import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleAuthProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
    handleRedirectResult();
  }, [confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/signup", {
        firstName,
        lastName,
        email,
        password,
      });
      navigate("/login");
    } catch (error) {
      alert("Signup failed!");
    }
  };

  // const handleGoogleSignup = async () => {
  //   try {
  //     const result = await signInWithPopup(auth, googleAuthProvider);
  //     // Handle successful authentication here
  //     console.log(result.user,"user entered");
  //     navigate("/dashboard"); // Navigate to the dashboard
  //   } catch (error) {
  //     console.error(error.message);
  //   }
  // };

  const handleGoogleSignup = async () => {
    try {
      await signInWithRedirect(auth, googleAuthProvider);
    } catch (error) {
      console.error(error.message);
    }
  };
  
  // Call this function in your component to handle the result after redirect
  const handleRedirectResult = async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log(result.user, "user entered");
        navigate("/dashboard"); // Navigate to the dashboard
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="login-div">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          required
        /><br />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          required
        /><br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        /><br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        /><br />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
        />
        {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
        <br/>
        <button type="submit" disabled={!!passwordError}>
          Sign Up
        </button>
        <p>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
        <button className="g-btn" onClick={handleGoogleSignup}>Sign up with Google</button>
      </form>
    </div>
  );
};

export default SignUp;
