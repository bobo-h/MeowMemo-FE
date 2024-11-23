import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toastMessage: { message: "", status: "" },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showToastMessage(state, action) {
      state.toastMessage = {
        message: action.payload.message,
        status: action.payload.status,
      };
    },
    hideToastMessage(state) {
      state.toastMessage = { message: "", status: "" }; 
    },
  },
});

export const { showToastMessage, hideToastMessage } = uiSlice.actions;
export default uiSlice.reducer;
