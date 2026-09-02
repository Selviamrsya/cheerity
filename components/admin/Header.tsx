import React from "react";
import { Session } from "next-auth";

interface AdminHeaderProps {
  session: Session | null;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ session }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 pb-6 border-b border-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name || "Admin"}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Monitor all institution verification requests and overall platform activity here.
        </p>
      </div>

      <div className="text-xs font-semibold text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm w-fit">
        {currentDate}
      </div>
    </header>
  );
};

export default AdminHeader;