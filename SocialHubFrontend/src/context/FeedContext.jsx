import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

const FeedContext = createContext();

export const FeedProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { keycloak, authenticated, loading: authLoading } = useAuth();

  // Fetch posts from backend
  const fetchPosts = useCallback(async () => {
    if (!authenticated || !keycloak?.token) {
      console.log("Skipping fetch: Not authenticated or no token");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching posts with token:", keycloak.token.substring(0, 20) + "...");
      const response = await api.get("/posts");
      console.log("Posts fetched:", response.data);

      const fetchedPosts = response.data.map((post) => ({
        id: post.id,
        user: post.username || "Unknown User",
        caption: post.content,
        image: post.imagePath ? `http://localhost:8080/images/${post.imagePath}` : null,
        likes: 0,
        comments: [],
      }));

      setPosts(fetchedPosts);
    } catch (error) {
      console.error("❌ Failed to fetch posts:", error.response?.data || error.message);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [authenticated, keycloak]);

  // Add post locally
  const addPost = useCallback((newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  }, []);

  // Delete post locally
  const deletePost = useCallback((postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  }, []);

  // Fetch posts when authenticated and ready
  useEffect(() => {
    if (!authLoading && authenticated && keycloak?.token) {
      console.log("✅ Authenticated and ready. Fetching posts...");
      fetchPosts();
    }
  }, [authLoading, authenticated, keycloak, fetchPosts]);

  return (
      <FeedContext.Provider value={{ posts, loading, error, setPosts, fetchPosts }}>
        {children}
      </FeedContext.Provider>
  );
};

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeed must be used within a FeedProvider");
  }
  return context;
};

export default FeedContext;