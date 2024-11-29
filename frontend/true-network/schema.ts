import { Char, Schema, U32, U64 } from "@truenetworkio/sdk"

export const MemeTemplateSchema = Schema.create({
  cid: U32,
  isTemplate: Char,
  marketId: U64,
  poolId: U64
})
