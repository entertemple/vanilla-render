import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import MainChat from "./pages/MainChat";
import Oracle from "./pages/Oracle";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <Layout>
          <Outlet />
        </Layout>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/chat" replace />,
      },
    ],
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Layout>
          <Outlet />
        </Layout>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <MainChat />,
      },
      {
        path: ":id",
        element: <MainChat />,
      },
    ],
  },
  {
    path: "/oracle",
    element: (
      <ProtectedRoute>
        <Layout>
          <Oracle />
        </Layout>
      </ProtectedRoute>
    ),
  },
]);
