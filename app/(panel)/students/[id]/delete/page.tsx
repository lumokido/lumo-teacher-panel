import StudentDeletePanel from "@/components/students/StudentDeletePanel";

export default async function DeleteStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentDeletePanel studentId={id} />;
}
