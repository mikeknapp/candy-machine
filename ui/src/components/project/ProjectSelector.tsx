import { Dropdown, Spinner } from "flowbite-react";
import React, { useEffect } from "react";
import { HiFolderOpen } from "react-icons/hi2";
import { useAppValue } from "../../hooks/useApp";
import { useProjectState } from "../../hooks/useProject";

export function ProjectSelector() {
  const appValue = useAppValue();
  const [projectValue, project] = useProjectState();

  useEffect(() => {
    if (projectValue !== null) {
      document.title = `Candy Machine (${projectValue?.images.length})`;
    } else {
      document.title = "Candy Machine";
    }
  }, [projectValue]);

  return (
    <>
      {!appValue.isLoading && !appValue.isError && (
        <Dropdown
          size="lg"
          className="min-w-[200px]"
          label={
            <div className="flex flex-row items-center gap-2">
              {projectValue.isLoading ? (
                <>
                  <Spinner size="sm" color="success" />
                  <span className="text-sm text-gray-700 dark:text-gray-400">
                    Loading...
                  </span>
                </>
              ) : (
                <>
                  <HiFolderOpen className="h-5 w-5 text-primary-600" />{" "}
                  {projectValue.name ? projectValue.name : "No Projects"}
                </>
              )}
            </div>
          }
          color="gray"
          dismissOnClick
        >
          {appValue.projects.map((projectName) => (
            <Dropdown.Item
              key={`project-${projectName}`}
              value={projectName}
              className="p-3"
              onClick={async () => {
                await project.loadProject(projectName);
              }}
            >
              {projectName}
            </Dropdown.Item>
          ))}
        </Dropdown>
      )}
    </>
  );
}
