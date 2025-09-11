// src/components/ReportVotes.jsx
import React, { useState } from "react";
import axios from "axios";

export default function ReportVotes({
  reportId,
  initialUpvotes,
  initialDownvotes,
  token,
}) {
  const [upvotes, setUpvotes] = useState(initialUpvotes || 0);
  const [downvotes, setDownvotes] = useState(initialDownvotes || 0);
  const [hasVoted, setHasVoted] = useState(false);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const handleVote = async (type) => {
    if (hasVoted) {
      alert("You have already voted.");
      return;
    }
    try {
      const response = await axios.post(
        `https://commute-buddy-fegt.onrender.com/api/reports/${reportId}/${type}`,
        {},
        config
      );
      setUpvotes(response.data.upvotes);
      setDownvotes(response.data.downvotes);
      setHasVoted(true);
    } catch (error) {
      console.error("Vote failed:", error.response?.data || error.message);
      alert("Failed to submit vote. Please try again.");
    }
  };

  return (
    <div className="report-votes">
      <button
        onClick={() => handleVote("upvote")}
        disabled={hasVoted}
        aria-label="Upvote"
      >
        👍 {upvotes}
      </button>
      <button
        onClick={() => handleVote("downvote")}
        disabled={hasVoted}
        aria-label="Downvote"
      >
        👎 {downvotes}
      </button>
    </div>
  );
}
