import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PostSwitchUser } from "api/authApi";
import { PostLogin } from "api/authApi";
import { GetUserInfo } from "api/userApi";
import { clearSession, saveSession, getSession } from "services/service";
import { get } from "lodash";
// import { GetMeInfo } from "api/authApi";

const token = localStorage.getItem("Authorization");

const initialState = {
  userDetails: {},
  loading: false,
  token: token ? token : "",
  // meInfo: [],
};

export const postLogin = createAsyncThunk("auth/postLogin", async (data) => {
  try {
    const response = await PostLogin(data);
    console.log("response post login >>>> ", response);
    return response.data;
  } catch (err) {
    console.log("postLogin error ======>", err);
  }
});

export const switchUser = createAsyncThunk("auth/switchUser", async (data) => {
  try {
    const response = await PostSwitchUser(data);
    console.log("response post login >>>> ", response);
    return response.data;
  } catch (err) {
    console.log("postLogin error ======>", err);
  }
});

export const getUserInfo = createAsyncThunk(
  "auth/getUserInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await GetUserInfo();
      clearSession()
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    clearSession();
    return {};
  } catch (err) {
    console.log("logout error ======>", err);
  }
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      clearSession();
      state = {};
    },
    getSession: () => {
      getSession();
    },
    setUserData: (state, action) => {
      state.userDetails = action.payload;
    },
    setAuthToken: (state, { payload }) => {
      state.token = payload;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(postLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(postLogin.fulfilled, (state, { payload }) => {
        saveSession(payload);
        state.token = payload.token;
        state.userDetails = get(payload, "data", {});
        state.loading = false;
      })
      .addCase(postLogin.rejected, (state) => {
        state.loading = false;
      })
     
});

// export const { logout } = authSlice.actions;

export const { setUserData, setAuthToken } = authSlice.actions;
export default authSlice.reducer;
