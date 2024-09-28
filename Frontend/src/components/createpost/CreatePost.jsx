import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import './AddNewPost.css';

const AddNewPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const ToolbarButton = ({ icon: Icon, label, onClick }) => (
    <button className="toolbar-button" title={label} onClick={onClick}>
      <Icon size={16} />
    </button>
  );

  const handleSharePost = async () => {
    if (!content) {
      alert('Please enter some text to share.');
      return;
    }

    try {
      const tokenResponse = await fetch(`http://localhost:8000/api/getAccessToken?username=${username}`);
      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        alert(`Error fetching access token: ${tokenData.error}`);
        return;
      }

      const accessToken = tokenData.accessToken;

      const response = await fetch('http://localhost:8000/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, text: content, title }),
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setContent('');
        setTitle('');
      } else {
        alert(`Error sharing post: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('An error occurred while sharing the post. Please try again.');
    }
  };

  const onEmojiClick = (emojiObject) => {
    setContent((prev) => prev + emojiObject.emoji);
    setShowPicker(false);
  };

  return (
    <div className="add-new-post">
      <h2 className="post-title">Add New Post</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your username"
        className="input-field"
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter title here"
        className="input-field"
      />
      <div className="media-section">
        <span className="visual-text">Visual Text</span>
      </div>
      <div className="toolbar">
        <ToolbarButton icon={Smile} label="Emoji" onClick={() => setShowPicker(!showPicker)} />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="content-textarea"
      />
      {showPicker && (
        <div className="emoji-picker-container">
          <EmojiPicker onEmojiClick={(emojiObject) => onEmojiClick(emojiObject)} />
        </div>
      )}
      <div className="word-count">
        Word count: {content.split(/\s+/).filter(Boolean).length}
      </div>
      <button onClick={handleSharePost} className="share-button">
        Share Post
      </button>
    </div>
  );
};

export default AddNewPost;