import React, { useState, useRef, useContext, useEffect } from 'react';
import { BsPersonFill } from 'react-icons/bs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTrash, faUsers } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { AppContext } from './AppContext'; // Import the AppContext



export default function Profile() {
const { userPhoto, userData, usersData, handleProfilePhotoUpload, posts } = useContext(AppContext);
const [profilePhoto, setProfilePhoto] = useState(null);
const [userPost, setUserPost] = useState([]);
const [userCount, setUserCount] = useState(0);
const [profilePicture, setProfilePicture] = useState(null);
const fileInputRef = useRef(null);




useEffect(() => {
  // Filter out the current user and set the count of remaining users
  const remainingUsers = usersData.filter(user => user.username !== userData.username);
  setUserCount(remainingUsers.length);
}, [userData.username, usersData]);
  

  useEffect(() => {
    const fetchUserPost = async () => {
      try {
        // Fetch user information from the server
        const response = await fetch('http://localhost:3001/api/posts', {
          method: 'GET',
          credentials: 'include',  // Include cookies in the request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user posts');
        }

        const responseData = await response.json();
        console.log(responseData); 
        setUserPost(responseData);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserPost();
  }, []); 


  const handleImageChange = (e) => {
    const file = e.target.files[0];

    // Validate file type if needed
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file.');
    }
  };

  const handleUpdatePhotoClick = () => {
    // Trigger the file input when the "Update Photo" button is clicked
    fileInputRef.current.click();
  };

  const handleImageRemove = () => {
    setProfilePicture(null);
  };

  return (
    <div className="container">
      {profilePicture ? (
        <div>
          <img src={profilePicture} alt="Profile" style={{ width: '100px', height: '100px', borderRadius:'50%' }} />
          <br />
          <button onClick={handleImageRemove}>
            <FontAwesomeIcon icon={faTrash} /> Remove Photo
          </button>
        </div>
      ) : (
        <div>
          {/* Hidden file input */}
          <BsPersonFill size={50} />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          {/* Update Photo button */}
          <button onClick={handleUpdatePhotoClick}>
            <FontAwesomeIcon icon={faCamera} /> Upload Photo
          </button>
        </div>
      )}

      {/* User's full name (replace with actual user data) */}
      <div className="user-info">
          <strong>{userData && userData.username}</strong>
      </div>

      {/* User statistics (replace with actual user data) */}
      <div style={{fontWeight:'bold', marginTop:'10px'}}>
        <span><FontAwesomeIcon icon={faUsers} /> Friends: {userCount}</span>
      </div>                   

      {/* User's posts (replace with actual user data) */}
      <div>
        <h3>Recent Posts</h3>
        {/* Map through the user's posts and display them */}
        {userPost.map((post) => (
          <div key={post._id}>
            <small><i>Posted on: {new Date(post.timestamp).toLocaleString()}</i></small>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

