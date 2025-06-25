import { TagCategories, ExperimentStatus, DurationUnit, ResourceType } from '../types';

// Predefined tags organized by category
export const TAG_CATEGORIES: TagCategories = {
  'experiment-type': [
    'computer-vision',
    'reinforcement-learning', 
    'supervised-learning',
    'unsupervised-learning',
    'robotics',
    'simulation',
    'data-collection',
    'model-validation',
    'hyperparameter-tuning',
    'ablation-study'
  ],
  'hardware-requirements': [
    'gpu-intensive',
    'cpu-only',
    'robotic-hardware',
    'camera-required',
    'sensors',
    'high-memory',
    'distributed',
    'edge-computing',
    'cloud-compute'
  ],
  'research-domain': [
    'manipulation',
    'navigation',
    'perception',
    'planning',
    'control',
    'learning',
    'safety',
    'multi-agent',
    'human-robot-interaction',
    'nlp',
    'audio-processing'
  ],
  'scale': [
    'small-scale',
    'medium-scale', 
    'large-scale',
    'proof-of-concept',
    'production-ready',
    'pilot-study',
    'full-deployment'
  ]
};

// All tags flattened for easy access
export const ALL_TAGS = Object.values(TAG_CATEGORIES).flat();

// Experiment status options with display labels
export const EXPERIMENT_STATUS_OPTIONS: Array<{
  value: ExperimentStatus;
  label: string;
  description?: string;
}> = [
  { 
    value: 'planned', 
    label: 'Planned',
    description: 'Experiment is planned but not yet started'
  },
  { 
    value: 'in-progress', 
    label: 'In Progress',
    description: 'Experiment is currently running'
  },
  { 
    value: 'completed', 
    label: 'Completed',
    description: 'Experiment finished successfully'
  },
  { 
    value: 'failed', 
    label: 'Failed',
    description: 'Experiment encountered errors or failed'
  },
  { 
    value: 'paused', 
    label: 'Paused',
    description: 'Experiment temporarily stopped'
  }
];

// Duration unit options
export const DURATION_UNIT_OPTIONS: Array<{
  value: DurationUnit;
  label: string;
}> = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' }
];

// Resource type mappings
export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  'gpu-cluster': 'GPU Cluster',
  'physical-lab': 'Physical Lab',
  'cpu-cluster': 'CPU Cluster',
  'storage': 'Storage System'
};

// Predefined resources (matching your current data)
export const PREDEFINED_RESOURCES = [
  {
    id: 'gpu-cluster-1',
    name: 'GPU Cluster Alpha',
    type: 'gpu-cluster' as ResourceType,
    description: '8x NVIDIA A100 GPUs',
    capacity: '8x A100',
  },
  {
    id: 'gpu-cluster-2', 
    name: 'GPU Cluster Beta',
    type: 'gpu-cluster' as ResourceType,
    description: '4x NVIDIA RTX 3090 GPUs',
    capacity: '4x RTX 3090',
  },
  {
    id: 'physical-lab-a',
    name: 'Physical Lab A',
    type: 'physical-lab' as ResourceType,
    description: 'Robotic Arm Setup',
    capacity: '1x Robotic Arm',
  },
  {
    id: 'cpu-cluster',
    name: 'CPU Processing Cluster',
    type: 'cpu-cluster' as ResourceType,
    description: '64-core CPU cluster',
    capacity: '64 cores',
  },
  {
    id: 'storage-primary',
    name: 'Primary Storage',
    type: 'storage' as ResourceType,
    description: 'Main data storage system',
    capacity: '50TB',
  }
];

// Predefined researchers (matching your current data)
export const PREDEFINED_RESEARCHERS = [
  'Alex Chen',
  'Sarah Kim', 
  'Mike Johnson',
  'Emily Davis',
  'Dr. Smith',
  'Dr. Johnson',
  'Prof. Wilson'
];

// Training task options for ML/RL experiments
export const TRAINING_TASK_OPTIONS = [
  'Classification',
  'Object Detection',
  'Semantic Segmentation',
  'Reinforcement Learning',
  'Imitation Learning',
  'Multi-task Learning',
  'Transfer Learning',
  'Fine-tuning',
  'Feature Extraction',
  'Data Augmentation'
];

// Scoring method options
export const SCORING_METHOD_OPTIONS = [
  'Accuracy',
  'F1 Score',
  'ROC-AUC',
  'Mean Squared Error',
  'Mean Average Precision',
  'Reward Sum',
  'Success Rate',
  'Custom Metric',
  'Human Evaluation',
  'Automated Testing'
];

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// UI Constants
export const PAGE_SIZES = [10, 25, 50, 100];

export const DEFAULT_PAGE_SIZE = 25;

// Form validation constants
export const VALIDATION_RULES = {
  EXPERIMENT_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000
  },
  BATCH_SIZE: {
    MIN: 1,
    MAX: 10000
  },
  LEARNING_RATE: {
    MIN: 0.00001,
    MAX: 1
  }
} as const;

// Badge color mappings for experiment status
export const STATUS_BADGE_VARIANTS = {
  'planned': 'neutral',
  'in-progress': 'success', 
  'completed': 'neutral',
  'failed': 'error',
  'paused': 'neutral'
} as const; 