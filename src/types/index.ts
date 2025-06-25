// Core experiment data types
export interface Experiment {
  id: string;
  name: string;
  status: ExperimentStatus;
  researcher: string;
  resource?: string; // Frontend field
  assignedResource?: string; // Database field
  startDate: string;
  expectedDuration: string;
  durationUnit: DurationUnit;
  description: string;
  hypothesis?: string;
  methodology?: string;
  datasetPath?: string;
  hardwareRequirements?: string;
  modelConfig?: string;
  tags: string[];
  // Training parameters (with database field names)
  trainingTask?: string;
  batchSize?: number; // Frontend field
  trainingBatchSize?: string; // Database field
  episodeLength?: number;
  learningRate?: number;
  stepsEpochsTrained?: number;
  episodesTaskHours?: number;
  framesInDataset?: number;
  scoringMethod?: string;
  scoring?: string; // Database field name
  // Settings (with database field names)
  enableMonitoring?: boolean; // Frontend field
  enableBackup?: boolean; // Frontend field
  enableNotifications?: boolean; // Frontend field
  autoBackup?: boolean; // Database field
  notifyOnCompletion?: boolean; // Database field
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// Experiment status enum
export type ExperimentStatus = 'planned' | 'in-progress' | 'completed' | 'failed' | 'paused';

// Duration units
export type DurationUnit = 'minutes' | 'hours' | 'days' | 'weeks';

// Resource monitoring types
export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description: string;
  capacity: string;
  currentUsage: number; // percentage
  status: ResourceStatus;
  details?: ResourceDetails;
}

export type ResourceType = 'gpu-cluster' | 'physical-lab' | 'cpu-cluster' | 'storage';

export type ResourceStatus = 'available' | 'in-use' | 'maintenance' | 'offline';

export interface ResourceDetails {
  specs?: string;
  location?: string;
  assignedExperiments?: string[];
  maintenanceSchedule?: string;
}

// Tag system types
export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  isCustom: boolean;
  createdAt?: string;
}

export type TagCategory = 
  | 'experiment-type' 
  | 'hardware-requirements' 
  | 'research-domain' 
  | 'scale';

// Predefined tag lists for each category
export interface TagCategories {
  'experiment-type': string[];
  'hardware-requirements': string[];
  'research-domain': string[];
  'scale': string[];
}

// Search and filter types
export interface ExperimentFilters {
  search?: string;
  status?: ExperimentStatus;
  resource?: string;
  researcher?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface ExperimentSortOptions {
  sortBy: 'date' | 'name' | 'status' | 'researcher' | 'duration';
  sortOrder: 'asc' | 'desc';
}

// Researcher types
export interface Researcher {
  id: string;
  name: string;
  email: string;
  department?: string;
  activeExperiments?: number;
  totalExperiments?: number;
}

// Form data types (for new experiment creation)
export interface ExperimentFormData {
  // Basic Information
  name: string;
  researcher: string;
  status: ExperimentStatus;
  assignedResource: string;
  
  // Research Details  
  description: string;
  hypothesis: string;
  methodology: string;
  
  // Technical Configuration
  datasetPath: string;
  hardwareRequirements: string;
  modelConfig: string;
  
  // Duration
  expectedDuration: string;
  durationUnit: DurationUnit;
  
  // Training Parameters
  trainingTask: string;
  batchSize: string;
  episodeLength: string;
  learningRate: string;
  stepsEpochsTrained: string;
  episodesTaskHours: string;
  framesInDataset: string;
  scoringMethod: string;
  
  // Tags
  selectedTags: string[];
  customTags: string[];
  
  // Settings
  enableMonitoring: boolean;
  enableBackup: boolean;
  enableNotifications: boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Dashboard stats types
export interface DashboardStats {
  totalExperiments: number;
  runningExperiments: number;
  completedToday: number;
  failedThisWeek: number;
  resourceUtilization: number;
}

// System alert types
export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  resourceId?: string;
  timestamp: string;
  isRead: boolean;
}

// API endpoint types (for service layer)
export interface ApiEndpoints {
  experiments: {
    list: string;
    create: string;
    get: (id: string) => string;
    update: (id: string) => string;
    delete: (id: string) => string;
  };
  resources: {
    list: string;
    get: (id: string) => string;
  };
  researchers: {
    list: string;
  };
  tags: {
    list: string;
    create: string;
  };
  dashboard: {
    stats: string;
    alerts: string;
  };
}

// Loading and error state types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FormErrors {
  [key: string]: string;
}

// Export commonly used type combinations
export type ExperimentWithFilters = Experiment & ExperimentFilters;
export type ExperimentListResponse = PaginatedResponse<Experiment>;
export type ResourceListResponse = ApiResponse<Resource[]>;
export type CreateExperimentResponse = ApiResponse<Experiment>; 