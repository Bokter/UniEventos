import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { MapViewPage } from "./pages/MapViewPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { OrganizerDashboardPage } from "./pages/OrganizerDashboardPage";
import { PublishEventPage } from "./pages/PublishEventPage";
import { AdminPanelPage } from "./pages/AdminPanelPage";
import { UserDashboardPage } from "./pages/UserDashboardPage";
import { RootLayout } from "./components/RootLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "map", Component: MapViewPage },
      { path: "event/:id", Component: EventDetailPage },
      { path: "login", Component: LoginPage },
      { path: "organizer/dashboard", Component: OrganizerDashboardPage },
      { path: "organizer/publish", Component: PublishEventPage },
      { path: "admin", Component: AdminPanelPage },
      { path: "user/dashboard", Component: UserDashboardPage },
    ],
  },
]);
