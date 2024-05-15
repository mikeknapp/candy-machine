import type { CustomFlowbiteTheme } from "flowbite-react";
import { Flowbite } from "flowbite-react";
import React from "react";
import { Header } from "./components/Header.js";

const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      none: "bg-none",
    },
  },
};

export function App() {
  return (
    <Flowbite theme={{ theme: customTheme }}>
      <main className="flex min-h-screen flex-col gap-2 dark:bg-gray-800">
        <Header />
        <h1 className="text-2xl dark:text-white">Hello world!</h1>
      </main>
    </Flowbite>
  );
}
