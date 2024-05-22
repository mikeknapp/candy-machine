import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { useRecoilValueLoadable } from "recoil";
import { currentProjectSelector } from "../../state/atoms";

import { Tooltip } from "flowbite-react";
import "react-circular-progressbar/dist/styles.css";

export function ProgressPieChart() {
  let percentage = 0;

  const projectLoadable = useRecoilValueLoadable(currentProjectSelector);

  if (projectLoadable.state !== "hasValue") {
    return;
  }

  const project = projectLoadable.contents;
  if (project.images.length === 0) {
    return;
  }

  const imageIndex = project.images.indexOf(project.selectedImage);
  percentage = Math.round(((imageIndex + 1) / project.images.length) * 100);

  return (
    <Tooltip content={`${project.images.length}\u00A0images`}>
      <div className="h-12 w-12">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          background
          backgroundPadding={6}
          styles={buildStyles({
            backgroundColor: "#065f46",
            textColor: "#fff",
            pathColor: "#fff",
            trailColor: "transparent",
            textSize: "24px",
          })}
        />
      </div>
    </Tooltip>
  );
}
