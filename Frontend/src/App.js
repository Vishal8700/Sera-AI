import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Chat from './components/chat/Chat'; 
import CreatePost from './components/createpost/CreatePost.jsx';
import CreateArticle from './components/articlepost/AddNewArticle.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route for the Chat component */}
          <Route path="/" element={<Chat />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/article-post" element={<CreateArticle />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;
