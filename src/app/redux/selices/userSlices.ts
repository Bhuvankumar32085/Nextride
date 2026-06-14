import { IUser } from "@/app/types";
import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  loggedUser: IUser | null;
  loading: boolean;
}

const initialState: UserState = {
  loggedUser: null,
  loading: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoggedUser(state, action) {
      state.loggedUser = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setLoggedUser, setLoading } = userSlice.actions;
export default userSlice.reducer;
