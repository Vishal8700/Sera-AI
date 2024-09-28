import React, { useState, useRef, useEffect } from 'react';
import './chat.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import user from '../assets/user-account-person-avatar-svgrepo-com.png';
import genai from '../assets/dialogflow-svgrepo-com.png';
import Auth from '../auth/Auth';
import ChatInput from './chatinput';
import LinkedInAuthButton from '../linkedin/LinkedInAuthButton';
import LinkedInCallback from '../userinfo/userinfo';
import axios from 'axios'; // Make sure to install axios: npm install axios
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


const AdvancedSearchToggle = ({ isEnabled, onToggle }) => {
  return (
    <motion.div
      className="advanced-search-toggle"
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
    >
      <span className="toggletext">Advanced Search</span>
      <motion.div
        className="toggle-switch"
        animate={{ backgroundColor: isEnabled ? '#4CAF50' : '#ccc' }}
      >
        <motion.div
          className="toggle-handle"
          animate={{ x: isEnabled ? 22 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.div>
      
    </motion.div>
  );
};


const getWebsiteName = (url) => {
  const domain = new URL(url).hostname;
  const domainWithoutWww = domain.replace(/^www\./, '');
  const websiteName = domainWithoutWww.split('.')[0];
  return websiteName.charAt(0).toUpperCase() + websiteName.slice(1);
};



const colors = ["#FF6347", "#4682B4", "#32CD32", "#8A2BE2", "#FF4500", "#D2691E", "#00CED1"];

const SearchLinks = ({ sources }) => {
  return (
    <div className="search-links">
      <span>Learn more</span>
      {sources.slice(0, 10).map((source, index) => (
        <a
          key={index}
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="search-link"
          style={{ backgroundColor: colors[index % colors.length] }}
          title={getWebsiteName(source)} // Tooltip showing full website name
        >
         {getWebsiteName(source)}
        </a>
      ))}
    </div>
  );

};

const Sidebar = ({ recentChats, onChatClick, isLoggedIn, username, onLoginClick, onLogout, isAdvancedSearch, onToggleAdvancedSearch }) => {
  return (
    <div className="chat-app-sidebar">
      {isLoggedIn ? (
        <div>
          <button className="chat-app-profile-button">
            {username.charAt(0).toUpperCase()}
          </button>
        </div>
      ) : (
        <button className="chat-app-login-button" onClick={onLoginClick}>
          Login / Sign Up
        </button>
      )}
      
      <LinkedInAuthButton />
      <LinkedInCallback />

      <div className="chat-app-recent-chats">
        <h3>Recent Chats</h3>
        {recentChats.map((chat, index) => (
          <div key={index} className="chat-app-chat-item" onClick={() => onChatClick(index)}>
            <div className="chat-snippet">
              <strong>User:</strong> {chat.userMessage.slice(0, 30)}...
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <AdvancedSearchToggle isEnabled={isAdvancedSearch} onToggle={onToggleAdvancedSearch} />
        <button className="chat-app-logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};
const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="chat-app-header">
    <div className="header-title">
      <h1>Chat App <span className="powered-by">powered by seraAI</span></h1>
      
    </div>
    <div className="tab-boxes">
        <div className="tab-box create-post" onClick={() => navigate('/create-post')}>
          Create Post
        </div>
        <div className="tab-box update-post" onClick={() => navigate('/article-post')}>
          Create Article
        </div>
    </div>
  </div>
    
  );
};

const App = () => {

  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [searchSources, setSearchSources] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatIndex, setCurrentChatIndex] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const chatContainerRef = useRef(null);

  const genAI = new GoogleGenerativeAI('AIzaSyCawcXRC_tJ0_vxtMhrYM5A0s20Z_JRbxc');

  // Load login state from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // const handleSendMessage = async (message) => {
  //   console.log("Message sent:", message);
    
  //   if (message.toLowerCase() === '@linkedin-myinfo') {
  //     const userInfoMessage = {
  //       userMessage: '@linkedin-myinfo',
  //       geminiResponse: formatUserInfo(userProfile),
  //       isLinkedInInfo: true
  //     };
  //     setChatHistory(prevChatHistory => [...prevChatHistory, userInfoMessage]);
  //     setRecentChats(prevRecentChats => [...prevRecentChats, userInfoMessage]);
  //   } 
  //   else if (message.toLowerCase().startsWith('@linkedin-userinfo')) {
  //     const name = message.split(' ').slice(1).join(' '); // Extract the name from the message
  //     if (!name) {
  //       const errorMessage = {
  //         userMessage: message,
  //         geminiResponse: "Please provide a name after @linkedin-userinfo",
  //         isLinkedInInfo: true
  //       };
  //       setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
  //       setRecentChats(prevRecentChats => [...prevRecentChats, errorMessage]);
  //       return;
  //     }
  
  //     const newChat = { userMessage: message, geminiResponse: "Fetching LinkedIn user info...", isLinkedInInfo: true };
  //     setChatHistory(prevChatHistory => [...prevChatHistory, newChat]);
  //     setRecentChats(prevRecentChats => [...prevRecentChats, newChat]);
  
  //     try {
  //       // Send POST request to the backend to fetch LinkedIn info
  //       const response = await axios.post('http://localhost:8003/scrape_linkedin_profiles', { name });
  
  //       if (response.status === 200) {
  //         const userInfo = response.data;
  
  //         const formattedResponse = formatLinkedInUserInfo(userInfo);
  
  //         setChatHistory(prevChatHistory => {
  //           const updatedChats = [...prevChatHistory];
  //           updatedChats[updatedChats.length - 1].geminiResponse = formattedResponse;
  //           return updatedChats;
  //         });
  
  //         setRecentChats(prevRecentChats => {
  //           const updatedRecentChats = [...prevRecentChats];
  //           updatedRecentChats[updatedRecentChats.length - 1].geminiResponse = formattedResponse;
  //           return updatedRecentChats;
  //         });
  //       } else {
  //         throw new Error("Failed to fetch LinkedIn user info");
  //       }
  //     } catch (error) {
  //       console.error('Error fetching LinkedIn user info:', error);
  //       const errorMessage = {
  //         userMessage: message,
  //         geminiResponse: "Error fetching LinkedIn user info. Please try again later.",
  //         isLinkedInInfo: true
  //       };
  //       setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
  //       setRecentChats(prevRecentChats => [...prevRecentChats, errorMessage]);
  //     }
  //   }
  //   else if (message.toLowerCase().startsWith('@linkedin-topic')) {
  //     const topic = message.split(' ').slice(1).join(' ');
  //     if (!topic) {
  //       const errorMessage = {
  //         userMessage: message,
  //         geminiResponse: "Please provide a topic after @linkedin-topic",
  //         isLinkedInInfo: true
  //       };
  //       setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
  //       setRecentChats(prevRecentChats => [...prevRecentChats, errorMessage]);
  //       return;
  //     }

  //     const newChat = { userMessage: message, geminiResponse: "Fetching topic-related posts...", isLinkedInInfo: true };
  //     setChatHistory(prevChatHistory => [...prevChatHistory, newChat]);
  //     setRecentChats(prevRecentChats => [...prevRecentChats, newChat]);

  //     try {
  //       const response = await axios.post('http://localhost:8001/scrape_topic_posts', { topic });
  //       const topicPosts = response.data;

  //       const formattedResponse = formatTopicPosts(topicPosts);
        
  //       setChatHistory(prevChatHistory => {
  //         const updatedChats = [...prevChatHistory];
  //         updatedChats[updatedChats.length - 1].geminiResponse = formattedResponse;
  //         return updatedChats;
  //       });
        
  //       setRecentChats(prevRecentChats => {
  //         const updatedRecentChats = [...prevRecentChats];
  //         updatedRecentChats[updatedRecentChats.length - 1].geminiResponse = formattedResponse;
  //         return updatedRecentChats;
  //       });
  //     } catch (error) {
  //       console.error('Error fetching topic-related posts:', error);
  //       const errorMessage = {
  //         userMessage: message,
  //         geminiResponse: "Error fetching topic-related posts. Please try again later.",
  //         isLinkedInInfo: true
  //       };
  //       setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
  //       setRecentChats(prevRecentChats => [...prevRecentChats, errorMessage]);
  //     }
  //   } 
  //   else if (message.toLowerCase().startsWith('@linkedin-role')) {
  //     const params = message.split(' ').slice(1);
  //     if (params.length < 2) {
  //       const errorMessage = {
  //         userMessage: message,
  //         geminiResponse: "Please provide both role and company name after @linkedin-role (e.g., @linkedin-role HR Google)",
  //         isLinkedInInfo: true
  //       };
  //       setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
  //       setRecentChats(prevRecentChats => [...prevRecentChats, errorMessage]);
  //       return;
  //     }

  //     const role = params[0];
  //     const companyName = params.slice(1).join(' ');

  //     const newChat = { userMessage: message, geminiResponse: "Fetching role-specific profiles...", isLinkedInInfo: true };
  //     setChatHistory(prevChatHistory => [...prevChatHistory, newChat]);
  //     setRecentChats(prevRecentChats => [...prevRecentChats, newChat]);

  //     try {
  //       const response = await axios.post('http://localhost:8002/scrape_role_profiles', { role, company_name: companyName });
  //       const roleProfiles = response.data;

  //       const formattedResponse = formatRoleProfiles(roleProfiles);
        
  //       setChatHistory(prevChatHistory => {
  //         const updatedChats = [...prevChatHistory];
  //         updatedChats[updatedChats.length - 1].geminiResponse = formattedResponse;
  //         return updatedChats;
  //       });
        
  //       setRecentChats(prevRecentChats => {
  //         const updatedRecentChats = [...prevRecentChats];
  //         updatedRecentChats[updatedRecentChats.length - 1].geminiResponse = formattedResponse;
  //         return updatedRecentChats;
  //       });
  //     } catch (error) {
  //       console.error('Error fetching role-specific profiles:', error);
  //       const errorMessage = {
  //         userMessage: message,
  //         geminiResponse: "Error fetching role-specific profiles. Please try again later.",
  //         isLinkedInInfo: true
  //       };
  //       setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
  //       setRecentChats(prevRecentChats => [...prevRecentChats, errorMessage]);
  //     }
  //   }
  //   if (isAdvancedSearch) {
  //     const newChat = { userMessage: message, geminiResponse: "Searching...", sources: [] };
  //     setChatHistory(prevChatHistory => [...prevChatHistory, newChat]);
  //     setRecentChats(prevRecentChats => [...prevRecentChats, newChat]);

  //     try {
  //       const response = await axios.post('http://localhost:8004/search', { query: message });
  //       const { summary, sources } = response.data;

  //       setChatHistory(prevChatHistory => {
  //         const updatedChats = [...prevChatHistory];
  //         updatedChats[updatedChats.length - 1].geminiResponse = summary;
  //         updatedChats[updatedChats.length - 1].sources = sources;
  //         return updatedChats;
  //       });

  //       setRecentChats(prevRecentChats => {
  //         const updatedRecentChats = [...prevRecentChats];
  //         updatedRecentChats[updatedRecentChats.length - 1].geminiResponse = summary;
  //         updatedRecentChats[updatedRecentChats.length - 1].sources = sources;
  //         return updatedRecentChats;
  //       });

  //       setSearchSources(sources);
  //     } catch (error) {
  //       console.error('Error performing advanced search:', error);
  //       // Handle error...
  //     }
  //   } 
  //   else {
  //     // Handle non-LinkedIn chat messages
  //     const newChat = { userMessage: message, geminiResponse: null };
  //     setChatHistory(prevChatHistory => [...prevChatHistory, newChat]);
  //     setRecentChats(prevRecentChats => [...prevRecentChats, newChat]);
  
  //     try {
  //       const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  //       const result = await model.generateContent(message);
  
  //       const geminiResponse = await result.response.text();
  
  //       setChatHistory(prevChatHistory => {
  //         const updatedChats = [...prevChatHistory];
  //         updatedChats[updatedChats.length - 1].geminiResponse = geminiResponse;
  //         return updatedChats;
  //       });
  
  //       setRecentChats(prevRecentChats => {
  //         const updatedRecentChats = [...prevRecentChats];
  //         updatedRecentChats[updatedRecentChats.length - 1].geminiResponse = geminiResponse;
  //         return updatedRecentChats;
  //       });
  //     } catch (error) {
  //       console.error('Error generating response:', error);
  //     }
  //   }
  // };
  const handleSendMessage = async (message) => {
    console.log("Message sent:", message);
    
    // Check for special LinkedIn commands first
    if (message.toLowerCase() === '@linkedin-myinfo') {
        const userInfoMessage = {
            userMessage: '@linkedin-myinfo',
            geminiResponse: formatUserInfo(userProfile),
            isLinkedInInfo: true
        };
        setChatHistory(prevChatHistory => [...prevChatHistory, userInfoMessage]);
        setRecentChats(prevRecentChats => [...prevRecentChats, userInfoMessage]);
        return; // Exit the function to prevent further processing
    } 
    else if (message.toLowerCase().startsWith('@linkedin-userinfo')) {
        const name = message.split(' ').slice(1).join(' '); // Extract the name from the message
        if (!name) {
            const errorMessage = {
                userMessage: message,
                geminiResponse: "Please provide a name after @linkedin-userinfo",
                isLinkedInInfo: true
            };
            setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
            setRecentChats(prevRecentChats => [...prevRecentChats, errorMessage]);
            return;
        }

        const newChat = { userMessage: message, geminiResponse: "Fetching LinkedIn user info...", isLinkedInInfo: true };
        setChatHistory(prevChatHistory => [...prevChatHistory, newChat]);
        setRecentChats(prevRecentChats => [...prevRecentChats, newChat]);

        try {
            // Send POST request to the backend to fetch LinkedIn info
            const response = await axios.post('http://localhost:8003/scrape_linkedin_profiles', { name });

            if (response.status === 200) {
                const userInfo = response.data;
                const formattedResponse = formatLinkedInUserInfo(userInfo);

                setChatHistory(prevChatHistory => {
                    const updatedChats = [...prevChatHistory];
                    updatedChats[updatedChats.length - 1].geminiResponse = formattedResponse;
                    return updatedChats;
                });

                setRecentChats(prevRecentChats => {
                    const updatedRecentChats = [...prevRecentChats];
                    updatedRecentChats[updatedRecentChats.length - 1].geminiResponse = formattedResponse;
                    return updatedRecentChats;
                });
            } else {
                throw new Error("Failed to fetch LinkedIn user info");
            }
        } catch (error) {
            console.error('Error fetching LinkedIn user info:', error);
            const errorMessage = {
                userMessage: message,
                geminiResponse: "Error fetching LinkedIn user info. Please try again later.",
                isLinkedInInfo: true
            };
            setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
            setRecentChats(prevRecentChats => [...prevRecentChats, errorMessage]);
        }
        return; // Exit the function to prevent further processing
    }
    else if (message.toLowerCase().startsWith('@linkedin-topic')) {
        const topic = message.split(' ').slice(1).join(' ');
        if (!topic) {
            const errorMessage = {
                userMessage: message,
                geminiResponse: "Please provide a topic after @linkedin-topic",
                isLinkedInInfo: true
            };
            setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
            setRecentChats(prevRecentChats => [...prevRecentChats, errorMessage]);
            return;
        }

        const newChat = { userMessage: message, geminiResponse: "Fetching topic-related posts...", isLinkedInInfo: true };
        setChatHistory(prevChatHistory => [...prevChatHistory, newChat]);
        setRecentChats(prevRecentChats => [...prevRecentChats, newChat]);

        try {
            const response = await axios.post('http://localhost:8001/scrape_topic_posts', { topic });
            const topicPosts = response.data;
            const formattedResponse = formatTopicPosts(topicPosts);
            
            setChatHistory(prevChatHistory => {
                const updatedChats = [...prevChatHistory];
                updatedChats[updatedChats.length - 1].geminiResponse = formattedResponse;
                return updatedChats;
            });
            
            setRecentChats(prevRecentChats => {
                const updatedRecentChats = [...prevRecentChats];
                updatedRecentChats[updatedRecentChats.length - 1].geminiResponse = formattedResponse;
                return updatedRecentChats;
            });
        } catch (error) {
            console.error('Error fetching topic-related posts:', error);
            const errorMessage = {
                userMessage: message,
                geminiResponse: "Error fetching topic-related posts. Please try again later.",
                isLinkedInInfo: true
            };
            setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
            setRecentChats(prevRecentChats => [...prevRecentChats, errorMessage]);
        }
        return; // Exit the function to prevent further processing
    } 
    else if (message.toLowerCase().startsWith('@linkedin-role')) {
        const params = message.split(' ').slice(1);
        if (params.length < 2) {
            const errorMessage = {
                userMessage: message,
                geminiResponse: "Please provide both role and company name after @linkedin-role (e.g., @linkedin-role HR Google)",
                isLinkedInInfo: true
            };
            setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
            setRecentChats(prevRecentChats => [...prevRecentChats, errorMessage]);
            return;
        }

        const role = params[0];
        const companyName = params.slice(1).join(' ');

        const newChat = { userMessage: message, geminiResponse: "Fetching role-specific profiles...", isLinkedInInfo: true };
        setChatHistory(prevChatHistory => [...prevChatHistory, newChat]);
        setRecentChats(prevRecentChats => [...prevRecentChats, newChat]);

        try {
            const response = await axios.post('http://localhost:8002/scrape_role_profiles', { role, company_name: companyName });
            const roleProfiles = response.data;
            const formattedResponse = formatRoleProfiles(roleProfiles);
            
            setChatHistory(prevChatHistory => {
                const updatedChats = [...prevChatHistory];
                updatedChats[updatedChats.length - 1].geminiResponse = formattedResponse;
                return updatedChats;
            });
            
            setRecentChats(prevRecentChats => {
                const updatedRecentChats = [...prevRecentChats];
                updatedRecentChats[updatedRecentChats.length - 1].geminiResponse = formattedResponse;
                return updatedRecentChats;
            });
        } catch (error) {
            console.error('Error fetching role-specific profiles:', error);
            const errorMessage = {
                userMessage: message,
                geminiResponse: "Error fetching role-specific profiles. Please try again later.",
                isLinkedInInfo: true
            };
            setChatHistory(prevChatHistory => [...prevChatHistory, errorMessage]);
            setRecentChats(prevRecentChats => [...prevRecentChats, errorMessage]);
        }
        return; // Exit the function to prevent further processing
    }
    
    // Only perform advanced search if no special LinkedIn commands were used
    if (isAdvancedSearch) {
        const newChat = { userMessage: message, geminiResponse: "Searching...", sources: [] };
        setChatHistory(prevChatHistory => [...prevChatHistory, newChat]);
        setRecentChats(prevRecentChats => [...prevRecentChats, newChat]);

        try {
            const response = await axios.post('http://localhost:8004/search', { query: message });
            const { summary, sources } = response.data;

            setChatHistory(prevChatHistory => {
                const updatedChats = [...prevChatHistory];
                updatedChats[updatedChats.length - 1].geminiResponse = summary;
                updatedChats[updatedChats.length - 1].sources = sources;
                return updatedChats;
            });

            setRecentChats(prevRecentChats => {
                const updatedRecentChats = [...prevRecentChats];
                updatedRecentChats[updatedRecentChats.length - 1].geminiResponse = summary;
                updatedRecentChats[updatedRecentChats.length - 1].sources = sources;
                return updatedRecentChats;
            });

            setSearchSources(sources);
        } catch (error) {
            console.error('Error performing advanced search:', error);
            // Handle error...
        }
        return; // Exit the function to prevent further processing
    } 

    // Handle non-LinkedIn chat messages
    const newChat = { userMessage: message, geminiResponse: null };
    setChatHistory(prevChatHistory => [...prevChatHistory, newChat]);
    setRecentChats(prevRecentChats => [...prevRecentChats, newChat]);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(message);

        const geminiResponse = await result.response.text();

        setChatHistory(prevChatHistory => {
            const updatedChats = [...prevChatHistory];
            updatedChats[updatedChats.length - 1].geminiResponse = geminiResponse;
            return updatedChats;
        });

        setRecentChats(prevRecentChats => {
            const updatedRecentChats = [...prevRecentChats];
            updatedRecentChats[updatedRecentChats.length - 1].geminiResponse = geminiResponse;
            return updatedRecentChats;
        });
    } catch (error) {
        console.error('Error generating response:', error);
    }
};

  const formatTopicPosts = (posts) => {
    return posts.map((post, index) => `
      Post ${index + 1}:
      Title: ${post.title}
      URL: ${post.post_url}
      Summary: ${post.summary}
    `).join('\n\n');
  };

  
  const formatRoleProfiles = (profiles) => {
    return profiles.map((profile, index) => `
      Profile ${index + 1}:
      Name: ${profile.name}
      About:${profile.about_section}
      LinkedIn URL: ${profile.linkedin_url}
      
    `).join('\n\n');
  };
  
  const formatLinkedInUserInfo = (userInfo) => {
    return userInfo.map((profile, index) => `
      Profile ${index + 1}:
      Name: ${profile.name}
      LinkedIn URL: ${profile.linkedin_url}
      About: ${profile.about_section}
    `).join('\n\n');
  };


  const formatUserInfo = (profile) => {
    if (!profile) return "LinkedIn profile information is not available.";
    return `
      LinkedIn Profile Information:
      Name: ${profile.name}
      Email: ${profile.email}
      Given Name: ${profile.given_name}
      Family Name: ${profile.family_name}
      Country: ${profile.locale.country}
      Language: ${profile.locale.language}
      Profile Picture: ${profile.picture}
    `;
  };


  const handleChatClick = (index) => {
    setCurrentChatIndex(index);
    console.log('Chat clicked:', index);
  };

  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setUsername(username);
    localStorage.setItem('username', username); // Store username in localStorage
    setShowAuth(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    localStorage.removeItem('username'); // Remove username from localStorage
  };

  const handleLoginClick = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const formatMessage = (message, isLinkedInInfo = false) => {
    if (isLinkedInInfo) {
      if (Array.isArray(message)) {
        if (message[0] && 'title' in message[0]) {
          // Handle topic posts
          return (
            <div className="linkedin-info">
              {message.map((post, index) => (
                <div key={index} className="linkedin-post">
                  <h3>{post.title}</h3>
                  <p>
                    URL: <a href={post.post_url} target="_blank" rel="noopener noreferrer">{post.post_url}</a>
                  </p>
                  <p>Summary: {post.summary}</p>
                </div>
              ))}
            </div>
          );
        } else if (message[0] && 'linkedin_url' in message[0]) {
          // Handle role-specific profiles
          return (
            <div className="linkedin-info">
              {message.map((profile, index) => (
                <div key={index} className="linkedin-profile">
                  <h3>{profile.name}</h3>
                  <p>Title: {profile.title}</p>
                  <p>Location: {profile.location}</p>
                  <p>
                    LinkedIn URL: <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">{profile.linkedin_url}</a>
                  </p>
                </div>
              ))}
            </div>
          );
        } else {
          // Handle user info
          return (
            <div className="linkedin-info">
              {message.map((profile, index) => (
                <div key={index} className="linkedin-profile">
                  <h3>{profile.name}</h3>
                  <p>
                    LinkedIn URL: <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">{profile.linkedin_url}</a>
                  </p>
                  <p>About: {profile.about_section}</p>
                </div>
              ))}
            </div>
          );
        }
      } else {
        // Handle string responses (e.g., @linkedin-myinfo)
        const lines = message.split('\n');
        return (
          <div className="linkedin-info">
            {lines.map((line, index) => {
              if (line.startsWith('Profile Picture:') || line.includes('http://') || line.includes('https://')) {
                const [label, url] = line.split(': ');
                return (
                  <p key={index} className="message-paragraph">
                    {label}: <a href={url} target="_blank" rel="noopener noreferrer">{url.trim()}</a>
                  </p>
                );
              }
              return (
                <p key={index} className="message-paragraph">
                  {line}
                </p>
              );
            })}
          </div>
        );
      }
    }
    
    // For non-LinkedIn messages
    return message.split('\n').map((paragraph, index) => (
      <p key={index} className="message-paragraph">
        {paragraph}
      </p>
    ));
  };
  const toggleAdvancedSearch = () => {
    setIsAdvancedSearch(!isAdvancedSearch);
  };

  return (
    <div className="chat-app">
      <Sidebar
        recentChats={recentChats}
        onChatClick={handleChatClick}
        isLoggedIn={isLoggedIn}
        username={username}
        onLoginClick={handleLoginClick}
        onLogout={handleLogout}
        isAdvancedSearch={isAdvancedSearch}
        onToggleAdvancedSearch={toggleAdvancedSearch}
      />
      <div className="chat-app-main-content">
        <Header />

        <div className="chat-app-chat-history" ref={chatContainerRef}>
          {currentChatIndex !== null ? (
            <div className="chat-message-container">
              <div className="chat-message gemini">
                <img src={genai} alt="Gemini Avatar" className="avatar" />
                <div className="message-content">
                  {formatMessage(recentChats[currentChatIndex].geminiResponse, recentChats[currentChatIndex].isLinkedInInfo)}
                </div>
              </div>
              {isAdvancedSearch && searchSources.length > 0 && (
                <SearchLinks sources={searchSources} />
              )}
              <div className="chat-message user">
                <div className="message-content">
                  {formatMessage(recentChats[currentChatIndex].userMessage)}
                </div>
                <img src={user} alt="User Avatar" className="avatar" />
              </div>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div key={index} className="chat-message-container">
                <div className="chat-message user">
                  <div className="message-content">
                    {formatMessage(chat.userMessage)}
                  </div>
                  <img src={user} alt="User Avatar" className="avatar" />
                </div>

                {chat.geminiResponse && (
                  <div className="chat-message gemini">
                    <img src={genai} alt="Gemini Avatar" className="avatar" />
                    <div className="message-content">
                      {formatMessage(chat.geminiResponse, chat.isLinkedInInfo)}
                    </div>
                  </div>
                )}
                 {isAdvancedSearch && chat.sources && (
                  <SearchLinks sources={chat.sources} />
                )}
              
            </div>
            ))
          )}
        </div>

        {currentChatIndex === null && (
          <ChatInput onSend={handleSendMessage} />
        )}
      </div>

      {showAuth && <Auth onLogin={handleLogin} onClose={handleCloseAuth} />}
      <LinkedInCallback setUserProfile={setUserProfile} />
    </div>
  );
};

export default App;