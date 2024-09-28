import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import './LinkedInAuthButton.css'; 

const LinkedInAuthButton = () => {
  const clientId = '86ctu5regyzoee'; 
  const redirectUri = 'http://localhost:8000/auth/linkedin/callback'; 
const scope = 'openid profile email w_member_social';

  const handleLogin = () => {
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.open(url, '_self');
  };

  return (
    <button className="linkedin-auth-button" onClick={handleLogin}>
      <FontAwesomeIcon icon={faLinkedin} /> Login with LinkedIn
    </button>
  );
};

export default LinkedInAuthButton;
