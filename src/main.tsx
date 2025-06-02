// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import "./index.css";
import router from "./router.mts";

const root = createRoot(document.getElementById("root")!);
const bootStrap = () => {
  root.render(<RouterProvider router={router} />);
};
bootStrap();
