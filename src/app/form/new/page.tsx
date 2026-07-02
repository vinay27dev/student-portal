import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudentForm from "@/components/StudentForm";

export default async function NewFormPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  // Duplicate Blocking Logic
  const existingRecords = await prisma.submission.findMany({
    where: {
      studentPhone: session.studentPhone,
      parentPhone: session.parentPhone,
    },
  });

  if (existingRecords.length > 0) {
    redirect("/form/edit");
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">New Enrollment</h1>
        <p className="text-slate-500 mt-2">Please fill out your details below.</p>
      </div>
      <StudentForm 
        isNewJoinee={true}
        initialStudentPhone={session.studentPhone}
        initialParentPhone={session.parentPhone}
      />
    </div>
  );
}
