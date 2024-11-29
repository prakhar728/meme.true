import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { useRouter } from "next/router";
import LandingHeader from "@/components/LandingHeader";

const features = [
  {
    title: "Create & Earn",
    description:
      "Design meme templates and earn royalties every time someone uses them. Our platform ensures creators are fairly compensated for their work.",
    image: "/images/feature.png",
  },
  {
    title: "Predict & Win",
    description:
      "Use your meme-sensing abilities to predict which content will go viral. Stake tokens on your predictions and earn rewards when you're right.",
    image: "/images/feature.png",
  },
  {
    title: "Community First",
    description:
      "Join a vibrant community of creators, predictors, and meme enthusiasts. Share ideas, collaborate on templates, and grow together.",
    image: "/images/feature.png",
  },
  {
    title: "Transparent Rewards",
    description:
      "All transactions and rewards are handled on-chain, ensuring complete transparency and fair distribution of earnings.",
    image: "/images/feature.png",
  },
];

// Update the InitialLoader component
const InitialLoader = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background flex items-center justify-center"
    >
      <div className="h-[40rem] w-full bg-background flex flex-col items-center justify-center overflow-hidden rounded-md">
        <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center relative z-20 flex items-center">
          <span
            className="text-foreground mr-2"
            style={{ WebkitTextStroke: "1px rgb(var(--muted-foreground))" }}
          >
            Meme
          </span>
          <span
            className="text-muted-foreground"
            style={{ WebkitTextStroke: "1px rgb(var(--accent-foreground))" }}
          >
            .True
          </span>
        </h1>
      </div>
    </motion.div>
  );
};

// Feature Card Component
const FeatureCard = ({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: any;
}) => (
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
const TimelineItem = ({
  date,
  title,
  description,
  align,
}: {
  date: string;
  title: string;
  description: string;
  align: string;
}) => (
  <motion.div
    initial={{ opacity: 0, x: align === "left" ? -50 : 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`flex w-full ${
      align === "left" ? "justify-end pr-8" : "justify-start pl-8"
    } relative`}
  >
    <div
      className={`w-1/2 p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm ${
        align === "left" ? "text-right" : "text-left"
      }`}
    >
      <span className="text-purple-400 text-sm">{date}</span>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  </motion.div>
);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  return (
    <div className="bg-gray-900 min-h-screen">
       <LandingHeader />

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
          <div className="absolute inset-0 bg-gradient-to-b from-secondary to-background" />
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-center z-10 max-w-4xl mx-auto px-4"
          >
            <TypewriterEffect
              words={[
                {
                  text: "Meme.",
                  className: "text-foreground",
                },
                {
                  text: "True",
                  className: "text-muted-foreground",
                },
              ]}
              className="text-6xl md:text-7xl font-bold mb-6"
              cursorClassName="hidden"
            />
            <TextGenerateEffect
              words="Where Memes Meet Markets. Create, Predict, Earn."
              className="text-2xl md:text-3xl text-primary font-medium mb-8"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-lg text-lg font-medium transition-colors flex items-center mx-auto"
              onClick={() => router.push('/app')}
            >
              Explore Platform
              <ChevronRight className="ml-2 w-5 h-5" />
            </motion.button>
          </motion.div>
        </section>
        {/* Features Section */}
        <StickyScroll content={features} />

        {/* Roadmap Section */}
        <TracingBeam className="px-4">
          <div className="max-w-2xl mx-auto antialiased pt-4 relative">
            {[
              {
                date: "Q1 2024",
                title: "Platform Launch",
                description:
                  "Initial release with core features and wallet integration",
              },
              {
                date: "Q2 2024",
                title: "Community Features",
                description:
                  "Introduction of social features and creator tools",
              },
              {
                date: "Q3 2024",
                title: "Enhanced Predictions",
                description: "Advanced prediction markets and analytics",
              },
              {
                date: "Q4 2024",
                title: "Mobile App",
                description: "Launch of native mobile applications",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="mb-32"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:bg-gray-800/60 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mr-2" />
                    <h3 className="text-sm text-purple-400">{item.date}</h3>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {item.title}
                  </h2>
                  <p className="text-gray-300">{item.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </TracingBeam>
        {/* Footer */}
        <footer className="bg-gray-800/50 backdrop-blur-sm py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Meme.True
                </h3>
                <p className="text-gray-300">
                  The future of meme creation and prediction markets.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Platform
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li>Features</li>
                  <li>Roadmap</li>
                  <li>Documentation</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Resources
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li>Help Center</li>
                  <li>Blog</li>
                  <li>Terms of Service</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Connect
                </h4>
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
