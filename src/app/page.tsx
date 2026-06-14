import Footer from "@/components/Footer";
import HomeComponent from "@/components/HomeComponent";
import Nav from "@/components/Nav";
import VehicleSlider from "@/components/VehicleSlider";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <Nav />
      <HomeComponent />
      <VehicleSlider />
      <Footer />
    </main>
  );
}
