import { Button, Table, Badge, TextField, IconButton } from "@/ui";
import Link from "next/link";

export default function ExperimentDashboard() {
  // Mock data for experiments
  const experiments = [
    {
      id: "EXP-001",
      name: "Vision Model Training v2.1",
      status: "running",
      startDate: "2024-01-15",
      duration: "2d 14h",
      researcher: "Alex Chen",
      resources: "4x A100 GPUs"
    },
    {
      id: "EXP-002", 
      name: "Robotic Arm Calibration",
      status: "completed",
      startDate: "2024-01-12",
      duration: "6h 23m",
      researcher: "Sarah Kim",
      resources: "Physical Lab A"
    },
    {
      id: "EXP-003",
      name: "Sensor Fusion Algorithm",
      status: "failed",
      startDate: "2024-01-10",
      duration: "45m",
      researcher: "Mike Johnson",
      resources: "2x RTX 3090"
    },
    {
      id: "EXP-004",
      name: "Dataset Preprocessing",
      status: "completed",
      startDate: "2024-01-08",
      duration: "12h 15m", 
      researcher: "Emily Davis",
      resources: "CPU Cluster"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge variant="success">Running</Badge>;
      case "completed":
        return <Badge variant="neutral">Completed</Badge>;
      case "failed":
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
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

        {/* Navigation & Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="brand-secondary">Dashboard</Button>
            </Link>
            <Link href="/experiments/new">
              <Button variant="neutral-secondary">New Experiment</Button>
            </Link>
            <Link href="/resources">
              <Button variant="neutral-secondary">Resources</Button>
            </Link>
          </div>
          
          <div className="flex gap-2">
            <TextField placeholder="Search experiments..." />
            <Link href="/experiments/new">
              <Button variant="brand-primary">+ New Experiment</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Total Experiments</h3>
            <p className="text-3xl font-bold text-neutral-900">247</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Running</h3>
            <p className="text-3xl font-bold text-green-600">3</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Completed Today</h3>
            <p className="text-3xl font-bold text-blue-600">12</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Failed This Week</h3>
            <p className="text-3xl font-bold text-red-600">5</p>
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
                {experiments.map((experiment) => (
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
                        <Button variant="neutral-tertiary" size="small">Edit</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
