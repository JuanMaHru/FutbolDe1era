import { GuessGame } from "@/components/GuessGame";

export default async function Page({ params }: { params: Promise<{ dia: string }> }) {
  const { dia } = await params;
  return <GuessGame gameId="dt" day={Number(dia)} />;
}
