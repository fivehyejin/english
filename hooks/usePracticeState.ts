'use client';

import { useEffect, useState } from 'react';

import { getPracticeState } from '@/lib/storage';
import { emptyPracticeState, type PracticeState } from '@/types';

export function usePracticeState() {
  const [practice, setPractice] = useState<PracticeState>(emptyPracticeState());

  const refresh = () => {
    setPractice(getPracticeState());
  };

  useEffect(() => {
    refresh();
  }, []);

  return { practice, refresh };
}
