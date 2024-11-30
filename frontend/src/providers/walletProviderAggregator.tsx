import { WalletAggregator } from "@polkadot-onboard/core";
import { InjectedWalletProvider } from "@polkadot-onboard/injected-wallets";
import { WalletConnectConfiguration, WalletConnectProvider } from "@polkadot-onboard/wallet-connect";
import { extensionConfig } from "@/configs/extensionConnectConfig";

const APP_NAME =
  (process.env.NEXT_PUBLIC_APP_NAME as string) || "create-polka-dapp";

const walletConnectParams: WalletConnectConfiguration = {
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || "id",
  relayUrl: "wss://relay.walletconnect.com",
  metadata: {
    name: "Near Wallet Telegram",
    description: "AppKit Example",
    url: "https://reown.com/appkit", // origin must match your domain & subdomain
    icons: ["https://assets.reown.com/reown-profile-pic.png"],
  },
  chainIds: [
    "polkadot:e143f23803ac50e8f6f8e62695d1ce9e",
    "polkadot:91b171bb158e2d3848fa23a9f1c25182",
  ],
  optionalChainIds: [
    "polkadot:67f9723393ef76214df0118c34bbbd3d",
    "polkadot:7c34d42fc815d392057c78b49f2755c7",
  ],
};

const walletAggregator = new WalletAggregator([
  new InjectedWalletProvider(extensionConfig, APP_NAME),
  new WalletConnectProvider(walletConnectParams, APP_NAME),
]);

export default walletAggregator;
