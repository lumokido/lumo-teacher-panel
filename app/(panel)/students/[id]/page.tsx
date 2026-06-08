import StudentDetailPanel from "@/components/students/StudentDetailPanel";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentDetailPanel studentId={id} />;
}
