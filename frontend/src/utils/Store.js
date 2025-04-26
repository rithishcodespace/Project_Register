import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import TeamReducer from "./teamSlice";

const Store = configureStore({
    reducer:{
      userSlice : userReducer,
      teamSlice : TeamReducer
    }
})

export default Store;