import { Dropdown } from "flowbite-react";
import React from "react";
import { HiFolderOpen } from "react-icons/hi2";
import { useRecoilValueLoadable, useSetRecoilState } from "recoil";
import { Project, loadProject } from "../../models/project";
import { currentProjectSelector, projectsAtom } from "../../state/atoms";

export function ProjectSelector() {
  const projectsLoading = useRecoilValueLoadable(projectsAtom);
  const setCurrentProject = useSetRecoilState(currentProjectSelector);

  if (projectsLoading.state === "loading") {
    return null;
  }

  const projects = projectsLoading.contents as Project[];

  return (
    <Dropdown
      size="lg"
      className="min-w-[200px]"
      label={
        <div className="flex flex-row items-center gap-2">
          <HiFolderOpen className="h-5 w-5 text-primary-600" />{" "}
          {projects.length > 0 ? projects[0].name : "No Projects"}
        </div>
      }
      color="gray"
    >
      {projects.map((project) => (
        <Dropdown.Item
          key={project.name}
          value={project.name}
          className="p-3"
          onClick={async () =>
            setCurrentProject(await loadProject(project.name))
          }
        >
          {project.name}
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
}
