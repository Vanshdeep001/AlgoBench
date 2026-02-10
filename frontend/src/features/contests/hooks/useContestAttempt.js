import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startContestAttempt, fetchMyAttempt } from '../contestsSlice';

export function useContestAttempt(contestId) {
  const dispatch = useDispatch();
  const attempt = useSelector((state) => state.contests.attempt);
  const loading = useSelector((state) => state.contests.loading);
  const error = useSelector((state) => state.contests.error);

  const start = useCallback(() => {
    if (!contestId) return;
    return dispatch(startContestAttempt(contestId)).unwrap();
  }, [contestId, dispatch]);

  const resume = useCallback(() => {
    if (!contestId) return;
    return dispatch(fetchMyAttempt(contestId)).unwrap();
  }, [contestId, dispatch]);

  return { attempt, loading, error, start, resume };
}
