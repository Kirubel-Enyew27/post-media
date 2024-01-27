import React, { useState, useEffect, useContext } from 'react';
import { BsPersonFill } from 'react-icons/bs';
import { AppContext } from './AppContext';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@fortawesome/fontawesome-svg-core/styles.css';


export default function Home() {
  const { handleProfilePhotoUpload, userData } = useContext(AppContext);

  const [content, setContent] = useState('');
  const [latestPost, setLatestPost] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const response = await fetch('http://localhost:3001/latest-post');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setLatestPost(data);
        setContent('');
      } catch (error) {
        console.error('Error fetching latest post:', error);
      }
    };

    fetchLatestPost();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();


if (content){
    try {
      const response = await fetch('http://localhost:3001/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      setLatestPost(data);
      setContent('');
      setEditing(false);

    } catch (error) {
      console.error('Error creating or updating post:', error);
    }}
  };

  const handleEdit = () => {
    setEditing(true);
    setContent(latestPost.content);
  };

  const handleUpdate = async (postId) => {
    try {
      const response = await fetch(`http://localhost:3001/edit-post/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      setLatestPost(data);
      setContent('');
      setEditing(false);

    } catch (error) {
      console.error('Error creating or updating post:', error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/delete-post/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. ${errorMessage}`);
      }

      setLatestPost(null);
      setContent('');
      setEditing(false);
    } catch (error) {
      console.error('Error deleting post:', error.message);
    }
  };

  return (
    <div className="container">
      <label htmlFor="photoInput" className="profile-photo-label">
        <BsPersonFill size={50} />
        <input
          type="file"
          id="photoInput"
          accept="image/*"
          onChange={handleProfilePhotoUpload}
          style={{ display: 'none', cursor: 'pointer' }}
        />
      </label>

      {userData ? (
        <div className="user-info">
          <strong>{userData.username}</strong>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="post-container">
          <textarea
            id="content"
            placeholder="What's on your mind?"
            name="content"
            rows="1"
            cols="40"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="textarea"
          ></textarea>

          <button
            type="submit"
            onClick={() => editing && handleUpdate(latestPost._id)}
            className="post-button"
          >
            {editing ? 'Update' : 'Post'}
          </button>

          {editing && (
            <button
              type="button"
              onClick={() => { setEditing(false); setContent(''); }}
              className="cancel-button"
            >
              X
            </button>
          )}
        </div>
      </form>

      <h2 style={{ marginTop: '50px' }}>Latest Post:</h2>

      {latestPost && (
        <div className="latest-post-container">
          {latestPost.content && (
            <small className="timestamp">
              <i>Posted on: {new Date(latestPost.timestamp).toLocaleString()}</i>
            </small>
          )}
          <p className="content">{latestPost.content}</p>

          {!editing && (
            <div className="edit-delete-buttons">
              <button onClick={handleEdit} className="edit-button">
                <FontAwesomeIcon icon={faPen} />Edit
              </button>
              <button onClick={() => handleDelete(latestPost._id)} className="delete-button">
                <FontAwesomeIcon icon={faTrash} />Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

