import { Dropdown } from "flowbite-react";
import React from "react";
import { HiFolderOpen } from "react-icons/hi2";
import { useRecoilValue } from "recoil";
import { projects } from "../../state/atoms";

export function ProjectSelector() {
  const allProjects = useRecoilValue(projects);

  if (!allProjects.length) {
    return null;
  }

  return (
    <Dropdown
      size="lg"
      className="min-w-[200px]"
      label={
        <div className="flex flex-row items-center gap-2">
          <HiFolderOpen className="h-5 w-5" />{" "}
          {allProjects.length > 0 ? allProjects[0].dirName : "No Projects"}
        </div>
      }
      gradientDuoTone="pinkToOrange"
      outline
    >
      {allProjects.map((project) => (
        <Dropdown.Item
          key={project.dirName}
          value={project.dirName}
          className="p-3"
        >
          {project.dirName}
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
}
