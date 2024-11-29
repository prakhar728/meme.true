import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  RefreshCcw,
  Type,
  Plus,
  Trash2,
  Loader,
  Minus,
} from "lucide-react";
import Webcam from "react-webcam";
import Layout from "@/components/Layout";

interface Position {
  x: number;
  y: number;
}

interface TextBox {
  id: string;
  text: string;
  position: Position;
  fontSize: number;
  color: string;
}

const TextControl = ({
  box,
  onTextChange,
  onRemove,
  onFontSizeChange,
  onColorChange,
}: {
  box: TextBox;
  onTextChange: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onFontSizeChange: (id: string, increase: boolean) => void;
  onColorChange: (id: string, color: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2 w-full bg-gray-800 p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          defaultValue={box.text} // Use defaultValue instead of value
          onBlur={(e) => onTextChange(box.id, e.target.value)} // Update state only on blur
          className="flex-1 bg-transparent border-none outline-none text-white text-lg"
          placeholder="Enter text"
        />
        <button
          onClick={() => onRemove(box.id)}
          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onFontSizeChange(box.id, false)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-300">
          Font Size: {box.fontSize}px
        </span>
        <button
          onClick={() => onFontSizeChange(box.id, true)}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <input
          type="color"
          value={box.color}
          onChange={(e) => onColorChange(box.id, e.target.value)}
          className="ml-auto w-8 h-8 rounded cursor-pointer"
        />
      </div>
    </div>
  );
};

const DraggableText = ({
  box,
  onMove,
}: {
  box: TextBox;
  onMove: (id: string, position: Position) => void;
}) => {
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default behavior to stop pull-to-refresh
    e.preventDefault();

    const isTouch = "touches" in e;
    const startX = isTouch
      ? e.touches[0].clientX
      : (e as React.MouseEvent).clientX;
    const startY = isTouch
      ? e.touches[0].clientY
      : (e as React.MouseEvent).clientY;

    const element = isTouch
      ? (e.target as HTMLElement).getBoundingClientRect()
      : (e.currentTarget as HTMLElement).getBoundingClientRect();

    const offsetX = startX - element.left;
    const offsetY = startY - element.top;

    const handleDragMove = (event: MouseEvent | TouchEvent) => {
      // Prevent default to stop unwanted behaviors
      event.preventDefault();

      const moveX =
        "touches" in event
          ? event.touches[0].clientX
          : (event as MouseEvent).clientX;
      const moveY =
        "touches" in event
          ? event.touches[0].clientY
          : (event as MouseEvent).clientY;

      // Get the container boundaries
      const container = document.querySelector(".image-container");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      // Calculate new position relative to container
      let newX = moveX - containerRect.left - offsetX;
      let newY = moveY - containerRect.top - offsetY;

      // Constrain movement within container bounds
      newX = Math.max(0, Math.min(newX, containerRect.width - element.width));
      newY = Math.max(0, Math.min(newY, containerRect.height - element.height));

      onMove(box.id, {
        x: newX,
        y: newY,
      });
    };

    const handleDragEnd = () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };

    window.addEventListener("mousemove", handleDragMove, { passive: false });
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove, { passive: false });
    window.addEventListener("touchend", handleDragEnd);
  };

  return (
    <div
      className="absolute touch-none cursor-move p-3 bg-black/50 rounded-lg backdrop-blur-sm"
      style={{
        left: `${box.position.x}px`,
        top: `${box.position.y}px`,
        fontSize: `${box.fontSize}px`,
        color: box.color,
        textShadow: "2px 2px 2px rgba(0,0,0,0.8)",
        WebkitUserSelect: "none",
        userSelect: "none",
        transform: "translate3d(0,0,0)", // Forces GPU acceleration
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <div className="text-white">{box.text}</div>
    </div>
  );
};

const generateMemeCanvas = async (
  imageUrl: string,
  textBoxes: TextBox[],
  width: number,
  height: number
): Promise<string> => {
  // Create canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not supported");

  // Set canvas size
  canvas.width = width;
  canvas.height = height;

  // Load and draw image
  const image = new Image();
  image.crossOrigin = "anonymous";

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = imageUrl;
  });

  ctx.drawImage(image, 0, 0, width, height);

  // Draw text boxes
  textBoxes.forEach((box) => {
    ctx.font = `${box.fontSize}px Arial`;
    ctx.fillStyle = box.color;
    ctx.textBaseline = "top";

    // Add text shadow
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillText(box.text, box.position.x, box.position.y);
  });

  return canvas.toDataURL("image/png");
};

