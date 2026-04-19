import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <h1 className="text-2xl font-bold text-foreground">찾을 수 없음</h1>
      <p className="mt-2 text-muted-foreground">요청한 Day가 없습니다.</p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        목차로 돌아가기
      </Link>
    </div>
  );
}
