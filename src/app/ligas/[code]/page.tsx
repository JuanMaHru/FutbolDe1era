import { LeagueTable } from "@/components/LeagueTable";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <>
      <h1>Tabla semanal</h1>
      <LeagueTable code={code.toUpperCase()} />
    </>
  );
}
