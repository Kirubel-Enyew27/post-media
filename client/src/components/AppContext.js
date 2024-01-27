// AppContext.js
import React, { createContext, useState, useEffect } from 'react';


const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userName, setUserName] = useState('');
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [usersData, setUsersData] = useState(null);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user information from the server
        const response = await fetch('http://localhost:3001/api/user', {
          method: 'GET',
          credentials: 'include',  // Include cookies in the request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user information');
        }

        const user = await response.json();
        setUserData(user);
      } catch (error) {
        console.error('Error fetching user information:', error);
      }
    };

    fetchUserData();
  }, []); 



    useEffect(() => {
    const fetchUsersData = async () => {
      try {
        // Fetch user information from the server
        const response = await fetch('http://localhost:3001/api/users', {
          method: 'GET',
          credentials: 'include',  // Include cookies in the request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users information');
        }

        const users = await response.json();
        setUsersData(users);
      } catch (error) {
        console.error('Error fetching users information:', error);
      }
    };

    fetchUsersData();
  }, []); 

  const login = () => {
    // Perform your authentication logic here
    // For simplicity, set authenticated to true
    setAuthenticated(true);
  };

  const logout = () => {
    // Perform logout logic if needed
    setAuthenticated(false);
  };

  const handleProfilePhotoUpload = async (selectedPhoto) => {
    try {
      const formData = new FormData();
      formData.append('photo', selectedPhoto);

      const response = await fetch('http://localhost:3001/api/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setUserPhoto(data.photo);
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

    const handlePost = (newPost) => {
      setPosts([...posts, newPost]);
    };

    useEffect(() => {
      
    }, [posts]); // Dependency array ensures this effect runs when posts changes


    const handleLike = async (postId) => {
      try {
        const response = await fetch(`http://localhost:3001/api/like/${postId}`, {
          method: 'POST',
        });
    
        if (response.ok) {
          const updatedPosts = posts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          );
          setPosts(updatedPosts);
        } else {
          console.error('Error liking post:', response.statusText);
        }
      } catch (error) {
        console.error('Error handling post like:', error);
      }
    };
    
    const handleComment = async (postId, comment) => {
      try {
        const response = await fetch(`http://localhost:3001/api/comment/${postId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment }),
        });
    
        if (response.ok) {
          const updatedPosts = posts.map((post) =>
            post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
          );
          setPosts(updatedPosts);
        } else {
          console.error('Error adding comment:', response.statusText);
        }
      } catch (error) {
        console.error('Error handling post comment:', error);
      }
    };
    

  const contextValue = {
    authenticated,
    userPhoto,
    userData,
    setUserData,
    usersData,
    setUsersData,
    setUserPhoto,
    setUserName,
    userName,
    posts,
    login,
    logout,
    handleProfilePhotoUpload,
    handlePost,
    handleLike,
    handleComment,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };

