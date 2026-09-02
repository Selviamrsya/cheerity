import React from "react";
import Link from "next/link";
import { auth } from "@/app/auth";
import { getInstitutionDonations } from "@/lib/actions/donation";
import { Plus, Package } from "lucide-react";
import { CATEGORY_LABELS, DELIVERY_METHOD_LABELS } from "@/constants";

const ManageDonationsPage = async () => {
  const session = await auth();
  const institutionId = session?.user?.id as string;

  const donations = await getInstitutionDonations(institutionId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Donations</h1>
          <p className="text-gray-500 text-sm mt-1">
            Overview of all donation campaigns uploaded by your institution.
          </p>
        </div>

        <Link
          href="/institution/newDonations"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-800 hover:bg-green-900 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Donation</span>
        </Link>
      </div>

      {donations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">No donations uploaded yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Start by adding your first donation campaign.
          </p>
          <Link
            href="/institution/newDonations"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-800 hover:bg-green-900 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Donation</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                  <th className="py-4 px-6">Cover</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Collected / Target</th>
                  <th className="py-4 px-6">Delivery Methods</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative">
                        {d.cover ? (
                          <img src={d.cover} alt={d.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900">{d.title}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {CATEGORY_LABELS[d.category] || d.category}
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {d.collected} / {d.target}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {d.deliveryMethods.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-md font-medium"
                          >
                            {DELIVERY_METHOD_LABELS[m] || m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          d.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDonationsPage;
