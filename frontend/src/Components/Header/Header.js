import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import "./header.css";

const Header = () => {
  const [loginStatus, setLoginStatus] = useState(
    localStorage.getItem("loggedIn")
  );
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      setLoginStatus(localStorage.getItem("loggedIn"));
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    axios
      .post("/api/logout", {}, { withCredentials: true })
      .then((response) => {
        console.log(response.data);
        // Handle successful logout
      })
      .catch((error) => {
        console.error("Error during logout:", error);
        // Handle logout error
      });

    localStorage.removeItem("email");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("token");
    setLoginStatus(null);
    window.dispatchEvent(new Event("storage")); // Trigger storage event to update Header
  };

  return (
    <div className="header">
      <Link to="/" onClick={handleLogout}>
        <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: "2em" }} />
      </Link>
      {loginStatus !== null ? (
        <ul className="nav-items">
          <li className="logout">
            <Link to="/" onClick={handleLogout}>
              Logout
            </Link>
          </li>
        </ul>
      ) : (
        <ul className="nav-items">
          <li>
            <Link
              to="/login"
              className={location.pathname === "/login" ? "active" : ""}
            >
              Login
            </Link>
          </li>
          <li>
            <Link
              to="/signup"
              className={location.pathname === "/signup" ? "active" : ""}
            >
              Signup
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Header;
