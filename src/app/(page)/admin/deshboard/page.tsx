import { AdminDashboard } from "@/components/admin/AdminDashboard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Nav";

const page = () => {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <AdminDashboard />
      <Footer />
    </main>
  );
};

export default page;
