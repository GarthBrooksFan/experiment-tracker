"use client";

import { Button, Table, Badge, TextField, IconButton } from "../ui";
import Link from "next/link";
import { useState, useEffect } from "react";

interface DashboardExperiment {
  id: string;
  name: string;
  status: string;
  startDate: string;
  duration: string;
  researcher: string;
  resources: string;
}

export default function ExperimentDashboard() {
  const [experiments, setExperiments] = useState<DashboardExperiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Fetch experiments from API
  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const response = await fetch('/api/experiments?limit=10&sortBy=updatedAt&sortOrder=desc');
        const data = await response.json();
        
        // Transform API data to match dashboard format
        const transformedExperiments = data.experiments.map((exp: any): DashboardExperiment => ({
          id: exp.id,
          name: exp.name,
          status: exp.status === 'in-progress' ? 'running' : exp.status,
          startDate: exp.startDate || new Date().toISOString().split('T')[0],
          duration: exp.expectedDuration ? `${exp.expectedDuration}${exp.durationUnit.charAt(0)}` : 'N/A',
          researcher: exp.researcher,
          resources: getResourceDisplay(exp.assignedResource)
        }));
        
        setExperiments(transformedExperiments);
      } catch (error) {
        console.error('Error fetching experiments:', error);
        // Fallback to empty array if API fails
        setExperiments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  // Helper function to display resource names
  const getResourceDisplay = (resourceId: string) => {
    const resourceMap: Record<string, string> = {
      'gpu-cluster-1': '4x A100 GPUs',
      'gpu-cluster-2': '2x RTX 3090',
      'physical-lab-a': 'Physical Lab A',
      'cpu-cluster': 'CPU Cluster',
      'storage-primary': 'Primary Storage'
    };
    return resourceMap[resourceId] || resourceId || 'No resource assigned';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
      case "in-progress":
        return <Badge variant="success">Running</Badge>;
      case "completed":
        return <Badge variant="neutral">Completed</Badge>;
      case "failed":
        return <Badge variant="error">Failed</Badge>;
      case "planned":
        return <Badge variant="neutral">Planned</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleDeleteExperiment = async (experimentId: string, experimentName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${experimentName}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setDeletingIds(prev => new Set(prev).add(experimentId));
    
    try {
      const response = await fetch(`/api/experiments/${experimentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete experiment');
      }
      
      // Remove from local state
      setExperiments(prev => prev.filter(exp => exp.id !== experimentId));
      alert('Experiment deleted successfully');
    } catch (err) {
      alert('Failed to delete experiment. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(experimentId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Experiment Tracker
          </h1>
          <p className="text-lg text-neutral-600">
            Manage and monitor your AI research experiments
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-6">
          <Link href="/">
            <Button variant="brand-secondary">Dashboard</Button>
          </Link>
          <Link href="/experiments">
            <Button variant="neutral-secondary">Search Experiments</Button>
          </Link>
          <Link href="/experiments/new">
            <Button variant="neutral-secondary">New Experiment</Button>
          </Link>
          <Link href="/resources">
            <Button variant="neutral-secondary">Resources</Button>
          </Link>
          <Link href="/schedule">
            <Button variant="neutral-secondary">Schedule</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Total Experiments</h3>
            <p className="text-3xl font-bold text-neutral-900">
              {loading ? '...' : experiments.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Running</h3>
            <p className="text-3xl font-bold text-green-600">
              {loading ? '...' : experiments.filter((exp: DashboardExperiment) => exp.status === 'running' || exp.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-blue-600">
              {loading ? '...' : experiments.filter((exp: DashboardExperiment) => exp.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Failed</h3>
            <p className="text-3xl font-bold text-red-600">
              {loading ? '...' : experiments.filter((exp: DashboardExperiment) => exp.status === 'failed').length}
            </p>
          </div>
        </div>

        {/* Experiments Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-neutral-900">Recent Experiments</h2>
      </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Experiment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Researcher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Resources
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                      Loading experiments...
                    </td>
                  </tr>
                ) : experiments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                      No experiments found. <Link href="/experiments/new" className="text-brand-600 hover:text-brand-700">Create your first experiment</Link>
                    </td>
                  </tr>
                ) : (
                  experiments.map((experiment: DashboardExperiment) => (
                    <tr key={experiment.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {experiment.name}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {experiment.id} • {experiment.startDate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(experiment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {experiment.researcher}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {experiment.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {experiment.resources}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Link href={`/experiments/${experiment.id}`}>
                            <Button variant="neutral-secondary" size="small">View</Button>
                          </Link>
                          <Link href={`/experiments/${experiment.id}/edit`}>
                            <Button variant="neutral-tertiary" size="small">Edit</Button>
                          </Link>
                          <Button 
                            variant="neutral-tertiary" 
                            size="small" 
                            onClick={() => handleDeleteExperiment(experiment.id, experiment.name)}
                            disabled={deletingIds.has(experiment.id)}
                          >
                            {deletingIds.has(experiment.id) ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
