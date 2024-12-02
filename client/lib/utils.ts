import { clsx, type ClassValue } from "clsx";
import { PinataSDK } from "pinata";
import { twMerge } from "tailwind-merge";
import { templates } from "./memes";
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

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
