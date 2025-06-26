"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Progress } from "../../ui";
import Link from "next/link";

interface Resource {
  id: string;
  resourceId: string;
  name: string;
  type: string;
  status: string;
  totalUnits: string;
  calculatedUsage: number;
  activeExperiments: number;
  experiments: Array<{
    id: string;
    name: string;
    resourceUtilization: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
  availableCapacity: number;
}

interface ResourcesResponse {
  resources: Resource[];
  summary: {
    total: number;
    active: number;
    idle: number;
    overAllocated: number;
  };
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    idle: 0,
    overAllocated: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch resources data from API
  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/resources?includeAvailability=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      
      const data: ResourcesResponse = await response.json();
      setResources(data.resources);
      setSummary(data.summary);
      setError(null);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and periodically refresh
  useEffect(() => {
    fetchResources();
    
    // Refresh every 30 seconds to show real-time updates
    const interval = setInterval(fetchResources, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string, calculatedUsage: number) => {
    // Use calculated usage to determine actual status
    if (calculatedUsage > 0) {
      return <Badge variant="success">Active</Badge>;
    } else {
      return <Badge variant="neutral">Idle</Badge>;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return "text-red-600";
    if (usage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const avgUsage = resources.length > 0 
    ? Math.round(resources.reduce((sum, r) => sum + r.calculatedUsage, 0) / resources.length)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-neutral-600">Loading resources...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">Error: {error}</div>
            <button 
              onClick={fetchResources}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Resource Monitoring
          </h1>
          <p className="text-lg text-neutral-600">
            Track compute usage and hardware availability
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-6">
          <Link href="/">
            <Button variant="neutral-secondary">Dashboard</Button>
          </Link>
          <Link href="/experiments">
            <Button variant="neutral-secondary">Search Experiments</Button>
          </Link>
          <Link href="/experiments/new">
            <Button variant="neutral-secondary">New Experiment</Button>
          </Link>
          <Link href="/resources">
            <Button variant="brand-secondary">Resources</Button>
          </Link>
          <Link href="/schedule">
            <Button variant="neutral-secondary">Schedule</Button>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Total Resources</h3>
            <p className="text-3xl font-bold text-neutral-900">{summary.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Active</h3>
            <p className="text-3xl font-bold text-green-600">{summary.active}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Idle</h3>
            <p className="text-3xl font-bold text-blue-600">{summary.idle}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Avg Usage</h3>
            <p className={`text-3xl font-bold ${getUsageColor(avgUsage)}`}>{avgUsage}%</p>
          </div>
        </div>

        {/* Resource Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{resource.name}</h3>
                  <p className="text-sm text-neutral-600">{resource.type} • {resource.totalUnits}</p>
                </div>
                {getStatusBadge(resource.status, resource.calculatedUsage)}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-neutral-700">Usage</span>
                  <span className={`text-sm font-medium ${getUsageColor(resource.calculatedUsage)}`}>
                    {resource.calculatedUsage}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      resource.calculatedUsage >= 90 ? 'bg-red-500' :
                      resource.calculatedUsage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${resource.calculatedUsage}%` }}
                  />
                </div>
              </div>

              {resource.activeExperiments > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Current Experiment</p>
                      <p className="text-sm text-neutral-600">{resource.experiments[0].name}</p>
                    </div>
                    {resource.experiments[0].endDate && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral-900">ETA</p>
                        <p className="text-sm text-neutral-600">{resource.experiments[0].endDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}


            </div>
          ))}
        </div>

        {/* Resource Alerts */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">System Alerts</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">High GPU utilization on Cluster Alpha</p>
                <p className="text-sm text-red-700">85% usage for 2+ hours. Consider load balancing.</p>
              </div>
              <Button variant="neutral-tertiary" size="small">Investigate</Button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Storage approaching capacity</p>
                <p className="text-sm text-yellow-700">Primary storage at 73%. Plan data cleanup or expansion.</p>
              </div>
              <Button variant="neutral-tertiary" size="small">Review</Button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">GPU Cluster Beta available</p>
                <p className="text-sm text-green-700">4x RTX 3090 cluster is idle and ready for new experiments.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 