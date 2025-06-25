'use client';

import { Badge, Button, Loader } from "../../../ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Experiment } from "../../../types";

interface PageProps {
  params: {
    id: string;
  };
}

export default function ExperimentDetailPage({ params }: PageProps) {
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        const response = await fetch(`/api/experiments/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch experiment');
        }
        const data = await response.json();
        setExperiment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiment();
  }, [params.id]);

  const handleDeleteExperiment = async () => {
    if (!experiment) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${experiment.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/experiments/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete experiment');
      }
      
      alert('Experiment deleted successfully');
      window.location.href = '/'; // Redirect to dashboard
    } catch (err) {
      alert('Failed to delete experiment. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-progress":
        return <Badge variant="success">In Progress</Badge>;
      case "completed":
        return <Badge variant="neutral">Completed</Badge>;
      case "failed":
        return <Badge variant="error">Failed</Badge>;
      case "planned":
        return <Badge variant="brand">Planned</Badge>;
      case "paused":
        return <Badge variant="warning">Paused</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResourceDisplayName = (resourceId: string) => {
    const resourceMap: { [key: string]: string } = {
      'gpu-cluster-1': 'GPU Cluster Alpha',
      'gpu-cluster-2': 'GPU Cluster Beta',
      'physical-lab-a': 'Physical Lab A',
      'cpu-cluster': 'CPU Processing Cluster',
      'storage-primary': 'Primary Storage'
    };
    return resourceMap[resourceId] || resourceId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-neutral-600">{error || 'Experiment not found'}</p>
            <Link href="/" className="mt-4 inline-block">
              <Button variant="neutral-secondary">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                ID: {experiment.id} • Led by {experiment.researcher}
              </p>
            </div>
            {getStatusBadge(experiment.status)}
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-1">Assigned Resource</h3>
              <p className="text-neutral-900">{getResourceDisplayName(experiment.assignedResource || experiment.resource || 'No resource assigned')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-1">Expected Duration</h3>
              <p className="text-neutral-900">{experiment.expectedDuration} {experiment.durationUnit}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-1">Start Date</h3>
              <p className="text-neutral-900">{formatDate(experiment.startDate)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-1">Last Updated</h3>
              <p className="text-neutral-900">{experiment.updatedAt ? formatDate(experiment.updatedAt) : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Research Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Research Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-1">Description</h3>
              <p className="text-neutral-900">{experiment.description}</p>
            </div>
            
            {experiment.hypothesis && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-1">Hypothesis</h3>
                <p className="text-neutral-900">{experiment.hypothesis}</p>
              </div>
            )}
            
            {experiment.methodology && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-1">Methodology</h3>
                <p className="text-neutral-900">{experiment.methodology}</p>
              </div>
            )}
          </div>
        </div>

        {/* Technical Configuration */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Technical Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experiment.datasetPath && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-1">Dataset Path</h3>
                <p className="text-neutral-900 font-mono text-sm bg-neutral-50 p-2 rounded">{experiment.datasetPath}</p>
              </div>
            )}
            
            {experiment.hardwareRequirements && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-1">Hardware Requirements</h3>
                <p className="text-neutral-900">{experiment.hardwareRequirements}</p>
              </div>
            )}
            
            {experiment.modelConfig && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-neutral-700 mb-1">Model Configuration</h3>
                <p className="text-neutral-900 font-mono text-sm bg-neutral-50 p-2 rounded">{experiment.modelConfig}</p>
              </div>
            )}
          </div>
        </div>

        {/* Training Parameters */}
        {(experiment.trainingTask || experiment.batchSize || experiment.learningRate) && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Training Parameters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {experiment.trainingTask && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-1">Training Task</h3>
                  <p className="text-neutral-900">{experiment.trainingTask}</p>
                </div>
              )}
              
              {(experiment.batchSize || experiment.trainingBatchSize) && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-1">Batch Size</h3>
                  <p className="text-neutral-900">{experiment.batchSize || experiment.trainingBatchSize}</p>
                </div>
              )}
              
              {experiment.learningRate && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-1">Learning Rate</h3>
                  <p className="text-neutral-900">{experiment.learningRate}</p>
                </div>
              )}
              
              {experiment.episodeLength && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-1">Episode Length</h3>
                  <p className="text-neutral-900">{experiment.episodeLength}</p>
                </div>
              )}
              
              {experiment.stepsEpochsTrained && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-1">Steps/Epochs Trained</h3>
                  <p className="text-neutral-900">{experiment.stepsEpochsTrained}</p>
                </div>
              )}
              
              {experiment.scoringMethod && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-1">Scoring Method</h3>
                  <p className="text-neutral-900">{experiment.scoringMethod}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {experiment.tags && experiment.tags.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Tags</h2>
                         <div className="flex flex-wrap gap-2">
               {experiment.tags.map((tag, index) => (
                 <Badge key={index} variant="neutral">{tag}</Badge>
               ))}
             </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Settings</h2>
          
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full ${(experiment.enableMonitoring !== undefined ? experiment.enableMonitoring : true) ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
               <span className="text-neutral-900">Monitoring {(experiment.enableMonitoring !== undefined ? experiment.enableMonitoring : true) ? 'Enabled' : 'Disabled'}</span>
             </div>
             
             <div className="flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full ${(experiment.enableBackup !== undefined ? experiment.enableBackup : experiment.autoBackup !== undefined ? experiment.autoBackup : true) ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
               <span className="text-neutral-900">Auto Backup {(experiment.enableBackup !== undefined ? experiment.enableBackup : experiment.autoBackup !== undefined ? experiment.autoBackup : true) ? 'Enabled' : 'Disabled'}</span>
             </div>
             
             <div className="flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full ${(experiment.enableNotifications !== undefined ? experiment.enableNotifications : experiment.notifyOnCompletion !== undefined ? experiment.notifyOnCompletion : true) ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
               <span className="text-neutral-900">Notifications {(experiment.enableNotifications !== undefined ? experiment.enableNotifications : experiment.notifyOnCompletion !== undefined ? experiment.notifyOnCompletion : true) ? 'Enabled' : 'Disabled'}</span>
             </div>
           </div>
        </div>

                 {/* Action Buttons */}
         <div className="bg-white rounded-lg shadow-sm border p-6">
           <div className="flex gap-4">
             <Link href={`/experiments/${experiment.id}/edit`}>
               <Button variant="brand-primary" size="medium">
                 Edit Experiment
               </Button>
             </Link>
             <Button variant="neutral-secondary" size="medium">
               View Logs
             </Button>
             <Button variant="destructive-secondary" size="medium" onClick={handleDeleteExperiment} disabled={isDeleting}>
               {isDeleting ? 'Deleting...' : 'Delete Experiment'}
             </Button>
           </div>
         </div>
      </div>
    </div>
  );
} 