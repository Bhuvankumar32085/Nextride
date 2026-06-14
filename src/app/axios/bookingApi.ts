import axios from "axios";

export const bookingApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BOOKING_API,
  withCredentials: true,
});
