import axios from "axios";

export const rideApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RIDER_API,
  withCredentials: true,
});