const MemeCreator = () => {
  const [stage, setStage] = useState(1);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const webcamRef = useRef<Webcam>(null);
  const [finalMeme, setFinalMeme] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const videoConstraints = {
    width: 1920,
    height: 1920,
    facingMode: "environment",
    aspectRatio: 1,
  };

  const webcamConfig = {
    audio: false,
    screenshotFormat: 'image/png' as 'image/png' | 'image/webp' | 'image/jpeg',
    screenshotQuality: 1,
    forceScreenshotSourceSize: true,
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot({
        width: 1920,
        height: 1920,
      });
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const addTextBox = () => {
    const newBox: TextBox = {
      id: `text-${Date.now()}`,
      text: "Add text here",
      position: { x: 50, y: 50 },
      fontSize: 24,
      color: "#FFFFFF",
    };
    setTextBoxes([...textBoxes, newBox]);
  };

  const generateMeme = async () => {
    if (!imageContainerRef.current || !capturedImage) return;

    setIsLoading(true);
    setLoadingMessage("Generating your meme...");

    try {
      const container = imageContainerRef.current;
      const { width, height } = container.getBoundingClientRect();

      const memeDataUrl = await generateMemeCanvas(
        capturedImage,
        textBoxes,
        width,
        height
      );

      setFinalMeme(memeDataUrl);
      setStage(3);
    } catch (error) {
      console.error("Error generating meme:", error);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const Stage1 = () => (
    <div className="flex flex-col items-center w-full">
      {!capturedImage ? (
        <>
          <div className="relative w-full h-[70vh] bg-gray-900 rounded-lg overflow-hidden mb-4">
            <Webcam
              ref={webcamRef}
              {...webcamConfig}
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
              mirrored={false}
            />
          </div>
          <button
            onClick={capturePhoto}
            className="p-6 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
            aria-label="Capture photo"
          >
            <Camera className="w-8 h-8" />
          </button>
        </>
      ) : (
        <>
          <div className="relative w-full h-[70vh] bg-gray-900 rounded-lg overflow-hidden mb-4">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col sm:flex-row w-full gap-4 px-4">
            <button
              onClick={retakePhoto}
              className="w-full sm:w-auto px-6 py-4 bg-gray-700 rounded-lg hover:bg-gray-600 
                       transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCcw className="w-5 h-5" />
              <span>Retake</span>
            </button>
            <button
              onClick={() => setStage(2)}
              className="w-full sm:w-auto px-6 py-4 bg-blue-500 rounded-lg hover:bg-blue-600 
                       transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Type className="w-5 h-5" />
              <span>Use Template</span>
            </button>
          </div>
        </>
      )}
    </div>
  );

  const Stage2 = () => (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full h-[70vh] bg-gray-900 rounded-lg overflow-hidden mb-4">
        {capturedImage && (
          <div
            ref={imageContainerRef}
            className="relative w-full h-[70vh] bg-gray-900 rounded-lg overflow-hidden mb-4 image-container"
            onTouchMove={(e) => e.preventDefault()} // Prevent pull-to-refresh
          >
            <img
              src={capturedImage}
              alt="Template"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {textBoxes.map((box) => (
          <DraggableText
            key={box.id}
            box={box}
            onMove={(id, newPosition) => {
              setTextBoxes((prev) =>
                prev.map((b) =>
                  b.id === id ? { ...b, position: newPosition } : b
                )
              );
            }}
          />
        ))}
      </div>
      <div className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row w-full gap-4 px-4">
          <button
            onClick={addTextBox}
            className="w-full sm:w-auto px-6 py-4 bg-gray-700 rounded-lg hover:bg-gray-600 
                     transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Text</span>
          </button>
          <button
            onClick={generateMeme}
            className="w-full sm:w-auto px-6 py-4 bg-blue-500 rounded-lg hover:bg-blue-600 
                     transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            Generate Meme
          </button>
        </div>

        {textBoxes.length > 0 && (
          <div className="px-4 space-y-3">
            {textBoxes.map((box) => (
              <TextControl
                key={box.id}
                box={box}
                onTextChange={(id, newText) => {
                  setTextBoxes((prev) =>
                    prev.map((b) => (b.id === id ? { ...b, text: newText } : b))
                  );
                }}
                onRemove={(id) => {
                  setTextBoxes((prev) => prev.filter((b) => b.id !== id));
                }}
                onFontSizeChange={(id, increase) => {
                  setTextBoxes((prev) =>
                    prev.map((b) =>
                      b.id === id
                        ? {
                            ...b,
                            fontSize: Math.max(
                              12,
                              b.fontSize + (increase ? 2 : -2)
                            ),
                          }
                        : b
                    )
                  );
                }}
                onColorChange={(id, color) => {
                  setTextBoxes((prev) =>
                    prev.map((b) => (b.id === id ? { ...b, color } : b))
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const Stage3 = () => (
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
      <div className="flex flex-col sm:flex-row w-full gap-4 px-4">
        <button
          onClick={() => {
            setStage(2);
            setFinalMeme(null);
          }}
          className="w-full sm:w-auto px-6 py-4 bg-gray-700 rounded-lg hover:bg-gray-600 
                   transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <RefreshCcw className="w-5 h-5" />
          <span>Edit Again</span>
        </button>
        <a
          href={finalMeme || "#"}
          download="meme.png"
          className="w-full sm:w-auto px-6 py-4 bg-blue-500 rounded-lg hover:bg-blue-600 
                   transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          Download Meme
        </a>
      </div>
    </div>
  );

  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-4 w-full max-w-sm">
        <Loader className="w-8 h-8 animate-spin" />
        <p className="text-white text-center">{loadingMessage}</p>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <AnimatePresence>{isLoading && <LoadingOverlay />}</AnimatePresence>

        <div className="w-full max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {stage === 1 ? <Stage1 /> : stage === 2 ? <Stage2 /> : <Stage3 />}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default MemeCreator;
