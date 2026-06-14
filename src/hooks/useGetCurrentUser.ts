"use client";
import { authApi } from "@/app/axios/authApi";
import { useAppDispatch } from "@/app/redux/hooks";
import { setLoading, setLoggedUser } from "@/app/redux/selices/userSlices";
import axios from "axios";
import { useEffect } from "react";

export const useGetCurrentUser = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      dispatch(setLoading(true));
      try {
        const token = localStorage.getItem("token");
        console.log("token", token);
        if (!token) {
          dispatch(setLoggedUser(null));
          dispatch(setLoading(false));
          return;
        }

        const res = await authApi.get("/current-user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data.success) {
          console.log("USER FROM API", res.data.user);
          dispatch(setLoggedUser(res.data.user));
          dispatch(setLoading(false));
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
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUser();
  }, [dispatch]);
};
