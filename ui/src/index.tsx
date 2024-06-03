import React from "react";
import { createRoot } from "react-dom/client";
import { RootNode } from "./app";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <RootNode />
  </React.StrictMode>,
);
