"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, ThumbsUp, ThumbsDown, ArrowLeft, ArrowRight, ArrowDown } from "lucide-react";
import { memes } from "@/lib/memes";

const MemeView = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [showInstructions, setShowInstructions] = useState(true);
  const [showReaction, setShowReaction] = useState<'like' | 'dislike' | null>(null);

  useEffect(() => {
    // Check if user has seen instructions
    const hasSeenInstructions = localStorage.getItem('hasSeenMemeInstructions');
    if (hasSeenInstructions) {
      setShowInstructions(false);
    }
  }, []);

  const handleDrag = (event: any, info: PanInfo) => {
    setDragPosition({ x: info.offset.x, y: info.offset.y });
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    const { offset, velocity } = info;

    // Horizontal swipe
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      if (offset.x > swipeThreshold) {
        // Right swipe
        handleLike();
      } else if (offset.x < -swipeThreshold) {
        // Left swipe
        handleDislike();
      }
    }
    // Vertical swipe
    else if (offset.y < -swipeThreshold) {
      // Swipe up
      handleSkip();
    }
  };

  const handleLike = async () => {
    setDirection(1);
    setShowReaction('like');
    setTimeout(() => setShowReaction(null), 1000);
    nextMeme();
  };

  const handleDislike = () => {
    setDirection(-1);
    setShowReaction('dislike');
    setTimeout(() => setShowReaction(null), 1000);
    nextMeme();
  };

  const handleSkip = () => {
    setDirection(2);
    nextMeme();
  };

  const nextMeme = () => {
    setCurrentIndex((prev) => (prev + 1) % memes.length);
  };

  const closeInstructions = () => {
    setShowInstructions(false);
    localStorage.setItem('hasSeenMemeInstructions', 'true');
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

  const getLikeOpacity = () => Math.min(Math.max(dragPosition.x / 100, 0), 1);
  const getDislikeOpacity = () => Math.min(Math.max(-dragPosition.x / 100, 0), 1);
  const getIgnoreOpacity = () => Math.min(Math.max(dragPosition.y / 100, 0), 1);

  return (
    <div className="bg-[hsl(220,10%,8%)] max-w-full min-h-screen flex items-center justify-center p-4">
      <div className="relative w-[400px] h-[60vh] overflow-hidden">
        {/* Instructions Overlay */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 rounded-xl flex flex-col items-center justify-center gap-6 p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">How to Rate Memes</h2>
              
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
              {showReaction === 'like' ? (
                <ThumbsUp className="w-16 h-16 text-green-500" />
              ) : (
                <ThumbsDown className="w-16 h-16 text-red-500" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swipe Hint Labels */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Right swipe - Funny */}
          <motion.div
            className="absolute left-4 inset-y-0 flex items-center"
            style={{ opacity: getLikeOpacity() }}
          >
            <div className="bg-green-500/80 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="font-medium">Funny!</span>
            </div>
          </motion.div>

          {/* Left swipe - Lame */}
          <motion.div
            className="absolute right-4 inset-y-0 flex items-center"
            style={{ opacity: getDislikeOpacity() }}
          >
            <div className="bg-red-500/80 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="font-medium">Lame</span>
            </div>
          </motion.div>

          {/* Down swipe - Ignore */}
          <motion.div
            className="absolute top-4 inset-x-0 flex justify-center"
            style={{ opacity: getIgnoreOpacity() }}
          >
            <div className="bg-gray-500/80 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <X className="w-6 h-6" />
              <span className="font-medium">Ignore</span>
            </div>
          </motion.div>
        </div>

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
              src={memes[currentIndex].imageUrl}
              alt={memes[currentIndex].title}
              className="w-full h-full object-contain rounded-xl"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemeView;