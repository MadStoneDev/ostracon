"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="flex-grow flex flex-col items-center justify-center h-full px-6"
      style={{ paddingTop: "60px" }}
    >
      <h1 className="font-serif text-4xl font-black mb-4">
        Something went wrong
      </h1>
      <p className="text-lg mb-6">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-dark text-light dark:bg-light dark:text-dark rounded-md font-semibold"
      >
        Try again
      </button>
    </main>
  );
}
