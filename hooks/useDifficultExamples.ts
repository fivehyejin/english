'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  getDifficultExamples,
  markDifficult as saveMark,
  unmarkDifficult as saveUnmark,
} from '@/lib/storage';
import type { DifficultExample } from '@/types';

export function difficultKey(groupId: string, exampleIdx: number): string {
  return `${groupId}::${exampleIdx}`;
}

export function useDifficultExamples() {
  const [items, setItems] = useState<Record<string, DifficultExample>>({});

  useEffect(() => {
    setItems(getDifficultExamples());
  }, []);

  const mark = (key: string, patch?: Partial<DifficultExample>) => {
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
