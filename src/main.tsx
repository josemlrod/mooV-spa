import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";

import { router } from "./router";

import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

const root = document.getElementById("root");

createRoot(root!).render(<RouterProvider router={router} />);
