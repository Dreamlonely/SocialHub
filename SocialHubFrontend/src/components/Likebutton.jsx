import React, { useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext';

const LikeButton = ({ postId, initialLikes = 0, initiallyLiked = false }) => {
  const { keycloak } = useAuth();
  const { updatePost } = useFeed();

  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initiallyLiked);

  const handleLike = async () => {
    try {
      const keycloakId = keycloak?.tokenParsed?.sub;
      const response = await api.post(`/posts/${postId}/like`, null, {
        params: { keycloakId },
      });

      if (response.status === 200) {
        const updatedLikes = hasLiked ? likes - 1 : likes + 1;
        setLikes(updatedLikes);
        setHasLiked(!hasLiked);

        // Oppdater FeedContext hvis ønskelig
        updatePost({
          id: postId,
          likes: updatedLikes,
          liked: !hasLiked,
        });
      }
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
