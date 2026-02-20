import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LiveMapPage } from "./pages/LiveMapPage";
import { AlertsPage } from "./pages/AlertsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { VehiclePage } from "./pages/VehiclePage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "map", Component: LiveMapPage },
      { path: "alerts", Component: AlertsPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "vehicles", Component: VehiclePage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
