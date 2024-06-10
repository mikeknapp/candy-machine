import React from "react";

export function ErrorPage({
  error,
  info,
}: {
  error: string;
  info: React.ErrorInfo | null;
}) {
  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="my-4 text-4xl font-bold text-pink-500">
        Oops, something went wrong
      </h1>
      {error && <p className="my-5 text-lg font-bold">{error}</p>}
      {info && (
        <p className="my-5 max-w-2xl rounded-lg bg-gray-100 p-5 font-mono text-sm">
          {info.componentStack}
        </p>
      )}
    </div>
  );
}
