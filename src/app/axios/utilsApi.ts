import axios from "axios";

export const cloudinaryApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_UTILS_API,
  withCredentials: true,
});
