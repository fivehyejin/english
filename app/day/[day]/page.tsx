import { notFound } from 'next/navigation';

import { DayView } from '@/components/DayView';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import { getAllDays } from '@/types';

/** 정적 내보내기: 존재하는 Day 경로만 HTML 생성 */
export function generateStaticParams() {
  return getAllDays(CURRENT_CURRICULUM).map((day) => ({
    day: String(day),
  }));
}

export default function DayPage({ params }: { params: { day: string } }) {
  const dayNum = parseInt(params.day, 10);
  const days = getAllDays(CURRENT_CURRICULUM);
  if (Number.isNaN(dayNum) || !days.includes(dayNum)) {
    notFound();
  }
  if (!CURRENT_CURRICULUM.daySummaries[dayNum]) {
    notFound();
  }
  return <DayView day={dayNum} />;
}
