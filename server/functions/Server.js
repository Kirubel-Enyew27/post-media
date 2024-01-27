// Server.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const User = require('./UserModel');
const Post = require('./PostModel')
const Message = require('./MessageModel')
const http = require('http');
const socketIO = require('socket.io');



const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3001;

mongoose.connect('mongodb://localhost:27017/social-media');

io.on('connection', (socket) => {
  console.log('User connected');

  // Load previous messages from MongoDB when a user connects
  Message.find()
    .sort({ timestamp: 1 })
    .then((messages) => {
      // Emit previous messages to the connected user
      socket.emit('loadMessages', messages);
    })
    .catch((error) => {
      console.error('Error loading messages from MongoDB:', error);
    });

  // Event listener for receiving new messages
  socket.on('sendMessage', (newMessage) => {
    // Save the new message to MongoDB
    const message = new Message(newMessage);
    message.save()
      .then(() => {
        // Broadcast the new message to all connected clients
        io.emit('newMessage', newMessage);
      })
      .catch((error) => {
        console.error('Error saving message to MongoDB:', error);
      });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Middleware to verify user session based on cookie
const verifySession = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No session cookie found' });
  }

  try {
    // Verify the user's session token
    const decoded = jwt.verify(token, 'my-super-secret-key-123!@#');

    // Add the decoded payload (userId) to the request object for later use
    req.userId = decoded.userId;

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid session cookie' });
  }
};

const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your client's origin
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

// Use the verifySession middleware for protected routes
app.use('/api', verifySession);

app.post('/register', async (req, res) => {
  const { username, password, email, dateJoined} = req.body;

  try {
    // Hash the password 
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in MongoDB
    const newUser = await User.create({ username, password: hashedPassword, email, dateJoined});
    
    // Send a confirmation email (using nodemailer)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'email76@gmail.com',
        pass: '111991',
      },
    });

    const mailOptions = {
      from: 'email76@gmail.com',
      to: email,
      subject: 'Registration Confirmation',
      text: `Thank you for registering with our social-media app, ${username}!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending confirmation email:', error);
      } else {
        console.log('Confirmation email sent:', info.response);
      }
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username or email already taken' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user in MongoDB
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check if the password is correct
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate a session token
  const token = jwt.sign({ userId: user._id }, 'my-super-secret-key-123!@#', { expiresIn: '365d' });

  // Set the token in an HTTP-only cookie
  res.cookie('token', token, { httpOnly: true });

  res.json({ token });
});

const resetTokens = {};

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate a unique reset token (in a real-world scenario, you might use a library like crypto)
    const resetToken = Math.random().toString(36).slice(2);

    // Store the reset token in memory (for demonstration purposes, consider using a database for storing reset tokens in production)
    resetTokens[user.id] = resetToken;

    // Send a reset email (using nodemailer)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'email76@gmail.com',
        pass: '111991',
      },
    });

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: 'email76@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending reset email:', error);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      console.log('Reset email sent:', info.response);
      res.status(200).json({ message: 'Reset email sent successfully.' });
    });
  } catch (error) {
    console.error('Error during forgot password:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// Serve static files (e.g., uploaded photos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for parsing JSON
app.use(express.json());

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route to get user data
app.get('/api/user', verifySession, async (req, res) => {
  try {
    // Assuming you have a user ID stored in req.userId after session verification
    const userId = req.userId;

    // Fetch the user data from the database based on the user ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send the user data back to the client
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      // Add other user properties as needed
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Route to handle get all users
app.get('/api/users', async (req, res) => {
  try {

    const users = await User.find().sort({ _id: -1 });

    if (!users) {
      return res.status(404).json({ error: 'No users found.' });
    }

    res.json(users.map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        timestamp: user.timestamp,
      })));

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Route to handle post creation
app.post('/post', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.json(savedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/latest-post', async (req, res) => {
  try {
    // Assuming you want the latest post based on timestamp
    const latestPost = await Post.findOne().sort({ timestamp: -1 });

    if (!latestPost) {
      return res.status(404).json({ error: 'No posts found.' });
    }

    res.json(latestPost);
  } catch (error) {
    console.error('Error fetching latest post:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

//Route to handle get posts
app.get('/api/posts', async (req, res) => {
  try {
    // Assuming you want the latest post based on timestamp
    const posts = await Post.find().sort({ timestamp: -1 });

    if (!posts) {
      return res.status(404).json({ error: 'No posts found.' });
    }

    res.json(posts.map(post => ({
        _id: post._id,
        content: post.content,
        timestamp: post.timestamp,
      })));

  } catch (error) {
    console.error('Error fetching latest post:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


// Route to handle post likes
app.post('/api/like/:postId', async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      return res.status(400).json({ error: 'User already liked this post' });
    }

    post.likes.push(userId);
    await post.save();

    res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Error handling post like:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to handle post comments
app.post('/api/comment/:postId', async (req, res) => {
  const postId = req.params.postId;
  const { comment } = req.body;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({
      user: userId,
      content: comment,
    });

    await post.save();

    res.status(200).json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error handling post comment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/posts/remove-like/:postId', async (req, res) => {
  const postId = req.params.postId;

  try {
    // Find the post by postId
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user's id is in the likes array
    const userIndex = post.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      return res.status(400).json({ message: 'User has not liked the post' });
    }

    // Remove the user's id from the likes array
    post.likes.splice(userIndex, 1);

    // Save the updated post
    await post.save();

    return res.status(200).json({ message: 'Like removed successfully' });
  } catch (error) {
    console.error('Error removing like:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete post endpoint
app.delete('/api/delete-post/:postId', verifySession, async (req, res) => {
  try {
    // Extract post ID from request parameters
    const postId = req.params.postId;

    // Assuming you have a Post model with a corresponding schema
    const deletedPost = await Post.findOneAndDelete({ _id: postId });

    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// edit-post endpoint to accept the post ID as a parameter
app.post('/edit-post/:postId', verifySession, async (req, res) => {
  const postId = req.params.postId;

  try {
    // Find the post by ID
    const existingPost = await Post.findById({ _id: postId });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update the existing post content
    existingPost.content = req.body.content;
    const updatedPost = await existingPost.save();

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
