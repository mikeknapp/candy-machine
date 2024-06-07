import React from "react";

interface AutoTagComparisonProps {
  filename: string;
  tags: string[];
  autoTags: string[];
  synonyms: string[];
}

export function AutoTagComparison(props: AutoTagComparisonProps) {
  const selected = (props.tags ?? []).concat(props.synonyms);

  return (
    <>
      {props.autoTags?.map((tag, i) => {
        return (
          <span key={`auto-tag-${i}`}>
            {selected.includes(tag) ? (
              <span className="font-normal text-green-500">{tag}</span>
            ) : (
              <span className="text-red-500">{tag}</span>
            )}
            {i < props.autoTags?.length - 1 ? ", " : ""}
          </span>
        );
      })}
    </>
  );
}
