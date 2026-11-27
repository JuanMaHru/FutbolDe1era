import { OrderGame } from "@/components/OrderGame";
export default async function Page({ params }: { params: Promise<{ dia: string }> }) {
  const { dia } = await params;
  return <OrderGame day={Number(dia)} />;
}
