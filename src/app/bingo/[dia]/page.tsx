import { BingoGame } from "@/components/BingoGame";
export default async function Page({ params }: { params: Promise<{ dia: string }> }) {
  const { dia } = await params;
  return <BingoGame day={Number(dia)} />;
}
