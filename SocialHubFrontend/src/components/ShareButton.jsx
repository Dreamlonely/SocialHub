import React from 'react';

const ShareButton = ({ postUrl }) => {
  const handleShare = () => {
    navigator.clipboard.writeText(postUrl);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="share-button-container">
      <button className="share-button" onClick={handleShare}>
        Share
      </button>
    </div>
  );
};

export default ShareButton;