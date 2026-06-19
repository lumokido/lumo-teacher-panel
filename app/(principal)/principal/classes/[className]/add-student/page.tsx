import AdminStudentAddForm from "@/components/principal/students/AdminStudentAddForm";
import Link from "next/link";

type Props = {
  params: Promise<{ className: string }>;
};

export default async function AddStudentPage({ params }: Props) {
  const { className } = await params;
  const decodedClassName = decodeURIComponent(className);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/principal/classes/${encodeURIComponent(decodedClassName)}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 transition hover:text-violet-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to class details
        </Link>
        <h2 className="font-montserrat text-3xl font-semibold text-slate-900">
          Onboard New Student
        </h2>
        <p className="mt-2 text-slate-600">
          Add a new student profile to {decodedClassName}.
        </p>
      </div>

      <AdminStudentAddForm className={className} />
    </div>
  );
}
