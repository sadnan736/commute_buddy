import React from 'react';
import '../assets/profile.css';

function ProfilePage() {
  

  return (
    <>
      <nav className="navi">
        <div className="logo">
          <div className="com">Commute</div><div className="bud">Buddy</div>
        </div>
        <ul>
          <li className="h"><a href="/">Home</a></li>
          <li className="about"><a href="#about">About</a></li>
          <li className="map"><a href="#map">Map</a></li>
          <li className="blog"><a href="#blog">Blog</a></li>
          <li className="dash"><a href="/dashboard">Dashboard</a></li>
        </ul>
      </nav>

      <section className="home">
        <div className="content">
          <h1>Welcome to Your Profile</h1>
          <h4>Here you can view and manage your personal details and preferences.</h4>
          
        </div>
      </section>
    </>
  );
}

export default ProfilePage;
