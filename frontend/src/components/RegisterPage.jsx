import React, { useState, useRef } from "react";
import axios from "axios";
import "../assets/regi.css";

function RegisterPage() {
  const [avatarPreview, setAvatarPreview] = useState("");
  const avatarRef = useRef(null);

  const goBack = () => {
    window.location.href = "/";
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
    else setAvatarPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();
    formData.append("name", form.name.value);
    formData.append("email", form.email.value);
    formData.append("password", form.password.value);
    if (avatarRef.current.files[0])
      formData.append("avatar", avatarRef.current.files);

    try {
      const res = await axios.post(
        "https://commute-buddy-fegt.onrender.com/api/users/register",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert(res.data.message || "Registration successful");
      window.location.href = "/profile";
    } catch (err) {
      alert(err.response?.data.error || "Server error");
    }
  };

  return (
    <>
      <div className="hd">
        <button className="back-btn" onClick={goBack}>
          <span className="arrow"></span>
        </button>
        <div className="logo">
          <div className="com">Commute</div>
          <div className="bud">Buddy</div>
        </div>
      </div>

      <div className="form-container">
        <h2>Register</h2>
        <form id="registerForm" onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Full Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
          />
          <label>Avatar (optional)</label>
          <input
            name="avatar"
            type="file"
            accept="image/*"
            ref={avatarRef}
            onChange={handleAvatarChange}
          />
          {avatarPreview && (
            <img id="avatarPreview" src={avatarPreview} alt="Avatar Preview" />
          )}
          <button className="regibut" type="submit">
            Register
          </button>
        </form>
      </div>
    </>
  );
}

export default RegisterPage;
