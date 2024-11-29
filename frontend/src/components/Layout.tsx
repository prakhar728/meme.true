import { WalletStoreProvider } from "@/providers/walletStoreProvider";
import dynamic from "next/dynamic";
import walletAggregator from "@/providers/walletProviderAggregator";
import { ReactNode } from "react";

// Dynamically import PolkadotWalletsContextProvider
const PolkadotWalletsContextProvider = dynamic(
  () =>
    import("@/providers/PolkadotWalletsContext").then(
      (mod) => mod.PolkadotWalletsContextProvider
    ),
  { ssr: false }
);

// Dynamically import Header
const Header = dynamic(() => import("@/components/Header"), { ssr: false });

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <PolkadotWalletsContextProvider walletAggregator={walletAggregator}>
      <WalletStoreProvider>
        {/* Header Component */}
        <Header />
        {/* Main Content */}
        <main>{children}</main>
      </WalletStoreProvider>
    </PolkadotWalletsContextProvider>
  );
}
