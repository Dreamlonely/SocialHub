import React, { useState } from "react";
import { useFeed } from "../context/FeedContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

const PostCreator = () => {
  const { fetchPosts } = useFeed();
  const { keycloak, authenticated, loading: authLoading } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false); // Renamed to avoid confusion with auth loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCreating(true);

    if (!authenticated || !keycloak?.tokenParsed?.sub) {
      setError("You must be logged in to create a post.");
      setCreating(false);
      return;
    }

    if (!content.trim() && !image) {
      setError("Please provide content or an image.");
      setCreating(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("keycloakId", keycloak.tokenParsed.sub); // ✅
      if (image) {
        formData.append("image", image);
      }

      const response = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const createdPost = response.data;

      const newPost = {
        id: createdPost.id,
        user: createdPost.user?.username || "Unknown User",
        caption: createdPost.content,
        image: createdPost.imagePath
            ? `http://localhost:8080/images/${createdPost.imagePath.replace(/^images\//, '')}` // Remove any "images/" prefix
            : null,
        likes: 0,
        comments: [],
      };

      await fetchPosts();
      setContent("");
      setImage(null);
    } catch (error) {
      console.error("❌ Failed to create post:", error.response?.data || error.message);
      setError(
        error.response?.data?.message || "Failed to create post. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  if (authLoading) {
    return <p>Loading authentication...</p>;
  }

  return (
    <div className="post-creator">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Write a caption..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button type="submit" className="button" disabled={creating}>
          {creating ? "Creating..." : "Post"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default PostCreator;
