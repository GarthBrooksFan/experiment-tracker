"use client";

import { useState, useEffect } from "react";
import { Button, Switch } from "../../../ui";
import Link from "next/link";

export default function NewExperiment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [researchers, setResearchers] = useState<Array<{ id: string; name: string }>>([]);

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

  const [customTags, setCustomTags] = useState<{[category: string]: string[]}>({});
  const [newTagInputs, setNewTagInputs] = useState<{[category: string]: string}>({});

  // Fetch researchers from API
  const fetchResearchers = async () => {
    try {
      const response = await fetch('/api/researchers');
      if (response.ok) {
        const data = await response.json();
        setResearchers(data.researchers || []);
      }
    } catch (error) {
      console.error('Error fetching researchers:', error);
    }
  };

  // Fetch researchers on component mount
  useEffect(() => {
    fetchResearchers();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    researcher: "",
    hypothesis: "",
    methodology: "",
    expectedDuration: "",
    durationUnit: "hours",
    priority: "medium",
    experimentType: "",
    datasetPath: "",
    modelConfig: "",
    hardwareRequirements: "",
    dependencies: "",
    selectedTags: [] as string[],
    notes: "",
    // Scheduling
    startDate: "",
    endDate: "",
    // Resource and Status
    assignedResource: "",
    resourceUtilization: "",
    experimentStatus: "planned",
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Date validation helper
  const validateDates = () => {
    if (formData.startDate && formData.endDate) {
      return new Date(formData.startDate) <= new Date(formData.endDate);
    }
    return true;
  };

  const handleDateChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    // Auto-adjust end date if it becomes before start date
    if (field === 'startDate' && newFormData.endDate && new Date(value) > new Date(newFormData.endDate)) {
      newFormData.endDate = value;
    }
    
    setFormData(newFormData);
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  const handleAddCustomTag = (category: string) => {
    const newTag = newTagInputs[category]?.trim();
    if (!newTag) return;

    // Convert to lowercase with hyphens (consistent with existing tags)
    const formattedTag = newTag.toLowerCase().replace(/\s+/g, '-');
    
    // Check if tag already exists
    const allTags = [...availableTags[category as keyof typeof availableTags], ...(customTags[category] || [])];
    if (allTags.includes(formattedTag)) {
      alert('Tag already exists!');
      return;
    }

    // Add to custom tags
    setCustomTags(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), formattedTag]
    }));

    // Clear input
    setNewTagInputs(prev => ({
      ...prev,
      [category]: ''
    }));
  };

  const handleNewTagInputChange = (category: string, value: string) => {
    setNewTagInputs(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const removeCustomTag = (category: string, tagToRemove: string) => {
    setCustomTags(prev => ({
      ...prev,
      [category]: prev[category]?.filter(tag => tag !== tagToRemove) || []
    }));
    
    // Also remove from selected tags if it was selected
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Convert selectedTags array to tags for API
          tags: formData.selectedTags,
          // Map form field names to API field names
          status: formData.experimentStatus,
        }),
      });

      if (response.ok) {
        const newExperiment = await response.json();
        alert(`Experiment "${newExperiment.name}" created successfully!`);
        
        // Redirect to the new experiment's detail page
        window.location.href = `/experiments/${newExperiment.id}`;
        return;
      } else {
        const error = await response.json();
        alert(`Error creating experiment: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating experiment:', error);
      alert('Failed to create experiment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Create New Experiment
          </h1>
          <p className="text-lg text-neutral-600">
            Document your research experiment with all necessary details
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
            <Button variant="brand-secondary">New Experiment</Button>
          </Link>
          <Link href="/resources">
            <Button variant="neutral-secondary">Resources</Button>
          </Link>
          <Link href="/schedule">
            <Button variant="neutral-secondary">Schedule</Button>
          </Link>
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
                <select
                  value={formData.researcher}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange("researcher", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none bg-white"
                >
                  <option value="">Select researcher...</option>
                  {researchers.map((researcher) => (
                    <option key={researcher.id} value={researcher.name}>
                      {researcher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange("startDate", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
                <p className="text-sm text-neutral-500 mt-1">
                  When should this experiment begin?
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange("endDate", e.target.value)}
                  min={formData.startDate || undefined}
                  className={`w-full h-10 px-3 border rounded-md focus:outline-none ${
                    !validateDates() 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-neutral-300 focus:border-brand-500'
                  }`}
                />
                <p className="text-sm text-neutral-500 mt-1">
                  When should this experiment complete?
                </p>
                {!validateDates() && (
                  <p className="text-sm text-red-600 mt-1">
                    End date must be after start date
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Expected Duration
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="e.g., 2"
                    min="0"
                    step="0.1"
                    value={formData.expectedDuration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("expectedDuration", e.target.value)}
                    className="flex-1 h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                  />
                  <select
                    value={formData.durationUnit}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange("durationUnit", e.target.value)}
                    className="h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none bg-white"
                  >
                    {timeUnits.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Assigned Resource
                </label>
                <select
                  value={formData.assignedResource}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange("assignedResource", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none bg-white"
                >
                  <option value="">Select resource...</option>
                  {availableResources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} ({resource.units})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Expected Resource Utilization (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="e.g., 75"
                    value={formData.resourceUtilization}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("resourceUtilization", e.target.value)}
                    className="w-full h-10 px-3 pr-8 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 text-sm">%</span>
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  Enter percentage (0-100%) of resource capacity expected to be used
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Experiment Status
                </label>
                <select
                  value={formData.experimentStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange("experimentStatus", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none bg-white"
                >
                  {experimentStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Experiment Tags
                </label>
                <div className="space-y-4">
                  {Object.entries(availableTags).map(([category, tags]) => {
                    const allCategoryTags = [...tags, ...(customTags[category] || [])];
                    return (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-neutral-800 mb-2">{category}</h4>
                        
                        {/* Existing and custom tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {allCategoryTags.map((tag) => (
                            <div key={tag} className="flex items-center">
                              <button
                                type="button"
                                onClick={() => handleTagToggle(tag)}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                  formData.selectedTags.includes(tag)
                                    ? 'bg-brand-500 text-white border-brand-500'
                                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-brand-300'
                                }`}
                              >
                                {tag}
                              </button>
                              {/* Remove button for custom tags */}
                              {customTags[category]?.includes(tag) && (
                                <button
                                  type="button"
                                  onClick={() => removeCustomTag(category, tag)}
                                  className="ml-1 w-4 h-4 text-red-500 hover:text-red-700 text-xs"
                                  title="Remove custom tag"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add new tag input */}
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder={`Add new ${category.toLowerCase()} tag...`}
                            value={newTagInputs[category] || ''}
                            onChange={(e) => handleNewTagInputChange(category, e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomTag(category);
                              }
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-neutral-300 rounded focus:border-brand-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCustomTag(category)}
                            className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 border border-neutral-300 rounded hover:bg-neutral-200 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {formData.selectedTags.length > 0 && (
                  <div className="mt-3 p-3 bg-neutral-50 rounded-md">
                    <p className="text-sm text-neutral-600 mb-2">Selected tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-brand-100 text-brand-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Provide a brief overview of the experiment objectives and scope..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
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
                <textarea
                  placeholder="State your research hypothesis and expected outcomes..."
                  value={formData.hypothesis}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("hypothesis", e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Methodology
                </label>
                <textarea
                  placeholder="Describe the experimental approach, algorithms, and procedures..."
                  value={formData.methodology}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("methodology", e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
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
                <input
                  type="text"
                  placeholder="/data/experiments/vision_v2/"
                  value={formData.datasetPath}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("datasetPath", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Hardware Requirements
                </label>
                <input
                  type="text"
                  placeholder="e.g., 4x A100 GPUs, 64GB RAM"
                  value={formData.hardwareRequirements}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("hardwareRequirements", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Model Configuration
              </label>
              <textarea
                placeholder="Model hyperparameters, architecture details, training settings..."
                value={formData.modelConfig}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("modelConfig", e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                rows={4}
              />
            </div>
          </div>

          {/* ML/RL Training Parameters */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Training Parameters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Training Task
                </label>
                <input
                  type="text"
                  placeholder="e.g., Object Detection, Manipulation Control"
                  value={formData.trainingTask}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("trainingTask", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Training Batch Size
                </label>
                <input
                  type="number"
                  placeholder="e.g., 32"
                  value={formData.trainingBatchSize}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("trainingBatchSize", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Episode Length
                </label>
                <input
                  type="number"
                  placeholder="e.g., 1000"
                  value={formData.episodeLength}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("episodeLength", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Learning Rate
                </label>
                <input
                  type="text"
                  placeholder="e.g., 0.001, 1e-4"
                  value={formData.learningRate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("learningRate", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Steps Trained For
                </label>
                <input
                  type="number"
                  placeholder="e.g., 100000"
                  value={formData.stepsTrainedFor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("stepsTrainedFor", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Epochs Trained For
                </label>
                <input
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.epochsTrainedFor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("epochsTrainedFor", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Episodes in Dataset
                </label>
                <input
                  type="number"
                  placeholder="e.g., 10000"
                  value={formData.episodesInDataset}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("episodesInDataset", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Task Hours in Dataset
                </label>
                <input
                  type="number"
                  placeholder="e.g., 120.5"
                  step="0.1"
                  value={formData.taskHoursInDataset}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("taskHoursInDataset", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Frames in Dataset
                </label>
                <input
                  type="number"
                  placeholder="e.g., 1000000"
                  value={formData.framesInDataset}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("framesInDataset", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Scoring Method
                </label>
                <input
                  type="text"
                  placeholder="e.g., Success Rate, Reward Threshold, BLEU Score"
                  value={formData.scoring}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("scoring", e.target.value)}
                  className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
                />
              </div>
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
                  onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, enableMonitoring: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">Automatic Backup</h3>
                  <p className="text-sm text-neutral-600">Automatically backup checkpoints and data</p>
                </div>
                <Switch 
                  checked={formData.autoBackup}
                  onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, autoBackup: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">Notify on Completion</h3>
                  <p className="text-sm text-neutral-600">Send notifications when experiment finishes</p>
                </div>
                <Switch 
                  checked={formData.notifyOnCompletion}
                  onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, notifyOnCompletion: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Additional Notes</h2>
            
            <textarea
              placeholder="Any additional notes, considerations, or reminders for this experiment..."
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("notes", e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center bg-white rounded-lg shadow-sm border p-6">
            <Link href="/">
              <Button variant="neutral-secondary">Cancel</Button>
            </Link>
            
            <div className="flex gap-3">
              <Button variant="neutral-secondary" type="button" disabled={isSubmitting}>Save as Draft</Button>
              <Button variant="brand-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Start Experiment'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 