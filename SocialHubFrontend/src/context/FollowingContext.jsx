import React, { createContext, useState, useContext } from 'react';

const FollowingContext = createContext();

export const FollowingProvider = ({ children }) => {
  const [following, setFollowing] = useState([]);

  const followUser = (user) => setFollowing([...following, user]);
  const unfollowUser = (userId) => setFollowing(following.filter(user => user.id !== userId));

  return (
    <FollowingContext.Provider value={{ following, followUser, unfollowUser }}>
      {children}
    </FollowingContext.Provider>
  );
};

export const useFollowing = () => useContext(FollowingContext);
export default FollowingContext;