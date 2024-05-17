import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { useRecoilValueLoadable } from "recoil";
import { currentProjectAtom, selectedImageAtom } from "../../state/atoms";

import "react-circular-progressbar/dist/styles.css";

export function ProgressPieChart() {
  let percentage = 0;

  const projectLoadable = useRecoilValueLoadable(currentProjectAtom);
  const selectedImageLoadable = useRecoilValueLoadable(selectedImageAtom);

  if (
    projectLoadable.state !== "hasValue" ||
    selectedImageLoadable.state !== "hasValue"
  ) {
    return;
  }

  const project = projectLoadable.contents;
  const selectedImage = selectedImageLoadable.contents;

  if (project.images.length === 0) {
    return;
  }

  const imageIndex = project.images.indexOf(selectedImage);
  percentage = Math.round(((imageIndex + 1) / project.images.length) * 100);

  return (
    <div className="h-12 w-12">
      <CircularProgressbar
        value={percentage}
        text={`${percentage}%`}
        background
        backgroundPadding={6}
        styles={buildStyles({
          backgroundColor: "#cb3365",
          textColor: "#fff",
          pathColor: "#fff",
          trailColor: "transparent",
          textSize: "24px",
        })}
      />
    </div>
  );
}
