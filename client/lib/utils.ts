import { clsx, type ClassValue } from "clsx"
import { PinataSDK } from "pinata";
import { twMerge } from "tailwind-merge"
import { templates } from "./memes";
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY
});


const API_ROUTE = process.env.NEXT_PUBLIC_PROD == "True" ? "http://localhost:5000" : "PROD";


const getMemesByTemplate = async(tempalteId: number) => {
  const res = await axios.get(`${API_ROUTE}/api/memes/${tempalteId}`)
  console.log(res);
}