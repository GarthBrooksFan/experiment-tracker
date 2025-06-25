"use client";

import { useState } from "react";
import { Button, Switch } from "../../../ui";
import Link from "next/link";

export default function NewExperiment() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    researcher: "",
    hypothesis: "",
    methodology: "",
    expectedDuration: "",
    priority: "medium",
    experimentType: "",
    datasetPath: "",
    modelConfig: "",
    hardwareRequirements: "",
    dependencies: "",
    tags: "",
    notes: "",
    enableMonitoring: true,
    autoBackup: true,
    notifyOnCompletion: true
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Experiment Data:", formData);
    // Here you would typically send to your API
    alert("Experiment created successfully!");
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="neutral-secondary" size="small">← Back to Dashboard</Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Create New Experiment
          </h1>
          <p className="text-lg text-neutral-600">
            Document your research experiment with all necessary details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Experiment Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Vision Model Training v2.1"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Lead Researcher *
                </label>
                <TextField
                  placeholder="e.g., Alex Chen"
                  value={formData.researcher}
                  onChange={(e) => handleInputChange("researcher", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Expected Duration
                </label>
                <TextField
                  placeholder="e.g., 2 days, 6 hours"
                  value={formData.expectedDuration}
                  onChange={(e) => handleInputChange("expectedDuration", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tags
                </label>
                <TextField
                  placeholder="e.g., computer-vision, pytorch, gpu-intensive"
                  value={formData.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description
              </label>
              <TextArea
                placeholder="Provide a brief overview of the experiment objectives and scope..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full"
                rows={3}
              />
            </div>
          </div>

          {/* Research Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Research Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Hypothesis
                </label>
                <TextArea
                  placeholder="State your research hypothesis and expected outcomes..."
                  value={formData.hypothesis}
                  onChange={(e) => handleInputChange("hypothesis", e.target.value)}
                  className="w-full"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Methodology
                </label>
                <TextArea
                  placeholder="Describe the experimental approach, algorithms, and procedures..."
                  value={formData.methodology}
                  onChange={(e) => handleInputChange("methodology", e.target.value)}
                  className="w-full"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Technical Configuration */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Technical Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Dataset Path
                </label>
                <TextField
                  placeholder="/data/experiments/vision_v2/"
                  value={formData.datasetPath}
                  onChange={(e) => handleInputChange("datasetPath", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Hardware Requirements
                </label>
                <TextField
                  placeholder="e.g., 4x A100 GPUs, 64GB RAM"
                  value={formData.hardwareRequirements}
                  onChange={(e) => handleInputChange("hardwareRequirements", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Model Configuration
              </label>
              <TextArea
                placeholder="Model hyperparameters, architecture details, training settings..."
                value={formData.modelConfig}
                onChange={(e) => handleInputChange("modelConfig", e.target.value)}
                className="w-full"
                rows={4}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Experiment Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">Enable Real-time Monitoring</h3>
                  <p className="text-sm text-neutral-600">Track metrics and logs during experiment execution</p>
                </div>
                <Switch 
                  checked={formData.enableMonitoring}
                  onChange={(checked) => handleInputChange("enableMonitoring", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">Automatic Backup</h3>
                  <p className="text-sm text-neutral-600">Automatically backup checkpoints and data</p>
                </div>
                <Switch 
                  checked={formData.autoBackup}
                  onChange={(checked) => handleInputChange("autoBackup", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">Notify on Completion</h3>
                  <p className="text-sm text-neutral-600">Send notifications when experiment finishes</p>
                </div>
                <Switch 
                  checked={formData.notifyOnCompletion}
                  onChange={(checked) => handleInputChange("notifyOnCompletion", checked)}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Additional Notes</h2>
            
            <TextArea
              placeholder="Any additional notes, considerations, or reminders for this experiment..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center bg-white rounded-lg shadow-sm border p-6">
            <Link href="/">
              <Button variant="neutral-secondary">Cancel</Button>
            </Link>
            
            <div className="flex gap-3">
              <Button variant="neutral-secondary" type="button">Save as Draft</Button>
              <Button variant="brand-primary" type="submit">Start Experiment</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 