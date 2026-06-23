import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './config/firebase';

/* ================= REGISTER ================= */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Registration failed',
        status: error.response?.status || 400,
      });
    }
  }
);

/* ================= LOGIN ================= */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      return response.data.user;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Login failed',
        status: error.response?.status || 401,
      });
    }
  }
);

/* ================= GOOGLE LOGIN ================= */
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { rejectWithValue }) => {
    try {
      // Step 1: Open Google Sign-In popup via Firebase
      const result = await signInWithPopup(auth, googleProvider);

      // Step 2: Get the Firebase ID token (JWT signed by Google)
      const idToken = await result.user.getIdToken();

      // Step 3: Send the ID token to YOUR backend for verification
      const response = await axiosClient.post('/user/google-login', { idToken });

      // Step 4: Return the user data from your backend (MongoDB user)
      return response.data.user;
    } catch (error) {
      // Handle specific Firebase errors
      const errorCode = error?.code;
      let message = 'Google Sign-In failed';

      if (errorCode === 'auth/popup-closed-by-user') {
        message = 'Sign-in cancelled';
      } else if (errorCode === 'auth/popup-blocked') {
        message = 'Pop-up blocked by browser. Please allow pop-ups.';
      } else if (errorCode === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      return rejectWithValue({
        message,
        status: error.response?.status || 400,
      });
    }
  }
);

/* ================= CHECK AUTH ================= */
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check');
      return data.user;
    } catch (error) {
      return rejectWithValue({
        message: 'Not authenticated',
        status: 401,
      });
    }
  }
);

/* ================= LOGOUT ================= */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Sign out from Firebase first (clears Firebase session)
      await signOut(auth);

      // Then sign out from your backend (clears JWT cookie)
      await axiosClient.post('/user/logout');
      return null;
    } catch (error) {
      // If we get a 401, it means the token is already invalid/expired
      // In this case, we should still log out on the client side
      if (error.response?.status === 401) {
        return null; // Treat as successful logout
      }
      return rejectWithValue({
        message: 'Logout failed',
      });
    }
  }
);

/* ================= UPDATE USER ================= */
export const updateUser = createAsyncThunk(
  'auth/update',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch('/user/me', userData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Update failed',
        status: error.response?.status || 400,
      });
    }
  }
);

/* ================= SLICE ================= */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* REGISTER */
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload.message;
      })

      /* LOGIN */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload.message;
      })

      /* GOOGLE LOGIN */
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message || 'Google Sign-In failed';
      })

      /* CHECK AUTH */
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      /* LOGOUT */
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      /* UPDATE USER */
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload.message;
      });
  },
});

export default authSlice.reducer;
