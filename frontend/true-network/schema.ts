import { Bool, Schema, Text, U64 } from "@truenetworkio/sdk"

export const MemeTemplateSchema = Schema.create({
  cid: Text,
  isTemplate: Bool,
  marketId: U64,
  poolId: U64
})


export const MemeSchema = Schema.create({
  cid: Text,
  templateId: Text,
  isTemplate: Bool,
  marketId: U64,
  poolId: U64
})
