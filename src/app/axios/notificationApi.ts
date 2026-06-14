import axios from "axios";

export const notificationApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NOTIFICATION_API,
  withCredentials: true,
});
