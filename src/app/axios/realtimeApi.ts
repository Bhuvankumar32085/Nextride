

import axios from "axios";

export const realtimeApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REALTIME_URL,
  withCredentials: true,
});
