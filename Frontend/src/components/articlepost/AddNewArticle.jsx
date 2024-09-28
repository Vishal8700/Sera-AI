import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import './AddNewArticle.css'; // Ensure you create a corresponding CSS file

const AddNewArticle = () => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [username, setUsername] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const ToolbarButton = ({ icon: Icon, label, onClick }) => (
    <button className="toolbar-button" title={label} onClick={onClick}>
      <Icon size={16} />
    </button>
  );

  const handleShareArticle = async () => {
    if (!title || !url || !description) {
      alert('Please enter the title, URL, and description to share the article.');
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

      const response = await fetch('http://localhost:8000/share-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          title,
          originalUrl: url,
          description,
          visibility,
        }),
      });
  
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setTitle('');
        setUrl('');
        setDescription('');
      } else {
        alert(`Error sharing article: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sharing article:', error);
      alert('An error occurred while sharing the article. Please try again.');
    }
  };

  const onEmojiClick = (emojiObject) => {
    setDescription((prev) => prev + emojiObject.emoji);
    setShowPicker(false);
  };

  return (
    <div className='body'>
        <div className="unique-add-new-article">
      <h2 className="unique-article-title">Create New Article</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your username"
        className="unique-input-field"
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter article title here"
        className="unique-input-field"
      />
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter article URL here"
        className="unique-input-field"
      />
      <div className="unique-toolbar">
        <ToolbarButton icon={Smile} label="Emoji" onClick={() => setShowPicker(!showPicker)} />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description or commentary..."
        className="unique-content-textarea"
      />
      {showPicker && (
        <div className="unique-emoji-picker-container">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
      <div className="unique-visibility-section">
        <label>
          <input
            type="radio"
            value="PUBLIC"
            checked={visibility === 'PUBLIC'}
            onChange={(e) => setVisibility(e.target.value)}
          />
          Public
        </label>
        <label>
          <input
            type="radio"
            value="CONNECTIONS"
            checked={visibility === 'CONNECTIONS'}
            onChange={(e) => setVisibility(e.target.value)}
          />
          Connections Only
        </label>
      </div>
      <div className="word-count">
        Word count: {description.split(/\s+/).filter(Boolean).length}
      </div>
      <button onClick={handleShareArticle} className="unique-share-button">
        Share Article
      </button>
    </div>
    </div>
    
  );
};

export default AddNewArticle;
