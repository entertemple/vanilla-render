import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import MainChat from "./pages/MainChat";
import DiscoverFeed from "./pages/DiscoverFeed";
import ThreadHistory from "./pages/ThreadHistory";
import Settings from "./pages/Settings";
import Library from "./pages/Library";
import LearnMore from "./pages/LearnMore";
import About from "./pages/About";
import UsagePolicy from "./pages/UsagePolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Upgrade from "./pages/Upgrade";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/landing",
    element: <Landing />,
  },
  {
    path: "/",
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
      {
        path: "chat",
        element: <MainChat />,
      },
      {
        path: "chat/:id",
        element: <MainChat />,
      },
      {
        path: "discover",
        element: <DiscoverFeed />,
      },
      {
        path: "history",
        element: <ThreadHistory />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "library",
        element: <Library />,
      },
      {
        path: "upgrade",
        element: <Upgrade />,
      },
      {
        path: "learn-more",
        element: <LearnMore />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "usage-policy",
        element: <UsagePolicy />,
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicy />,
      },
    ],
  },
]);
