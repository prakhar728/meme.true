import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCcw, Type, Plus, Trash2, Loader } from 'lucide-react';
import Webcam from 'react-webcam';

interface TextBox {
  id: number;
  text: string;
  position: {
    x: number;
    y: number;
  };
  isDragging: boolean;
}

const MemeCreator = () => {
  const [stage, setStage] = useState(1);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const webcamRef = useRef<Webcam>(null);

  // Mobile-optimized video constraints
  const videoConstraints = {
    width: 1920,
    height: 1920,  // Taller height for mobile
    facingMode: "environment",
    aspectRatio: 1
  };

  const webcamConfig = {
    audio: false,
    screenshotFormat: "image/png",  // PNG for better quality
    screenshotQuality: 1,           // Maximum quality (0-1)
    forceScreenshotSourceSize: true // Force full resolution capture
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot({
        width: 1920,
        height: 1920
      });
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const addTextBox = () => {
    setTextBoxes([...textBoxes, {
      id: Date.now(),
      text: 'Add text here',
      position: { x: 50, y: 50 },
      isDragging: false
    }]);
  };

  const removeTextBox = (id: number) => {
    setTextBoxes(textBoxes.filter(box => box.id !== id));
  };

  const updateTextBox = (id: number, newText: string) => {
    setTextBoxes(textBoxes.map(box => 
      box.id === id ? { ...box, text: newText } : box
    ));
  };

  const generateMeme = async () => {
    setIsLoading(true);
    setLoadingMessage('Generating your meme...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Generated Meme:', {
      baseImage: capturedImage,
      textOverlays: textBoxes
    });
    setIsLoading(false);
    setLoadingMessage('');
  };

  const Stage1 = () => (
    <div className="flex flex-col items-center w-full">
      {!capturedImage ? (
        <>
          <div className="relative w-full h-[70vh] bg-gray-900 rounded-lg overflow-hidden mb-4">
            <Webcam
              ref={webcamRef}
              {...webcamConfig}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
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
          <div
            key={box.id}
            className="absolute cursor-move p-3 bg-black/50 rounded-lg backdrop-blur-sm"
            style={{
              left: `${box.position.x}px`,
              top: `${box.position.y}px`,
            }}
          >
            <input
              type="text"
              value={box.text}
              onChange={(e) => updateTextBox(box.id, e.target.value)}
              className="bg-transparent border-none outline-none text-white text-lg w-full"
              placeholder="Enter text"
            />
            <button
              onClick={() => removeTextBox(box.id)}
              className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full 
                       hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
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
      <AnimatePresence>
        {isLoading && <LoadingOverlay />}
      </AnimatePresence>
      
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