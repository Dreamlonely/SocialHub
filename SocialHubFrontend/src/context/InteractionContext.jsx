import React, { createContext, useState, useContext } from 'react';

const InteractionContext = createContext();

export const InteractionProvider = ({ children }) => {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [sharedUrl, setSharedUrl] = useState('');

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  const addComment = (newComment) => {
    setComments([...comments, newComment]);
  };

  const sharePost = (postUrl) => {
    navigator.clipboard.writeText(postUrl);
    setSharedUrl(postUrl);
    alert('URL is copied to the clipboard');
  };

  return (
    <InteractionContext.Provider
      value={{
        likes,
        hasLiked,
        handleLike,
        comments,
        addComment,
        sharedUrl,
        sharePost,
      }}
    >
      {children}
    </InteractionContext.Provider>
  );
};

// Custom hook to use InteractionContext
export const useInteraction = () => useContext(InteractionContext);
export default InteractionContext;