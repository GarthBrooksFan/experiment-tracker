import { Badge, Button } from "../../../ui";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

export default function ExperimentDetailPage({ params }: PageProps) {
  // Mock data for experiment details
  const experiment = {
    id: params.id,
    name: "Vision Model Training v2.1", 
    status: "running",
    researcher: "Alex Chen",
    startDate: "2024-01-15T10:30:00Z",
    description: "Training a computer vision model for object detection in manufacturing environments",
    progress: 67,
    metrics: {
      accuracy: 0.923,
      loss: 0.087,
      f1Score: 0.915,
      epoch: 45
    }
  };

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="neutral-secondary" size="small">← Back to Dashboard</Button>
          </Link>
          
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                {experiment.name}
              </h1>
              <p className="text-lg text-neutral-600">
                {experiment.id} • Led by {experiment.researcher}
              </p>
            </div>
            {getStatusBadge(experiment.status)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Experiment Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-1">Description</h3>
              <p className="text-neutral-900">{experiment.description}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-1">Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: `${experiment.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{experiment.progress}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{experiment.metrics.accuracy}</p>
                <p className="text-sm text-neutral-600">Accuracy</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{experiment.metrics.loss}</p>
                <p className="text-sm text-neutral-600">Loss</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{experiment.metrics.f1Score}</p>
                <p className="text-sm text-neutral-600">F1 Score</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{experiment.metrics.epoch}</p>
                <p className="text-sm text-neutral-600">Current Epoch</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 