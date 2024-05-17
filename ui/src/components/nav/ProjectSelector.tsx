import { Dropdown } from "flowbite-react";
import React from "react";
import { HiFolderOpen } from "react-icons/hi2";
import { useRecoilValueLoadable } from "recoil";
import Project from "../../models/project";
import { projectsAtom } from "../../state/atoms";

export function ProjectSelector() {
  const projectsLoading = useRecoilValueLoadable(projectsAtom);

  if (projectsLoading.state === "loading") {
    return null;
  }

  const projects = projectsLoading.contents;

  return (
    <Dropdown
      size="lg"
      className="min-w-[200px]"
      label={
        <div className="flex flex-row items-center gap-2">
          <HiFolderOpen className="text-primary-600 h-5 w-5" />{" "}
          {projects.length > 0 ? projects[0].dirName : "No Projects"}
        </div>
      }
      color="gray"
    >
      {projects.map((project: Project) => (
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
