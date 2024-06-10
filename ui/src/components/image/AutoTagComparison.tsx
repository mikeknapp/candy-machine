import { Tooltip } from "flowbite-react";
import React from "react";

interface AutoTagComparisonProps {
  filename: string;
  tags: string[];
  autoTags: string[];
  synonyms: string[];
}

export function AutoTagComparison(props: AutoTagComparisonProps) {
  return (
    <>
      {props.autoTags?.map((tag, i) => {
        return (
          <span key={`auto-tag-${i}`}>
            {(props.tags ?? []).includes(tag) ? (
              <span className="font-normal text-green-500">{tag}</span>
            ) : (props.synonyms ?? []).includes(tag) ? (
              <Tooltip
                content="Already covered by trigger word"
                theme={{
                  target: "inline",
                }}
              >
                <span className="text-gray-500">
                  <s>{tag}</s>
                </span>
              </Tooltip>
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
