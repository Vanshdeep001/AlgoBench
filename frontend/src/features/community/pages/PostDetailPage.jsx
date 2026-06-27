import CommunityHome from './CommunityHome';

export default function PostDetailPage({ user, isAuthenticated, currentUserId }) {
    return (
        <CommunityHome
            user={user}
            isAuthenticated={isAuthenticated}
            currentUserId={currentUserId}
        />
    );
}
