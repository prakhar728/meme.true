"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect,  useSwitchChain } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { Wallet, LogOut, ChevronDown, X, Menu } from "lucide-react";
import Link from "next/link";

// Chain configuration
const SUPPORTED_CHAINS = [mainnet, sepolia];

// WalletModal component
const WalletModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const [isLoading, setisLoading] = useState(false)
  const { connect, connectors } = useConnect(); 

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Connect Wallet</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={!connector.ready || isLoading}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {connector.name === "MetaMask" && (
                  <img
                    src="/images/metamask-fox.svg"
                    alt="MetaMask"
                    className="w-8 h-8"
                  />
                )}
                <span className="font-medium">{connector.name}</span>
              </div>
              {isLoading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// MobileNav component remains largely the same
const MobileNav: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  navLinks: Array<{ href: string; label: string }>;
}> = ({ isOpen, onClose, navLinks }) => {
  
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useAccount();
  const { chains, switchChain, pendingChainId } = useSwitchChain();
  
  const [showChains, setShowChains] = useState<boolean>(false);

  const navLinks = [
    { href: '/app/memes', label: 'Explore' },
    { href: '/app/memes/create', label: 'Create' },
    { href: '/app/my-memes', label: 'My Memes' },
  ];

  const truncatedAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : "";

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
          {isConnected ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowChains(!showChains)}
                  className="bg-card hover:bg-card/80 px-2 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition duration-200 text-sm sm:text-base"
                  disabled={!switchChain}
                >
                  <img
                    src={`/images/${chain?.name.toLowerCase()}-logo.svg`}
                    alt={chain?.name || "Network"}
                    className="w-4 h-4 sm:w-6 sm:h-6"
                  />
                  <span className="hidden sm:inline">{chain?.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showChains && switchChain && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                      {chains.map((x) => (
                        <button
                          key={x.id}
                          onClick={() => {
                            switchChain(x.id);
                            setShowChains(false);
                          }}
                          disabled={pendingChainId === x.id}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={`/images/${x.name.toLowerCase()}-logo.svg`}
                              alt={x.name}
                              className="w-6 h-6"
                            />
                            <span>{x.name}</span>
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
                  onClick={() => disconnect()}
                  className="bg-card hover:bg-card/80 px-2 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition duration-200 text-sm sm:text-base"
                >
                  <img
                    src="/images/metamask-fox.svg"
                    alt="MetaMask"
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                  />
                  <span>{truncatedAddress}</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowWalletModal(true)}
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
        onClose={() => setShowWalletModal(false)}
      />
    </header>
  );
};

export default Header;