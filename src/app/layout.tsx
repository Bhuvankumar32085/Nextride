import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import GoogleProvider from "@/components/GoogleProvider";
import ReduxProvider from "./redux/ReduxProvider";
import HoockProvider from "@/components/HoockProvider";
import SocketProvider from "@/providers/SocketProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "NextRide",
  description:
    "This project is built using a Microservices Architecture with real-time communication, scalable backend systems, and containerized deployment — just like real-world startups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {" "}
        <SocketProvider>
          <ReduxProvider>
            <HoockProvider />
            <GoogleProvider>{children}</GoogleProvider>
            {/* Toast container */}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#111",
                  color: "#fff",
                },
              }}
            />
          </ReduxProvider>
        </SocketProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
