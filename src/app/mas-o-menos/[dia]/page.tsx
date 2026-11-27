import { MasOMenosGame } from "@/components/MasOMenosGame";
export default async function Page({ params }: { params: Promise<{ dia: string }> }) {
  const { dia } = await params;
  return <MasOMenosGame day={Number(dia)} />;
}
