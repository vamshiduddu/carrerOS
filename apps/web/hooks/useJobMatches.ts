'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';

export type JobMatch = {
  id: string;
  matchScore: number;
  job: {
    id: string;
    title: string;
    company: string;
    location?: string;
    remote: boolean;
    jobType?: string;
    salary?: string;
    tags: string[];
    url: string;
    source: string;
    postedAt?: string;
  };
};

export type JobPreferences = {
  titles: string[];
  locations: string[];
  remote: boolean;
  jobTypes: string[];
  salaryMin?: number;
  salaryMax?: number;
  keywords: string[];
};

export function useJobMatches() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [prefs, setPrefs] = useState<JobPreferences>({
    titles: [], locations: [], remote: false, jobTypes: [], keywords: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  // Load cached matches + saved preferences on mount
  useEffect(() => {
    mounted.current = true;

    async function init() {
      const [matchRes, prefRes] = await Promise.allSettled([
        api.get<{ matches: JobMatch[] }>('/v1/jobs/matches'),
        api.get<JobPreferences>('/v1/jobs/preferences')
      ]);
      if (!mounted.current) return;

      if (matchRes.status === 'fulfilled') {
        setMatches(matchRes.value.matches ?? []);
        // Backend returned loading:true → it's fetching defaults, stay in refreshing state
        if ((matchRes.value as any).loading) setRefreshing(true);
      }
      if (prefRes.status === 'fulfilled' && prefRes.value.titles) {
        setPrefs(prefRes.value);
      }
      setLoading(false);
    }

    init();

    // Connect socket and listen for real-time pushes
    const socket = connectSocket();
    socket.on('job:matches', ({ matches: liveMatches }: { matches: JobMatch[]; total: number }) => {
      if (mounted.current) {
        setMatches(liveMatches);
        setRefreshing(false);
      }
    });

    return () => {
      mounted.current = false;
      socket.off('job:matches');
      disconnectSocket();
    };
  }, []);

  // Save preferences → triggers live fetch on backend → socket pushes results back
  async function savePreferences(updated: JobPreferences) {
    setPrefs(updated);
    setRefreshing(true);
    await api.put('/v1/jobs/preferences', updated);
    // Results arrive via socket 'job:matches' event; refreshing clears when they arrive
    // Fallback: if socket isn't connected, poll once after 4s
    if (!getSocket().connected) {
      setTimeout(async () => {
        if (!mounted.current) return;
        const res = await api.get<{ matches: JobMatch[] }>('/v1/jobs/matches').catch(() => null);
        if (res && mounted.current) {
          setMatches(res.matches ?? []);
          setRefreshing(false);
        }
      }, 4000);
    }
  }

  async function forceRefresh() {
    setRefreshing(true);
    const res = await api.post<{ matches: JobMatch[] }>('/v1/jobs/matches/refresh').catch(() => null);
    if (res && mounted.current) {
      setMatches(res.matches ?? []);
    }
    setRefreshing(false);
  }

  return { matches, prefs, loading, refreshing, savePreferences, forceRefresh };
}
