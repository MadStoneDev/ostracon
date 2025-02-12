import { Redis } from "@upstash/redis";
import { Receiver, Client } from "@upstash/qstash";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export const qstashReceiver = new Receiver({
  currentSigningKey: process.env.UPSTASH_QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.UPSTASH_QSTASH_NEXT_SIGNING_KEY,
});
