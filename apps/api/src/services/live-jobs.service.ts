import { prisma } from '../config/database';

type NormalizedJob = {
  source: string;
  externalId: string;
  url: string;
  title: string;
  company: string;
  description: string;
  location: string;
  remote: boolean;
  jobType: string;
  tags: string[];
  postedAt: Date | null;
};

// ── Arbeitnow (no auth, global remote + on-site jobs) ──────────────────────
async function fetchArbeitnow(query: string, _location: string): Promise<NormalizedJob[]> {
  const params = new URLSearchParams({ search: query });
  const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?${params}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) return [];

  const data = await res.json() as { data?: any[] };
  return (data.data ?? []).slice(0, 20).map((j: any) => ({
    source: 'arbeitnow',
    externalId: j.slug ?? j.url,
    url: j.url ?? '',
    title: j.title ?? '',
    company: j.company_name ?? '',
    description: stripHtml(j.description ?? '').slice(0, 1000),
    location: j.location ?? '',
    remote: Boolean(j.remote),
    jobType: (j.job_types ?? [])[0] ?? 'full-time',
    tags: j.tags ?? [],
    postedAt: j.created_at ? new Date(j.created_at * 1000) : null
  }));
}

// ── Remotive (no auth, remote-only jobs) ──────────────────────────────────
async function fetchRemotive(query: string): Promise<NormalizedJob[]> {
  const params = new URLSearchParams({ search: query, limit: '20' });
  const res = await fetch(`https://remotive.com/api/remote-jobs?${params}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) return [];

  const data = await res.json() as { jobs?: any[] };
  return (data.jobs ?? []).slice(0, 20).map((j: any) => ({
    source: 'remotive',
    externalId: String(j.id),
    url: j.url ?? '',
    title: j.title ?? '',
    company: j.company_name ?? '',
    description: stripHtml(j.description ?? '').slice(0, 1000),
    location: j.candidate_required_location ?? 'Remote',
    remote: true,
    jobType: j.job_type ?? 'full-time',
    tags: j.tags ?? [],
    postedAt: j.publication_date ? new Date(j.publication_date) : null
  }));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Upsert jobs into DB and return their IDs ───────────────────────────────
async function upsertJobs(jobs: NormalizedJob[]): Promise<string[]> {
  const ids: string[] = [];
  for (const job of jobs) {
    if (!job.externalId || !job.url) continue;
    try {
      const record = await prisma.jobListing.upsert({
        where: { source_externalId: { source: job.source, externalId: job.externalId } },
        create: {
          source: job.source,
          externalId: job.externalId,
          url: job.url,
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location,
          remote: job.remote,
          jobType: job.jobType,
          tags: job.tags,
          postedAt: job.postedAt
        },
        update: {
          title: job.title,
          description: job.description,
          location: job.location,
          remote: job.remote,
          jobType: job.jobType,
          tags: job.tags
        },
        select: { id: true }
      });
      ids.push(record.id);
    } catch { /* skip duplicate constraint races */ }
  }
  return ids;
}

// ── Main export: fetch live jobs matching preferences ──────────────────────
export type Preference = {
  titles: string[];
  locations: string[];
  remote: boolean;
  jobTypes: string[];
  keywords: string[];
};

export async function fetchLiveJobsForPreferences(prefs: Preference): Promise<string[]> {
  // Build a search query from title + keywords
  const queryTerms = [...prefs.titles, ...prefs.keywords].filter(Boolean);
  if (queryTerms.length === 0) return [];

  const query = queryTerms.slice(0, 3).join(' ');
  const location = prefs.locations[0] ?? '';

  const [arbeitnowJobs, remotiveJobs] = await Promise.allSettled([
    fetchArbeitnow(query, location),
    prefs.remote ? fetchRemotive(query) : Promise.resolve([])
  ]);

  const allJobs: NormalizedJob[] = [
    ...(arbeitnowJobs.status === 'fulfilled' ? arbeitnowJobs.value : []),
    ...(remotiveJobs.status === 'fulfilled' ? remotiveJobs.value : [])
  ];

  // Filter by remote preference
  const filtered = prefs.remote ? allJobs : allJobs.filter((j) => !j.remote || prefs.locations.length === 0);

  return upsertJobs(filtered);
}
