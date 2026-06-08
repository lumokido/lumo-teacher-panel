import TeacherAddForm from "@/components/principal/teachers/TeacherAddForm";
import Link from "next/link";

export default function AddTeacherPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/principal/teachers"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 transition hover:text-violet-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to staff directory
        </Link>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Onboard New Teacher
        </h2>
        <p className="mt-2 text-slate-600">
          Create a new teacher profile and assign them to classes and sections.
        </p>
      </div>

      <TeacherAddForm />
    </div>
  );
}
