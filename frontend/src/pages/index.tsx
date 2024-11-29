import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

// Initial Loader Component
const InitialLoader = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black flex items-center justify-center"
    >
      <motion.h1
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"
      >
        Meme.True
      </motion.h1>
    </motion.div>
  );
};

// Feature Card Component
const FeatureCard = ({ title, description, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-800/70 transition-all"
  >
    <Icon className="w-8 h-8 text-purple-400 mb-4" />
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

// Timeline Item Component
const TimelineItem = ({ date, title, description, align }) => (
  <motion.div
    initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`flex w-full ${align === 'left' ? 'justify-end pr-8' : 'justify-start pl-8'} relative`}
  >
    <div className={`w-1/2 p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm ${align === 'left' ? 'text-right' : 'text-left'}`}>
      <span className="text-purple-400 text-sm">{date}</span>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  </motion.div>
);

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="bg-gray-900 min-h-screen">
      <AnimatePresence>
        {loading && <InitialLoader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black/20" />
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-center z-10 max-w-4xl mx-auto px-4"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Meme.True
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Where Memes Meet Markets. Create, Predict, Earn.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Explore Platform
              <ChevronRight className="inline ml-2" />
            </motion.button>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-white mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                title="Create & Earn"
                description="Design meme templates and earn royalties when others use them"
                icon={() => <motion.div className="text-purple-400">🎨</motion.div>}
              />
              <FeatureCard
                title="Predict & Win"
                description="Bet on which memes will go viral using prediction markets"
                icon={() => <motion.div className="text-purple-400">📈</motion.div>}
              />
              <FeatureCard
                title="Community Driven"
                description="Join a vibrant community of creators and predictors"
                icon={() => <motion.div className="text-purple-400">👥</motion.div>}
              />
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="py-20 relative">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-white mb-12">Roadmap</h2>
            <div className="relative">
              {/* Center Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-purple-600/30" />
              
              {/* Timeline Items */}
              <div className="space-y-12">
                <TimelineItem
                  date="Q1 2024"
                  title="Platform Launch"
                  description="Initial release with core features and wallet integration"
                  align="left"
                />
                <TimelineItem
                  date="Q2 2024"
                  title="Community Features"
                  description="Introduction of social features and creator tools"
                  align="right"
                />
                <TimelineItem
                  date="Q3 2024"
                  title="Enhanced Predictions"
                  description="Advanced prediction markets and analytics"
                  align="left"
                />
                <TimelineItem
                  date="Q4 2024"
                  title="Mobile App"
                  description="Launch of native mobile applications"
                  align="right"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800/50 backdrop-blur-sm py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Meme.True</h3>
                <p className="text-gray-300">The future of meme creation and prediction markets.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>Features</li>
                  <li>Roadmap</li>
                  <li>Documentation</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>Help Center</li>
                  <li>Blog</li>
                  <li>Terms of Service</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
                <div className="flex space-x-4">
                  <ChevronRight className="w-6 h-6 text-gray-300 hover:text-white cursor-pointer" />
                  <ChevronRight className="w-6 h-6 text-gray-300 hover:text-white cursor-pointer" />
                  <ChevronRight className="w-6 h-6 text-gray-300 hover:text-white cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
              <p>&copy; 2024 Meme.True. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}