'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  getDifficultExamples,
  markDifficult as saveMark,
  unmarkDifficult as saveUnmark,
} from '@/lib/storage';
import { difficultKey, type DifficultFlag } from '@/types';

export { difficultKey };

export function useDifficultExamples() {
  const [items, setItems] = useState<Record<string, DifficultFlag>>({});

  useEffect(() => {
    setItems(getDifficultExamples());
  }, []);

  const mark = (key: string, patch?: Partial<DifficultFlag>) => {
    saveMark(key, patch);
    setItems(getDifficultExamples());
  };

  const unmark = (key: string) => {
    saveUnmark(key);
    setItems(getDifficultExamples());
  };

  const has = useMemo(() => new Set(Object.keys(items)), [items]);

  return { items, has, mark, unmark };
}
