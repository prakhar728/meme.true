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
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const offsetX = e.clientX - box.position.x;
    const offsetY = e.clientY - box.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      onMove(box.id, {
        x: e.clientX - offsetX,
        y: e.clientY - offsetY,
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="absolute cursor-move p-3 bg-black/50 rounded-lg backdrop-blur-sm"
      style={{
        left: `${box.position.x}px`,
        top: `${box.position.y}px`,
        fontSize: `${box.fontSize}px`,
        color: box.color,
        textShadow: "2px 2px 2px rgba(0,0,0,0.8)",
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="text-white">{box.text}</div>
    </div>
  );
};

const MemeCreator = () => {
  const [stage, setStage] = useState(1);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const webcamRef = useRef<Webcam>(null);

  const videoConstraints = {
    width: 1920,
    height: 1920,
    facingMode: "environment",
    aspectRatio: 1,
  };

  const webcamConfig = {
    audio: false,
    screenshotFormat: "image/png",
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
    setIsLoading(true);
    setLoadingMessage("Generating your meme...");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Generated Meme:", {
      baseImage: capturedImage,
      textOverlays: textBoxes,
    });

    setIsLoading(false);
    setLoadingMessage("");
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
          <img
            src={capturedImage}
            alt="Template"
            className="w-full h-full object-cover"
          />
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

  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-4 w-full max-w-sm">
        <Loader className="w-8 h-8 animate-spin" />
        <p className="text-white text-center">{loadingMessage}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <AnimatePresence>{isLoading && <LoadingOverlay />}</AnimatePresence>

      <div className="w-full max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {stage === 1 ? <Stage1 /> : <Stage2 />}
        </motion.div>
      </div>
    </div>
  );
};

export default MemeCreator;
