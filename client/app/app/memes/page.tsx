"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { memeTemplates } from "@/lib/memes";

const MemeGallery = () => {
  const router = useRouter();

  const handleMemeClick = (id: string) => {
    router.push(`/app/memes/templates/${id}`);
  };

  return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Grid Layout */}
        <main className="max-w-7xl mx-auto px-2 py-4">
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {memeTemplates.map((meme) => (
              <motion.div
                key={meme.id}
                layoutId={`meme-${meme.id}`}
                onClick={() => handleMemeClick(meme.id)}
                className="relative group cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={meme.imageUrl}
                    alt={meme.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="truncate font-medium text-white">
                        {meme.title}
                      </p>
                      <p className="text-sm text-gray-300">
                        {meme.likes} likes
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        {/* Floating Create Button for Mobile */}
        <Link
          href="/app/create"
          className="fixed bottom-6 right-6 p-4 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-colors md:hidden"
        >
          <ImagePlus className="w-6 h-6" />
        </Link>
      </div>
  );
};

export default MemeGallery;
