import { Dropdown, Tooltip } from "flowbite-react";
import React, { useState } from "react";
import { HiTag } from "react-icons/hi";
import { HiInformationCircle, HiMiniPlus } from "react-icons/hi2";
import { Project } from "../../models/project";
import { Tag } from "./Tag";

export function SuggestedAutoTags({ project }: { project: Project }) {
  const [chosenTags, setChosenTags] = useState<Record<string, string>>({});

  return (
    <>
      {project.autoTags.map((tag) => (
        <div
          key={`setup-tag-${tag.tag}`}
          className="flex flex-row justify-between p-10"
        >
          <div className="flex flex-row items-center gap-3">
            <Tag tag={tag.tag} />

            {tag.examples.length > 0 && (
              <Tooltip
                className="max-w-[300px]"
                content={`This is a fill-in tag. It helps keep the tag selection screen clean. Examples from your dataset include: ${tag.examples.join(", ")}`}
              >
                <HiInformationCircle className="h-5 w-5 text-gray-400" />
              </Tooltip>
            )}
          </div>

          <Dropdown
            size="sm"
            color="light"
            label={
              <div className="flex w-[180px] flex-row items-center">
                {chosenTags[tag.tag] ? (
                  <>
                    <HiTag
                      style={{
                        color: project.tagLayout.find(
                          (category) => category.title === chosenTags[tag.tag],
                        )?.color,
                      }}
                      className="mr-2 h-5 w-5"
                    />
                    {chosenTags[tag.tag]}
                  </>
                ) : (
                  <>
                    <HiMiniPlus className="mr-2 h-5 w-5" /> Add to Category
                  </>
                )}
              </div>
            }
          >
            {project.tagLayout.map((category) => (
              <Dropdown.Item
                key={`${tag}-${category.title}`}
                onClick={() => {
                  setChosenTags({
                    ...chosenTags,
                    [tag.tag]: category.title,
                  });
                }}
              >
                <HiTag
                  style={{
                    color: category.color,
                  }}
                  className="mr-2 h-5 w-5"
                />
                {category.title}
              </Dropdown.Item>
            ))}
          </Dropdown>
        </div>
      ))}
    </>
  );
}
