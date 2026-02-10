import axiosClient from '../../utils/axiosClient';

export const contestsApi = {
  getContests: () => axiosClient.get('/contest'),
  getContestById: (contestId) => axiosClient.get(`/contest/${contestId}`),
  startAttempt: (contestId) => axiosClient.post(`/contest/${contestId}/start`),
  getMyAttempt: (contestId) => axiosClient.get(`/contest/${contestId}/attempt`),
  submitSolution: (payload) => axiosClient.post('/contest/submit', payload),
  runCode: (payload) => axiosClient.post('/contest/run', payload),
  getLeaderboard: (contestId) => axiosClient.get(`/contest/${contestId}/leaderboard`),
};

export const adminContestsApi = {
  getContests: () => axiosClient.get('/admin/contests'),
  create: (data) => axiosClient.post('/admin/contests', data),
  update: (contestId, data) => axiosClient.put(`/admin/contests/${contestId}`, data),
  delete: (contestId) => axiosClient.delete(`/admin/contests/${contestId}`),
  publish: (contestId, publish) => axiosClient.patch(`/admin/contests/${contestId}/publish`, { publish }),
  getAttempts: (contestId) => axiosClient.get(`/admin/contests/${contestId}/attempts`),
};
