import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { NotificationIcon } from "../../notification";

/**
 * DashboardLayout - Main layout component for the Job Manager Dashboard
 * Features:
 * - Fixed sidebar navigation
 * - Main content area with Outlet for nested routes
 * - Top header with notification icon
 * - Responsive design
 */
function DashboardLayout() {
  return (
    <div className="flex h-screen bg-light-gray overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
