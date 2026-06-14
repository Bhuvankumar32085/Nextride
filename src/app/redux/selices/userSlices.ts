import { IUser } from "@/app/types";
import { createSlice } from "@reduxjs/toolkit";

interface UserState {
    loggedUser: IUser | null;
}

const initialState: UserState = {
  loggedUser: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoggedUser(state, action) {
      state.loggedUser = action.payload;
    },
  },
});

export const { setLoggedUser } = userSlice.actions;
export default userSlice.reducer;
