import ClassStudentsPanel from "@/components/principal/ClassStudentsPanel";

type Props = {
  params: Promise<{ className: string }>;
};

export default async function ClassDetailPage({ params }: Props) {
  const { className } = await params;
  return <ClassStudentsPanel className={className} />;
}
