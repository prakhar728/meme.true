import React, { useState, useCallback, useMemo } from "react";
import { useWallets } from "@/providers/PolkadotWalletsContext";
import { useWalletStore } from "@/providers/walletStoreProvider";
import { Wallet, LogOut, ChevronDown, X } from "lucide-react";
import type { BaseWallet } from "@polkadot-onboard/core";
import { ExternalLink } from "lucide-react";
import { extensionConfig } from "@/configs/extensionConnectConfig";
import { type ChainConfig, chainsConfig } from "@/configs/chainsConfig";

const WalletModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  wallets: BaseWallet[];
  onSelectWallet: (wallet: BaseWallet) => Promise<void>;
  isConnecting: boolean;
  connectingWallet: string | null;
}> = ({
  isOpen,
  onClose,
  wallets,
  onSelectWallet,
  isConnecting,
  connectingWallet,
}) => {
  if (!isOpen) return null;

  const walletConnect = wallets.find((w) => w.type === "WALLET_CONNECT");

  const allWallets = extensionConfig.supported;
  const installedWallets = new Set(
    wallets.map((wallet) => wallet.metadata.title)
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md relative border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-card-foreground">
            Select a Wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            disabled={isConnecting}
          >
            <X size={24} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {allWallets?.map((wallet) => {
            const isInstalled = installedWallets.has(wallet.title);
            return (
              <div
                key={wallet.id}
                className="flex flex-col items-center justify-center p-4 border border-border rounded-lg relative bg-card/50"
              >
                {/* ... rest of wallet card content */}
                {isInstalled ? (
                  <button
                    type="button"
                    onClick={() =>
                      onSelectWallet(
                        wallets.find(
                          (w) => w.metadata.title === wallet.title
                        ) as BaseWallet
                      )
                    }
                    className="mt-2 px-3 py-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md transition duration-200"
                    disabled={isConnecting}
                  >
                    Connect
                  </button>
                ) : (
                  <a
                    href={wallet.urls?.browsers?.chrome || wallet.urls?.main}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition duration-200 flex items-center"
                  >
                    Install <ExternalLink size={14} className="ml-1" />
                  </a>
                )}
                {isConnecting && connectingWallet === wallet.title && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* WalletConnect section */}
        {walletConnect && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4 text-center text-card-foreground">
              Other Connection Methods
            </h3>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onSelectWallet(walletConnect)}
                className="flex items-center px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md transition duration-200"
                disabled={isConnecting}
              >
                <img
                  src="/images/wallet-connect.svg"
                  alt="WalletConnect"
                  className="w-6 h-6 mr-2"
                />
                Connect with WalletConnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const {
    connectedWallet,
    connectedAccount,
    disconnectWallet,
    disconnectAccount,
    accounts,
    connectAccount,
    connectWallet,
    currentChain,
    changeChain,
  } = useWalletStore((state) => state);

  const { wallets } = useWallets();

  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [showAccounts, setShowAccounts] = useState<boolean>(false);
  const [showChains, setShowChains] = useState<boolean>(false);
  const [isChangingChain, setIsChangingChain] = useState<boolean>(false);

  const toggleWalletModal = useCallback(
    () => setShowWalletModal((prev) => !prev),
    []
  );
  const toggleAccounts = useCallback(
    () => setShowAccounts((prev) => !prev),
    []
  );

  const handleConnectWallet = useCallback(
    async (wallet: BaseWallet) => {
      setIsConnecting(true);
      setConnectingWallet(wallet.metadata.title);
      try {
        await connectWallet(wallet);
        const walletAccounts = await wallet.getAccounts();
        if (walletAccounts && walletAccounts.length > 0) {
          await connectAccount(walletAccounts[0]);
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
      } finally {
        setIsConnecting(false);
        setConnectingWallet(null);
        setShowWalletModal(false);
      }
    },
    [connectWallet, connectAccount]
  );

  const handleDisconnect = useCallback(() => {
    disconnectWallet();
    disconnectAccount();
    setShowAccounts(false);
  }, [disconnectWallet, disconnectAccount]);

  const truncatedAddress = useMemo(
    () =>
      connectedAccount?.address
        ? `${connectedAccount.address.slice(
            0,
            6
          )}...${connectedAccount.address.slice(-4)}`
        : "",
    [connectedAccount]
  );

  const handleChangeChain = async (chain: ChainConfig) => {
    setIsChangingChain(true);
    try {
      await changeChain(chain);
    } catch (error) {
      console.error("Error changing chain:", error);
    } finally {
      setIsChangingChain(false);
      setShowChains(false);
    }
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border text-foreground">
      <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">create-polka-dapp</h1>
        <div className="flex items-center space-x-4">
          {connectedWallet?.isConnected && connectedAccount ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowChains(!showChains)}
                  className="bg-card hover:bg-card/80 px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200 border border-border"
                  disabled={isChangingChain}
                >
                  <img
                    src={currentChain?.logo || "/images/polkadot-logo.svg"}
                    alt={currentChain?.name || "Polkadot"}
                    width={24}
                    height={24}
                  />
                  <span>{currentChain?.name || "Polkadot"}</span>
                  {isChangingChain ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-foreground" />
                  )}
                </button>
                {showChains && !isChangingChain && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border">
                    <div className="py-1" role="menu">
                      {chainsConfig.map((chain) => (
                        <button
                          type="button"
                          key={chain.name}
                          onClick={() => handleChangeChain(chain)}
                          className="block w-full text-left px-4 py-2 text-sm text-card-foreground hover:bg-accent/10 transition duration-200"
                        >
                          <div className="flex items-center space-x-2">
                            <img
                              src={chain.logo}
                              alt={chain.name}
                              width={24}
                              height={24}
                            />
                            <span>{chain.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleAccounts}
                  className="bg-card hover:bg-card/80 px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200 border border-border"
                >
                  {connectedWallet?.metadata?.iconUrl && (
                    <img
                      src={connectedWallet.metadata.iconUrl}
                      alt="wallet icon"
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <span>{truncatedAddress}</span>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </button>
                {showAccounts && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border">
                    <div className="py-1 max-h-60 overflow-auto" role="menu">
                      {accounts.map((account) => (
                        <button
                          type="button"
                          key={account.address}
                          onClick={() => {
                            connectAccount(account);
                            setShowAccounts(false);
                          }}
                          className={`block px-4 py-2 text-sm w-full text-left transition duration-200 ${
                            connectedAccount.address === account.address
                              ? "bg-accent/10 text-foreground"
                              : "text-card-foreground hover:bg-accent/10"
                          }`}
                        >
                          <div className="font-medium">
                            {account.name || "Unnamed Account"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {account.address}
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent/10 transition duration-200 flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>Disconnect Wallet</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={toggleWalletModal}
              className="bg-accent hover:bg-accent/90 px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200 text-accent-foreground"
            >
              <Wallet size={16} />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
        <WalletModal
          isOpen={showWalletModal}
          onClose={() => !isConnecting && setShowWalletModal(false)}
          wallets={wallets || []}
          onSelectWallet={handleConnectWallet}
          isConnecting={isConnecting}
          connectingWallet={connectingWallet}
        />
      </div>
    </header>
  );
};

export default Header;
