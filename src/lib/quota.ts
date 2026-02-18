import { redis } from "@/lib/redis";

const MAX_SESSIONS_PER_DAY = 3;

// Get YYYY-MM-DD in IST without extra libs 
function istDateKey(d = new Date()) {
  const istMs = d.getTime() + 330 * 60 * 1000; // UTC + 5:30 
  const ist = new Date(istMs);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Seconds until next IST midnight (so quota resets at IST 00:00)
function secondsUntilNextIstMidnight(d = new Date()) {
  const istMs = d.getTime() + 330 * 60 * 1000;
  const ist = new Date(istMs);

  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();
  const day = ist.getUTCDate();

  // next midnight in IST (still using UTC getters because we shifted time already)
  const nextMidnightIst = Date.UTC(y, m, day + 1, 0, 0, 0);
  const diffMs = nextMidnightIst - ist.getTime();

  const sec = Math.max(1, Math.floor(diffMs / 1000));
  return sec;
}

export async function consumeDailySessionQuota(userId: string) {
  const today = istDateKey();
  const key = `quota:sessions:${userId}:${today}`;

  //new key is generated per day per user
  // Increment usage count .incr is redis command to increment +1 to the key if already existed within a day. if incr incremented more than 3 then, user quota is used up.
  const count = await redis.incr(key);

  // Ensure Time to live- TTL exists (only set if missing)
  const ttl = await redis.ttl(key);
  if (ttl === -1) { //key exists but has no expiry, so set one now
    await redis.expire(key, secondsUntilNextIstMidnight()); //now key expiry is set to remaining diff between first and start of second midnight. and redis will automatically delete the key when expired
  }

  const remaining = Math.max(0, MAX_SESSIONS_PER_DAY - count);
  const allowed = count <= MAX_SESSIONS_PER_DAY;

  return { allowed, used: count, remaining, key };
}
