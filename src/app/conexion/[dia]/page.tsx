import { ConexionGame } from "@/components/ConexionGame";
export default async function Page({ params }: { params: Promise<{ dia: string }> }) {
  const { dia } = await params;
  return <ConexionGame day={Number(dia)} />;
}
