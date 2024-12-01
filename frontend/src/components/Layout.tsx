import dynamic from "next/dynamic";
import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";


const Header = dynamic(() => import("@/components/Header"), { ssr: false });

interface LayoutProps {
  children: ReactNode;
}


const FloatingMemes = () => {
  return (
    <div className="fixed inset-0 top-0 overflow-hidden pointer-events-none ">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          animate={{
            y: ["0%", "100%"],
            x: ["0%", i % 2 === 0 ? "100%" : "-100%"],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20 + i * 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.1,
          }}
        >
          <img
            src={`/images/meme-${i}.webp`}
            alt="Floating meme"
            className="w-40 h-40 object-contain"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default function Layout({ children }: LayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = 
        typeof window !== "undefined" ? window.navigator.userAgent : "";
      
      const mobile = Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
      );
      
      setIsMobile(mobile);
      setIsLoading(false);
    };

    checkMobile();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <FloatingMemes />
          <h1 className="text-2xl font-bold text-foreground">Mobile Only App</h1>
          <p className="text-muted-foreground">
            This app is designed for mobile devices only. Please open it on your phone or tablet.
          </p>
          <div className="w-48 h-48 relative mx-auto border border-border rounded-lg overflow-hidden">
            <Image 
              src="/images/Website.png" 
              alt="QR Code"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}