import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

const MemeView = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Sample meme data
  const memes = [
    { id: 1, imageUrl: "/images/sample-meme-1.png", title: "Meme 1" },
    { id: 2, imageUrl: "/images/sample-meme-1.png", title: "Meme 2" },
    { id: 3, imageUrl: "/images/sample-meme-1.png", title: "Meme 3" }
  ];

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
      opacity: 0
    }),
    center: {
      x: 0,
      y: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction === 1 ? -1000 : direction === -1 ? 1000 : 0,
      y: direction === 2 ? -1000 : 0,
      opacity: 0
    })
  };

  return (
    <div className="bg-[hsl(220,10%,8%)] min-h-screen flex items-center justify-center">
      <div className="relative w-[400px] h-[600px] overflow-hidden">
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
              opacity: { duration: 0.2 }
            }}
            drag={true}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute w-full h-full bg-[hsl(220,10%,12%)] rounded-xl shadow-lg"
          >
            <img
              src={memes[currentIndex].imageUrl}
              alt={memes[currentIndex].title}
              className="w-full h-full object-cover rounded-xl"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemeView;