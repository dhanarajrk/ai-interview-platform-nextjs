//This is a safe wrapper around parsing JSON from a fetch response. The standard res.json() throws if the body isn't valid JSON, which can make error handling messy.

export async function safeJson(res: Response) {
    const text = await res.text();
    try {
      return { ok: res.ok, status: res.status, data: JSON.parse(text), text };
    } catch {
      return { ok: res.ok, status: res.status, data: null, text };
    }
  }