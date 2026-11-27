import { IntrusoGame } from "@/components/IntrusoGame";
export default async function Page({ params }: { params: Promise<{ dia: string }> }) {
  const { dia } = await params;
  return <IntrusoGame day={Number(dia)} />;
}
