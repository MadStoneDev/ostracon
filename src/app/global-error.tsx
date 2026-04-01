"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="relative bg-primary dark:text-light text-dark">
        <div className="mx-auto flex flex-col items-center justify-center min-h-dvh w-full max-w-4xl px-6">
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
        </div>
      </body>
    </html>
  );
}
