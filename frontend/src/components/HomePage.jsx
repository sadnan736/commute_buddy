import React, { useState } from 'react';
import axios from 'axios';
import '../assets/home.css';

function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:1477/api/users/login', { email, password });
      alert(response.data.message);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      window.location.href = '/profile';
    } catch (error) {
      if (error.response) {
        alert(error.response.data.error);
      } else {
        alert('Server error');
      }
    }
  };

  const goToRegister = () => {
    window.location.href = '/register';
  };

  return (
    <>
      <nav className="naviHome">
        <div className="logoHome">
          <div className="com">Commute</div><div className="bud">Buddy</div>
        </div>
        <ul>
          <li className="hm"><a href="#home">Home</a></li>
          <li className="about"><a href="#about">About</a></li>
          <li className="help"><a href="#help">Help</a></li>
          <li className="blogHome"><a href="#blog">Blog</a></li>
          <li className="RegisterHome">
            <button className="regi" onClick={goToRegister}>Register</button>
          </li>
        </ul>
      </nav>

      <section className="home">
        <div className="content">
          <h1>Welcome to our<br />community</h1>
          <h4 className="note">
            Start your new journey with us and join<br />
            our community for safe and reliable<br />
            traveling
          </h4>
          <button className="explore">Explore our community</button>
        </div>

        <form className="login" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="email"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
          <button type="submit" className="sign">SIGN IN</button>
          <p className="connect">Or connect with</p>
          <div className="social">
            <button type="button" className="twitter">Twitter</button>
            <button type="button" className="facebook">Facebook</button>
          </div>
        </form>
      </section>
    </>
  );
}

export default HomePage;
