import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { isAdminLoggedIn } from "@/shared/api/adminAuth";

export function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  if (!isAdminLoggedIn()) {
    return null;
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 w-full flex flex-col overflow-hidden ml-64">
        <AdminHeader />
        <main className="flex-1 w-full overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
