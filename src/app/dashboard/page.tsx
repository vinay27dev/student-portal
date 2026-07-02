import { getSession, logout } from "@/actions/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LogOut, History, Edit3, FileText, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const submissions = await prisma.submission.findMany({
    where: {
      studentPhone: session.studentPhone,
      parentPhone: session.parentPhone,
    },
    orderBy: {
      version: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Student Portal</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-sm">
              <span className="text-slate-500 text-xs">Logged in as</span>
              <span className="font-medium text-slate-800">{session.studentPhone}</span>
            </div>
            <form action={async () => {
              "use server";
              await logout();
              redirect("/login");
            }}>
              <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Log out">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Submissions</h1>
            <p className="text-slate-500 mt-1">View your previous records or submit an update.</p>
          </div>
          <Link 
            href="/form/edit" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-[0.98] font-medium"
          >
            <Edit3 className="w-4 h-4" />
            Submit Edit/Correction
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No submissions found</h3>
            <p className="text-slate-500 mt-2">You haven't submitted any forms yet.</p>
            <Link href="/form/new" className="inline-block mt-6 text-indigo-600 font-medium hover:underline">
              Create your first submission
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
                    <th className="py-4 px-6">Date Submitted</th>
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6">Version</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub, index) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-slate-600">
                        {new Date(sub.createdAt).toLocaleDateString()} at {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">
                        {sub.studentName}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          v{sub.version}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {index === 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Latest
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
