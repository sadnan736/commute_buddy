import React, { useState } from "react";
import axios from "axios";
import "../assets/home.css";

function HomePage() {
  let hasCreds = false;

  try {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    hasCreds = !!(userId && token);
  } catch (err) {
    
    hasCreds = false;
  }
  if (hasCreds) {
  window.location.href = "/profile";
}


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://commute-buddy-fegt.onrender.com/api/users/login",
        { email, password }
      );
      setShowSuccess(true);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);

      setTimeout(() => {
        window.location.href = "/profile";
      }, 2000);
    } catch (error) {
      if (error.response) {
        alert(error.response.data.error);
      } else {
        alert("Server error");
      }
    }
  };

  const goToRegister = () => {
    window.location.href = "/register";
  };

  return (
    <>
      <nav className="naviHome">
        <div className="logoHome">
          <div className="com">Commute</div>
          <div className="bud">Buddy</div>
        </div>
        <ul>
          <li className="hm">
            <a href="#home">Home</a>
          </li>
          <li className="about">
            <a href="#about">About</a>
          </li>
          <li className="help">
            <a href="#help">Help</a>
          </li>
          <li className="blogHome">
            <a href="#blog">Blog</a>
          </li>
          <li className="RegisterHome">
            <button className="regi" onClick={goToRegister}>
              Register
            </button>
          </li>
        </ul>
      </nav>

      <section className="home">
        <div className="content">
          <h1>
            Welcome to our
            <br />
            community
          </h1>
          <h4 className="note">
            Start your new journey with us and join
            <br />
            our community for safe and reliable
            <br />
            traveling
          </h4>
          <button className="explore" onClick={goToRegister}>
            Explore our community
          </button>
        </div>

        <form className="login" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="email"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password"
            required
          />
          <div className="rememberPass">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
              className="remember"
            />
            <p className="rem">Remember me</p>
            <p className="forgotPass">Forget Password</p>
          </div>
          <button type="submit" className="sign">
            SIGN IN
          </button>
          <p className="connect">Or connect with</p>
          <div className="social">
            <button type="button" className="twitter">
              Twitter
            </button>
            <button type="button" className="facebook">
              Facebook
            </button>
          </div>
        </form>
      </section>

      <section className="about-section">
        <div className="about-container">
          <h2>About Our Website</h2>
          <p className="about-text">
            <span className="highlight">CommuteBuddy</span> is designed to make
            your daily travel safe, affordable, and enjoyable. Our platform
            helps people find and connect with commuters traveling along similar
            routes, reducing costs and promoting eco-friendly travel.
          </p>

          <div className="about-details">
            <div className="detail-box">
              <h3>📧 Contact Us</h3>
              <p className="detaisl-text">
                Got questions or feedback? Reach out at <br />
                <a href="mailto:commutebuddy@gmail.com">
                  commutebuddy@gmail.com
                </a>
              </p>
            </div>

            <div className="detail-box">
              <h3>🌍 Our Mission</h3>
              <p className="detaisl-text">
                We are spreading awareness about safe commuting, reducing
                traffic jams, lowering carbon emissions, and building a strong
                commuting community.
              </p>
            </div>

            <div className="detail-box">
              <h3>👨‍💻 This website is made by</h3>
              <ul className="builders-list">
                <li>Mushfiq Rahman</li>
                <li>Sadnan Islam</li>
                <li>Musfique Us Salehin</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {showSuccess && (
        <div className="success-card">
          <h2> Login Successful!</h2>
          <p>Redirecting to your profile...</p>
        </div>
      )}
    </>
  );
}

export default HomePage;
