import { createBrowserRouter } from "react-router";

import AuthLayout from "@/routes/auth-layout";
import Auth from "@/routes/auth";
import AppWithProviders from "@/routes/providers";
import Home from "@/routes/home";
import Profile from "@/routes/profile";
import Layout from "@/routes/layout";
import Entity from "@/routes/entity";
import { loggingMiddleware, authMiddleware } from "@/lib/utils";
import Search from "@/routes/search";

const routes = [
  {
    element: <AppWithProviders />,
    middleware: [loggingMiddleware],
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/auth",
            element: <Auth />,
          },
        ],
      },

      {
        element: <Layout />,
        middleware: [authMiddleware],
        children: [
          {
            path: "/",
            element: <Home />,
            loader: Home.loader,
          },
          {
            path: "/profile",
            element: <Profile />,
          },
          {
            path: "/search",
            element: <Search />,
            action: Search.action,
            loader: Search.loader,
          },
        ],
      },

      {
        path: "/entity/:id",
        element: <Entity />,
        loader: Entity.loader,
        action: Entity.action,
      },

      {
        path: "/",
        element: <div className="text-9xl">Hello World</div>,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
