import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OperatorManagement from "./pages/OperatorManagement";
import FacilityManagement from "./pages/FacilityManagement";
import UnitManagement from "./pages/UnitManagement";
import QueueManagement from "./pages/QueueManagement";
import ContractManagement from "./pages/ContractManagement";
import ResaleManagement from "./pages/ResaleManagement";
import MemberManagement from "./pages/MemberManagement";
import NotificationManagement from "./pages/NotificationManagement";
import AuditLog from "./pages/AuditLog";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "operators", Component: OperatorManagement },
      { path: "facilities", Component: FacilityManagement },
      { path: "units", Component: UnitManagement },
      { path: "queues", Component: QueueManagement },
      { path: "contracts", Component: ContractManagement },
      { path: "resales", Component: ResaleManagement },
      { path: "members", Component: MemberManagement },
      { path: "notifications", Component: NotificationManagement },
      { path: "audit-log", Component: AuditLog },
    ],
  },
]);
