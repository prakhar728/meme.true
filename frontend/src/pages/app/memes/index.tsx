"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import Layout from "@/components/Layout";

interface MemeTemplate {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: string;
  likes: number;
  featured?: boolean;
  position?: "top-right" | "bottom-left";
}

const MemeGallery = () => {
  // Mock data with featured posts
  const memeTemplates: MemeTemplate[] = [
    {
      id: "1",
      imageUrl: "/images/sample-meme-1.jpg",
      title: "Featured Meme 1",
      createdAt: "2024-03-20",
      likes: 1234,
      featured: true,
      position: "top-right",
    },
    {
      id: "2",
      imageUrl: "/images/sample-meme-1.jpg",

      title: "Featured Meme 2",
      createdAt: "2024-03-20",
      likes: 5678,
      featured: true,
      position: "bottom-left",
    },
    // Regular memes...
    {
      id: "4",
      imageUrl: "/images/sample-meme-1.jpg",

      title: "Regular Meme",
      createdAt: "2024-03-20",
      likes: 100,
    },
    {
      id: "5",
      imageUrl: "/images/sample-meme-1.jpg",

      title: "Regular Meme",
      createdAt: "2024-03-20",
      likes: 100,
    },
    {
      id: "6",
      imageUrl: "/images/sample-meme-1.jpg",

      title: "Regular Meme",
      createdAt: "2024-03-20",
      likes: 100,
    },
    {
      id: "7",
      imageUrl: "/images/sample-meme-1.jpg",

      title: "Regular Meme",
      createdAt: "2024-03-20",
      likes: 100,
    },
    {
      id: "8",
      imageUrl: "/images/sample-meme-1.jpg",

      title: "Regular Meme",
      createdAt: "2024-03-20",
      likes: 100,
    },
    {
      id: "9",
      imageUrl: "/images/sample-meme-1.jpg",

      title: "Regular Meme",
      createdAt: "2024-03-20",
      likes: 100,
    },
    // Add more memes...
  ];

  const router = useRouter();

  const handleMemeClick = (id: string) => {
    router.push(`/app/memes/templates/${id}`);
  };

  return (
    <Layout>
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
    </Layout>
  );
};

export default MemeGallery;
