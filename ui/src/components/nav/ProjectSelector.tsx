import { Select } from "flowbite-react";
import React from "react";
import { HiFolderOpen } from "react-icons/hi2";
import { useRecoilValue } from "recoil";
import { projects } from "../../state/atoms";

export function ProjectSelector() {
  const allProjects = useRecoilValue(projects);

  return (
    <Select
      className="min-w-[200px]"
      color="header"
      icon={HiFolderOpen}
      theme={{
        field: {
          icon: {
            svg: "text-primary-500 h-5 w-5",
          },
          select: {
            colors: {
              header: "bg-primary-100 border-none dark:bg-slate-200",
            },
          },
        },
      }}
    >
      {allProjects.map((project) => (
        <option key={project.dirName} value={project.dirName}>
          {project.dirName}
        </option>
      ))}
    </Select>
  );
}
