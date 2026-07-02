import { getAdminSession, adminLogout } from "@/actions/admin-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSubmissionsTable, { AdminSubmissionGroup } from "@/components/AdminSubmissionsTable";
import { LogOut, LayoutDashboard } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch all submissions ordered by latest first
  const allSubmissions = await prisma.submission.findMany({
    orderBy: [
      { studentPhone: 'asc' },
      { parentPhone: 'asc' },
      { version: 'desc' }
    ]
  });

  // Group by studentPhone + parentPhone
  const groupedMap = new Map<string, AdminSubmissionGroup>();
  
  for (const sub of allSubmissions) {
    const groupId = `${sub.studentPhone}-${sub.parentPhone}`;
    if (!groupedMap.has(groupId)) {
      groupedMap.set(groupId, {
        id: groupId,
        studentPhone: sub.studentPhone,
        parentPhone: sub.parentPhone,
        latestName: sub.studentName,
        latestDate: sub.createdAt.toISOString(),
        submissions: []
      });
    }
    const group = groupedMap.get(groupId)!;
    let parsedFields: any = {};
    if (sub.otherFields) {
      try { parsedFields = JSON.parse(sub.otherFields); } catch {}
    }

    group.submissions.push({
      id: sub.id,
      version: sub.version,
      createdAt: sub.createdAt.toISOString(),
      studentName: sub.studentName,
      pdfUrl: parsedFields.pdfUrl || null,
    });
  }

  // Convert to array and sort by latest date across groups
  const groupedSubmissions = Array.from(groupedMap.values()).sort((a, b) => {
    return new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime();
  });

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
              <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-bold text-lg tracking-tight">Admin Console</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end text-sm">
              <span className="text-slate-400 text-xs">Logged in as</span>
              <span className="font-medium text-slate-200">{session.name} ({session.email})</span>
            </div>
            <form action={async () => {
              "use server";
              await adminLogout();
              redirect("/admin/login");
            }}>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 rounded-lg transition-all" title="Log out">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Student Submissions</h1>
          <p className="text-slate-500 mt-2">Manage all enrollment and update declarations across versions.</p>
        </div>

        <AdminSubmissionsTable groups={groupedSubmissions} />
      </main>
    </div>
  );
}
