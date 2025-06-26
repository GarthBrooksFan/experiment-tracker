"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge, Button, Loader } from "../../ui";
import Link from "next/link";
import { 
  Experiment, 
  ExperimentFilters, 
  ExperimentSortOptions,
  ExperimentStatus,
  LoadingState 
} from "../../types";
import { 
  ALL_TAGS, 
  EXPERIMENT_STATUS_OPTIONS, 
  STATUS_BADGE_VARIANTS 
} from "../../constants";

export default function ExperimentsSearchPage() {
  // Search and filter state
  const [filters, setFilters] = useState<ExperimentFilters>({
    search: "",
    status: undefined,
    resource: "",
    researcher: "",
    tags: []
  });
  
  const [sortOptions, setSortOptions] = useState<ExperimentSortOptions>({
    sortBy: "date",
    sortOrder: "desc"
  });
  
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  });

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [totalExperiments, setTotalExperiments] = useState(0);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [researchers, setResearchers] = useState<Array<{ id: string; name: string }>>([]);
  const [resources, setResources] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch experiments from API - wrapped in useCallback to prevent infinite loops
  const fetchExperiments = useCallback(async () => {
    setLoadingState({ isLoading: true, error: null });
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.resource) params.append('resource', filters.resource);
      if (filters.researcher) params.append('researcher', filters.researcher);
      if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
      
      // Map frontend sort options to API parameters
      let apiSortBy: string = sortOptions.sortBy;
      if (sortOptions.sortBy === 'date') apiSortBy = 'updatedAt';
      
      params.append('sortBy', apiSortBy);
      params.append('sortOrder', sortOptions.sortOrder);
      params.append('limit', '50'); // Get more results for search
      
      const response = await fetch(`/api/experiments?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch experiments');
      }
      
      const data = await response.json();
      setExperiments(data.experiments || []);
      setTotalExperiments(data.pagination?.total || data.experiments?.length || 0);
      
    } catch (error) {
      console.error('Error fetching experiments:', error);
      setLoadingState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch experiments' 
      });
      return;
    }
    
    setLoadingState({ isLoading: false, error: null });
  }, [filters, sortOptions]); // Dependencies that should trigger refetch

  // Fetch researchers from API
  const fetchResearchers = useCallback(async () => {
    try {
      const response = await fetch('/api/researchers');
      if (response.ok) {
        const data = await response.json();
        setResearchers(data.researchers || []);
      }
    } catch (error) {
      console.error('Error fetching researchers:', error);
    }
  }, []);

  // Fetch resources from API
  const fetchResources = useCallback(async () => {
    try {
      const response = await fetch('/api/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }, []);

  // Fetch data on component mount and when filters/sort change
  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  // Fetch researchers on component mount only
  useEffect(() => {
    fetchResearchers();
  }, [fetchResearchers]);

  // Fetch resources on component mount only
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...(prev.tags || []), tag]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      status: undefined,
      resource: "",
      researcher: "",
      tags: []
    });
  };

  const getStatusBadge = (status: ExperimentStatus) => {
    const variant = STATUS_BADGE_VARIANTS[status];
    const statusOption = EXPERIMENT_STATUS_OPTIONS.find(opt => opt.value === status);
    
    return (
      <Badge variant={variant as any}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const getResourceDisplayName = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    return resource?.name || resourceId || 'No resource assigned';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      
      // Remove from local state and update count
      setExperiments(prev => prev.filter(exp => exp.id !== experimentId));
      setTotalExperiments(prev => prev - 1);
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
            Search Experiments
          </h1>
          <p className="text-lg text-neutral-600">
            Find and filter through all your AI research experiments
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-6">
          <Link href="/">
            <Button variant="neutral-secondary">Dashboard</Button>
          </Link>
          <Link href="/experiments">
            <Button variant="brand-secondary">Search Experiments</Button>
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

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, description, or ID..."
                value={filters.search || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  status: e.target.value as ExperimentStatus || undefined 
                }))}
                className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none bg-white"
              >
                <option value="">All Statuses</option>
                {EXPERIMENT_STATUS_OPTIONS.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Resource
              </label>
              <select
                value={filters.resource || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value }))}
                className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none bg-white"
              >
                <option value="">All Resources</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Researcher Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Researcher
              </label>
              <select
                value={filters.researcher || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, researcher: e.target.value }))}
                className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none bg-white"
              >
                <option value="">All Researchers</option>
                {researchers.map((researcher) => (
                  <option key={researcher.id} value={researcher.name}>
                    {researcher.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Sort By
              </label>
              <select
                value={`${sortOptions.sortBy}-${sortOptions.sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortOptions({
                    sortBy: newSortBy as any,
                    sortOrder: newSortOrder as 'asc' | 'desc'
                  });
                }}
                className="w-full h-10 px-3 border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none bg-white"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="status-asc">Status</option>
              </select>
            </div>
          </div>

          {/* Tag Filters */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-neutral-700">
                Filter by Tags
              </label>
              <button
                onClick={clearAllFilters}
                className="text-sm text-brand-600 hover:text-brand-700"
              >
                Clear All Filters
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.tags?.includes(tag)
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-brand-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {filters.tags && filters.tags.length > 0 && (
              <div className="mt-3 p-3 bg-neutral-50 rounded-md">
                <p className="text-sm text-neutral-600 mb-2">Active tag filters:</p>
                <div className="flex flex-wrap gap-1">
                  {filters.tags.map((tag) => (
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

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-neutral-900">
              {loadingState.isLoading ? 'Loading...' : `${totalExperiments} Experiments Found`}
            </h2>
            {loadingState.error && (
              <p className="text-sm text-red-600 mt-1">
                Error: {loadingState.error}
              </p>
            )}
          </div>

          <div className="overflow-x-auto">
            {loadingState.isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader />
              </div>
            ) : loadingState.error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-neutral-600">Failed to load experiments</p>
                  <Button 
                    variant="neutral-secondary" 
                    size="small" 
                    onClick={fetchExperiments}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : experiments.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-neutral-600 mb-2">No experiments found</p>
                  <p className="text-sm text-neutral-500">Try adjusting your search filters</p>
                </div>
              </div>
            ) : (
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
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Tags
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
                            {experiment.id} • {formatDate(experiment.startDate || experiment.createdAt || '')}
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
                        {getResourceDisplayName(experiment.assignedResource || experiment.resource || '')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {experiment.expectedDuration ? `${experiment.expectedDuration} ${experiment.durationUnit}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(experiment.tags || []).slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {(experiment.tags || []).length > 3 && (
                            <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-500 rounded-full">
                              +{(experiment.tags || []).length - 3}
                            </span>
                          )}
                        </div>
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
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Search Tips */}
        {!loadingState.isLoading && !loadingState.error && (
          <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
            <h3 className="text-sm font-medium text-neutral-900 mb-2">Search Tips</h3>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li>• Use the search box to find experiments by name, description, or ID</li>
              <li>• Filter by status, resource, or researcher to narrow down results</li>
              <li>• Click on tags to filter experiments by specific categories</li>
              <li>• Use sorting options to organize results by date, name, or status</li>
              <li>• Clear all filters to see all {totalExperiments} experiments</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}