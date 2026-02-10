import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitContestSolution, runContestCode, fetchMyAttempt, fetchLeaderboard } from '../contestsSlice';

export function useContestSubmit(contestAttemptId, contestId) {
  const dispatch = useDispatch();
  const submitResult = useSelector((state) => state.contests.submitResult);
  const runResult = useSelector((state) => state.contests.runResult);
  const loading = useSelector((state) => state.contests.loading);
  const error = useSelector((state) => state.contests.error);

  const submit = useCallback(
    async (problemId, code, language) => {
      if (!contestAttemptId || !problemId) return;
      const result = await dispatch(
        submitContestSolution({ contestAttemptId, problemId, code, language })
      ).unwrap();
      if (contestId) {
        dispatch(fetchMyAttempt(contestId));
        dispatch(fetchLeaderboard(contestId));
      }
      return result;
    },
    [contestAttemptId, contestId, dispatch]
  );

  const run = useCallback(
    async (problemId, code, language) => {
      if (!contestAttemptId || !problemId) return;
      return dispatch(runContestCode({ contestAttemptId, problemId, code, language })).unwrap();
    },
    [contestAttemptId, dispatch]
  );

  return { submit, run, submitResult, runResult, loading, error };
}
