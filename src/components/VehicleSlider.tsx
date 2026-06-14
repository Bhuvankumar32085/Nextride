"use client";

import { motion } from "framer-motion";
import {
  Bike,
  Car,
  Truck,
  Package,
  CarFront,
  Zap,
  Star,
  ShieldCheck,
} from "lucide-react";


const vehicles = [
  {
    id: 1,
    type: "bike",
    name: "Bike",
    icon: Bike,
    desc: "Beat the traffic with our quickest option. Perfect for solo city rides.",
    tags: [
      { text: "Quick", icon: Zap },
      { text: "Solo", icon: null },
    ],
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    id: 2,
    type: "auto",
    name: "Auto",
    icon: CarFront, 
    desc: "Economical and breezy. The perfect choice for short distance city travel.",
    tags: [
      { text: "Budget", icon: Star },
      { text: "City", icon: null },
    ],
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    id: 3,
    type: "car",
    name: "Car",
    icon: Car,
    desc: "Everyday comfortable rides for your daily commute and errands.",
    tags: [
      { text: "Popular", icon: ShieldCheck },
      { text: "Comfort", icon: null },
    ],
    gradient: "from-violet-500 to-fuchsia-400",
  },
  {
    id: 4,
    type: "loading",
    name: "Loading",
    icon: Package, 
    desc: "Small commercial vehicles for moving furniture, appliances, or business goods.",
    tags: [
      { text: "Utility", icon: null },
      { text: "Goods", icon: null },
    ],
    gradient: "from-orange-500 to-amber-400",
  },
  {
    id: 5,
    type: "truck",
    name: "Truck",
    icon: Truck,
    desc: "Reliable logistics and heavy transport solutions for your large-scale goods.",
    tags: [
      { text: "Heavy", icon: null },
      { text: "Logistics", icon: null },
    ],
    gradient: "from-rose-500 to-pink-400",
  },
];
export default function VehicleSlider() {
  // We duplicate the array to create a seamless infinite scrolling effect
  const duplicatedVehicles = [...vehicles, ...vehicles];

  return (
    <section className="relative py-24 bg-[#020617] overflow-hidden border-t border-white/5">
      {/* ── Background Glow ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-75 bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-16 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-xs font-medium tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            Our Premium Fleet
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-6 mb-4 tracking-tight">
            A Ride for Every Need
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Choose from our diverse range of vehicles tailored for speed,
            comfort, and heavy-duty logistics.
          </p>
        </motion.div>
      </div>

      {/* ── Auto-Scrolling Slider ── */}
      <div className="relative w-full flex overflow-x-hidden">
        {/* Left & Right Fade Gradients for smooth visual transition */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-linear-to-r from-[#020617] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-linear-to-l from-[#020617] to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-6 md:gap-8 px-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 35, // Adjust this value to make it slower or faster
            repeat: Infinity,
          }}
        >
          {duplicatedVehicles.map((vehicle, index) => (
            <motion.div
              key={`${vehicle.id}-${index}`}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative shrink-0 w-50 md:w-[320px] bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-3 md:p-6 group cursor-grab active:cursor-grabbing shadow-lg"
            >
              {/* Top Section: Icon & Name */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-linear-to-br ${vehicle.gradient} shadow-inner`}
                >
                  <vehicle.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-md md:text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-blue-400 group-hover:to-violet-400 transition-all">
                  {vehicle.name}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-6 h-10">
                {vehicle.desc}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-auto">
                {vehicle.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-medium tracking-wide uppercase rounded-md bg-white/5 border border-white/10 text-slate-300 group-hover:border-white/20 transition-colors"
                  >
                    {tag.icon && <tag.icon className="w-3 h-3" />}
                    {tag.text}
                  </span>
                ))}
              </div>

              {/* Subtle hover glow border effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-blue-500/30 transition-colors duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
