import Link from 'next/link';

// TODO(phase 3): replace with the globe hero and landing sections.
export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1">
      <h1 className="text-2xl font-bold mb-4">Road to AI</h1>
      <p>
        <Link href="/ZeroToHero/" className="font-medium underline">
          Neural Networks
        </Link>{' '}
        ·{' '}
        <Link href="/Books/" className="font-medium underline">
          Library
        </Link>
      </p>
    </div>
  );
}
