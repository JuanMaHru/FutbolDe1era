import { PalabraGame } from "@/components/PalabraGame";
export default async function Page({ params }: { params: Promise<{ dia: string }> }) {
  const { dia } = await params;
  return <PalabraGame day={Number(dia)} />;
}
