import Footer from "@/components/Footer";
import Navbar from "@/components/Nav";
import PartnerDashboard from "@/components/partner/PartnerDashboard";

const page = () => {
  return (
    <main className="min-h-screen  bg-[#020617] text-white">
      <Navbar />
      <PartnerDashboard />
      <Footer />
    </main>
  );
};

export default page;
