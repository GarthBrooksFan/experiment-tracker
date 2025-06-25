"use client";

import { useState, useEffect } from "react";
import { Button, Switch, Loader } from "../../../../ui";
import Link from "next/link";
import { Experiment } from "../../../../types";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditExperiment({ params }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [experiment, setExperiment] = useState<Experiment | null>(null);

  // Resource options matching the resources page
  const availableResources = [
    { id: "gpu-cluster-1", name: "GPU Cluster Alpha", type: "Compute", units: "8x A100" },
    { id: "gpu-cluster-2", name: "GPU Cluster Beta", type: "Compute", units: "4x RTX 3090" },
    { id: "physical-lab-a", name: "Physical Lab A", type: "Physical Hardware", units: "Robotic Arm Setup" },
    { id: "cpu-cluster", name: "CPU Processing Cluster", type: "Compute", units: "64 cores" },
    { id: "storage-primary", name: "Primary Storage", type: "Storage", units: "50TB" }
  ];

  const experimentStatuses = [
    { value: "planned", label: "Planned", color: "blue" },
    { value: "in-progress", label: "In Progress", color: "green" },
    { value: "completed", label: "Completed", color: "neutral" },
    { value: "failed", label: "Failed", color: "red" },
    { value: "paused", label: "Paused", color: "yellow" }
  ];

  // Tag system for experiment categorization
  const availableTags = {
    "Experiment Type": [
      "computer-vision",
      "reinforcement-learning", 
      "supervised-learning",
      "robotics",
      "simulation",
      "data-collection",
      "model-validation"
    ],
    "Hardware Requirements": [
      "gpu-intensive",
      "cpu-only", 
      "robotic-hardware",
      "camera-required",
      "sensors",
      "high-memory",
      "distributed"
    ],
    "Research Domain": [
      "manipulation",
      "navigation", 
      "perception",
      "planning",
      "control",
      "learning",
      "safety"
    ],
    "Scale": [
      "small-scale",
      "medium-scale",
      "large-scale",
      "proof-of-concept",
      "production-ready"
    ]
  };

  // Time unit options for duration
  const timeUnits = [
    { value: "minutes", label: "Minutes" },
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
    { value: "weeks", label: "Weeks" }
  ];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    researcher: "",
    hypothesis: "",
    methodology: "",
    expectedDuration: "",
    durationUnit: "hours",
    priority: "medium",
    datasetPath: "",
    modelConfig: "",
    hardwareRequirements: "",
    dependencies: "",
    selectedTags: [] as string[],
    notes: "",
    // Resource and Status
    assignedResource: "",
    resourceUtilization: "",
    status: "planned",
    // ML/RL Training Parameters
    trainingTask: "",
    trainingBatchSize: "",
    episodeLength: "",
    learningRate: "",
    stepsTrainedFor: "",
    epochsTrainedFor: "",
    episodesInDataset: "",
    taskHoursInDataset: "",
    framesInDataset: "",
    scoring: "",
    enableMonitoring: true,
    autoBackup: true,
    notifyOnCompletion: true
  });

  // Load experiment data
  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        const response = await fetch(`/api/experiments/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch experiment');
        }
        const data = await response.json();
        setExperiment(data);
        
        // Populate form with existing data
        setFormData({
          name: data.name || "",
          description: data.description || "",
          researcher: data.researcher || "",
          hypothesis: data.hypothesis || "",
          methodology: data.methodology || "",
          expectedDuration: data.expectedDuration || "",
          durationUnit: data.durationUnit || "hours",
          priority: data.priority || "medium",
          datasetPath: data.datasetPath || "",
          modelConfig: data.modelConfig || "",
          hardwareRequirements: data.hardwareRequirements || "",
          dependencies: data.dependencies || "",
          selectedTags: data.tags || [],
          notes: data.notes || "",
          assignedResource: data.assignedResource || data.resource || "",
          resourceUtilization: data.resourceUtilization || "",
          status: data.status || "planned",
          trainingTask: data.trainingTask || "",
          trainingBatchSize: data.trainingBatchSize || "",
          episodeLength: data.episodeLength || "",
          learningRate: data.learningRate || "",
          stepsTrainedFor: data.stepsTrainedFor || "",
          epochsTrainedFor: data.epochsTrainedFor || "",
          episodesInDataset: data.episodesInDataset || "",
          taskHoursInDataset: data.taskHoursInDataset || "",
          framesInDataset: data.framesInDataset || "",
          scoring: data.scoring || data.scoringMethod || "",
          enableMonitoring: data.enableMonitoring !== undefined ? data.enableMonitoring : true,
          autoBackup: data.autoBackup !== undefined ? data.autoBackup : data.enableBackup !== undefined ? data.enableBackup : true,
          notifyOnCompletion: data.notifyOnCompletion !== undefined ? data.notifyOnCompletion : data.enableNotifications !== undefined ? data.enableNotifications : true
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiment();
  }, [params.id]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch(`/api/experiments/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.selectedTags,
        }),
      });

      if (response.ok) {
        const updatedExperiment = await response.json();
        alert(`Experiment "${updatedExperiment.name}" updated successfully!`);
        // Redirect to experiment detail page
        window.location.href = `/experiments/${params.id}`;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update experiment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      alert(`Error: ${err instanceof Error ? err.message : 'An error occurred'}`);
    } finally {
      setSaving(false);
    }
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

  if (error && !experiment) {
    return (
      <div className="min-h-screen bg-neutral-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-neutral-600">{error}</p>
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
        {/* Header */}
        <div className="mb-8">
          <Link href={`/experiments/${params.id}`}>
            <Button variant="neutral-secondary" size="small">← Back to Experiment</Button>
          </Link>
          
          <h1 className="text-4xl font-bold text-neutral-900 mt-4 mb-2">
            Edit Experiment
          </h1>
          <p className="text-lg text-neutral-600">
            Update experiment details and configuration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Experiment Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Lead Researcher *
                </label>
                <input
                  type="text"
                  value={formData.researcher}
                  onChange={(e) => handleInputChange('researcher', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {experimentStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Assigned Resource
                </label>
                <select
                  value={formData.assignedResource}
                  onChange={(e) => handleInputChange('assignedResource', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select a resource</option>
                  {availableResources.map(resource => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} ({resource.units})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Expected Duration
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.expectedDuration}
                    onChange={(e) => handleInputChange('expectedDuration', e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                    min="1"
                  />
                  <select
                    value={formData.durationUnit}
                    onChange={(e) => handleInputChange('durationUnit', e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {timeUnits.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Resource Utilization (%)
                </label>
                <input
                  type="number"
                  value={formData.resourceUtilization}
                  onChange={(e) => handleInputChange('resourceUtilization', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Research Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Research Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Hypothesis
                </label>
                <textarea
                  value={formData.hypothesis}
                  onChange={(e) => handleInputChange('hypothesis', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Methodology
                </label>
                <textarea
                  value={formData.methodology}
                  onChange={(e) => handleInputChange('methodology', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Technical Configuration */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Technical Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Dataset Path
                </label>
                <input
                  type="text"
                  value={formData.datasetPath}
                  onChange={(e) => handleInputChange('datasetPath', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  placeholder="/path/to/dataset"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Hardware Requirements
                </label>
                <input
                  type="text"
                  value={formData.hardwareRequirements}
                  onChange={(e) => handleInputChange('hardwareRequirements', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="GPU memory, CPU cores, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Model Configuration
                </label>
                <textarea
                  value={formData.modelConfig}
                  onChange={(e) => handleInputChange('modelConfig', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  rows={3}
                  placeholder="Model architecture, hyperparameters, etc."
                />
              </div>
            </div>
          </div>

          {/* Training Parameters */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">ML/RL Training Parameters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Training Task
                </label>
                <input
                  type="text"
                  value={formData.trainingTask}
                  onChange={(e) => handleInputChange('trainingTask', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Classification, regression, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Batch Size
                </label>
                <input
                  type="text"
                  value={formData.trainingBatchSize}
                  onChange={(e) => handleInputChange('trainingBatchSize', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Episode Length
                </label>
                <input
                  type="text"
                  value={formData.episodeLength}
                  onChange={(e) => handleInputChange('episodeLength', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Learning Rate
                </label>
                <input
                  type="text"
                  value={formData.learningRate}
                  onChange={(e) => handleInputChange('learningRate', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="0.001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Steps/Epochs Trained
                </label>
                <input
                  type="text"
                  value={formData.stepsTrainedFor}
                  onChange={(e) => handleInputChange('stepsTrainedFor', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Scoring Method
                </label>
                <input
                  type="text"
                  value={formData.scoring}
                  onChange={(e) => handleInputChange('scoring', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Accuracy, F1, reward, etc."
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Tags</h2>
            
            {Object.entries(availableTags).map(([category, tags]) => (
              <div key={category} className="mb-6">
                <h3 className="text-md font-medium text-neutral-800 mb-3">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        formData.selectedTags.includes(tag)
                          ? 'bg-brand-100 border-brand-300 text-brand-700'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">Enable Monitoring</h3>
                  <p className="text-sm text-neutral-600">Track experiment progress and metrics</p>
                </div>
                <Switch
                  checked={formData.enableMonitoring}
                  onCheckedChange={(checked) => handleInputChange('enableMonitoring', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">Auto Backup</h3>
                  <p className="text-sm text-neutral-600">Automatically backup experiment data</p>
                </div>
                <Switch
                  checked={formData.autoBackup}
                  onCheckedChange={(checked) => handleInputChange('autoBackup', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">Notify on Completion</h3>
                  <p className="text-sm text-neutral-600">Send notification when experiment finishes</p>
                </div>
                <Switch
                  checked={formData.notifyOnCompletion}
                  onCheckedChange={(checked) => handleInputChange('notifyOnCompletion', checked)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex gap-4">
              <Button 
                type="submit" 
                variant="brand-primary" 
                size="medium"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href={`/experiments/${params.id}`}>
                <Button variant="neutral-secondary" size="medium" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 