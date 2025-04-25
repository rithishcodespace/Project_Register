import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

const Store = configureStore({
    reducer:{
      userSlice : userReducer,
    }
})

export default Store;