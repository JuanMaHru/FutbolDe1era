import { TrayectoriaGame } from "@/components/TrayectoriaGame";
export default async function Page({ params }: { params: Promise<{ dia: string }> }) {
  const { dia } = await params;
  return <TrayectoriaGame kind="jugador" day={Number(dia)} />;
}
