import { Dropdown, Spinner } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { HiFolderOpen } from "react-icons/hi2";
import { useRecoilStateLoadable, useRecoilValueLoadable } from "recoil";
import { Project, loadProject } from "../../models/project";
import { currentProjectSelector, projectsAtom } from "../../state/atoms";

export function ProjectSelector() {
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const projectsLoading = useRecoilValueLoadable(projectsAtom);
  const [currentProjectLoading, setCurrentProject] = useRecoilStateLoadable(
    currentProjectSelector,
  );

  let projects: Project[] = [];
  let currentProject: Project = null;

  useEffect(() => {
    if (currentProject) {
      document.title = `Candy Machine (${currentProject.images.length})`;
    } else {
      document.title = "Candy Machine";
    }
  }, [currentProject]);

  if (
    projectsLoading.state === "loading" ||
    currentProjectLoading.state === "loading"
  ) {
    return null;
  } else {
    projects = projectsLoading.contents as Project[];
    currentProject = currentProjectLoading.contents as Project;
  }

  return (
    <Dropdown
      size="lg"
      className="min-w-[200px]"
      label={
        <div className="flex flex-row items-center gap-2">
          {isLoadingProject ? (
            <>
              <Spinner size="sm" color="success" />
              <span className="text-sm text-gray-700 dark:text-gray-400">
                Loading Project...
              </span>
            </>
          ) : (
            <>
              <HiFolderOpen className="h-5 w-5 text-primary-600" />{" "}
              {currentProject ? currentProject.name : "No Projects"}
            </>
          )}
        </div>
      }
      color="gray"
      dismissOnClick
    >
      {projects.map((project) => (
        <Dropdown.Item
          key={project.name}
          value={project.name}
          className="p-3"
          onClick={async () => {
            setIsLoadingProject(true);
            const p = await loadProject(project.name);
            setCurrentProject(p);
            setIsLoadingProject(false);
          }}
        >
          {project.name}
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
}
