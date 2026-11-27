import { AniosGame } from "@/components/AniosGame";
export default async function Page({ params }: { params: Promise<{ dia: string }> }) {
  const { dia } = await params;
  return <AniosGame day={Number(dia)} />;
}
