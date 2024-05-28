import React from "react";

export function Tag({ tag }: { tag: string }) {
  // If the tag has a fill in suffix, like {type}, color that part blue.
  const match = tag.match(/{([^}]+)}/);
  let inner: React.JSX.Element = <>{tag}</>;
  if (match) {
    const fillInSuffix = match[0];
    const suffix = tag.split(fillInSuffix)[1];
    inner = (
      <>
        <span className="text-blue-500 dark:font-bold">{fillInSuffix}</span>
        <span>{suffix}</span>
      </>
    );
  }
  return (
    <div className="dark: inline whitespace-nowrap rounded-md bg-gray-300 p-3 drop-shadow-md dark:bg-slate-800 dark:text-white">
      {inner}
    </div>
  );
}
