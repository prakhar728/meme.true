import { clsx, type ClassValue } from "clsx"
import { PinataSDK } from "pinata";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY
});
