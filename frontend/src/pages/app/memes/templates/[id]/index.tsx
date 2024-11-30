import React, { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Layout from "@/components/Layout";
import { ThumbsUp, ThumbsDown, X } from "lucide-react"; // Import icons

const MemeView = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const memes = [
    { id: 1, imageUrl: "/images/meme-1.webp", title: "Meme 1" },
    { id: 2, imageUrl: "/images/meme-2.webp", title: "Meme 2" },
    { id: 3, imageUrl: "/images/meme-3.webp", title: "Meme 3" },
    { id: 4, imageUrl: "/images/meme-4.webp", title: "Meme 4" },
    { id: 5, imageUrl: "/images/meme-5.webp", title: "Meme 5" },
    { id: 6, imageUrl: "/images/meme-6.webp", title: "Meme 6" },
    { id: 7, imageUrl: "/images/meme-7.webp", title: "Meme 7" },
    { id: 8, imageUrl: "/images/meme-8.webp", title: "Meme 8" },
    { id: 9, imageUrl: "/images/meme-9.webp", title: "Meme 9" },
    { id: 10, imageUrl: "/images/meme-10.webp", title: "Meme 10" },
    { id: 11, imageUrl: "/images/meme-11.webp", title: "Meme 11" },
    { id: 12, imageUrl: "/images/meme-12.webp", title: "Meme 12" },
  ];

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

  const handleLike = () => {
    setDirection(1);
    nextMeme();
  };

  const handleDislike = () => {
    setDirection(-1);
    nextMeme();
  };

  const handleSkip = () => {
    setDirection(2);
    nextMeme();
  };

  const nextMeme = () => {
    setCurrentIndex((prev) => (prev + 1) % memes.length);
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
  const getDislikeOpacity = () =>
    Math.min(Math.max(-dragPosition.x / 100, 0), 1);
  const getIgnoreOpacity = () => Math.min(Math.max(dragPosition.y / 100, 0), 1);

  return (
    <Layout>
      <div className="bg-[hsl(220,10%,8%)] max-w-full min-h-screen flex items-center justify-center p-4">
        <div className="relative w-[400px] h-[60vh] overflow-hidden">
          {/* Swipe Hint Labels */}
          <div className="absolute inset-0 pointer-events-none ">
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

          {/* Initial Hint Overlay */}
          {/* <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="text-white/50 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <ThumbsUp className="w-6 h-6" />
              <span>Swipe right for Funny</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ThumbsDown className="w-6 h-6" />
              <span>Swipe left for Lame</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <X className="w-6 h-6" />
              <span>Swipe down to Ignore</span>
            </div>
          </div>
        </div> */}

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
    </Layout>
  );
};

export default MemeView;
