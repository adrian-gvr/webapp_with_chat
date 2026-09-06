import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL;
const productionApiUrl = import.meta.env.PROD
  ? "https://webapp-with-chat.onrender.com"
  : "";

export const apiUrl = (configuredApiUrl || productionApiUrl).replace(/\/$/, "");

axios.defaults.baseURL = apiUrl;

export function mediaUrl(url) {
  if (!url || /^https?:\/\//i.test(url)) return url;
  return `${apiUrl}${url}`;
}
