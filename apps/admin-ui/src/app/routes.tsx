import { createBrowserRouter } from "react-router";
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import UserLoginPage from "./pages/UserLoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import FacilityListPage from "./pages/FacilityListPage";
import FacilityDetailPage from "./pages/FacilityDetailPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import WaitlistPage from "./pages/WaitlistPage";
import ContractPage from "./pages/ContractPage";
import MyPage from "./pages/MyPage";
import Dashboard from "./pages/Dashboard";
import CompanyListPage from "./pages/CompanyListPage";
import FacilityManagement from "./pages/FacilityManagement";
import UnitManagement from "./pages/UnitManagement";
import QueueManagement from "./pages/QueueManagement";
import ContractManagement from "./pages/ContractManagement";
import ResaleManagement from "./pages/ResaleManagement";
import MemberManagement from "./pages/MemberManagement";
import NotificationManagement from "./pages/NotificationManagement";
import AuditLog from "./pages/AuditLog";
import CompanyRegisterPage from "./pages/CompanyRegisterPage";
import SiteRegisterPage from "./pages/SiteRegisterPage";
import SectionCreatePage from "./pages/SectionCreatePage";
import SeatManagementPage from "./pages/SeatManagementPage";
import PolicySettingPage from "./pages/PolicySettingPage";
import AgentOnboardPage from "./pages/AgentOnboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: UserLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "facilities", Component: FacilityListPage },
      { path: "facilities/:id", Component: FacilityDetailPage },
      { path: "seats/:id", Component: SeatSelectionPage },
      { path: "waitlist/:seatId", Component: WaitlistPage },
      { path: "contract/:seatId", Component: ContractPage },
      { path: "login", Component: UserLoginPage },
      { path: "change-password", Component: ChangePasswordPage },
      { path: "signup", Component: SignupPage },
      { path: "mypage", Component: MyPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "company", Component: CompanyRegisterPage },
      { path: "agent-onboard", Component: AgentOnboardPage },
      { path: "site", Component: SiteRegisterPage },
      { path: "section", Component: SectionCreatePage },
      { path: "seat-management", Component: SeatManagementPage },
      { path: "policy", Component: PolicySettingPage },
      { path: "business", Component: CompanyListPage },
      { path: "facility", Component: FacilityManagement },
      { path: "seat", Component: UnitManagement },
      { path: "waitlist", Component: QueueManagement },
      { path: "contracts", Component: ContractManagement },
      { path: "resale", Component: ResaleManagement },
      { path: "member", Component: MemberManagement },
      { path: "notification", Component: NotificationManagement },
      { path: "audit", Component: AuditLog },
      { path: "companies/:companyId", Component: CompanyDetailPage },
    ],
  },
  {
    path: "/admin/login",
    Component: Login,
  },
  {
    path: "/admin/change-password",
    Component: ChangePasswordPage,
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
