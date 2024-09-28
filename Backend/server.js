const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());
// MongoDB URI
const MONGODB_URI = 'mongodb+srv://USER:USER123@cluster0.r4pv1.mongodb.net/DAPP';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  linkedinEmail: { type: String },
  linkedinPassword: { type: String },
  accessToken: { type: String },
  linkedinPersonId: { type: String },
  linkedinPersonalEmail: { type: String }, // Store LinkedIn Person ID
});

const User = mongoose.model('User', UserSchema);

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password, linkedinEmail, linkedinPassword } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({ 
      username, 
      password: hashedPassword, 
      linkedinEmail, 
      linkedinPassword 
    });
    
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Username already exists or invalid data' });
  }
});



// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    
    res.json({ token, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// LinkedIn authentication
const clientId = '86ctu5regyzoee';
const clientSecret = 'WPL_AP1.RTHyTLxikqYLD4Mu.qY+jqA==';
const redirectUri = 'http://localhost:8000/auth/linkedin/callback';

// LinkedIn callback endpoint
app.get('/auth/linkedin/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Step 1: Exchange authorization code for access token
    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      },
    });

    const accessToken = response.data.access_token;
    console.log('Access Token:', accessToken);

    // Step 2: Fetch LinkedIn user profile
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userProfile = profileResponse.data;
    console.log('User Profile:', userProfile);

    const linkedinPersonId = userProfile.sub; 
    const linkedinPersonalEmail = userProfile.email; 

    // Step 3: Update or create user in MongoDB
    let user = await User.findOneAndUpdate(
      { username:linkedinPersonalEmail }, // Use LinkedIn email as username
      { accessToken, linkedinPersonId }, 
      { new: true, upsert: true } // Create if not found
    );

    // Redirect or send a success response
    res.redirect(`http://localhost:3000/?access_token=${accessToken}&user_profile=${encodeURIComponent(JSON.stringify(userProfile))}`);
  } catch (error) {
    console.error('Error during authentication or fetching user data:', error);
    res.status(500).send('Error during authentication');
  }
});

// Get access token for user
app.get('/api/getAccessToken', async (req, res) => {
  const { username } = req.query; // Assume you pass username or some identifier

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ accessToken: user.accessToken });
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Share post endpoint
app.post('/share', async (req, res) => {
  const { accessToken, text } = req.body;

  if (!accessToken || !text) {
    return res.status(400).json({ error: 'Access token and text are required.' });
  }

  try {
    // Find user by access token
    const user = await User.findOne({ accessToken });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - User not found' });
    }

    const linkedinPersonId = user.linkedinPersonId;

    const postBody = {
      author: `urn:li:person:${linkedinPersonId}`, // Use actual LinkedIn person ID
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text, // Ensure this is not empty
          },
          shareMediaCategory: 'NONE' // Make sure this is valid
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' // Ensure this is correct
      }
    };

    // Post to LinkedIn
    const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    res.status(201).json({ message: 'Post shared successfully', data: response.data });
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({ error: 'Failed to share post on LinkedIn' });
  }
});

// Publish article endpoint
app.post('/share-article', async (req, res) => {
  const { accessToken, title, originalUrl, description, visibility } = req.body;

  try {
    // Find user by access token
    const user = await User.findOne({ accessToken });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - User not found' });
    }

    const linkedinPersonId = user.linkedinPersonId;

    const articleBody = {
      author: `urn:li:person:${linkedinPersonId}`, // Use actual LinkedIn person ID
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: description, // Commentary provided by the user
          },
          shareMediaCategory: 'ARTICLE', // Ensure this is valid
          media: [
            {
              status: 'READY', // Set media status
              description: {
                text: description, // Description of the article
              },
              originalUrl: originalUrl, // URL of the article
              title: {
                text: title, // Title of the article
              },
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': visibility || 'PUBLIC', // Default to PUBLIC if not provided
      },
    };

    // Post to LinkedIn
    const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', articleBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    res.status(201).json({ message: 'Article published successfully', data: response.data });
  } catch (error) {
    console.error('Error publishing article:', error);
    res.status(500).json({ error: 'Failed to publish article on LinkedIn' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
