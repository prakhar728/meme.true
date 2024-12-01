import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { PinataSDK } from "pinata";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY
});


export const DEPLOYED_CONTRACT = '0x46A90DF5737817D7f885027d3E7B72DBa9a3EbE4';