# ✨Sera AI - Etherverse Variants

## 🔎 Overview 

**Sera AI** is an intelligent, React-based chatbot application created by **Team Etherverse Variants**. Sera AI integrates Google Authentication for secure access and leverages cutting-edge APIs to facilitate dynamic conversations, information retrieval, and task automation, all within a seamless and user-friendly interface.

---
## 📽️Video (Youtube)
[![YouTube Video](https://img.youtube.com/vi/c2p3oX5EKNw/maxresdefault.jpg)](https://youtu.be/c2p3oX5EKNw)

---
## 📊 Presentation  
[Sera AI.pdf]👨‍💻(https://github.com/user-attachments/files/17175485/Sera.AI.pdf)

---
## 💡 Key Features 

1. **Natural Conversations** 💬🧠:  
   Sera AI uses the **Gemini API** to engage users in natural, coherent conversations on a wide range of topics. It can understand user prompts, maintain context, and offers relevant information or entertainment.
   
2. **Task-Specific Command Routes**:
    - **Fetch LinkedIn Profile Details** 🔍💼:  
      Sera AI retrieves public information from LinkedIn profiles based on user input, such as name,company affiliation, job title and professional summary along with the user's profile URL.

    - **Role Specific Search** ✏️📢:
      Sera AI can search for users on linkedin with specific roles (like "HR Manager") and their company affiliation to make it easier for users to find relevant profiles.
    
    - **Web Scraping for Specific Text** 🌐🔎:  
      Sera AI is capable of scraping websites to search for occurrences of specified text or patterns and presenting the results concisely along with their source URL.

3. **LinkedIn Post Creation** 📤:
   Sera AI allows users to create and publish LinkedIn posts. Users can compose posts with titles, content, and hashtags, and Sera AI will handle the post creation process.

---
## 💻 Tech Stack

- **Backend**:  
  - ⚡ **FastAPI** : Used for building and managing API endpoints.
  -  🐍 **Python**: The primary programming language, chosen for its extensive libraries and ease of integration with AI models.
  - 🤖 **LangChain**: For managing and chaining together various NLP tasks to handle complex user requests.
  - 📅**MongoDB**: Used for storing and retrieving user data.
  
- **Frontend**:  
  - ⚛️  **ReactJS**: Powers the user interface, providing a dynamic and responsive experience.
  - 📡**WebSockets**: Enables real-time communication between the bot and users, ensuring prompt task execution and feedback.

- **Authentication**:  
  - 🔐 **Google Authentication**: Provides secure access to the chat application.

---

## 🔧 Setup and Installation

- Navigate to ___ folder and run `npm install`
-
-

---

## 📝 Available ChatBot Commands

| Command | Description |
|--------|-------------|
| General user propmt | Sera AI engages in a natural conversation on a wide range of topics. | 
| `@linkedin-writepost {user prompt}` | Returns a markdown formatted LinkedIn post based on the provided prompt. |
| `@linkedin-myinfo` | Returns the user's LinkedIn profile information including name, email, and profile picture. |
| `@linkedin-userinfo {username to be searched}` | Searches Linkedin for the user with provided username and returns upto 10 users with their profile information like name, company affiliation and professional summary along with the user's profile URL. |
| `@linkedin-topic {Article to search}` | Searches Linkedin for articles related to the provided topic and returns the top 10 results with their title, URL and summary. |
| `@linkedin-role {user role} {company name}` | Searches Linkedin for users with the provided role and company affiliation and returns the top 5 results with their profile information like name, company affiliation and professional summary along with the user's profile URL. |
| `Advanced Search turned ON` | Scrapes webpages for specific text or patterns and presents the results concisely along with their source URL. |


---
## 🪜 Steps to Post on LinkedIn

### Step 1: Log in and Connect LinkedIn Account
- Ensure that you are logged in to Sera AI with your Google account.
- After logging in, connect your LinkedIn account by following the authentication process.

### Step 2: Navigate to the `Create Post` Page
- Once logged in and connected, click the `Create Post` button on the dashboard.
- This will redirect you to a new page where you can compose your LinkedIn post.

### Step 3: Enter Post Details
- On the `Create Post` page, you will be prompted to enter the following details:
    - **Username**: Your LinkedIn username or the username associated with the post.
    - **Post Title**: The title or heading of the post you want to share.
    - **Content**: The main body of the post. This can include text, hashtags, and any relevant content you want to share with your LinkedIn network.

### Step 4: Review and Submit
- Once you have entered all the required information, review your post for accuracy.
- After reviewing, click the `Share Post` button to publish the post to LinkedIn.

### Step 5: Confirmation
- After submission, you will receive a confirmation message that your post has been successfully published to your LinkedIn profile.

---

## 🪜 Steps to Post an Article on LinkedIn

After logging in and connecting your LinkedIn account, users can create and publish articles by following the steps below.

### Step 1: Log in and Connect LinkedIn Account
- Ensure that you are logged in to Sera AI using your Google account.
- After successful login, connect your LinkedIn account through the authentication process.

### Step 2: Navigate to the `Create Article` Page
- Click the `Create Article` button.
- This will redirect you to a new page where you can compose and publish your article on LinkedIn.

### Step 3: Enter Article Details
- On the `Create Article` page, fill in the following details:
    - **Username**: Your LinkedIn username or the account under which the article will be published.
    - **Article Title**: The title or heading of your article.
    - **Article URL**: Provide a URL for the article .
    - **Description**: A brief summary or description of the article’s content.
    - **Visibility**: Choose the visibility of the article. You can select from options like "Public," "Connections Only".

### Step 4: Review and Submit
- After entering all the required details, review the article for accuracy and completeness.
- Once reviewed, click the `Submit Article` button to post the article to your LinkedIn profile.

### Step 5: Confirmation
- Upon successful submission, you will receive a confirmation message that the article has been published on LinkedIn.


## 👨‍💻 Team

- Vishal Kumar [Github Profile](https://github.com/Vishal8700)
- Keshav Anand Verma [Github Profile](https://github.com/codes-by-keshav)
- Devanshu Raj [Github Profile](https://github.com/Redd-hope)
- Simran [Github Profile](https://github.com/simran1devloper)

---
