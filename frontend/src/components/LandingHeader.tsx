// components/Header.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const LandingHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Roadmap', href: '#roadmap' },
    { name: 'Documentation', href: '#docs' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-card/80 backdrop-blur-md border-b border-border' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.a
              href="/"
              className="text-foreground font-bold text-xl flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Meme.True
            </motion.a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg transition-colors"
              >
                Launch App
              </motion.button>
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="md:hidden text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 bg-card/95 backdrop-blur-lg z-40 border-b border-border md:hidden"
          >
            <nav className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-accent/10"
                    whileHover={{ x: 4 }}
                    whileTap={{ x: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </motion.a>
                ))}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg transition-colors mx-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Launch App
                </motion.button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingHeader;