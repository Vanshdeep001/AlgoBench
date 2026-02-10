import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../../utils/axiosClient';

export function useComments(postId) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchComments = useCallback(async () => {
        if (!postId) {
            setComments([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await axiosClient.get(`/community/comments/${postId}`);
            setComments(res.data.comments || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load comments');
            setComments([]);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const addComment = useCallback(async (content) => {
        const res = await axiosClient.post('/community/comments', { postId, content });
        setComments(prev => [...prev, res.data.comment]);
        return res.data.comment;
    }, [postId]);

    return { comments, loading, error, refetch: fetchComments, addComment };
}
