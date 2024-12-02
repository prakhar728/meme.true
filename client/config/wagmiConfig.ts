import { http, createConfig } from 'wagmi'
import { mainnet, moonbaseAlpha, sepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, sepolia, moonbaseAlpha],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [moonbaseAlpha.id]: http()
  },
})