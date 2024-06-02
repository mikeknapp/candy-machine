import { Dropdown, Spinner } from "flowbite-react";
import React, { useEffect } from "react";
import { HiFolderOpen } from "react-icons/hi2";
import { useAllProjectsValue } from "../../hooks/useAllProjects";
import { useProject } from "../../hooks/useProject";
import { State } from "../../models/base";

export function ProjectSelector() {
  const allProjects = useAllProjectsValue();
  const [project, projectContext] = useProject();

  useEffect(() => {
    if (project !== null) {
      document.title = `Candy Machine (${project?.images.length})`;
    } else {
      document.title = "Candy Machine";
    }
  }, [project]);

  return (
    <>
      <Dropdown
        size="lg"
        className="min-w-[200px]"
        label={
          <div className="flex flex-row items-center gap-2">
            {project?.state === State.Loading ||
            allProjects?.state === State.Loading ? (
              <>
                <Spinner size="sm" color="success" />
                <span className="text-sm text-gray-700 dark:text-gray-400">
                  Loading...
                </span>
              </>
            ) : (
              <>
                <HiFolderOpen className="h-5 w-5 text-primary-600" />{" "}
                {project ? project.name : "No Projects"}
              </>
            )}
          </div>
        }
        color="gray"
        dismissOnClick
      >
        {allProjects?.projects.map((projectName) => (
          <Dropdown.Item
            key={`project-${projectName}`}
            value={projectName}
            className="p-3"
            onClick={async () => {
              await projectContext.loadProject(projectName);
            }}
          >
            {projectName}
          </Dropdown.Item>
        ))}
      </Dropdown>
    </>
  );
}
