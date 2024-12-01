import React, { useState, useRef, useCallback, useEffect } from "react";
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
import { getTrueNetworkInstance } from "../../../../../true-network/true.config";
import { TrueApi } from "@truenetworkio/sdk";
import {
  MemeSchema,
  MemeTemplateSchema,
} from "../../../../../true-network/schema";
import { useWalletStore } from "@/providers/walletStoreProvider";
import { pinata } from "@/lib/utils";
import { IPFS } from "@zeitgeistpm/web3.storage";
import {
  Sdk,
  create,
  createStorage,
  RpcContext,
  CreateMarketParams,
  ZTG,
  FullContext,
  swapFeeFromFloat,
} from "@zeitgeistpm/sdk";
import { Keyring } from "@polkadot/api";
import Decimal from "decimal.js";
import { templates } from "@/lib/meme";
import { Contract } from "ethers";
import { CONTRACT_ABI, DEPLOYED_CONTRACT } from "@/ethers";

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

const MemeCreator: React.FC = () => {
  const [stage, setStage] = useState(1);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const webcamRef = useRef<Webcam>(null);
  const [finalMeme, setFinalMeme] = useState<string | null>(null);
  const [trueApi, setTrueApi] = useState<TrueApi>();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [ZeitGiestSdk, setZeitGuestSdk] = useState<Sdk<RpcContext>>();

  const { connectedAccount } = useWalletStore((state) => state);

  const getSigner = () => {
    const keyring = new Keyring({ type: "sr25519" });
    return keyring.addFromUri(process.env.NEXT_PUBLIC_SEED_PHRASE || "Alice");
  };
  const signer = getSigner();


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

      if (!trueApi || !connectedAccount?.address || !capturedImage) {
        setIsLoading(false);
        setLoadingMessage("");
        return;
      }

      // const upload = await pinata.upload.base64(memeDataUrl);

      // await MemeSchema.attest(trueApi, connectedAccount?.address, {
      //   cid: upload.cid,
      //   isTemplate: false,
      //   memeTemplate: "1",
      //   marketId: 0,
      //   poolId: 0,
      // });

      setFinalMeme(memeDataUrl);
      setStage(3);
    } catch (error) {
      console.error("Error generating meme:", error);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const generateTemplate = async () => {
    setIsLoading(true);
    setLoadingMessage("Selecting your meme...");

    // if (!trueApi || !connectedAccount?.address || !capturedImage) {
    //   setIsLoading(false);
    //   setLoadingMessage("");
    //   return;
    // }

    // const upload = await pinata.upload.base64(
    //   capturedImage.replace(/^data:image\/png;base64,/, "")
    // );

    // const cid = upload.cid;

    // await MemeTemplateSchema.attest(trueApi, connectedAccount?.address, {
    //   cid: cid,
    //   isTemplate: false,
    //   marketId: 0,
    //   poolId: 0,
    // });

    // //Create a marketplace right here

    // // Make attestation of marketplace with zeitguest

    // await MemeTemplateSchema.attest(trueApi, connectedAccount?.address, {
    //   cid: cid,
    //   isTemplate: false,
    //   marketId: 1,
    //   poolId: 1,
    // });

    setStage(2);
    setIsLoading(false);
    setLoadingMessage("");
  };

  const Stage1 = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsLoading(true);
      setLoadingMessage("Uploading your photo...");

      try {
        // Convert the file to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;

          // Upload to IPFS via Pinata
          try {
            const upload = await pinata.upload.base64(
              base64String.replace(/^data:image\/\w+;base64,/, "")
            );

            // Set the captured image to the IPFS URL
            setCapturedImage(`https://gateway.pinata.cloud/ipfs/${upload.cid}`);

            const contract = new Contract(DEPLOYED_CONTRACT, CONTRACT_ABI, signer as any);

            console.log(await contract.voteCost());
            
            // Create market logic would go here
            // if (trueApi && connectedAccount?.address) {
            //   await MemeTemplateSchema.attest(trueApi, connectedAccount.address, {
            //     cid: upload.cid,
            //     isTemplate: false,
            //     marketId: 0,
            //     poolId: 0,
            //   });
            // }
          } catch (error) {
            console.error("Error uploading to IPFS:", error);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error processing file:", error);
      } finally {
        setIsLoading(false);
        setLoadingMessage("");
      }
    };

    return (
      <div className="flex flex-col items-center w-full">
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6">Choose a Template</h2>

          {/* Grid Container */}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Upload Photo Tile */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">Upload Photo</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-primary/90 px-4 py-2 rounded-full text-sm font-medium">
                  Upload Photo
                </div>
              </div>
            </motion.div>

            {/* Existing Templates */}
            {templates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => {
                  setCapturedImage(template.src);
                }}
              >
                <img
                  src={template.src}
                  alt={template.alt}
                  className="w-full h-full object-cover"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-primary/90 px-4 py-2 rounded-full text-sm font-medium">
                    Use Template
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {capturedImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl max-w-2xl w-full p-4">
              <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden mb-4">
                <img
                  src={capturedImage}
                  alt="Selected Template"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setCapturedImage(null)}
                  className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 
                           transition-colors flex items-center gap-2"
                >
                  Cancel
                </button>
                <button
                  onClick={generateTemplate}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg
                           transition-colors flex items-center gap-2 text-black"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
              className="w-full h-full object-contain"
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
        <div className="flex sm:flex-row w-full gap-4 px-4">
          <button
            onClick={addTextBox}
            className="w-3/12 sm:w-auto px-6 py-4 bg-gray-700 rounded-lg hover:bg-gray-600 
                     transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={generateMeme}
            className="w-9/12 sm:w-auto px-6 py-4 bg-blue-500 rounded-lg hover:bg-blue-600 
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
      <div className="flex flex-col w-full gap-4 px-4">
        <div className="flex sm:flex-row w-full gap-4">
          <button
            onClick={() => {
              setStage(2);
              setFinalMeme(null);
            }}
            className="w-3/12 sm:w-auto px-6 py-4 bg-gray-700 rounded-lg hover:bg-gray-600 
                     transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>

          <a
            href={finalMeme || "#"}
            download="meme.png"
            className="w-9/12 sm:w-auto px-6 py-4 bg-blue-500 rounded-lg hover:bg-blue-600 
                     transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            Download Meme
          </a>
        </div>

        <button
          onClick={() => {
            // Create the Twitter share URL with the meme
            const text = "Check out this meme I created!";
            const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              text
            )}`;
            window.open(shareUrl, "_blank");
          }}
          className="w-full sm:w-auto px-6 py-4 bg-black rounded-lg hover:bg-gray-900 
                   transition-colors flex items-center justify-center gap-2 shadow-lg mx-auto"
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

  useEffect(() => {
    const setupapi = async () => {
      const api = await getTrueNetworkInstance();

      setTrueApi(api);

      const sdk: Sdk<RpcContext> = await create({
        provider: "wss://bsr.zeitgeist.pm",
        storage: createStorage(
          IPFS.storage({
            node: { url: "http://localhost:5001" },
          })
        ),
      });

      // const market = (await sdk.model.markets.get(818)).unwrap();
      // console.log(market);

      setZeitGuestSdk(sdk);
    };

    setupapi();
  }, []);

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
