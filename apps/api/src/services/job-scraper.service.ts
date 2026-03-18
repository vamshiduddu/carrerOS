import { prisma } from '../config/database';
import { logger } from '../config/logger';

const SAMPLE_JOBS = [
  {
    source: 'seed',
    url: 'https://jobs.example.com/software-engineer-1',
    title: 'Software Engineer',
    company: 'Apex Technologies'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/senior-software-engineer',
    title: 'Senior Software Engineer',
    company: 'NovaStar Corp'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/frontend-engineer',
    title: 'Frontend Engineer',
    company: 'Pixel Labs'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/backend-engineer',
    title: 'Backend Engineer',
    company: 'CloudStack Inc'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/fullstack-engineer',
    title: 'Full Stack Engineer',
    company: 'Bridge Systems'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/product-manager',
    title: 'Product Manager',
    company: 'Orbit Ventures'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/senior-product-manager',
    title: 'Senior Product Manager',
    company: 'Momentum AI'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/data-scientist',
    title: 'Data Scientist',
    company: 'DataWave Analytics'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/ml-engineer',
    title: 'Machine Learning Engineer',
    company: 'Neural Dynamics'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/devops-engineer',
    title: 'DevOps Engineer',
    company: 'Infra Solutions'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/site-reliability-engineer',
    title: 'Site Reliability Engineer',
    company: 'ScaleNet'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/mobile-engineer-ios',
    title: 'iOS Engineer',
    company: 'AppForge'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/mobile-engineer-android',
    title: 'Android Engineer',
    company: 'AppForge'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/staff-engineer',
    title: 'Staff Engineer',
    company: 'Hyperion Tech'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/engineering-manager',
    title: 'Engineering Manager',
    company: 'Cascade Networks'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/ui-ux-designer',
    title: 'UX/UI Designer',
    company: 'DesignPulse'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/qa-engineer',
    title: 'QA Engineer',
    company: 'Qualitek'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/data-engineer',
    title: 'Data Engineer',
    company: 'StreamLine Data'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/cloud-architect',
    title: 'Cloud Architect',
    company: 'SkyBridge Cloud'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/security-engineer',
    title: 'Security Engineer',
    company: 'Fortress Security'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/blockchain-developer',
    title: 'Blockchain Developer',
    company: 'ChainCore'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/react-developer',
    title: 'React Developer',
    company: 'WebCraft Studio'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/node-developer',
    title: 'Node.js Developer',
    company: 'ServerSide Labs'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/python-developer',
    title: 'Python Developer',
    company: 'Pythonic Solutions'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/golang-engineer',
    title: 'Go Engineer',
    company: 'GopherHQ'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/rust-engineer',
    title: 'Rust Engineer',
    company: 'LowLevel Systems'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/technical-lead',
    title: 'Technical Lead',
    company: 'Zenith Software'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/solutions-architect',
    title: 'Solutions Architect',
    company: 'Enterprise Edge'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/ai-engineer',
    title: 'AI Engineer',
    company: 'FutureAI Labs'
  },
  {
    source: 'seed',
    url: 'https://jobs.example.com/platform-engineer',
    title: 'Platform Engineer',
    company: 'PlatformOps'
  }
];

export async function seedJobs(): Promise<void> {
  const count = await prisma.jobListing.count();
  if (count > 0) {
    logger.info(`[JobScraper] DB already has ${count} jobs, skipping seed`);
    return;
  }

  logger.info(`[JobScraper] Seeding ${SAMPLE_JOBS.length} sample jobs`);
  await prisma.jobListing.createMany({ data: SAMPLE_JOBS });
  logger.info('[JobScraper] Job seed complete');
}
