import { Bool, Schema, Text, U64 } from "@truenetworkio/sdk"

export const MemeTemplateSchema = Schema.create({
  cid: Text,
  isTemplate: Text,
  marketId: U64,
  poolId: U64
})
