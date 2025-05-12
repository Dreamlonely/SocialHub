import React, { useState } from 'react';
import { useFollowing } from '../../context/FollowingContext';
import { useFeed } from '../../context/FeedContext';

const SearchAndFollow = () => {
  const { following, followUser, unfollowUser } = useFollowing();
  const { posts } = useFeed();
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFollow = () => {
    if (newUser.trim()) {
      followUser({ id: Date.now(), name: newUser });
      setNewUser('');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1 className="text-2xl">Search for Users</h1>
      <input
        type="text"
        className="search-input"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <h2>Following</h2>
      <div className="following-list">
        <input
          type="text"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          placeholder="Enter user name"
        />
        <button className="button" onClick={handleFollow}>Follow</button>
      </div>

      {following.length > 0 ? (
        <ul>
          {following.map((user) => (
            <li key={user.id}>
              <span>{user.name}</span>
              <button className="button" onClick={() => unfollowUser(user.id)}>Unfollow</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>You are not following anyone yet.</p>
      )}

      <h2>Posts</h2>
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post, index) => (
          <div key={index} className="post-card">
            <div className="post-header">
              <strong className="post-username">{post.user}</strong>
              <p className="post-caption">{post.caption}</p>
            </div>
            {post.image && <img src={post.image} alt="Post" className="post-image" />}
            <div className="post-actions">
              <button className="like-button">❤️ {post.likes}</button>
              <button className="comment-button">💬 Comment</button>
            </div>
          </div>
        ))
      ) : (
        <p>No posts found.</p>
      )}
    </div>
  );
};

export default SearchAndFollow;