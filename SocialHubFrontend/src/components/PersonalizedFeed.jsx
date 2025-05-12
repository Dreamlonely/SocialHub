// PersonalizedFeed.jsx updated to use username for ownership check and backend-refreshed data
import React, { useState } from "react";
import { useFeed } from "../context/FeedContext";
import { useAuth } from "../context/AuthContext";
import LikeButton from "./Likebutton";
import CommentSection from "./CommentSection";
import api from "../api/api";

const PersonalizedFeed = () => {
  const { posts, loading, error, setPosts } = useFeed();
  const { keycloak } = useAuth();
  const currentUsername = keycloak?.tokenParsed?.preferred_username;
  const [showCommentSection, setShowCommentSection] = useState({});

  const toggleCommentSection = (postId) => {
    setShowCommentSection((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const response = await api.delete(`/posts/${postId}`);
      if (response.status === 204 || response.status === 200) {
        window.location.reload();
      } else {
        console.warn("Unexpected status:", response.status);
        alert("Unexpected response. Please refresh.");
      }
    } catch (err) {
      if (err?.response?.status === 204) {
        window.location.reload();
      } else {
        console.error("Error deleting post:", err?.response || err);
        alert(
            err?.response?.status === 404
                ? "Post not found."
                : "Failed to delete post."
        );
      }
    }
  };

  return (
      <div className="feed">
        {loading && <p>Loading posts...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && posts.length === 0 ? (
            <p>No posts yet</p>
        ) : (
            posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <strong className="post-username">{post.user || "Unknown User"}</strong>
                    <p className="post-caption">{post.caption}</p>
                  </div>
                  {post.image && <img src={post.image} alt="Post" className="post-image" />}
                  <div className="post-actions">
                    <LikeButton initialLikes={post.likes} />
                    <button
                        className="comment-button"
                        onClick={() => toggleCommentSection(post.id)}
                    >
                      💬 Comment
                    </button>
                    {currentUsername === post.user && (
                        <button
                            className="delete-button"
                            onClick={() => handleDelete(post.id)}
                        >
                          ❌ Delete
                        </button>
                    )}
                  </div>
                  {showCommentSection[post.id] && <CommentSection postId={post.id} />}
                </div>
            ))
        )}
      </div>
  );
};

export default PersonalizedFeed;
