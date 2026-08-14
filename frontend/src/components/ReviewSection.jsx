import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { Star, User } from "lucide-react";

const ReviewSection = ({ vehicleId, reviews, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("You must be logged in to leave a review.");
      return;
    }
    
    setSubmitting(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_URL}/api/vehicles/${vehicleId}/reviews`,
        { rating, comment },
        { headers: { "x-auth-token": token } }
      );
      
      // We populate user name in GET request, so let's mock it for the new review instantly
      const newReview = {
        ...res.data,
        user: { name: user.name || "You" }
      };
      
      onReviewAdded(newReview);
      setComment("");
      setRating(5);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-section">
      <h3>Reviews ({reviews.length})</h3>
      
      {/* Review List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review this vehicle!</p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="review-card">
              <div className="review-header">
                <div className="review-user">
                  <div className="review-avatar">
                    <User size={16} />
                  </div>
                  <strong>{r.user?.name || "Unknown User"}</strong>
                </div>
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < r.rating ? "#f59e0b" : "#e5e7eb"}
                      color={i < r.rating ? "#f59e0b" : "#e5e7eb"}
                    />
                  ))}
                </div>
              </div>
              <p className="review-comment">{r.comment}</p>
              <span className="review-date">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Review Form */}
      {user ? (
        <form className="review-form" onSubmit={handleSubmit}>
          <h4>Leave a Review</h4>
          {error && <div className="review-error">{error}</div>}
          <div className="form-group">
            <label>Rating</label>
            <div className="star-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`star-btn ${star <= rating ? "active" : ""}`}
                >
                  <Star size={24} fill={star <= rating ? "#f59e0b" : "transparent"} color={star <= rating ? "#f59e0b" : "#d1d5db"} />
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Comment</label>
            <textarea
              rows={4}
              placeholder="What did you think of this vehicle?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-review-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="review-login-prompt">
          <p>Please log in to leave a review.</p>
        </div>
      )}
      
      <style>{`
        .review-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
          font-family: var(--font-body);
        }
        .review-section h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 1.5rem;
        }
        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .no-reviews {
          color: #6b7280;
          font-style: italic;
        }
        .review-card {
          background: #f9fafb;
          border-radius: 12px;
          padding: 1.25rem;
          border: 1px solid #f3f4f6;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .review-user {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .review-avatar {
          width: 28px;
          height: 28px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }
        .review-user strong {
          color: #111827;
          font-size: 0.95rem;
        }
        .review-rating {
          display: flex;
          gap: 2px;
        }
        .review-comment {
          color: #4b5563;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0 0 0.5rem;
        }
        .review-date {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .review-form {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .review-form h4 {
          margin: 0 0 1rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }
        .star-selector {
          display: flex;
          gap: 0.5rem;
        }
        .star-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: transform 0.2s;
        }
        .star-btn:hover {
          transform: scale(1.1);
        }
        .review-form textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-family: inherit;
          resize: vertical;
        }
        .review-form textarea:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 2px rgba(249,115,22,0.1);
        }
        .submit-review-btn {
          background: #f97316;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .submit-review-btn:hover {
          background: #ea580c;
        }
        .submit-review-btn:disabled {
          background: #fca5a5;
          cursor: not-allowed;
        }
        .review-error {
          background: #fee2e2;
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        .review-login-prompt {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default ReviewSection;
