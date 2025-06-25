import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create researchers
  const researchers = await Promise.all([
    prisma.researcher.upsert({
      where: { name: 'Alex Chen' },
      update: {},
      create: {
        name: 'Alex Chen',
        email: 'alex.chen@company.com',
        department: 'Computer Vision',
      },
    }),
    prisma.researcher.upsert({
      where: { name: 'Sarah Kim' },
      update: {},
      create: {
        name: 'Sarah Kim',
        email: 'sarah.kim@company.com',
        department: 'Robotics',
      },
    }),
    prisma.researcher.upsert({
      where: { name: 'Mike Johnson' },
      update: {},
      create: {
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        department: 'Reinforcement Learning',
      },
    }),
    prisma.researcher.upsert({
      where: { name: 'Emily Davis' },
      update: {},
      create: {
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        department: 'Data Engineering',
      },
    }),
    prisma.researcher.upsert({
      where: { name: 'Dr. Smith' },
      update: {},
      create: {
        name: 'Dr. Smith',
        email: 'dr.smith@company.com',
        department: 'Research Lead',
      },
    }),
  ]);

  console.log('✅ Created researchers');

  // Create resources
  const resources = await Promise.all([
    prisma.resource.upsert({
      where: { resourceId: 'gpu-cluster-1' },
      update: {},
      create: {
        resourceId: 'gpu-cluster-1',
        name: 'GPU Cluster Alpha',
        type: 'Compute',
        totalUnits: '8x A100',
        status: 'active',
        currentUsage: 85,
        currentExperiment: 'Vision Model Training v2.1',
        estimatedCompletion: '2h 15m',
      },
    }),
    prisma.resource.upsert({
      where: { resourceId: 'gpu-cluster-2' },
      update: {},
      create: {
        resourceId: 'gpu-cluster-2',
        name: 'GPU Cluster Beta',
        type: 'Compute',
        totalUnits: '4x RTX 3090',
        status: 'idle',
        currentUsage: 0,
      },
    }),
    prisma.resource.upsert({
      where: { resourceId: 'physical-lab-a' },
      update: {},
      create: {
        resourceId: 'physical-lab-a',
        name: 'Physical Lab A',
        type: 'Physical Hardware',
        totalUnits: 'Robotic Arm Setup',
        status: 'active',
        currentUsage: 100,
        currentExperiment: 'Calibration Tests',
        estimatedCompletion: '45m',
      },
    }),
    prisma.resource.upsert({
      where: { resourceId: 'cpu-cluster' },
      update: {},
      create: {
        resourceId: 'cpu-cluster',
        name: 'CPU Processing Cluster',
        type: 'Compute',
        totalUnits: '64 cores',
        status: 'active',
        currentUsage: 45,
        currentExperiment: 'Data Preprocessing',
        estimatedCompletion: '6h 30m',
      },
    }),
    prisma.resource.upsert({
      where: { resourceId: 'storage-primary' },
      update: {},
      create: {
        resourceId: 'storage-primary',
        name: 'Primary Storage',
        type: 'Storage',
        totalUnits: '50TB',
        status: 'active',
        currentUsage: 73,
        currentExperiment: 'Multiple',
      },
    }),
  ]);

  console.log('✅ Created resources');

  // Helper to get date strings relative to today
  const getDateString = (daysFromToday: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    return date.toISOString().split('T')[0];
  };

  // Create sample experiments
  const experiments = await Promise.all([
    // Dashboard experiments
    prisma.experiment.upsert({
      where: { id: 'exp-dashboard-1' },
      update: {},
      create: {
        id: 'exp-dashboard-1',
        name: 'Vision Model Training v2.1',
        researcher: 'Alex Chen',
        status: 'in-progress',
        startDate: getDateString(-2),
        endDate: getDateString(1),
        expectedDuration: '3',
        durationUnit: 'days',
        assignedResource: 'gpu-cluster-1',
        resourceUtilization: '85',
        description: 'Training computer vision model for object detection',
        tags: JSON.stringify(['computer-vision', 'gpu-intensive', 'perception', 'large-scale']),
      },
    }),
    prisma.experiment.upsert({
      where: { id: 'exp-dashboard-2' },
      update: {},
      create: {
        id: 'exp-dashboard-2',
        name: 'Robotic Arm Calibration',
        researcher: 'Sarah Kim',
        status: 'completed',
        startDate: getDateString(-3),
        endDate: getDateString(-3),
        expectedDuration: '6',
        durationUnit: 'hours',
        assignedResource: 'physical-lab-a',
        resourceUtilization: '100',
        description: 'Calibrating robotic arm for precision tasks',
        tags: JSON.stringify(['robotics', 'robotic-hardware', 'manipulation', 'small-scale']),
      },
    }),
    // Schedule experiments
    prisma.experiment.upsert({
      where: { id: 'exp-today' },
      update: {},
      create: {
        id: 'exp-today',
        name: 'Model Validation Tests',
        researcher: 'Dr. Smith',
        status: 'in-progress',
        startDate: getDateString(0),
        endDate: getDateString(0),
        expectedDuration: '4',
        durationUnit: 'hours',
        assignedResource: 'gpu-cluster-1',
        resourceUtilization: '60',
        description: 'Running validation tests on trained models',
        tags: JSON.stringify(['model-validation', 'supervised-learning', 'small-scale']),
      },
    }),
    prisma.experiment.upsert({
      where: { id: 'exp-tomorrow' },
      update: {},
      create: {
        id: 'exp-tomorrow',
        name: 'Robotic Arm Calibration',
        researcher: 'Sarah Kim',
        status: 'planned',
        startDate: getDateString(1),
        endDate: getDateString(1),
        expectedDuration: '6',
        durationUnit: 'hours',
        assignedResource: 'physical-lab-a',
        resourceUtilization: '100',
        description: 'Calibrating robotic arm for precision tasks',
        tags: JSON.stringify(['robotics', 'robotic-hardware', 'manipulation', 'small-scale']),
      },
    }),
    prisma.experiment.upsert({
      where: { id: 'exp-multiday' },
      update: {},
      create: {
        id: 'exp-multiday',
        name: 'Vision Model Training v2.1',
        researcher: 'Alex Chen',
        status: 'planned',
        startDate: getDateString(2),
        endDate: getDateString(5),
        expectedDuration: '3',
        durationUnit: 'days',
        assignedResource: 'gpu-cluster-2',
        resourceUtilization: '80',
        description: 'Training computer vision model for object detection',
        tags: JSON.stringify(['computer-vision', 'gpu-intensive', 'perception', 'large-scale']),
      },
    }),
  ]);

  console.log('✅ Created experiments');

  // Create some predefined tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'computer-vision' },
      update: {},
      create: {
        name: 'computer-vision',
        category: 'Experiment Type',
        color: '#3B82F6',
      },
    }),
    prisma.tag.upsert({
      where: { name: 'reinforcement-learning' },
      update: {},
      create: {
        name: 'reinforcement-learning',
        category: 'Experiment Type',
        color: '#10B981',
      },
    }),
    prisma.tag.upsert({
      where: { name: 'robotics' },
      update: {},
      create: {
        name: 'robotics',
        category: 'Experiment Type',
        color: '#8B5CF6',
      },
    }),
    prisma.tag.upsert({
      where: { name: 'gpu-intensive' },
      update: {},
      create: {
        name: 'gpu-intensive',
        category: 'Hardware Requirements',
        color: '#F59E0B',
      },
    }),
  ]);

  console.log('✅ Created tags');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 