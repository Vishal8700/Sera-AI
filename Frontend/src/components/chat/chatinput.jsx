import React, { useState } from 'react';
import { Send } from 'lucide-react';
import './chatinput.css'

const ChatInput = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-app-input-container">
      <input
        type="text"
        placeholder="Enter a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        className="chat-app-input"
      />
      <button className="chat-app-send-button" onClick={handleSend}>
        <Send size={20} />
      </button>
    </div>
  );
};

export default ChatInput;