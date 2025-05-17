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
  const [openMenu, setOpenMenu] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);

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
        setPosts((prev) => prev.filter((post) => post.id !== postId));
      }
    } catch (err) {
      alert("Error deleting post.");
    }
  };

  const handleEditSubmit = async (postId) => {
    try {
      const formData = new FormData();
      formData.append("content", editContent);
      formData.append("keycloakId", keycloak?.tokenParsed?.sub);
      if (newImageFile) {
        formData.append("image", newImageFile);
      }

      const response = await api.put(`/posts/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        const updatedPost = response.data;

        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? {
                      ...post,
                      caption: updatedPost.content,
                      image: updatedPost.imagePath
                          ? `http://localhost:8080/images/${updatedPost.imagePath}`
                          : null,
                    }
                    : post
            )
        );

        setEditingPost(null);
        setEditContent("");
        setNewImageFile(null);
      }
    } catch (error) {
      alert("Error editing post.");
    }
  };

  const handleLikeToggle = (postId, newLikes, likedStatus) => {
    setPosts((prev) =>
        prev.map((post) =>
            post.id === postId
                ? { ...post, likes: newLikes, liked: likedStatus }
                : post
        )
    );
  };

  return (
      <div className="content">
        {loading && <p>Loading posts...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && posts.length === 0 ? (
            <p>No posts yet</p>
        ) : (
            posts.map((post) => {
              const isOwner = currentUsername === post.user;

              return (
                  <div key={post.id} className="post-wrapper">
                    <div className="post-header">
                      <div className="post-header-content">
                        <strong className="post-username">
                          {post.user || "Unknown User"}
                        </strong>
                        <span className="post-caption">{post.caption}</span>
                      </div>

                      <div
                          className="more-menu-wrapper"
                          style={{ visibility: isOwner ? "visible" : "hidden" }}
                      >
                        <button
                            onClick={() =>
                                isOwner
                                    ? setOpenMenu(openMenu === post.id ? null : post.id)
                                    : null
                            }
                            aria-label="More options"
                        >
                          ⋮
                        </button>
                        {isOwner && openMenu === post.id && (
                            <div className="more-menu">
                              <button
                                  onClick={() => {
                                    setEditingPost(post.id);
                                    setEditContent(post.caption);
                                    setNewImageFile(null);
                                    setOpenMenu(null);
                                  }}
                              >
                                Edit
                              </button>
                              <button
                                  onClick={() => {
                                    handleDelete(post.id);
                                    setOpenMenu(null);
                                  }}
                              >
                                Delete
                              </button>
                            </div>
                        )}
                      </div>
                    </div>

                    <div className="post-content-wrapper">
                      {editingPost === post.id ? (
                          <div className="edit-section">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                    />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setNewImageFile(e.target.files[0])}
                            />
                            <div className="edit-buttons">
                              <button onClick={() => handleEditSubmit(post.id)}>
                                Save
                              </button>
                              <button onClick={() => setEditingPost(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                      ) : (
                          <>
                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="Post"
                                    className="post-image"
                                    loading="lazy"
                                />
                            )}
                          </>
                      )}
                    </div>

                    <div className="post-actions">
                      <LikeButton
                          postId={post.id}
                          initialLikes={post.likes}
                          initiallyLiked={post.liked}
                          onLikeToggle={(newLikes, liked) =>
                              handleLikeToggle(post.id, newLikes, liked)
                          }
                      />
                      <button
                          className="comment-button"
                          onClick={() => toggleCommentSection(post.id)}
                      >
                        💬 Comment
                      </button>
                    </div>

                    {showCommentSection[post.id] && (
                        <CommentSection postId={post.id} />
                    )}
                  </div>
              );
            })
        )}
      </div>
  );
};

export default PersonalizedFeed;
