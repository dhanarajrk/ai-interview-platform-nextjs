
import { redis } from "@/lib/redis";

//build lock key with passed username name
export function lockKey(name: string) {
  return `lock:${name}`;
}

/**
 * Acquire a lock. Returns true if acquired, false if already locked.
 * { nx:true means redis will set only when ("lockey","value") pair was not existed
 *   ex: ttlSeconds} means the expiry of the ("lockey","value") until next same lockey can be set again for another submit button by same user
 *  eg user1 clicked Submit, creates key="lock:user1", redis set ("lock:user1", "1")  with expiry:10 secs
 *     user1 spam Submit again,creates key="lock:user1" redis checks if its already existed, if yes then the current user submit req will not proceed until ("lock:user1", "1") is expired and deleted by redis
 */
export async function acquireLock(name: string, ttlSeconds: number) {
  const key = lockKey(name); 
  const ok = await redis.set(key, "1", { nx: true, ex: ttlSeconds });
  return ok === "OK"; //ok = "OK" so to force return boolean we use ===
}


//release the req lock when done processing previous submit 
export async function releaseLock(name: string) {
  const key = lockKey(name);
  await redis.del(key);
}