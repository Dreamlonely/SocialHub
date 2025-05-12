import React, { useState } from 'react';

const LikeButton = ({ initialLikes }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    setLikes(hasLiked ? likes - 1 : likes + 1);
    setHasLiked(!hasLiked);
  };

  return (
    <button className="like-button" onClick={handleLike}>
      {hasLiked ? '❤️' : '❤'} ({likes})
    </button>
  );
};

export default LikeButton;