//resuable setTimeout to prevent spamming submit

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  