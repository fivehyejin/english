'use client';

import { useEffect, useState } from 'react';

import { getState } from '@/lib/storage';
import type { AppState } from '@/types';

export function useLastViewedDay(): AppState['lastViewedDay'] {
  const [last, setLast] = useState<AppState['lastViewedDay']>(null);

  useEffect(() => {
    setLast(getState().lastViewedDay ?? null);
  }, []);

  return last;
}
