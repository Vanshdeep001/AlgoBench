import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../../utils/axiosClient';

export function usePosts(problemId = null, sort = 'newest') {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (problemId) params.set('problemId', problemId);
            if (sort) params.set('sort', sort);
            const res = await axiosClient.get(`/community/posts?${params.toString()}`);
            setPosts(res.data.posts || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load posts');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [problemId, sort]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return { posts, loading, error, refetch: fetchPosts };
}

export function usePost(postId) {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!postId) {
            setPost(null);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        axiosClient.get(`/community/posts/${postId}`)
            .then(res => { if (!cancelled) setPost(res.data.post); })
            .catch(err => { if (!cancelled) setError(err.response?.data?.message || err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [postId]);

    return { post, loading, error };
}
