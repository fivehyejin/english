'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { usePracticeState } from '@/hooks/usePracticeState';
import { CURRENT_CURRICULUM } from '@/lib/curriculum';
import {
  getAccuracyByDay,
  getAccuracyByKind,
  getAccuracyTrend,
  getOverallStats,
  getTopWrongGroups,
} from '@/types';

import { kindLabel } from '@/components/practice/kindLabels';

const CONFIG_KEY = 'english-global-practice-config';
const DIFF_KEYS = 'english-global-practice-difficult-keys';

function groupTitle(groupId: string): string {
  const g = CURRENT_CURRICULUM.groups.find((x) => x.id === groupId);
  return g?.title ?? groupId;
}

export default function DashboardPage() {
  const router = useRouter();
  const { practice } = usePracticeState();

  const overall = getOverallStats(practice);
  const trend = getAccuracyTrend(practice, 20);
  const dayStats = getAccuracyByDay(practice);
  const kindStats = getAccuracyByKind(practice);
  const topWrong = getTopWrongGroups(practice, 5);

  const weakestDay =
    dayStats.length > 0
      ? [...dayStats].sort((a, b) => a.accuracy - b.accuracy)[0].day
      : null;

  const startTopWrongSession = () => {
    const topGroupIds = new Set(topWrong.map((g) => g.groupId));
    const keys = Object.entries(practice.wrongBank)
      .filter(([key]) => {
        const gid = key.split(':')[0];
        return topGroupIds.has(gid);
      })
      .sort((a, b) => b[1].wrongCount - a[1].wrongCount)
      .map(([key]) => key);
    if (keys.length === 0) return;

    sessionStorage.setItem(
      CONFIG_KEY,
      JSON.stringify({
        scope: 'all',
        kinds: ['collocation', 'minimal-pairs', 'composition'],
        length: 'all',
        source: 'wrong-bank',
        retryWrongInSession: true,
      })
    );
    sessionStorage.setItem(DIFF_KEYS, JSON.stringify(keys));
    router.push('/practice/session/');
  };

  return (
    <article className="mx-auto max-w-4xl space-y-10">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← 홈으로
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
          📊 대시보드
        </h1>
      </div>

      {overall.sessions === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-8 text-center md:p-10">
          <p className="text-muted-foreground">아직 푼 세션이 없어요.</p>
          <Link
            href="/practice/"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            🎯 전체 연습 시작하기 →
          </Link>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: '총 세션', value: overall.sessions, suffix: '회' },
              { label: '총 푼 문제', value: overall.totalQuestions, suffix: '개' },
              {
                label: '전체 정답률',
                value: Math.round(overall.overallAccuracy * 100),
                suffix: '%',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border bg-card p-4 text-center md:p-5"
              >
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </div>
                <div className="mt-2 text-2xl font-bold tabular-nums md:text-3xl">
                  {stat.value}
                  <span className="ml-0.5 text-sm font-medium text-muted-foreground">
                    {stat.suffix}
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              회차별 정답률 추이 <span className="normal-case font-normal">(최근 20회)</span>
            </h2>
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    domain={[0, 1]}
                    tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                    formatter={(value) => {
                      const n = typeof value === 'number' ? value : Number(value ?? 0);
                      return [`${Math.round(n * 100)}%`, '정답률'];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Day별 정답률
            </h2>
            <div className="space-y-2">
              {dayStats.map((d) => {
                const pct = Math.round(d.accuracy * 100);
                const weakest = weakestDay === d.day;
                return (
                  <div key={d.day} className="flex items-center gap-3 text-sm">
                    <div className="w-14 tabular-nums text-muted-foreground">Day {d.day}</div>
                    <div className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                      <div
                        className="h-full bg-primary transition-none"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-14 text-right font-medium tabular-nums">{pct}%</div>
                    <div className="w-20 text-right text-xs tabular-nums text-muted-foreground">
                      {d.correct}/{d.attempted}
                    </div>
                    {weakest ? (
                      <span className="w-10 text-xs font-medium text-accent">← 약함</span>
                    ) : (
                      <span className="w-10" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              유형별 정답률
            </h2>
            <div className="space-y-2">
              {kindStats.map((k) => {
                const pct = Math.round(k.accuracy * 100);
                return (
                  <div key={k.kind} className="flex items-center gap-3 text-sm">
                    <div className="w-28 text-muted-foreground">{kindLabel(k.kind)}</div>
                    <div className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                      <div
                        className="h-full bg-primary transition-none"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-14 text-right font-medium tabular-nums">{pct}%</div>
                    <div className="w-20 text-right text-xs tabular-nums text-muted-foreground">
                      {k.correct}/{k.attempted}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              가장 많이 틀리는 그룹 Top 5
            </h2>
            <ol className="space-y-2">
              {topWrong.map((g, i) => (
                <li
                  key={g.groupId}
                  className="flex items-baseline gap-3 rounded-md border bg-card px-4 py-3"
                >
                  <span className="w-5 text-sm font-bold tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{groupTitle(g.groupId)}</div>
                    <div className="text-xs text-muted-foreground">{g.groupId}</div>
                  </div>
                  <div className="text-sm tabular-nums text-muted-foreground">
                    {g.wrongCount}회 · {g.uniqueExamples}예문
                  </div>
                </li>
              ))}
            </ol>
            {topWrong.length > 0 ? (
              <Button onClick={startTopWrongSession} variant="outline" className="mt-4 w-full">
                Top 5 바로 풀기 →
              </Button>
            ) : null}
          </section>
        </>
      )}
    </article>
  );
}
