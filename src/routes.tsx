import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import MainChat from "./pages/MainChat";
import Oracle from "./pages/Oracle";
import Journal from "./pages/Journal";
import ThreadHistory from "./pages/ThreadHistory";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import UsagePolicy from "./pages/UsagePolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

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
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/usage-policy",
    element: <UsagePolicy />,
  },
  {
    path: "/privacy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/terms",
    element: <TermsOfService />,
  },
  {
    path: "/terms-of-service",
    element: <TermsOfService />,
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
  {
    path: "/history",
    element: (
      <ProtectedRoute>
        <Layout>
          <ThreadHistory />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/journal",
    element: (
      <ProtectedRoute>
        <Layout>
          <Journal />
        </Layout>
      </ProtectedRoute>
    ),
  },
]);
