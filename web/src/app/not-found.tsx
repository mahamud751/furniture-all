import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-2xl font-medium text-(--brand) lg:text-5xl">Page not found</h1>
      <p className="mt-4 text-(--secondary)">The page you are looking for is not available.</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-[5px] bg-(--primary) px-8 text-sm font-medium text-white"
      >
        Back to home
      </Link>
    </section>
  );
}
