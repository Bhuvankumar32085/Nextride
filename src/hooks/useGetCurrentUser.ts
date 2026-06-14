"use client";
import { authApi } from "@/app/axios/authApi";
import { useAppDispatch } from "@/app/redux/hooks";
import { setLoggedUser } from "@/app/redux/selices/userSlices";
import axios from "axios";
import { useEffect } from "react";

export const useGetCurrentUser = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await authApi.get("/current-user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data.success) {
          dispatch(setLoggedUser(res.data.user));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        if (axios.isAxiosError(error)) {
          console.error(
            "Error fetching user:",
            error.response?.data || error.message,
          );
          localStorage.removeItem("token");
        } else {
          console.error("Unexpected error:", error);
          localStorage.removeItem("token");
        }
        dispatch(setLoggedUser(null));
      }
    };

    fetchUser();
  }, [dispatch]);
};
