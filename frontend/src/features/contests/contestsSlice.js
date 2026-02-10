import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { contestsApi } from './contests.api';

export const fetchContests = createAsyncThunk(
  'contests/fetchContests',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await contestsApi.getContests();
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch contests');
    }
  }
);

export const fetchContestById = createAsyncThunk(
  'contests/fetchContestById',
  async (contestId, { rejectWithValue }) => {
    try {
      const { data } = await contestsApi.getContestById(contestId);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch contest');
    }
  }
);

export const startContestAttempt = createAsyncThunk(
  'contests/startAttempt',
  async (contestId, { rejectWithValue }) => {
    try {
      const { data } = await contestsApi.startAttempt(contestId);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to start contest');
    }
  }
);

export const fetchMyAttempt = createAsyncThunk(
  'contests/fetchMyAttempt',
  async (contestId, { rejectWithValue }) => {
    try {
      const { data } = await contestsApi.getMyAttempt(contestId);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'No attempt found');
    }
  }
);

export const submitContestSolution = createAsyncThunk(
  'contests/submitSolution',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await contestsApi.submitSolution(payload);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Submission failed');
    }
  }
);

export const runContestCode = createAsyncThunk(
  'contests/runCode',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await contestsApi.runCode(payload);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Run failed');
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'contests/fetchLeaderboard',
  async (contestId, { rejectWithValue }) => {
    try {
      const { data } = await contestsApi.getLeaderboard(contestId);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

const initialState = {
  list: [],
  current: null,
  attempt: null,
  leaderboard: [],
  submitResult: null,
  runResult: null,
  loading: false,
  error: null,
};

const contestsSlice = createSlice({
  name: 'contests',
  initialState,
  reducers: {
    clearCurrentContest: (state) => {
      state.current = null;
      state.attempt = null;
      state.leaderboard = [];
    },
    clearAttempt: (state) => {
      state.attempt = null;
    },
    setSubmitResult: (state, { payload }) => {
      state.submitResult = payload;
    },
    clearSubmitResult: (state) => {
      state.submitResult = null;
    },
    setRunResult: (state, { payload }) => {
      state.runResult = payload;
    },
    clearRunResult: (state) => {
      state.runResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContests.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchContests.fulfilled, (state, { payload }) => {
        state.list = payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(fetchContests.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchContestById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchContestById.fulfilled, (state, { payload }) => {
        state.current = payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(fetchContestById.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(startContestAttempt.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(startContestAttempt.fulfilled, (state, { payload }) => {
        state.attempt = payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(startContestAttempt.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchMyAttempt.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyAttempt.fulfilled, (state, { payload }) => {
        state.attempt = payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(fetchMyAttempt.rejected, (state, { payload }) => {
        state.attempt = null;
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchLeaderboard.pending, (state) => { state.error = null; })
      .addCase(fetchLeaderboard.fulfilled, (state, { payload }) => {
        state.leaderboard = payload;
        state.error = null;
      })
      .addCase(fetchLeaderboard.rejected, (state, { payload }) => { state.error = payload; })
      .addCase(submitContestSolution.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(submitContestSolution.fulfilled, (state, { payload }) => {
        state.submitResult = payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(submitContestSolution.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(runContestCode.fulfilled, (state, { payload }) => {
        state.runResult = payload;
        state.error = null;
      })
      .addCase(runContestCode.rejected, (state, { payload }) => { state.error = payload; });
  },
});

export const {
  clearCurrentContest,
  clearAttempt,
  setSubmitResult,
  clearSubmitResult,
  setRunResult,
  clearRunResult,
} = contestsSlice.actions;
export default contestsSlice.reducer;
