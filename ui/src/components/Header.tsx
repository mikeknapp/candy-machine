import { Button, DarkThemeToggle } from "flowbite-react";
import React from "react";
import { Cog } from "./svg/Cog";

export function Header() {
  return (
    <div className="flex w-full flex-row items-center justify-between bg-brand p-3 dark:bg-slate-600">
      <span className="text-gray text-base font-bold dark:text-white">
        CANDY MACHINE
      </span>
      <div className="flex flex-row gap-2">
        <DarkThemeToggle
          theme={{
            root: {
              base: "dark:focus:ring-gray-70 rounded-lg p-2.5 text-sm text-black hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700",
            },
          }}
        />
        <Button color="none">
          <Cog />
        </Button>
      </div>
    </div>
  );
}
