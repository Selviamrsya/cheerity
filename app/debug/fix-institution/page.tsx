import { fixInstitutionUserRecord } from "@/lib/actions/fix-institution";

export default async function FixInstitutionPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id: institutionId } = await searchParams;

  let result = null;
  if (institutionId) {
    result = await fixInstitutionUserRecord(institutionId);
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Fix Institution User Record</h1>

      {!institutionId ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            This page fixes institutions that exist in the <code>institutions</code> table
            but are missing from the <code>users</code> table (which is required for authentication).
          </p>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <h3 className="font-semibold mb-2">Kasih Ibu Institution ID:</h3>
            <code className="text-sm bg-white px-2 py-1 rounded border">
              b5a07c5b-fb84-4a4c-bf07-8a88816ed0cf
            </code>
          </div>

          <a
            href="/debug/fix-institution?id=b5a07c5b-fb84-4a4c-bf07-8a88816ed0cf"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Fix Kasih Ibu Institution
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {result?.success ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <h3 className="font-semibold text-green-800 mb-2">✓ Success</h3>
              <p className="text-green-700">{result.message}</p>
              <p className="text-sm text-green-600 mt-2">
                You can now try logging in as the institution.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <h3 className="font-semibold text-red-800 mb-2">✗ Error</h3>
              <p className="text-red-700">{result?.error || "Unknown error"}</p>
            </div>
          )}

          <a
            href="/debug/fix-institution"
            className="inline-block text-blue-600 hover:underline"
          >
            ← Back
          </a>
        </div>
      )}
    </div>
  );
}
