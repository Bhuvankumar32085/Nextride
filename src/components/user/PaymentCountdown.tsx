import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const PaymentCountdown = ({
  deadline,
  onExpire,
}: {
  deadline: string | Date;
  onExpire: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(deadline) - +new Date();
      if (difference <= 0) {
        setTimeLeft("00:00");
        onExpire();
        return false;
      }
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (minutes < 1) setIsCritical(true);

      setTimeLeft(
        `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`,
      );
      return true;
    };

    calculateTime();
    const interval = setInterval(() => {
      const active = calculateTime();
      if (!active) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${isCritical ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"}`}
    >
      <Clock
        size={14}
        className={isCritical ? "animate-spin" : ""}
        style={{ animationDuration: "2s" }}
      />
      <span className="font-mono font-black text-sm tracking-widest">
        {timeLeft || "--:--"}
      </span>
    </div>
  );
};

export default PaymentCountdown;
