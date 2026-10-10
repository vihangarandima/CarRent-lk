import PageHero from "../components/PageHero";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Search,
  Plus,
  Sparkles,
  Car,
  ChevronDown,
  Calendar,
  MapPin,
  X,
  Send,
  ArrowRight,
  User,
  HeartHandshake,
  Check,
  Award,
} from "lucide-react";
import { API_URL } from "../config";
import { useToast } from "../context/ToastContext";
import { formatVehicleImageUrl, handleImageError } from "../utils/imageHelper";

const TRIP_TYPES = [
  "Road Trip & Leisure",
  "Family Vacation",
  "Coastal & Beach Tour",
  "Wildlife Safari & Hills",
  "Business & Airport",
  "Wedding & Special Occasion",
  "City Commute",
];

const VEHICLE_CATEGORIES = [
  { id: "all", label: "All Vehicles" },
  { id: "car", label: "Sedans" },
  { id: "mini-car", label: "Budget & Mini" },
  { id: "van", label: "Vans & Groups" },
  { id: "premium-car", label: "SUVs & Luxury" },
];

const resolveReviewerAvatar = (rev) => {
  const profileImg = rev?.user?.profileImage;
  const name = rev?.user?.name?.toLowerCase() || "";
  if (profileImg && typeof profileImg === "string") {
    if (profileImg.includes("thivina") || name.includes("thivina")) return "/assets/images/thivina.png";
    if (profileImg.includes("punsara") || name.includes("punsara")) return "/assets/images/punsara.png";
    if (profileImg.includes("nirmal") || name.includes("nirmal")) return "/assets/images/nirmal.png";
    return profileImg;
  }
  if (name.includes("thivina")) return "/assets/images/thivina.png";
  if (name.includes("punsara")) return "/assets/images/punsara.png";
  if (name.includes("nirmal")) return "/assets/images/nirmal.png";
  return null;
};

const isFoundationalThree = (name = "") => {
  const n = String(name || "").toLowerCase();
  return n.includes("thivina") || n.includes("punsara") || n.includes("nirmal");
};

const ReviewsPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Filter & Search State
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 5.0,
    recommendRate: 100,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    subRatingAverages: {
      cleanliness: 5.0,
      communication: 5.0,
      valueForMoney: 5.0,
      vehicleCondition: 5.0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedTripType, setSelectedTripType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Modal / Submission Wizard State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formVehicleId, setFormVehicleId] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formCleanliness, setFormCleanliness] = useState(5);
  const [formCommunication, setFormCommunication] = useState(5);
  const [formValue, setFormValue] = useState(5);
  const [formCondition, setFormCondition] = useState(5);
  const [formTripType, setFormTripType] = useState(TRIP_TYPES[0]);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formRecommended, setFormRecommended] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImages, setFormImages] = useState([]);

  // Fetch Reviews & Stats
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("vehicleType", selectedCategory);
      if (selectedRating !== "all") params.append("rating", selectedRating);
      if (selectedTripType !== "all") params.append("tripType", selectedTripType);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (sortBy) params.append("sort", sortBy);

      const res = await axios.get(`${API_URL}/api/reviews?${params.toString()}`);
      setReviews(res.data.reviews || []);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
      toast.error("Could not load reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Vehicles for Review Dropdown
  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vehicles`);
      setVehiclesList(res.data || []);
    } catch (err) {
      console.warn("Could not load vehicles for review selector:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedCategory, selectedRating, selectedTripType, sortBy]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleAddImage = () => {
    if (!formImageUrl.trim()) return;
    if (formImages.length >= 3) {
      toast.warning("Maximum 3 trip photos allowed.");
      return;
    }
    setFormImages([...formImages, formImageUrl.trim()]);
    setFormImageUrl("");
  };

  const handleRemoveImage = (index) => {
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  const handleHelpfulClick = async (reviewId) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/reviews/${reviewId}/helpful`,
        {},
        token ? { headers: { "x-auth-token": token } } : {}
      );
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, helpfulCount: res.data.helpfulCount } : r
        )
      );
      toast.success("Thank you for your feedback!", "Review Marked Helpful");
    } catch (err) {
      console.warn("Helpful vote error:", err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.warning("Please sign in to publish your verified review.", "Sign In Required");
      navigate("/login");
      return;
    }

    if (!formComment || formComment.trim().length < 10) {
      toast.warning("Please write a detailed review story (at least 10 characters).", "Details Required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        vehicleId: formVehicleId || null,
        rating: Number(formRating),
        title: formTitle.trim() || `${formTripType} Experience`,
        comment: formComment.trim(),
        subRatings: {
          cleanliness: Number(formCleanliness),
          communication: Number(formCommunication),
          valueForMoney: Number(formValue),
          vehicleCondition: Number(formCondition),
        },
        tripType: formTripType,
        recommended: formRecommended,
        images: formImages,
      };

      await axios.post(`${API_URL}/api/reviews`, payload, {
        headers: { "x-auth-token": token },
      });

      toast.success("Your review has been verified and published to the community!", "Review Published");
      setIsModalOpen(false);
      // Reset form
      setFormTitle("");
      setFormComment("");
      setFormVehicleId("");
      setFormRating(5);
      setFormImages([]);
      // Reload reviews
      fetchReviews();
    } catch (err) {
      console.error("Submit review error:", err);
      toast.error(err.response?.data?.msg || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reviews-page">
      <PageHero
        badge="Customer reviews"
        title="What renters say about"
        highlight="Yamu Car Rentals"
        subtitle="Read honest experiences from people who rented through Yamu, or share your own trip."
        actions={
          <>
            <button
              type="button"
              className="y-btn y-btn-white"
              onClick={() => {
                if (!token) {
                  toast.info("Please log in to submit a review.");
                  navigate("/login?redirect=/reviews");
                } else {
                  setIsModalOpen(true);
                }
              }}
            >
              <Plus size={18} /> Write a review
            </button>
            <a href="#reviews-feed" className="y-btn y-btn-ghost-light">
              Read all reviews ({stats.totalReviews})
            </a>
          </>
        }
      >
        <div className="y-fleet-stats">
          <span>
            <Star size={16} fill="#fde68a" color="#fde68a" />
            <strong>{stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : "—"}</strong>
            {stats.totalReviews > 0 ? "average rating" : "No reviews yet"}
          </span>
          <span><strong>{stats.totalReviews}</strong> reviews</span>
          {stats.totalReviews > 0 && <span><strong>{stats.recommendRate}%</strong> would recommend</span>}
        </div>
      </PageHero>

      {/* 2. Rating Breakdown & Detailed Category Metrics */}
      <section className="container score-breakdown-section">
        <div className="breakdown-card">
          <div className="breakdown-col star-bars-col">
            <h3>Rating Breakdown</h3>
            <p className="subtext">Based on {stats.totalReviews} verified community ratings</p>

            <div className="star-bars-list">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats.distribution[stars] || 0;
                const percentage =
                  stats.totalReviews > 0
                    ? Math.round((count / stats.totalReviews) * 100)
                    : 0;
                return (
                  <div
                    key={stars}
                    className={`star-bar-row ${selectedRating === String(stars) ? "active-filter" : ""}`}
                    onClick={() =>
                      setSelectedRating(selectedRating === String(stars) ? "all" : String(stars))
                    }
                    title={`Click to filter by ${stars} star reviews`}
                  >
                    <div className="star-label">
                      <span>{stars}</span>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="count-label">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="breakdown-col subratings-col">
            <h3>Quality & Service Scores</h3>
            <p className="subtext">Averaged across cleanliness, host support & vehicle performance</p>

            <div className="subratings-grid">
              <div className="subrating-card">
                <div className="subrating-header">
                  <span className="subrating-title">Cleanliness & Sanitization</span>
                  <span className="subrating-val">{stats.subRatingAverages?.cleanliness || 5.0} ★</span>
                </div>
                <div className="sub-bar-track">
                  <div
                    className="sub-bar-fill"
                    style={{
                      width: `${((stats.subRatingAverages?.cleanliness || 5) / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="subrating-card">
                <div className="subrating-header">
                  <span className="subrating-title">Host Communication</span>
                  <span className="subrating-val">{stats.subRatingAverages?.communication || 5.0} ★</span>
                </div>
                <div className="sub-bar-track">
                  <div
                    className="sub-bar-fill"
                    style={{
                      width: `${((stats.subRatingAverages?.communication || 5) / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="subrating-card">
                <div className="subrating-header">
                  <span className="subrating-title">Value for Money</span>
                  <span className="subrating-val">{stats.subRatingAverages?.valueForMoney || 5.0} ★</span>
                </div>
                <div className="sub-bar-track">
                  <div
                    className="sub-bar-fill"
                    style={{
                      width: `${((stats.subRatingAverages?.valueForMoney || 5) / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="subrating-card">
                <div className="subrating-header">
                  <span className="subrating-title">Vehicle Mechanical Condition</span>
                  <span className="subrating-val">{stats.subRatingAverages?.vehicleCondition || 5.0} ★</span>
                </div>
                <div className="sub-bar-track">
                  <div
                    className="sub-bar-fill"
                    style={{
                      width: `${((stats.subRatingAverages?.vehicleCondition || 5) / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Filter & Control Center */}
      <section className="container reviews-filter-section" id="reviews-feed">
        <div className="filter-controls-card">
          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search reviews by model, destination, keywords (e.g., 'Axio', 'Ella', 'Safari')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery("");
                  fetchReviews();
                }}
              >
                <X size={16} />
              </button>
            )}
            <button type="submit" className="search-submit-btn">
              Search
            </button>
          </form>

          {/* Category Tabs */}
          <div className="filter-tags-row">
            <div className="category-chips">
              {VEHICLE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`chip-btn ${selectedCategory === cat.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="filter-dropdowns">
              <select
                value={selectedTripType}
                onChange={(e) => setSelectedTripType(e.target.value)}
                className="custom-select"
              >
                <option value="all">All Trip Types</option>
                {TRIP_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="custom-select"
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Reviews Grid & Feed */}
      <section className="container reviews-feed-section">
        {loading ? (
          <div className="reviews-loading-state">
            <div className="spinner" />
            <p>Loading genuine traveler reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty-state">
            <MessageSquare size={48} className="empty-icon" />
            <h3>No Reviews Found</h3>
            <p>
              No reviews match your selected filter criteria. Try selecting another
              category or be the first to leave a review!
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedRating("all");
                setSelectedTripType("all");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((rev) => (
              <div key={rev._id} className="review-card-premium">
                {/* Header: User & Rating */}
                <div className="card-top-row">
                  <div className="user-profile-meta">
                    <div className="user-avatar-circle">
                      {resolveReviewerAvatar(rev) ? (
                        <img
                          src={resolveReviewerAvatar(rev)}
                          alt={rev.user?.name || "User"}
                          className="user-avatar-img"
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.parentElement) {
                              e.target.parentElement.innerText = rev.user?.name ? rev.user.name[0].toUpperCase() : "U";
                            }
                          }}
                        />
                      ) : (
                        rev.user?.name ? rev.user.name[0].toUpperCase() : "U"
                      )}
                    </div>
                    <div className="user-text-info">
                      <div className="user-name-badge">
                        <h4>{rev.user?.name || "Verified Traveler"}</h4>
                        {rev.isVerifiedTrip && (
                          <span className="verified-badge" title="Verified Car Rental">
                            <CheckCircle2 size={13} />
                            <span>Verified Renter</span>
                          </span>
                        )}
                      </div>
                      <div className="trip-type-tag">
                        <Calendar size={12} />
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                        {!isFoundationalThree(rev.user?.name) && Boolean(rev.location || rev.user?.location) && (
                          <>
                            <span className="dot">•</span>
                            <span className="review-loc-pill">
                              <MapPin size={11} /> {rev.location || rev.user?.location}
                            </span>
                          </>
                        )}
                        <span className="dot">•</span>
                        <span>{rev.tripType || "Road Trip"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="stars-cluster">
                    <div className="stars-row">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rev.rating ? "#f59e0b" : "#e2e8f0"}
                          color={i < rev.rating ? "#f59e0b" : "#cbd5e1"}
                        />
                      ))}
                    </div>
                    <span className="rating-digit">{Number(rev.rating).toFixed(1)}</span>
                  </div>
                </div>

                {/* Attached Vehicle Preview Card if available */}
                {rev.vehicle && (
                  <Link
                    to={`/vehicle/${rev.vehicle._id}`}
                    className="review-vehicle-pill"
                  >
                    <img
                      src={formatVehicleImageUrl(
                        rev.vehicle.images,
                        rev.vehicle.vehicleType
                      )}
                      alt={`${rev.vehicle.brand} ${rev.vehicle.model}`}
                      onError={(e) => handleImageError(e, formatVehicleImageUrl(null, rev.vehicle.vehicleType))}
                      className="pill-car-thumb"
                    />
                    <div className="pill-car-info">
                      <span className="pill-title">
                        {rev.vehicle.brand} {rev.vehicle.model} ({rev.vehicle.year})
                      </span>
                      <span className="pill-subtitle">
                        {rev.vehicle.company?.companyName
                          ? `${rev.vehicle.company.companyName} Fleet`
                          : "Self-Drive Rental"}
                      </span>
                    </div>
                    <ArrowRight size={14} className="pill-arrow" />
                  </Link>
                )}

                {/* Review Title & Body */}
                <div className="review-body">
                  {rev.title && <h5 className="review-title">{rev.title}</h5>}
                  <p className="review-text">{rev.comment}</p>
                </div>

                {/* Sub-ratings Badges */}
                {rev.subRatings && (
                  <div className="sub-ratings-tags">
                    <span className="mini-tag">
                      Cleanliness: <strong>{rev.subRatings.cleanliness || rev.rating}★</strong>
                    </span>
                    <span className="mini-tag">
                      Host: <strong>{rev.subRatings.communication || rev.rating}★</strong>
                    </span>
                    <span className="mini-tag">
                      Value: <strong>{rev.subRatings.valueForMoney || rev.rating}★</strong>
                    </span>
                  </div>
                )}

                {/* Trip Images if uploaded */}
                {rev.images && rev.images.length > 0 && (
                  <div className="trip-photos-strip">
                    {rev.images.map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt="Trip Photo"
                        className="trip-photo-thumb"
                      />
                    ))}
                  </div>
                )}

                {/* Card Footer: Helpful button & recommendation */}
                <div className="card-footer-row">
                  {rev.recommended && (
                    <div className="recommend-flag">
                      <Check size={14} className="check-icon" />
                      <span>Recommends this rental</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="helpful-btn"
                    onClick={() => handleHelpfulClick(rev._id)}
                    title="Mark this review as helpful"
                  >
                    <ThumbsUp size={14} />
                    <span>Helpful ({rev.helpfulCount || 0})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Interactive Write a Review Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content review-builder-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="header-icon-wrap">
                <Sparkles size={20} />
              </div>
              <div>
                <h3>Submit Your Travel Experience</h3>
                <p>Help future travelers choose the best vehicles and verified hosts.</p>
              </div>
              <button
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="modal-form">
              {/* Vehicle Selector */}
              <div className="form-group">
                <label>Select Rented Vehicle (Optional)</label>
                <select
                  value={formVehicleId}
                  onChange={(e) => setFormVehicleId(e.target.value)}
                  className="modal-input"
                >
                  <option value="">General Platform Experience / Other Car</option>
                  {vehiclesList.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.brand} {v.model} ({v.year}) - {v.location || "Sri Lanka"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating Pickers */}
              <div className="form-group rating-picker-box">
                <label>Overall Experience Rating</label>
                <div className="interactive-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className="star-button"
                      onClick={() => setFormRating(star)}
                    >
                      <Star
                        size={28}
                        fill={star <= formRating ? "#f59e0b" : "transparent"}
                        color={star <= formRating ? "#f59e0b" : "#cbd5e1"}
                      />
                    </button>
                  ))}
                  <span className="rating-tag-label">
                    {formRating === 5
                      ? "Outstanding (5.0)"
                      : formRating === 4
                      ? "Very Good (4.0)"
                      : formRating === 3
                      ? "Average (3.0)"
                      : formRating === 2
                      ? "Below Average (2.0)"
                      : "Poor (1.0)"}
                  </span>
                </div>
              </div>

              {/* Sub-rating Criteria */}
              <div className="sub-ratings-form-row">
                <div className="sub-rate-item">
                  <span>Cleanliness</span>
                  <div className="mini-star-picker">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className="star-click"
                        fill={s <= formCleanliness ? "#f59e0b" : "#e2e8f0"}
                        color={s <= formCleanliness ? "#f59e0b" : "#cbd5e1"}
                        onClick={() => setFormCleanliness(s)}
                      />
                    ))}
                  </div>
                </div>

                <div className="sub-rate-item">
                  <span>Host Support</span>
                  <div className="mini-star-picker">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className="star-click"
                        fill={s <= formCommunication ? "#f59e0b" : "#e2e8f0"}
                        color={s <= formCommunication ? "#f59e0b" : "#cbd5e1"}
                        onClick={() => setFormCommunication(s)}
                      />
                    ))}
                  </div>
                </div>

                <div className="sub-rate-item">
                  <span>Value for Money</span>
                  <div className="mini-star-picker">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className="star-click"
                        fill={s <= formValue ? "#f59e0b" : "#e2e8f0"}
                        color={s <= formValue ? "#f59e0b" : "#cbd5e1"}
                        onClick={() => setFormValue(s)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Trip Category */}
              <div className="form-group">
                <label>Trip Category</label>
                <select
                  value={formTripType}
                  onChange={(e) => setFormTripType(e.target.value)}
                  className="modal-input"
                >
                  {TRIP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Review Title */}
              <div className="form-group">
                <label>Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Unforgettable family coastal road trip to Mirissa!"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="modal-input"
                  required
                />
              </div>

              {/* Detailed Review Story */}
              <div className="form-group">
                <label>Your Review Story</label>
                <textarea
                  rows={4}
                  placeholder="Share details about the car's condition, driving experience, host responsiveness, pickup/drop-off ease..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="modal-textarea"
                  required
                />
              </div>

              {/* Photo Attachment */}
              <div className="form-group">
                <label>Add Trip Photo URL (Optional)</label>
                <div className="photo-input-row">
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="modal-input"
                  />
                  <button
                    type="button"
                    className="btn-add-photo"
                    onClick={handleAddImage}
                  >
                    Add
                  </button>
                </div>
                {formImages.length > 0 && (
                  <div className="form-images-preview">
                    {formImages.map((img, i) => (
                      <div key={i} className="preview-item">
                        <img src={img} alt="Preview" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommend Toggle */}
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formRecommended}
                  onChange={(e) => setFormRecommended(e.target.checked)}
                />
                <span>I recommend Yamu Car Rentals to other drivers</span>
              </label>

              {/* Submit Buttons */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Publishing..." : "Publish Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Stylesheet */}
      <style>{`
        .y-fleet-stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.6rem; margin-top: 0.5rem; }
        .y-fleet-stats span {
          display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.9rem;
          border-radius: 999px; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.3);
          color: #fff; font-size: 0.85rem;
        }

        .reviews-page {
          min-height: 100vh;
          background: #f8fafc;
          padding-bottom: 6rem;
          font-family: var(--font-body, 'Plus Jakarta Sans', sans-serif);
        }

        /* Hero Section */
        .reviews-hero {
          position: relative;
          padding: 8.5rem 0 4.5rem;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          color: white;
          overflow: hidden;
          text-align: center;
        }

        .hero-backdrop-glow {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 350px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, rgba(249, 115, 22, 0) 70%);
          filter: blur(60px);
          pointer-events: none;
        }

        .reviews-hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 900px;
        }

        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(249, 115, 22, 0.15);
          border: 1px solid rgba(249, 115, 22, 0.3);
          border-radius: 999px;
          color: #fb923c;
          font-size: 0.88rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
        }

        .hero-title {
          font-size: clamp(2.2rem, 4.5vw, 3.4rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          color: #94a3b8;
          font-size: 1.08rem;
          line-height: 1.6;
          max-width: 620px;
          margin-bottom: 2rem;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 3.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .write-review-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          padding: 0.85rem 1.8rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.98rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(249, 115, 22, 0.35);
          transition: all 0.25s ease;
        }

        .write-review-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(249, 115, 22, 0.45);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.85rem 1.8rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.98rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.18);
        }

        /* Metrics Strip */
        .hero-metrics-strip {
          display: flex;
          align-items: center;
          justify-content: space-around;
          width: 100%;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem 2rem;
        }

        .metric-box {
          text-align: center;
        }

        .metric-score {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 6px;
          font-size: 1.8rem;
          font-weight: 900;
          color: white;
        }

        .metric-score small {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .metric-number {
          font-size: 1.8rem;
          font-weight: 900;
          color: white;
        }

        .metric-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #38bdf8;
          font-weight: 800;
          font-size: 1.15rem;
        }

        .metric-label {
          margin-top: 4px;
          font-size: 0.82rem;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .metric-divider {
          width: 1px;
          height: 44px;
          background: rgba(255, 255, 255, 0.12);
        }

        /* Breakdown Card */
        .score-breakdown-section {
          margin-top: -2rem;
          position: relative;
          z-index: 10;
        }

        .breakdown-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 2.2rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.04);
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 3rem;
        }

        .breakdown-col h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .breakdown-col .subtext {
          font-size: 0.88rem;
          color: #64748b;
          margin-bottom: 1.5rem;
        }

        .star-bars-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .star-bar-row {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: background 0.15s;
        }

        .star-bar-row:hover, .star-bar-row.active-filter {
          background: #f1f5f9;
        }

        .star-label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          width: 32px;
          font-size: 0.9rem;
          font-weight: 700;
          color: #334155;
          line-height: 1;
        }

        .star-label svg {
          display: block;
          flex-shrink: 0;
        }

        .bar-track {
          flex: 1;
          height: 8px;
          background: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: #f59e0b;
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        .count-label {
          width: 24px;
          text-align: right;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 600;
        }

        .subratings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
        }

        .subrating-card {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 1rem;
        }

        .subrating-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .subrating-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
        }

        .subrating-val {
          font-size: 0.88rem;
          font-weight: 800;
          color: #f59e0b;
        }

        .sub-bar-track {
          height: 6px;
          background: #e2e8f0;
          border-radius: 999px;
          overflow: hidden;
        }

        .sub-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #f97316, #f59e0b);
          border-radius: 999px;
        }

        /* Filter Controls */
        .reviews-filter-section {
          margin-top: 2.5rem;
          margin-bottom: 2rem;
        }

        .filter-controls-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.4rem 0.75rem;
          transition: border-color 0.2s;
        }

        .search-bar:focus-within {
          border-color: #f97316;
          background: white;
        }

        .search-icon {
          color: #94a3b8;
        }

        .search-bar input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.95rem;
          color: #0f172a;
          outline: none;
        }

        .clear-search-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .search-submit-btn {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0.45rem 1.2rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
        }

        .filter-tags-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .category-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .chip-btn {
          background: #f1f5f9;
          border: 1px solid transparent;
          color: #475569;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chip-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .chip-btn.active {
          background: #f97316;
          color: white;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
        }

        .filter-dropdowns {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          min-width: 0;
        }
        .filter-dropdowns .custom-select { flex: 1 1 140px; min-width: 0; max-width: 100%; }

        .custom-select {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.45rem 1rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
          outline: none;
          cursor: pointer;
        }

        /* Reviews Grid */
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.5rem;
        }

        .review-card-premium {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 1.5rem;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          transition: transform 0.25s, box-shadow 0.25s;
          overflow: hidden;
          box-sizing: border-box;
          max-width: 100%;
        }

        .review-card-premium:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.07);
          border-color: #cbd5e1;
        }

        .card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          flex-wrap: wrap;
          width: 100%;
          box-sizing: border-box;
        }

        .user-profile-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1 1 180px;
          max-width: 100%;
        }

        .user-avatar-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
          box-shadow: 0 4px 10px rgba(249, 115, 22, 0.2);
          overflow: hidden;
          flex-shrink: 0;
        }

        .user-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .user-text-info {
          min-width: 0;
          flex: 1;
        }

        .review-loc-pill {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #f97316;
          font-weight: 600;
        }

        .user-name-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .user-name-badge h4 {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #10b981;
          font-size: 0.75rem;
          font-weight: 700;
          margin-top: 2px;
        }

        .trip-type-tag {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #64748b;
          font-size: 0.76rem;
          font-weight: 500;
          margin-top: 2px;
          flex-wrap: wrap;
        }

        .trip-type-tag .dot {
          color: #cbd5e1;
        }

        .stars-cluster {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          padding: 4px 9px;
          border-radius: 999px;
          flex-shrink: 0;
          margin-left: auto;
          box-sizing: border-box;
        }

        .stars-row {
          display: inline-flex;
          align-items: center;
          gap: 2.5px;
          line-height: 1;
        }

        .stars-row svg {
          display: block;
          flex-shrink: 0;
        }

        .rating-digit {
          font-size: 0.82rem;
          font-weight: 800;
          color: #d97706;
          line-height: 1;
        }

        .review-vehicle-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 6px 10px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .review-vehicle-pill:hover {
          background: #f1f5f9;
          border-color: #f97316;
        }

        .pill-car-thumb {
          width: 42px;
          height: 32px;
          border-radius: 6px;
          object-fit: cover;
        }

        .pill-car-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .pill-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
        }

        .pill-subtitle {
          font-size: 0.72rem;
          color: #64748b;
        }

        .pill-arrow {
          color: #94a3b8;
        }

        .review-body {
          flex: 1;
        }

        .review-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.35;
          margin-bottom: 0.45rem;
        }

        .review-text {
          color: #475569;
          font-size: 0.92rem;
          line-height: 1.6;
          margin: 0;
        }

        .sub-ratings-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mini-tag {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 0.75rem;
          color: #475569;
        }

        .mini-tag strong {
          color: #f59e0b;
        }

        .trip-photos-strip {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .trip-photo-thumb {
          width: 80px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e2e8f0;
        }

        .card-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.8rem;
          border-top: 1px solid #f1f5f9;
        }

        .recommend-flag {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #059669;
        }

        .helpful-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .helpful-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* Loading & Empty States */
        .reviews-loading-state, .reviews-empty-state {
          text-align: center;
          padding: 5rem 1rem;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        .spinner {
          width: 44px;
          height: 44px;
          border: 4px solid #f1f5f9;
          border-top-color: #f97316;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-icon {
          color: #cbd5e1;
          margin-bottom: 1rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .modal-content.review-builder-modal {
          background: white;
          width: min(640px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 1rem;
        }

        .header-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(249, 115, 22, 0.1);
          color: #f97316;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .modal-header p {
          font-size: 0.85rem;
          color: #64748b;
          margin: 2px 0 0;
        }

        .close-modal-btn {
          margin-left: auto;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .form-group label {
          display: block;
          font-size: 0.88rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.4rem;
        }

        .modal-input, .modal-textarea {
          width: 100%;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          padding: 0.7rem 0.9rem;
          font-family: inherit;
          font-size: 0.92rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .modal-input:focus, .modal-textarea:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .interactive-stars {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .star-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          line-height: 1;
          transition: transform 0.15s;
        }

        .star-button svg {
          display: block;
        }

        .star-button:hover {
          transform: scale(1.2);
        }

        .rating-tag-label {
          margin-left: 12px;
          font-size: 0.9rem;
          font-weight: 700;
          color: #f97316;
        }

        .sub-ratings-form-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px;
          border-radius: 12px;
        }

        .sub-rate-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
        }

        .mini-star-picker {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          cursor: pointer;
          line-height: 1;
        }

        .mini-star-picker svg {
          display: block;
        }

        .star-click:hover {
          transform: scale(1.15);
        }

        .photo-input-row {
          display: flex;
          gap: 8px;
        }

        .btn-add-photo {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .form-images-preview {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .preview-item {
          position: relative;
          width: 60px;
          height: 50px;
        }

        .preview-item img {
          width: 100%;
          height: 100%;
          border-radius: 6px;
          object-fit: cover;
        }

        .preview-item button {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 1rem;
        }

        .btn-cancel {
          background: #f1f5f9;
          border: none;
          padding: 0.75rem 1.4rem;
          border-radius: 10px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
        }

        @media (max-width: 800px) {
          .breakdown-card {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .hero-metrics-strip {
            flex-direction: column;
            gap: 1.25rem;
          }
          .metric-divider {
            display: none;
          }
          .sub-ratings-form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewsPortal;
