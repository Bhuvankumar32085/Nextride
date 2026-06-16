"use client";

import { cloudinaryApi } from "@/app/axios/utilsApi";
import { useGetCurrentUser } from "@/hooks/useGetCurrentUser";
import axios from "axios";
import { useEffect } from "react";

export default function HoockProvider() {
  useEffect(() => {
    const wakeUpService = async () => {
      try {
        const { data } = await cloudinaryApi.get("/health");

        console.log("SERVICE AWAKE", data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(error.code);
          console.log(error.message);
          console.log(error.response);
        }

        console.log(error);
      }
    };

    wakeUpService();
  }, []);
  
  useGetCurrentUser();
  return null;
}
