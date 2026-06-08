import TeacherDetailPanel from "@/components/principal/TeacherDetailPanel";

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ emailId: string }>;
}) {
  const { emailId } = await params;
  return <TeacherDetailPanel emailId={emailId} />;
}
