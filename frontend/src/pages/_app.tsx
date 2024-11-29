import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WalletStoreProvider } from "@/providers/walletStoreProvider";
import dynamic from "next/dynamic";
import walletAggregator from "@/providers/walletProviderAggregator";
import LandingHeader from "@/components/LandingHeader";

const PolkadotWalletsContextProvider = dynamic(
  () =>
    import("@/providers/PolkadotWalletsContext").then(
      (mod) => mod.PolkadotWalletsContextProvider
    ),
  { ssr: false }
);


export default function App({ Component, pageProps }: AppProps) {
  return (
    <PolkadotWalletsContextProvider walletAggregator={walletAggregator}>
      <WalletStoreProvider>
       <LandingHeader />
        <Component {...pageProps} />
      </WalletStoreProvider>
    </PolkadotWalletsContextProvider>
  );
}
