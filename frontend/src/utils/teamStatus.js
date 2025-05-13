import { createSlice } from "@reduxjs/toolkit";

const teamStatus = createSlice({
  name: "teamStatusSlice",
  initialState: null,
  reducers: {
    addTeamStatus: (state, action) => {
      return action.payload;
    }
  }
});

// Exporting the action and reducer
export const { addTeamStatus } = teamStatus.actions;
export default teamStatus.reducer;
