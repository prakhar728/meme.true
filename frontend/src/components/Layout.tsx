import dynamic from "next/dynamic";
import { ReactNode } from "react";


const Header = dynamic(() => import("@/components/Header"), { ssr: false });

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      {/* Header Component */}
      <Header />
      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
