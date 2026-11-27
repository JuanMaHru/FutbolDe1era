import { ClubGame } from "@/components/ClubGame";
export default async function Page({ params }: { params: Promise<{ dia: string }> }) {
  const { dia } = await params;
  return <ClubGame day={Number(dia)} />;
}
