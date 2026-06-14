import PartnerProtectedRoute from "@/components/PartnerProtectedRoute";


export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PartnerProtectedRoute>
      {children}
    </PartnerProtectedRoute>
  );
}