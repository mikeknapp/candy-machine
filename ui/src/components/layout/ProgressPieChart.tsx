import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import { Tooltip } from "flowbite-react";
import "react-circular-progressbar/dist/styles.css";
import { useAppValue } from "../../hooks/useApp";

export function ProgressPieChart() {
  const app = useAppValue("project.images", "project.selectedImage.filename");

  const images = app.project.images;
  const filename = app.project.selectedImage?.filename;

  let percentage = 0;
  if (images.length === 0) {
    return;
  }

  const imageIndex = images.indexOf(filename);
  percentage = Math.round(((imageIndex + 1) / images.length) * 100);

  return (
    <Tooltip content={`${images.length}\u00A0images`}>
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
