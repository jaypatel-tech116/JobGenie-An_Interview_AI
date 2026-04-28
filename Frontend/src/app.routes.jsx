import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import GuestRoute from "./features/auth/components/GuestRoute";
import Home from "./features/interview/pages/Home";
import Analyze from "./features/interview/pages/Analyze";
import Recent from "./features/interview/pages/Recent";
import Interview from "./features/interview/pages/interview";
import AppLayout from "./components/Layout/AppLayout";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/interview",
        element: (
          <Protected>
            <Analyze />
          </Protected>
        ),
      },
      {
        path: "/login",
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        ),
      },
      {
        path: "/register",
        element: (
          <GuestRoute>
            <Register />
          </GuestRoute>
        ),
      },
      {
        path: "/interview/:interviewId",
        element: (
          <Protected>
            <Interview />
          </Protected>
        ),
      },
      {
        path: "/recent",
        element: (
          <Protected>
            <Recent />
          </Protected>
        ),
      },
    ],
  },
]);
