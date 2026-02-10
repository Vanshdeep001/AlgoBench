import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../../utils/axiosClient';

export function useVote(postId, initialVotes = 0) {
    const [votes, setVotes] = useState(initialVotes);
    const [userVote, setUserVote] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setVotes(initialVotes);
    }, [initialVotes]);

    useEffect(() => {
        if (!postId) {
            setUserVote(0);
            return;
        }
        axiosClient.get(`/community/vote/${postId}`)
            .then(res => setUserVote(res.data.userVote || 0))
            .catch(() => setUserVote(0));
    }, [postId]);

    const vote = useCallback(async (value) => {
        if (!postId || (value !== 1 && value !== -1)) return;
        setLoading(true);
        try {
            const res = await axiosClient.post('/community/vote', { postId, value });
            setVotes(res.data.votes ?? votes);
            setUserVote(res.data.userVote ?? value);
        } catch (err) {
            console.error('Vote failed:', err);
        } finally {
            setLoading(false);
        }
    }, [postId, votes]);

    return { votes, userVote, vote, loading };
}
