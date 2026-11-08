import { debugInstitutionStatus } from "@/lib/actions/debug";

export default async function DebugInstitutionsPage() {
  const results = await debugInstitutionStatus("kasih");

  if ("error" in results) {
    return (
      <div className="p-8 bg-white min-h-screen">
        <p className="text-red-600">{results.error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Debug Institution Status</h1>

      {results.length === 0 ? (
        <p>No institutions found matching &ldquo;kasih&rdquo;</p>
      ) : (
        <div className="space-y-6">
          {results.map((result, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-4">
              <h2 className="text-lg font-semibold">
                {result.institution.name}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <h3 className="font-semibold text-sm mb-2">Institutions Table</h3>
                  <p className="text-sm">ID: {result.institution.id}</p>
                  <p className="text-sm">Email: {result.institution.email}</p>
                  <p className="text-sm">Status: <span className="font-bold">{result.institution.status}</span></p>
                </div>

                <div className="bg-green-50 p-3 rounded">
                  <h3 className="font-semibold text-sm mb-2">Users Table</h3>
                  {result.user ? (
                    <>
                      <p className="text-sm">ID: {result.user.id}</p>
                      <p className="text-sm">Email: {result.user.email}</p>
                      <p className="text-sm">Role: {result.user.role}</p>
                      <p className="text-sm">Status: <span className="font-bold">{result.user.status}</span></p>
                    </>
                  ) : (
                    <p className="text-sm text-red-600">No user record found!</p>
                  )}
                </div>
              </div>

              {result.match ? (
                <div className="bg-gray-50 p-3 rounded">
                  <h3 className="font-semibold text-sm mb-2">Comparison</h3>
                  <p className="text-sm">
                    IDs Match: {result.match.idsMatch ? "✓" : "✗"}
                  </p>
                  <p className="text-sm">
                    Statuses Match: {result.match.statusesMatch ? "✓" : "✗"}
                  </p>
                  <p className="text-sm">
                    User Found By: {result.match.foundBy}
                  </p>
                  {!result.match.idsMatch && (
                    <p className="text-sm text-red-600 font-bold mt-2">
                      ⚠️ ID MISMATCH - User has different ID!
                    </p>
                  )}
                  {!result.match.statusesMatch && (
                    <p className="text-sm text-red-600 font-bold mt-2">
                      ⚠️ STATUS MISMATCH DETECTED!
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 p-3 rounded">
                  <h3 className="font-semibold text-sm mb-2">Comparison</h3>
                  <p className="text-sm text-red-600 font-bold">
                    ⚠️ No user record found at all!
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
