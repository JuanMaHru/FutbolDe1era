import { OnceGame } from "@/components/OnceGame";
export default async function Page({ params }: { params: Promise<{ dia: string }> }) {
  const { dia } = await params;
  return <OnceGame day={Number(dia)} />;
}
