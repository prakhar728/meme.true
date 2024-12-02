// components/meme-creator/Stage3.tsx
import { RefreshCcw } from 'lucide-react';

interface Stage3Props {
 finalMeme: string | null;
 setStage: (stage: number) => void;
 setFinalMeme: (meme: string | null) => void;
 shareText?: string;
 downloadFileName?: string;
}

const Stage3: React.FC<Stage3Props> = ({
 finalMeme,
 setStage,
 setFinalMeme,
 shareText = "Check out this meme I created!",
 downloadFileName = "meme.png"
}) => {
 const handleShare = () => {
   const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
   window.open(shareUrl, "_blank", "noopener,noreferrer");
 };

 const handleReset = () => {
   setStage(2);
   setFinalMeme(null);
 };

 return (
   <div className="flex flex-col items-center w-full">
     <div className="relative w-full h-[70vh] bg-gray-900 rounded-lg overflow-hidden mb-4">
       {finalMeme && (
         <img
           src={finalMeme}
           alt="Generated Meme"
           className="w-full h-full object-cover"
         />
       )}
     </div>
     <div className="flex flex-col w-full gap-4 px-4">
       <div className="flex sm:flex-row w-full gap-4">
         <button
           onClick={handleReset}
           className="w-3/12 sm:w-auto px-6 py-4 bg-gray-700 rounded-lg hover:bg-gray-600 
                    transition-colors flex items-center justify-center gap-2 shadow-lg"
           aria-label="Start Over"
         >
           <RefreshCcw className="w-5 h-5" />
         </button>

         <a
           href={finalMeme || "#"}
           download={downloadFileName}
           className="w-9/12 sm:w-auto px-6 py-4 bg-blue-500 rounded-lg hover:bg-blue-600 
                    transition-colors flex items-center justify-center gap-2 shadow-lg"
           onClick={(e) => {
             if (!finalMeme) {
               e.preventDefault();
             }
           }}
         >
           Download Meme
         </a>
       </div>

       <button
         onClick={handleShare}
         className="w-full sm:w-auto px-6 py-4 bg-black rounded-lg hover:bg-gray-900 
                  transition-colors flex items-center justify-center gap-2 shadow-lg mx-auto"
         aria-label="Share on X (Twitter)"
       >
         <svg
           viewBox="0 0 24 24"
           className="w-5 h-5 fill-current"
           aria-hidden="true"
         >
           <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
         </svg>
         <span>Share on X</span>
       </button>

       {/* Optional: Add copy link button */}
       {finalMeme && navigator.clipboard && (
         <button
           onClick={() => {
             navigator.clipboard.writeText(finalMeme);
             // You might want to add a toast notification here
           }}
           className="w-full sm:w-auto px-6 py-4 bg-gray-800 rounded-lg hover:bg-gray-700 
                    transition-colors flex items-center justify-center gap-2 shadow-lg mx-auto"
         >
           Copy Link
         </button>
       )}
     </div>
   </div>
 );
};

export default Stage3;