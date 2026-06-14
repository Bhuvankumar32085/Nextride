import RidePage from "@/components/user/RidePage";

interface PageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { bookingId } = await params;


  return <RidePage bookingId={bookingId}/>;
}
