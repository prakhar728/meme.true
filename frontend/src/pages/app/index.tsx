import React, { useEffect, useState } from "react";
import Nextjs from "@/components/logos/next";
import TypeScriptLogo from "@/components/logos/typescript";
import { useWalletStore } from "@/providers/walletStoreProvider";
import { ArrowRight } from "lucide-react";
import { Inter } from "next/font/google";
import Layout from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { connectedWallet, connectedAccount, api } = useWalletStore(
    (state) => state
  );

  const [balance, setBalance] = useState<number>(0);
  const [chainToken, setChainToken] = useState<string>("");
  const [chain, setChain] = useState<string>("");

  useEffect(() => {
    async function getChainData() {
      if (!api) return;
      const [chain, nodeName] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
      ]);
      setChain(`${chain} - ${nodeName}`);

      if (connectedAccount?.address) {
        const chainToken = api.registry.chainTokens[0];
        api.query.system.account(
          connectedAccount?.address,
          (res: {
            data: { free: { toHuman: () => React.SetStateAction<number> } };
          }) => {
            setBalance(res.data.free.toHuman());
            setChainToken(chainToken);
          }
        );
      }
    }
    getChainData();
  }, [api, connectedAccount]);

  async function signTransaction() {
    try {
      if (api && connectedAccount?.address && connectedWallet?.signer) {
        const signer = connectedWallet.signer as any;

        await api.tx.system
          .remark("Hello World")
          .signAndSend(
            connectedAccount.address,
            { signer },
            ({ status, events }) => {
              // do something with result
              events.forEach(({ event: { data, method, section } }) => {
                console.log(`\t' ${section}.${method}:: ${data}`);
              });
              console.log(
                "Transaction successful",
                status.asFinalized.toString()
              );
            }
          );
      }
    } catch (err) {
      alert("Error signing transaction");
      console.log(err);
    }
  }

  return (
    <Layout>
      <main
        className={`${inter.className} min-h-screen bg-background text-foreground py-12 px-4`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center space-x-6 mb-12">
            <TypeScriptLogo className="w-16 h-16" />
            <ArrowRight size={24} className="text-muted-foreground" />
            <Nextjs className="w-16 h-16" />
            <ArrowRight size={24} className="text-muted-foreground" />
            <img
              src={"/polkadot-logo.svg"}
              alt="Polkadot"
              className="w-16 h-16"
            />
          </div>

          <div className="bg-card/40 backdrop-blur-md rounded-lg p-8 mb-8 border border-border">
            {connectedWallet?.isConnected ? (
              <div className="space-y-4">
                {connectedAccount?.address && (
                  <>
                    <p className="text-xl font-semibold text-card-foreground">
                      Balance: {balance} {chainToken}
                    </p>

                    <button
                      type="button"
                      onClick={signTransaction}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Sign Transaction
                    </button>
                  </>
                )}
                <p className="text-sm text-muted-foreground">{chain}</p>
              </div>
            ) : (
              <div className="text-center">
                <h4 className="text-2xl font-bold mb-4 text-card-foreground">
                  Connect your Wallet
                </h4>
                <p className="text-muted-foreground">
                  Please connect your wallet to interact with the dApp.
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-lg">
            Make changes to{" "}
            <code className="bg-secondary text-secondary-foreground px-2 py-1 rounded">
              src/pages/index.tsx
            </code>
          </p>
        </div>
      </main>
    </Layout>
  );
}
