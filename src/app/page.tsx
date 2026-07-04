import StudentForm from "@/components/StudentForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <StudentForm />
      </div>
    </div>
  );
}