import { Dropdown, Spinner } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { HiFolderOpen } from "react-icons/hi2";
import { useAppState } from "../../hooks/useApp";
import { useShortcut } from "../../hooks/useShortcut";

export function ProjectSelector() {
  const [appValue, app] = useAppState(
    "isLoading",
    "isError",
    "project.name",
    "project.images",
    "projects",
    "project.isLoading",
  );
  const [showAllProjects, setShowAllProjects] = useState(false);

  useShortcut({
    description: "Refresh Projects",
    keys: "r",
    onKeyDown: () => {
      app.load(true);
    },
    deps: [],
  });

  useShortcut({
    description: "Projects: Show All Folders",
    keys: "Shift",
    onKeyDown: () => {
      setShowAllProjects(true);
    },
    onKeyUp: () => {
      setShowAllProjects(false);
    },
    deps: [],
  });

  useEffect(() => {
    if (appValue.project !== null) {
      document.title = `Candy Machine (${appValue.project?.images.length})`;
    } else {
      document.title = "Candy Machine";
    }
  }, [appValue.project]);

  const projects = showAllProjects
    ? appValue.projects
    : appValue.projects.filter((p) => !p.startsWith("."));

  return (
    <>
      {!appValue.isLoading && !appValue.isError && (
        <Dropdown
          size="lg"
          className="min-w-[200px]"
          label={
            <div className="flex flex-row items-center gap-2">
              {appValue.project.isLoading ? (
                <>
                  <Spinner size="sm" color="success" />
                  <span className="text-sm text-gray-700 dark:text-gray-400">
                    Loading...
                  </span>
                </>
              ) : (
                <>
                  <HiFolderOpen className="h-5 w-5 text-primary-600" />{" "}
                  {appValue.project.name
                    ? appValue.project.name
                    : "No Projects"}
                </>
              )}
            </div>
          }
          color="gray"
          dismissOnClick
        >
          {projects.map((projectName) => (
            <Dropdown.Item
              key={`project-${projectName}`}
              value={projectName}
              className="p-3"
              onClick={async () => {
                await app.project.loadProject(projectName);
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
