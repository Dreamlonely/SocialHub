import React, { useState } from 'react';
import api from '../api/api';
import { useFeed } from '../context/FeedContext';
import { useAuth } from '../context/AuthContext';

const LikeButton = ({ postId, initialLikes = 0, initiallyLiked = false }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initiallyLiked);
  const { toggleLikeLocally } = useFeed();
  const { keycloak } = useAuth();

  const handleLike = async () => {
    try {
      await api.post(`/posts/${postId}/like`, null, {
        params: { keycloakId: keycloak.tokenParsed.sub }
      });

      // Optimistisk oppdatering
      toggleLikeLocally(postId);
      setHasLiked(!hasLiked);
      setLikes((prev) => hasLiked ? prev - 1 : prev + 1);

    } catch (error) {
      console.error("Feil ved liking:", error);
    }
  };

  return (
      <button className="like-button" onClick={handleLike}>
        {hasLiked ? '❤️' : '🤍'} ({likes})
      </button>
  );
};

export default LikeButton;
