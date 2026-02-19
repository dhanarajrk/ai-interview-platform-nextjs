//Functions to Create Evaluation Cache Key, 
//To Check If it was already Existed(Cache hit if same question+answer hash combination is passed), 
//And to set Cache key (when Cache miss )
//by "Evaluation" I mean the evaluated answer by Gemini 

import { redis } from "@/lib/redis";
import type { Evaluation } from "@/lib/gemini";

const EVAL_CACHE_TTL_SECONDS = 60 * 60 * 24 * 14; // TIME TO LIVE duration for Cache (I set 14 days for now)

//Construct Evaluation Cache key to be unique eg. cache:eval:123456 (will be diff for diff question+answer evaluation)
export function evalCacheKey(hash: string) {
  return `cache:eval:${hash}`;
}

//To Check if Cache key passed as prop is Hit or Missed
export async function getCachedEval(hash: string): Promise<Evaluation | null> {
  const key = evalCacheKey(hash);
  const data = await redis.get<Evaluation>(key); 
  return data ?? null;  //return cached evaluation data 
}

//To Set Evaluation Cache key when Missed
export async function setCachedEval(hash: string, value: Evaluation) {
  const key = evalCacheKey(hash);
  await redis.set(key, value, { ex: EVAL_CACHE_TTL_SECONDS });
}
