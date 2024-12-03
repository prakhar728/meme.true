"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { getAllMemes } from "@/lib/utils";
import { MemeTemplate } from "@/lib/memes";

const MemeGallery = () => {
  const [memes, setmemes] = useState<MemeTemplate[]>([]);
  const router = useRouter();

  const handleMemeClick = (id: string) => {
    router.push(`/app/memes/templates/${id}`);
  };

  useEffect(() => {
    const populateMemes = async () => {
      const memes = await getAllMemes();

      if (memes.data)
        for (const m of memes.data) {
          const data = await fetch(
            `https://gateway.lighthouse.storage/ipfs/${m.cid}`
          );
          const img = await data.text();

          m.image = `data:image/png;base64,${img}`;
        }
      setmemes(memes.data || []);
    };
    populateMemes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Grid Layout */}
      <main className="max-w-7xl mx-auto px-2 py-4">
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {memes.map((meme, index) => (
            <motion.div
              key={index}
              layoutId={`meme-${index}`}
              onClick={() => handleMemeClick(index.toString())}
              className="relative group cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={meme.image}
                  alt={`meme`}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Floating Create Button for Mobile */}
      <Link
        href="/app/memes/create"
        className="fixed bottom-6 right-6 p-4 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-colors md:hidden"
      >
        <ImagePlus className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default MemeGallery;
