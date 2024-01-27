// Message.js

import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AppContext } from './AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faUser, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

const socket = io('http://localhost:3000');

export default function Chat() {
  const { userData, usersData, } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [editMessageIndex, setEditMessageIndex] = useState(null);
  const [userSelected, setUserSelected] = useState(null)



  useEffect(() => {
    socket.on('newMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off('newMessage');
    };
  }, []);

  const sendMessage = () => {
    const newMessage = {
      sender: userData.username,
      content: newMessageContent.trim(),
      timestamp: new Date().toLocaleString(),
    };

    if (newMessage.content !== '') {
      if (editMessageIndex !== null) {
        // Editing an existing message
        const updatedMessages = [...messages];
        updatedMessages[editMessageIndex] = { ...newMessage };
        setMessages(updatedMessages);
        setEditMessageIndex(null);
      } else {
        // Sending a new message
        socket.emit('sendMessage', newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }

      setNewMessageContent('');
    }
  };

  const editMessage = (index) => {
    const messageToEdit = messages[index];
    setNewMessageContent(messageToEdit.content);
    setEditMessageIndex(index);
  };

  const deleteMessage = (index) => {
    const updatedMessages = [...messages];
    updatedMessages.splice(index, 1);
    setMessages(updatedMessages);

    // You may want to emit a 'deleteMessage' event to the server here
    // to inform other clients about the deleted message.
  };

  const handleRecipient = (selectedUsername) => {
    setUserSelected(selectedUsername);
    setMessages([]); // Clear current messages when selecting a new user
  };

  return (
    <div className="container">
      <h2><FontAwesomeIcon icon={faComments} />Chat</h2>
      <div>
        {messages.map((message, index) => (
          <div key={index}>
            <p>
              <strong className="user-info" style={{fontSize:'18px'}}>{message.sender}</strong>
            </p>
            {message.content}
            <p>
              <small>
                <i>Sent on: {message.timestamp}</i>
              </small>
            </p>
            <div>
              <button onClick={() => editMessage(index)} className="edit-button"><FontAwesomeIcon icon={faPen} />Edit</button>
              <button onClick={() => deleteMessage(index)} className="delete-button"><FontAwesomeIcon icon={faTrash} /> Delete</button>
            </div>
          </div>
        ))}
      </div>
{!userSelected ? (
  usersData
    .filter(user => user.username !== userData.username)
    .map(user => (
      <div key={user._id} className="user-chat">
        <span onClick={() => handleRecipient(user.username)}>
          <FontAwesomeIcon icon={faUser} />{user.username}
        </span>
      </div>
    ))
) : (
  <div className="post-container">
    <input
      type="text"
      placeholder="Write a message"
      className="textarea"
      value={newMessageContent}
      onChange={(e) => setNewMessageContent(e.target.value)}
    />
    <button onClick={sendMessage} className="post-button">
      {editMessageIndex !== null ? 'Update' : 'Send'}
    </button>
    {(editMessageIndex !== null) && (
  <button className="cancel-button" onClick={() => {setEditMessageIndex(null);setNewMessageContent('')}}>X</button>)}
  </div>
)}

</div>
  );
}

