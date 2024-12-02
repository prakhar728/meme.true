import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MemeTemplate } from "./memes";
import lighthouse from '@lighthouse-web3/sdk' 

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_ROUTE =
  process.env.NEXT_PUBLIC_PROD == "False" ? "http://localhost:5000" :"PROD";

// lib/api.ts
interface MemeData {
  cid: String;
  isTemplate: Boolean;
  memeTemplate: String;
  // Add any other fields your Meme model requires
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const createMeme = async (memeData: MemeData): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_ROUTE}/api/memes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memeData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create meme");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error creating meme:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};


export const getAllMemes = async ()  => {
  try {
    const response = await fetch(`${API_ROUTE}/api/memes`);

    const data: MemeTemplate[] = await response.json();
    console.log(data);
    
    if (!response.ok) {
      throw new Error("Failed to create meme");
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error creating meme:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}


export const uploadImage = async (base64: string) => {
  const API_KEY = process.env.NEXT_PUBLIC_LIGHTHOPUSE_GATEWAY;
  const response = await lighthouse.uploadText(base64, API_KEY || "");

  return response.data.Hash;
}
