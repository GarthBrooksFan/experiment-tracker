import { Badge, Button, Progress } from "../../ui";
import Link from "next/link";

export default function ResourcesPage() {
  // Mock data for resource status
  const resources = [
    {
      id: "gpu-cluster-1",
      name: "GPU Cluster Alpha",
      type: "Compute",
      status: "active",
      usage: 85,
      totalUnits: "8x A100",
      currentExperiment: "Vision Model Training v2.1",
      estimatedCompletion: "2h 15m"
    },
    {
      id: "gpu-cluster-2", 
      name: "GPU Cluster Beta",
      type: "Compute",
      status: "idle",
      usage: 0,
      totalUnits: "4x RTX 3090",
      currentExperiment: null,
      estimatedCompletion: null
    },
    {
      id: "physical-lab-a",
      name: "Physical Lab A",
      type: "Physical Hardware",
      status: "active", 
      usage: 100,
      totalUnits: "Robotic Arm Setup",
      currentExperiment: "Calibration Tests",
      estimatedCompletion: "45m"
    },
    {
      id: "cpu-cluster",
      name: "CPU Processing Cluster",
      type: "Compute",
      status: "active",
      usage: 45,
      totalUnits: "64 cores",
      currentExperiment: "Data Preprocessing",
      estimatedCompletion: "6h 30m"
    },
    {
      id: "storage-primary",
      name: "Primary Storage",
      type: "Storage",
      status: "active",
      usage: 73,
      totalUnits: "50TB",
      currentExperiment: "Multiple",
      estimatedCompletion: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "idle":
        return <Badge variant="neutral">Idle</Badge>;
      case "maintenance":
        return <Badge variant="error">Maintenance</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return "text-red-600";
    if (usage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const totalResources = resources.length;
  const activeResources = resources.filter(r => r.status === "active").length;
  const idleResources = resources.filter(r => r.status === "idle").length;
  const avgUsage = Math.round(resources.reduce((sum, r) => sum + r.usage, 0) / resources.length);

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
          <Link href="/experiments/new">
            <Button variant="neutral-secondary">New Experiment</Button>
          </Link>
          <Link href="/resources">
            <Button variant="brand-secondary">Resources</Button>
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Total Resources</h3>
            <p className="text-3xl font-bold text-neutral-900">{totalResources}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Active</h3>
            <p className="text-3xl font-bold text-green-600">{activeResources}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Idle</h3>
            <p className="text-3xl font-bold text-blue-600">{idleResources}</p>
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
                {getStatusBadge(resource.status)}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-neutral-700">Usage</span>
                  <span className={`text-sm font-medium ${getUsageColor(resource.usage)}`}>
                    {resource.usage}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      resource.usage >= 90 ? 'bg-red-500' :
                      resource.usage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${resource.usage}%` }}
                  />
                </div>
              </div>

              {resource.currentExperiment && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Current Experiment</p>
                      <p className="text-sm text-neutral-600">{resource.currentExperiment}</p>
                    </div>
                    {resource.estimatedCompletion && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-neutral-900">ETA</p>
                        <p className="text-sm text-neutral-600">{resource.estimatedCompletion}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {resource.status === "idle" && (
                <div className="border-t pt-4">
                  <Button variant="brand-primary" size="small" className="w-full">
                    Allocate Resource
                  </Button>
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
              <Button variant="brand-primary" size="small">Allocate</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 