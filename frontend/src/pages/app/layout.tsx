import "@/styles/globals.css";
import { WalletStoreProvider } from "@/providers/walletStoreProvider";
import dynamic from "next/dynamic";
import walletAggregator from "@/providers/walletProviderAggregator";

const PolkadotWalletsContextProvider = dynamic(
  () =>
    import("@/providers/PolkadotWalletsContext").then(
      (mod) => mod.PolkadotWalletsContextProvider
    ),
  { ssr: false }
);

const Header = dynamic(() => import("@/components/Header"), { ssr: false });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PolkadotWalletsContextProvider walletAggregator={walletAggregator}>
      <WalletStoreProvider>
        <Header />
        <main>{children}</main>
      </WalletStoreProvider>
    </PolkadotWalletsContextProvider>
  );
}
