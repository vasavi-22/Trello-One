import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import { config } from "./src/config/index.js";

import User from "./src/models/user.model.js";
import Session from "./src/models/session.model.js";
import { authenticateToken } from "./src/middleware/authMiddleware.js";
import taskRoutes from "./src/routes/task.route.js";

import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000', // Allow your frontend's origin
  credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(session({
  secret: 'mySuperSecretKey123456!',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure to true in production with HTTPS
}));

app.use(express.json());
// app.use(cors());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));

app.use(bodyParser.json()); // older way for app.use(express.json()) before 4.16.0

app.get('/', (req, res) => {
  res.send('hello world');
});

app.use('/api/tasks', taskRoutes);

app.post('/api/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  console.log(req.body);
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    console.log("trying to create user....................")
    const user = new User({ firstName, lastName, email, password: hashedPassword });
    await user.save();
    res.status(201).send('User created');
  } catch (error) {
    res.status(400).send('Error creating user');
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    const session = new Session({ userId: user._id, token });
    await session.save();

    res.json({ token });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Logout route
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err); // Log error for debugging
      return res.status(500).send('Logout failed');
    }
    res.clearCookie('connect.sid', { path: '/' }); // Ensure the path is correctly specified
    res.status(200).send('Logged out');
  });
});

app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.send('Welcome to the dashboard');
});

passport.use(new GoogleStrategy({
  clientID: 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
  callbackURL: 'http://localhost:5000/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = new User({ googleId: profile.id, email: profile.emails[0].value });
    await user.save();
  }
  return done(null, user);
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, 'your_jwt_secret');
  res.redirect(`http://localhost:3000?token=${token}`);
});


// Security Measures
app.use(helmet());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


( async () => {
  try {
      await mongoose.connect(config.DATABASE);
      console.log("MongoDB connected");

      app.listen(process.env.PORT, () => {
          console.log(`Server starts at port ${config.PORT}`);
      });
  } catch (error) {
      console.error("Failed to connect to MongoDB", error);
  }
})()