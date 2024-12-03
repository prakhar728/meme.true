"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  X,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import { MemeTemplate } from "@/lib/memes";
import { getAllMemes, investInTemplate } from "@/lib/utils";
import { useAccount } from "wagmi";

const MemeView = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [showInstructions, setShowInstructions] = useState(true);
  const [showReaction, setShowReaction] = useState<"like" | "dislike" | null>(
    null
  );
  const [memes, setMemes] = useState<MemeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();

  // Handle instructions visibility
  useEffect(() => {
    const hasSeenInstructions = localStorage.getItem("hasSeenMemeInstructions");
    if (hasSeenInstructions) {
      setShowInstructions(false);
    }
  }, []);

  // Load memes with proper error handling and race condition prevention
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadMemes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const memesData = await getAllMemes();

        if (!isMounted) return;

        if (!memesData.data || memesData.data.length === 0) {
          throw new Error("No memes found");
        }

        // Load images sequentially to prevent race conditions
        const loadedMemes = await Promise.all(
          memesData.data.map(async (meme) => {
            try {
              const response = await fetch(
                `https://gateway.lighthouse.storage/ipfs/${meme.cid}`,
                { signal: abortController.signal }
              );

              if (!response.ok) {
                throw new Error(`Failed to load meme: ${response.statusText}`);
              }

              const imageData = await response.text();
              return {
                ...meme,
                image: `data:image/png;base64,${imageData}`,
              };
            } catch (error) {
              if (error instanceof Error && error.name === "AbortError") {
                throw error; // Rethrow if it's an AbortError
              }
              // Handle other errors and return the meme without the image
              return {
                ...meme,
                image: null,
              };
            }
          })
        );

        if (!isMounted) return;

        // Filter out memes with failed image loads
        const validMemes = loadedMemes.filter((meme) => meme.image !== null);

        if (validMemes.length === 0) {
          throw new Error("No valid memes could be loaded");
        }

        setMemes(validMemes);
      } catch (error) {
        if (!isMounted) return;

        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setError( "Failed to load memes");
        console.error("Error loading memes:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMemes();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const handleDrag = (event: any, info: PanInfo) => {
    setDragPosition({ x: info.offset.x, y: info.offset.y });
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    const { offset } = info;

    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x > swipeThreshold) {
        handleLike();
      } else if (offset.x < -swipeThreshold) {
        handleDislike();
      }
    } else if (offset.y < -swipeThreshold) {
      handleSkip();
    }
  };

  const handleLike = async () => {
    if (isLoading || memes.length === 0) return;

    setDirection(1);
    setShowReaction("like");
    setTimeout(() => setShowReaction(null), 1000);

    const mm = memes[currentIndex];
    
    await investInTemplate(address as string, parseInt(mm.memeTemplate), true);

    nextMeme();
  };

  const handleDislike = async () => {
    if (isLoading || memes.length === 0) return;

    setDirection(-1);
    setShowReaction("dislike");
    setTimeout(() => setShowReaction(null), 1000);

    const mm = memes[currentIndex];
    await investInTemplate(address as string, parseInt(mm.memeTemplate), false);

    nextMeme();
  };

  const handleSkip = () => {
    if (isLoading || memes.length === 0) return;

    setDirection(2);
    nextMeme();
  };

  const nextMeme = () => {
    setCurrentIndex((prev) => (prev + 1) % memes.length);
  };

  const closeInstructions = () => {
    setShowInstructions(false);
    localStorage.setItem("hasSeenMemeInstructions", "true");
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction === 1 ? 1000 : direction === -1 ? -1000 : 0,
      y: direction === 2 ? 1000 : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction === 1 ? -1000 : direction === -1 ? 1000 : 0,
      y: direction === 2 ? -1000 : 0,
      opacity: 0,
    }),
  };

  if (error) {
    return (
      <div className="bg-[hsl(220,10%,8%)] max-w-full min-h-screen flex items-center justify-center p-4">
        <div className="text-white text-center">
          <p className="text-xl mb-4">😕 {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(220,10%,8%)] max-w-full min-h-screen flex items-center justify-center p-4">
      <div className="relative w-[400px] h-[60vh] overflow-hidden">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl z-50">
            <div className="text-white text-xl">Loading memes...</div>
          </div>
        )}

        {/* Instructions Overlay */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 rounded-xl flex flex-col items-center justify-center gap-6 p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                How to Rate Memes
              </h2>

              <div className="space-y-6 text-center">
                <div className="flex items-center gap-4">
                  <ArrowRight className="w-6 h-6 text-green-500" />
                  <span className="text-white">Swipe Right for Funny</span>
                </div>

                <div className="flex items-center gap-4">
                  <ArrowLeft className="w-6 h-6 text-red-500" />
                  <span className="text-white">Swipe Left for Lame</span>
                </div>

                <div className="flex items-center gap-4">
                  <ArrowDown className="w-6 h-6 text-gray-500" />
                  <span className="text-white">Swipe Down to Skip</span>
                </div>
              </div>

              <button
                onClick={closeInstructions}
                className="mt-8 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Got it!
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reaction Animations */}
        <AnimatePresence>
          {showReaction && (
            <motion.div
              initial={{ scale: 0.5, y: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40"
            >
              {showReaction === "like" ? (
                <ThumbsUp className="w-16 h-16 text-green-500" />
              ) : (
                <ThumbsDown className="w-16 h-16 text-red-500" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meme Display */}
        {!isLoading && memes.length > 0 && (
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag={true}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={1}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              className="absolute w-full h-full rounded-xl shadow-lg"
            >
              <img
                src={memes[currentIndex]?.image}
                alt="Meme"
                className="w-full h-full object-contain rounded-xl"
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default MemeView;
