import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import { Tooltip } from "flowbite-react";
import "react-circular-progressbar/dist/styles.css";
import { useAppValue } from "../../hooks/useApp";

export function ProgressPieChart() {
  const app = useAppValue("project.percentComplete");

  let percentage = app.project.percentComplete;
  if (percentage === 0) {
    return;
  }

  return (
    <Tooltip content={`Images with tags`}>
      <div className="h-12 w-12">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          background
          backgroundPadding={6}
          styles={buildStyles({
            backgroundColor: "#15803d",
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
