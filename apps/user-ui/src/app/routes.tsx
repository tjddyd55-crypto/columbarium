import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/HomePage";
import { FacilitiesPage } from "./pages/FacilitiesPage";
import { FacilityDetailPage } from "./pages/FacilityDetailPage";
import { SeatSelectionPage } from "./pages/SeatSelectionPage";
import { WaitlistPage } from "./pages/WaitlistPage";
import { WaitlistDetailPage } from "./pages/WaitlistDetailPage";
import { ContractPage } from "./pages/ContractPage";
import { MyContractsPage } from "./pages/MyContractsPage";
import { MyPage } from "./pages/MyPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminLoginPage } from "./admin/AdminLoginPage";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminPlaceholder } from "./admin/AdminPlaceholder";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/admin/login",
    Component: AdminLoginPage,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "business", Component: AdminPlaceholder },
      { path: "facility", Component: AdminPlaceholder },
      { path: "seat", Component: AdminPlaceholder },
      { path: "waitlist", Component: AdminPlaceholder },
      { path: "contracts", Component: AdminPlaceholder },
      { path: "resale", Component: AdminPlaceholder },
      { path: "member", Component: AdminPlaceholder },
      { path: "notification", Component: AdminPlaceholder },
      { path: "audit", Component: AdminPlaceholder },
    ],
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "facilities", Component: FacilitiesPage },
      { path: "facilities/:id", Component: FacilityDetailPage },
      { path: "facilities/:id/seats", Component: SeatSelectionPage },
      { path: "waitlist", Component: WaitlistPage },
      { path: "waitlist/:id", Component: WaitlistDetailPage },
      { path: "contract/:unitId", Component: ContractPage },
      { path: "my-contracts", Component: MyContractsPage },
      { path: "my-page", Component: MyPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
