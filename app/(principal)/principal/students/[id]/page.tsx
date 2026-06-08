import StudentDetailPanel from "@/components/students/StudentDetailPanel";

export default async function PrincipalStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentDetailPanel studentId={id} />;
}
