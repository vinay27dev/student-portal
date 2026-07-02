import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudentForm from "@/components/StudentForm";

export default async function EditFormPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  // Fetch the latest submission for pre-filling
  const latestSubmission = await prisma.submission.findFirst({
    where: {
      studentPhone: session.studentPhone,
      parentPhone: session.parentPhone,
    },
    orderBy: {
      version: "desc",
    },
  });

  if (!latestSubmission) {
    // If no submission exists, they shouldn't be editing, redirect to new
    redirect("/form/new");
  }

  // Parse otherFields which is a JSON field
  let otherFields = {};
  if (latestSubmission.otherFields) {
    try {
      otherFields = typeof latestSubmission.otherFields === 'string' 
        ? JSON.parse(latestSubmission.otherFields)
        : latestSubmission.otherFields;
    } catch {
      otherFields = {};
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Update Details</h1>
          <p className="text-slate-500 mt-1 text-sm">Editing version {latestSubmission.version}</p>
        </div>
      </div>
      <StudentForm 
        isNewJoinee={false}
        initialStudentPhone={session.studentPhone}
        initialParentPhone={session.parentPhone}
        initialStudentName={latestSubmission.studentName}
        initialOtherFields={otherFields}
      />
    </div>
  );
}
