import React, { useState, useCallback, useMemo } from "react";
import { useWallets } from "@/providers/PolkadotWalletsContext";
import { useWalletStore } from "@/providers/walletStoreProvider";
import { Wallet, LogOut, ChevronDown, X, Menu } from "lucide-react";
import type { BaseWallet } from "@polkadot-onboard/core";
import { ExternalLink } from "lucide-react";
import { extensionConfig } from "@/configs/extensionConnectConfig";
import { type ChainConfig, chainsConfig } from "@/configs/chainsConfig";
import Link from "next/link";
import { useRouter } from "next/router";

// WalletModal component remains the same
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Select a Wallet</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
                className="flex flex-col items-center justify-center p-4 border rounded-lg relative"
              >
                {wallet.iconUrl && (
                  <img
                    src={wallet.iconUrl}
                    alt={`${wallet.title} icon`}
                    className="w-12 h-12 mb-2"
                  />
                )}
                <span className="text-sm font-medium text-gray-800">
                  {wallet.title}
                </span>
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
                    className="mt-2 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200"
                    disabled={isConnecting}
                  >
                    Connect
                  </button>
                ) : (
                  <a
                    href={wallet.urls?.browsers?.chrome || wallet.urls?.main}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200 flex items-center"
                  >
                    Install <ExternalLink size={14} className="ml-1" />
                  </a>
                )}
                {isConnecting && connectingWallet === wallet.title && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {walletConnect && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4 text-center text-black">
              Other Connection Methods
            </h3>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onSelectWallet(walletConnect)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
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

const MobileNav: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  navLinks: Array<{ href: string; label: string }>;
}> = ({ isOpen, onClose, navLinks }) => {
  const router = useRouter();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-40">
      <div className="p-4 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold">Meme.True</h1>
        <button onClick={onClose} className="p-2">
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="p-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block py-3 text-lg ${
              router.pathname === link.href
                ? "text-foreground font-medium"
                : "text-foreground/70"
            }`}
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}
      </nav>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [showAccounts, setShowAccounts] = useState<boolean>(false);
  const [showChains, setShowChains] = useState<boolean>(false);
  const [isChangingChain, setIsChangingChain] = useState<boolean>(false);

  const navLinks = [
    { href: '/app/memes', label: 'Explore' },
    { href: '/app/memes/create', label: 'Create' },
    { href: '/app/my-memes', label: 'My Memes' },
  ];

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
            4
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
    <header className="bg-background text-foreground p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo and Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <h1 className="text-2xl font-bold">Meme.True</h1>
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-foreground transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Logo (centered) */}
        <h1 className="text-2xl font-bold lg:hidden">Meme.True</h1>

        {/* Wallet Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {connectedWallet?.isConnected && connectedAccount ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowChains(!showChains)}
                  className="bg-card hover:bg-card/80 px-2 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition duration-200 text-sm sm:text-base"
                  disabled={isChangingChain}
                >
                  <img
                    src={currentChain?.logo || "/images/polkadot-logo.svg"}
                    alt={currentChain?.name || "Polkadot"}
                    className="w-4 h-4 sm:w-6 sm:h-6"
                  />
                  <span className="hidden sm:inline">{currentChain?.name || "Polkadot"}</span>
                  {isChangingChain ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showChains && !isChangingChain && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                      {chainsConfig.map((chain) => (
                        <button
                          type="button"
                          key={chain.name}
                          onClick={() => handleChangeChain(chain)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={chain.logo}
                              alt={chain.name}
                              className="w-6 h-6"
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
                  className="bg-card hover:bg-card/80 px-2 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition duration-200 text-sm sm:text-base"
                >
                  {connectedWallet?.metadata?.iconUrl && (
                    <img
                      src={connectedWallet.metadata.iconUrl}
                      alt="wallet icon"
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                    />
                  )}
                  <span>{truncatedAddress}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showAccounts && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
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
                              ? "bg-gray-200 text-gray-900"
                              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <div className="font-medium">
                            {account.name || "Unnamed Account"}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {account.address}
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition duration-200 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect</span>
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
              className="bg-card hover:bg-card/80 px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200 text-sm sm:text-base"
            >
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Connect Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
      />

      {/* Wallet Modal */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => !isConnecting && setShowWalletModal(false)}
        wallets={wallets || []}
        onSelectWallet={handleConnectWallet}
        isConnecting={isConnecting}
        connectingWallet={connectingWallet}
      />
    </header>
  );
};

export default Header;