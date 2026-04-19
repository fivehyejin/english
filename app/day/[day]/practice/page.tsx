import { notFound } from 'next/navigation';

import { PracticePage } from '@/components/PracticePage';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import { getAllDays } from '@/types';

export function generateStaticParams() {
  return getAllDays(CURRENT_CURRICULUM).map((day) => ({
    day: String(day),
  }));
}

export default function DayPracticePage({
  params,
}: {
  params: { day: string };
}) {
  const dayNum = parseInt(params.day, 10);
  const days = getAllDays(CURRENT_CURRICULUM);
  if (Number.isNaN(dayNum) || !days.includes(dayNum)) {
    notFound();
  }
  return <PracticePage day={dayNum} />;
}
