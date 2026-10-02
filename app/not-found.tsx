import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="mb-2 font-display text-7xl font-black text-gradient">404</p>
      <p lang="bn" className="mb-6 text-ink-muted">
        পাতাটি খুঁজে পাওয়া যায়নি।
      </p>
      <Link href="/" className="btn-primary">
        <span lang="bn">হোমে ফিরে যাও</span>
      </Link>
    </main>
  );
}
