const KEY = "cardback_tokens";

export function getTokens() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { accessToken: null, refreshToken: null };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

export function setTokens(tokens) {
  localStorage.setItem(KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem(KEY);
}
