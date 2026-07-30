import StudentDeletePanel from "@/components/students/StudentDeletePanel";

export default async function DeletePrincipalStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentDeletePanel studentId={id} />;
}
