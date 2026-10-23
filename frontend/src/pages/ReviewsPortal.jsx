import PageHero from "../components/PageHero";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Filter,
  Search,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  X,
  Send,
  ArrowRight,
  User,
  Check,
  Upload,
  CornerDownRight,
  Loader2,
  Share2,
  Eye,
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedTripType, setSelectedTripType] = useState("all");
  const [onlyMyReviews, setOnlyMyReviews] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Lightbox State for Trip Photos
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMatching, setTotalMatching] = useState(0);
  const REVIEWS_PER_PAGE = 9;

  // Expanded review text tracking (Read More)
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  // Modal / Submission Wizard State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formVehicleId, setFormVehicleId] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
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

  // Debounced search ref
  const searchTimerRef = useRef(null);

  // Fetch Reviews & Stats (with pagination)
  const fetchReviews = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("vehicleType", selectedCategory);
      if (selectedRating !== "all") params.append("rating", selectedRating);
      if (selectedTripType !== "all") params.append("tripType", selectedTripType);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (onlyMyReviews && user?._id) params.append("userId", user._id);
      if (sortBy) params.append("sort", sortBy);
      params.append("page", page);
      params.append("limit", REVIEWS_PER_PAGE);

      const res = await axios.get(`${API_URL}/api/reviews?${params.toString()}`, {
        headers: token
          ? { "x-auth-token": token, Authorization: `Bearer ${token}` }
          : {},
      });
      const newReviews = res.data.reviews || [];

      if (append) {
        setReviews((prev) => [...prev, ...newReviews]);
      } else {
        setReviews(newReviews);
      }

      setCurrentPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);
      setTotalMatching(res.data.totalMatching || 0);

      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
      toast.error("Could not load reviews. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchReviews(1);
  }, [selectedCategory, selectedRating, selectedTripType, sortBy, onlyMyReviews]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Debounced search — auto-search as user types
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchReviews(1);
    }, 350);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  // Lightbox keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightbox.isOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") handleNextLightbox();
      if (e.key === "ArrowLeft") handlePrevLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox.isOpen, lightbox.images.length]);

  const openLightbox = (images, index = 0) => {
    if (!images || images.length === 0) return;
    setLightbox({
      isOpen: true,
      images,
      currentIndex: index,
    });
  };

  const closeLightbox = () => {
    setLightbox((prev) => ({ ...prev, isOpen: false }));
  };

  const handleNextLightbox = (e) => {
    if (e) e.stopPropagation();
    setLightbox((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  };

  const handlePrevLightbox = (e) => {
    if (e) e.stopPropagation();
    setLightbox((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedRating !== "all" ||
    selectedTripType !== "all" ||
    searchQuery.trim() !== "" ||
    onlyMyReviews;

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedRating("all");
    setSelectedTripType("all");
    setSearchQuery("");
    setOnlyMyReviews(false);
    setSortBy("newest");
  };

  const getSentimentInfo = (rating) => {
    const r = Number(rating);
    if (r >= 5) return { label: "Exceptional", emoji: "⭐", cls: "sentiment-exceptional" };
    if (r >= 4) return { label: "Very Good", emoji: "✨", cls: "sentiment-great" };
    if (r >= 3) return { label: "Good", emoji: "👍", cls: "sentiment-good" };
    if (r >= 2) return { label: "Fair", emoji: "⚠️", cls: "sentiment-fair" };
    return { label: "Disappointing", emoji: "👎", cls: "sentiment-poor" };
  };

  const handleShareReview = async (rev) => {
    const url = `${window.location.origin}/reviews#review-${rev._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CarRent.lk Review: ${rev.title || "Traveler Review"}`,
          text: `Check out this ${rev.rating}-star review on CarRent.lk!`,
          url,
        });
        return;
      } catch (err) {
        // user dismissed or native share unsupported
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Review link copied to clipboard!");
    } catch (err) {
      toast.info("Could not copy link to clipboard.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (formImages.length >= 3) {
      toast.warning("Maximum 3 trip photos allowed.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setFormImages((prev) => [...prev, reader.result]);
        toast.success("Photo attached successfully!");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchReviews(nextPage, true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReviews(1);
  };

  const toggleExpandReview = (reviewId) => {
    setExpandedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
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
    if (!token) {
      toast.info("Please log in to vote on reviews.", "Login Required");
      navigate("/login?redirect=/reviews");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/reviews/${reviewId}/helpful`,
        {},
        {
          headers: {
            "x-auth-token": token,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                helpfulCount: res.data.helpfulCount,
                hasVoted: res.data.hasVoted,
              }
            : r
        )
      );
      if (res.data.hasVoted) {
        toast.success("Thank you for your feedback!", "Review Marked Helpful");
      } else {
        toast.info("Vote removed.");
      }
    } catch (err) {
      console.warn("Helpful vote error:", err);
      if (err.response?.status === 401) {
        toast.info("Please log in to vote on reviews.", "Login Required");
        navigate("/login?redirect=/reviews");
      } else {
        toast.error("Could not record vote. Please try again.");
      }
    }
  };

  // Wizard Modal helpers
  const openReviewModal = () => {
    if (!token) {
      toast.info("Please log in to submit a review.");
      navigate("/login?redirect=/reviews");
      return;
    }
    setWizardStep(1);
    setIsModalOpen(true);
  };

  const formHasContent = formTitle || formComment || formImages.length > 0 || formVehicleId;

  const closeReviewModal = () => {
    if (formHasContent) {
      if (!window.confirm("You have unsaved changes. Discard your review?")) return;
    }
    setIsModalOpen(false);
    setWizardStep(1);
  };

  const getRatingLabel = (r) => {
    if (r >= 5) return "Outstanding";
    if (r >= 4) return "Very Good";
    if (r >= 3) return "Average";
    if (r >= 2) return "Below Average";
    return "Poor";
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
      setWizardStep(1);
      // Reset form
      setFormTitle("");
      setFormComment("");
      setFormVehicleId("");
      setFormRating(5);
      setFormHoverRating(0);
      setFormCleanliness(5);
      setFormCommunication(5);
      setFormValue(5);
      setFormCondition(5);
      setFormTripType(TRIP_TYPES[0]);
      setFormRecommended(true);
      setFormImages([]);
      setFormImageUrl("");
      // Reload reviews from page 1
      setCurrentPage(1);
      fetchReviews(1);
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
              onClick={openReviewModal}
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
            <div className="breakdown-header-row">
              <div>
                <h3>Rating Breakdown</h3>
                <p className="subtext">Based on {stats.totalReviews} verified community ratings</p>
              </div>
              {selectedRating !== "all" && (
                <button
                  type="button"
                  className="clear-rating-pill"
                  onClick={() => setSelectedRating("all")}
                  title="Clear star filter"
                >
                  Clear {selectedRating}★ filter <X size={12} />
                </button>
              )}
            </div>

            {selectedRating !== "all" && (
              <div className="rating-filter-active-alert">
                <span>Filtering by <strong>{selectedRating} Star</strong> reviews only</span>
              </div>
            )}

            <div className="star-bars-list">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats.distribution[stars] || 0;
                const percentage =
                  stats.totalReviews > 0
                    ? Math.round((count / stats.totalReviews) * 100)
                    : 0;
                const isActive = selectedRating === String(stars);
                return (
                  <div
                    key={stars}
                    className={`star-bar-row ${isActive ? "active-filter" : ""}`}
                    onClick={() =>
                      setSelectedRating(isActive ? "all" : String(stars))
                    }
                    title={isActive ? "Click to clear filter" : `Click to filter by ${stars} star reviews`}
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
                    {isActive && <span className="active-dot-indicator">✓</span>}
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

          {/* Category Tabs & Controls */}
          <div className="filter-tags-row">
            <div className="category-chips">
              {VEHICLE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`chip-btn ${selectedCategory === cat.id && !onlyMyReviews ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setOnlyMyReviews(false);
                  }}
                >
                  {cat.label}
                </button>
              ))}

              {token && user && (
                <button
                  type="button"
                  className={`chip-btn my-reviews-chip ${onlyMyReviews ? "active" : ""}`}
                  onClick={() => setOnlyMyReviews(!onlyMyReviews)}
                  title="Filter to reviews you have written"
                >
                  <User size={13} /> My Reviews
                </button>
              )}
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

          {/* Active Filter Chips Summary Bar */}
          {hasActiveFilters && (
            <div className="active-filters-bar">
              <span className="active-filters-title">
                <Filter size={13} /> Active Filters:
              </span>
              <div className="active-chips-wrap">
                {selectedCategory !== "all" && (
                  <span className="active-filter-badge">
                    {VEHICLE_CATEGORIES.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                    <button type="button" onClick={() => setSelectedCategory("all")} title="Remove category filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedRating !== "all" && (
                  <span className="active-filter-badge">
                    {selectedRating} Stars
                    <button type="button" onClick={() => setSelectedRating("all")} title="Remove rating filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedTripType !== "all" && (
                  <span className="active-filter-badge">
                    {selectedTripType}
                    <button type="button" onClick={() => setSelectedTripType("all")} title="Remove trip type filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {searchQuery.trim() !== "" && (
                  <span className="active-filter-badge">
                    &ldquo;{searchQuery}&rdquo;
                    <button type="button" onClick={() => setSearchQuery("")} title="Clear search">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {onlyMyReviews && (
                  <span className="active-filter-badge my-reviews-badge">
                    My Reviews
                    <button type="button" onClick={() => setOnlyMyReviews(false)} title="Show all reviewers">
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button type="button" className="clear-all-btn" onClick={clearAllFilters}>
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Reviews Grid & Feed */}
      <section className="container reviews-feed-section">
        {loading ? (
          <div className="reviews-grid skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((sk) => (
              <div key={sk} className="review-card-premium skeleton-card">
                <div className="skeleton-header">
                  <div className="skeleton-avatar shimmer" />
                  <div className="skeleton-user-meta">
                    <div className="skeleton-line shimmer short" />
                    <div className="skeleton-line shimmer extra-short" />
                  </div>
                  <div className="skeleton-stars shimmer" />
                </div>
                <div className="skeleton-vehicle shimmer" />
                <div className="skeleton-body">
                  <div className="skeleton-line shimmer title" />
                  <div className="skeleton-line shimmer" />
                  <div className="skeleton-line shimmer medium" />
                </div>
                <div className="skeleton-footer">
                  <div className="skeleton-pill shimmer" />
                  <div className="skeleton-pill shimmer" />
                </div>
              </div>
            ))}
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
                        {user && rev.user?._id === user._id && (
                          <span className="your-review-badge" title="You authored this review">
                            Your Review
                          </span>
                        )}
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
                    <div className="stars-cluster-top">
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
                    {(() => {
                      const sent = getSentimentInfo(rev.rating);
                      return (
                        <div className={`sentiment-badge ${sent.cls}`}>
                          <span>{sent.emoji}</span>
                          <span>{sent.label}</span>
                        </div>
                      );
                    })()}
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
                        {rev.vehicle.rentMode === "with-driver"
                          ? "Chauffeur Driven Rental"
                          : "Self-Drive Rental"}
                      </span>
                    </div>
                    <ArrowRight size={14} className="pill-arrow" />
                  </Link>
                )}

                {/* Review Title & Body with Read More */}
                <div className="review-body">
                  {rev.title && <h5 className="review-title">{rev.title}</h5>}
                  {rev.comment && rev.comment.length > 220 && !expandedReviews.has(rev._id) ? (
                    <>
                      <p className="review-text">{rev.comment.slice(0, 220)}...</p>
                      <button
                        type="button"
                        className="read-more-btn"
                        onClick={() => toggleExpandReview(rev._id)}
                      >
                        Read more
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="review-text">{rev.comment}</p>
                      {rev.comment && rev.comment.length > 220 && (
                        <button
                          type="button"
                          className="read-more-btn"
                          onClick={() => toggleExpandReview(rev._id)}
                        >
                          Show less
                        </button>
                      )}
                    </>
                  )}
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

                {/* Trip Images with Lightbox */}
                {rev.images && rev.images.length > 0 && (
                  <div className="trip-photos-strip">
                    {rev.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="trip-photo-wrapper"
                        onClick={() => openLightbox(rev.images, idx)}
                        title="Click to view photo full size"
                      >
                        <img
                          src={imgUrl}
                          alt="Trip Photo"
                          className="trip-photo-thumb"
                        />
                        <div className="photo-zoom-overlay">
                          <Eye size={12} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Host Reply */}
                {rev.hostReply && rev.hostReply.comment && (
                  <div className="host-reply-card">
                    <div className="host-reply-header">
                      <CornerDownRight size={14} className="host-reply-icon" />
                      <span className="host-reply-label">Host Response</span>
                      {rev.hostReply.repliedAt && (
                        <span className="host-reply-date">
                          {new Date(rev.hostReply.repliedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="host-reply-text">{rev.hostReply.comment}</p>
                  </div>
                )}

                {/* Card Footer: Recommendation, Share & Helpful */}
                <div className="card-footer-row">
                  {rev.recommended ? (
                    <div className="recommend-flag">
                      <Check size={14} className="check-icon" />
                      <span>Recommends this rental</span>
                    </div>
                  ) : <div />}

                  <div className="card-actions-group">
                    <button
                      type="button"
                      className="share-review-btn"
                      onClick={() => handleShareReview(rev)}
                      title="Share review"
                    >
                      <Share2 size={13} />
                      <span>Share</span>
                    </button>

                    <button
                      type="button"
                      className={`helpful-btn ${rev.hasVoted ? "helpful-voted" : ""}`}
                      onClick={() => handleHelpfulClick(rev._id)}
                      title={rev.hasVoted ? "Remove your helpful vote" : "Mark this review as helpful"}
                    >
                      <ThumbsUp size={13} />
                      <span>{rev.hasVoted ? "Helpful" : "Helpful"} ({rev.helpfulCount || 0})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Pagination */}
        {!loading && reviews.length > 0 && currentPage < totalPages && (
          <div className="load-more-container">
            <button
              type="button"
              className="load-more-btn"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 size={16} className="spin-icon" /> Loading...
                </>
              ) : (
                <>
                  Load More Reviews
                  <span className="load-more-count">
                    ({reviews.length} of {totalMatching})
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Reviews count summary */}
        {!loading && reviews.length > 0 && currentPage >= totalPages && (
          <div className="reviews-count-summary">
            Showing all {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </div>
        )}
      </section>

      {/* 5. Multi-Step Write a Review Wizard */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeReviewModal}>
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
                <p>Step {wizardStep} of 3 — {wizardStep === 1 ? "Vehicle & Rating" : wizardStep === 2 ? "Quality Scores" : "Your Story"}</p>
              </div>
              <button
                className="close-modal-btn"
                onClick={closeReviewModal}
              >
                <X size={20} />
              </button>
            </div>

            {/* Wizard Progress Bar */}
            <div className="wizard-progress">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`wizard-step-dot ${wizardStep >= step ? "active" : ""} ${wizardStep === step ? "current" : ""}`}
                >
                  <div className="dot-circle">{step}</div>
                  <span className="dot-label">
                    {step === 1 ? "Vehicle" : step === 2 ? "Ratings" : "Review"}
                  </span>
                </div>
              ))}
              <div className="wizard-progress-line">
                <div className="wizard-progress-fill" style={{ width: `${((wizardStep - 1) / 2) * 100}%` }} />
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="modal-form">
              {/* === Step 1: Vehicle & Overall Rating === */}
              {wizardStep === 1 && (
                <>
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

                  <div className="form-group rating-picker-box">
                    <label>Overall Experience Rating</label>
                    <div className="interactive-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className="star-button"
                          onClick={() => setFormRating(star)}
                          onMouseEnter={() => setFormHoverRating(star)}
                          onMouseLeave={() => setFormHoverRating(0)}
                        >
                          <Star
                            size={32}
                            fill={star <= (formHoverRating || formRating) ? "#f59e0b" : "transparent"}
                            color={star <= (formHoverRating || formRating) ? "#f59e0b" : "#cbd5e1"}
                          />
                        </button>
                      ))}
                      <span className="rating-tag-label">
                        {getRatingLabel(formHoverRating || formRating)} ({(formHoverRating || formRating)}.0)
                      </span>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={closeReviewModal}>
                      Cancel
                    </button>
                    <button type="button" className="btn-primary" onClick={() => setWizardStep(2)}>
                      Next: Quality Scores <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              )}

              {/* === Step 2: Sub-Ratings & Trip Type === */}
              {wizardStep === 2 && (
                <>
                  <div className="sub-ratings-form-row">
                    <div className="sub-rate-item">
                      <span>Cleanliness</span>
                      <div className="mini-star-picker">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={18}
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
                            size={18}
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
                            size={18}
                            className="star-click"
                            fill={s <= formValue ? "#f59e0b" : "#e2e8f0"}
                            color={s <= formValue ? "#f59e0b" : "#cbd5e1"}
                            onClick={() => setFormValue(s)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="sub-rate-item">
                      <span>Vehicle Condition</span>
                      <div className="mini-star-picker">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={18}
                            className="star-click"
                            fill={s <= formCondition ? "#f59e0b" : "#e2e8f0"}
                            color={s <= formCondition ? "#f59e0b" : "#cbd5e1"}
                            onClick={() => setFormCondition(s)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

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

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setWizardStep(1)}>
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button type="button" className="btn-primary" onClick={() => setWizardStep(3)}>
                      Next: Write Review <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              )}

              {/* === Step 3: Title, Story, Photos, Recommend, Submit === */}
              {wizardStep === 3 && (
                <>
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

                  <div className="form-group">
                    <label>Your Review Story</label>
                    <textarea
                      rows={5}
                      placeholder="Share details about the car's condition, driving experience, host responsiveness, pickup/drop-off ease..."
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      className="modal-textarea"
                      maxLength={2000}
                      required
                    />
                    <div className="char-counter">
                      <span className={formComment.length < 10 ? "char-warn" : ""}>
                        {formComment.length < 10 ? `${10 - formComment.length} more characters needed` : "\u2713 Minimum met"}
                      </span>
                      <span>{formComment.length}/2000</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Trip Photos (Optional — Max 3)</label>
                    <div className="photo-input-section">
                      <div className="photo-input-row">
                        <input
                          type="url"
                          placeholder="Paste image link (https://...)"
                          value={formImageUrl}
                          onChange={(e) => setFormImageUrl(e.target.value)}
                          className="modal-input"
                        />
                        <button
                          type="button"
                          className="btn-add-photo"
                          onClick={handleAddImage}
                        >
                          <Plus size={14} /> Add URL
                        </button>
                      </div>

                      <div className="photo-divider-or">
                        <span>or upload file</span>
                      </div>

                      <label className="btn-file-picker">
                        <Upload size={14} />
                        <span>Upload Photo from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>

                    {formImages.length > 0 && (
                      <div className="form-images-preview">
                        {formImages.map((img, i) => (
                          <div key={i} className="preview-item">
                            <img src={img} alt="Preview" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(i)}
                              title="Remove photo"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {formImages.length < 3 && (
                      <p className="photo-hint">{3 - formImages.length} photo slot{3 - formImages.length !== 1 ? "s" : ""} remaining</p>
                    )}
                  </div>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formRecommended}
                      onChange={(e) => setFormRecommended(e.target.checked)}
                    />
                    <span>I recommend Yamu Car Rentals to other drivers</span>
                  </label>

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setWizardStep(2)}>
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={submitting || formComment.trim().length < 10}
                    >
                      {submitting ? (
                        <><Loader2 size={16} className="spin-icon" /> Publishing...</>
                      ) : (
                        <><Send size={16} /> Publish Review</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 6. Trip Photo Lightbox Overlay */}
      {lightbox.isOpen && lightbox.images.length > 0 && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={closeLightbox}
              title="Close (Esc)"
            >
              <X size={20} />
            </button>

            {lightbox.images.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn prev"
                onClick={handlePrevLightbox}
                title="Previous Photo"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="lightbox-figure">
              <img
                src={lightbox.images[lightbox.currentIndex]}
                alt={`Trip Photo ${lightbox.currentIndex + 1}`}
                className="lightbox-main-img"
              />
              <div className="lightbox-caption-tag">
                Photo {lightbox.currentIndex + 1} of {lightbox.images.length}
              </div>
            </div>

            {lightbox.images.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn next"
                onClick={handleNextLightbox}
                title="Next Photo"
              >
                <ChevronRight size={24} />
              </button>
            )}
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
            grid-template-columns: 1fr 1fr;
          }
          .reviews-grid {
            grid-template-columns: 1fr;
          }
          .filter-tags-row {
            flex-direction: column;
            align-items: stretch;
          }
          .category-chips {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 4px;
            -webkit-overflow-scrolling: touch;
          }
          .chip-btn {
            white-space: nowrap;
            flex-shrink: 0;
          }
        }

        @media (max-width: 500px) {
          .sub-ratings-form-row {
            grid-template-columns: 1fr;
          }
        }

        /* === Wizard Progress Bar === */
        .wizard-progress {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
          padding: 0 1rem;
          margin-bottom: 1.5rem;
        }

        .wizard-step-dot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          position: relative;
          z-index: 2;
        }

        .dot-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.82rem;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .wizard-step-dot.active .dot-circle {
          background: #f97316;
          color: white;
          border-color: #f97316;
        }

        .wizard-step-dot.current .dot-circle {
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2);
          transform: scale(1.1);
        }

        .dot-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .wizard-step-dot.active .dot-label {
          color: #f97316;
        }

        .wizard-progress-line {
          position: absolute;
          top: 15px;
          left: calc(1rem + 16px);
          right: calc(1rem + 16px);
          height: 3px;
          background: #e2e8f0;
          border-radius: 999px;
          z-index: 1;
        }

        .wizard-progress-fill {
          height: 100%;
          background: #f97316;
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        /* === Read More Button === */
        .read-more-btn {
          background: none;
          border: none;
          color: #f97316;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          padding: 2px 0;
          margin-top: 4px;
          transition: color 0.2s;
        }

        .read-more-btn:hover {
          color: #ea580c;
          text-decoration: underline;
        }

        /* === Host Reply Card === */
        .host-reply-card {
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 10px;
          padding: 0.85rem 1rem;
          margin-top: 2px;
        }

        .host-reply-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 0.4rem;
        }

        .host-reply-icon {
          color: #d97706;
          flex-shrink: 0;
        }

        .host-reply-label {
          font-size: 0.78rem;
          font-weight: 800;
          color: #92400e;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .host-reply-date {
          margin-left: auto;
          font-size: 0.72rem;
          color: #a16207;
        }

        .host-reply-text {
          font-size: 0.88rem;
          color: #78350f;
          line-height: 1.5;
          margin: 0;
        }

        /* === Helpful Voted State === */
        .helpful-btn.helpful-voted {
          background: #dbeafe;
          border-color: #93c5fd;
          color: #1d4ed8;
        }

        .helpful-btn.helpful-voted:hover {
          background: #bfdbfe;
        }

        /* === Load More === */
        .load-more-container {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .load-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          color: #0f172a;
          padding: 0.85rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.25s;
        }

        .load-more-btn:hover:not(:disabled) {
          border-color: #f97316;
          color: #f97316;
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.12);
          transform: translateY(-1px);
        }

        .load-more-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .load-more-count {
          font-weight: 500;
          color: #64748b;
          font-size: 0.85rem;
        }

        .reviews-count-summary {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 600;
        }

        /* === Character Counter === */
        .char-counter {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
          font-size: 0.78rem;
          color: #94a3b8;
        }

        .char-counter .char-warn {
          color: #ef4444;
          font-weight: 600;
        }

        /* === Photo Hint === */
        .photo-hint {
          font-size: 0.78rem;
          color: #94a3b8;
          margin-top: 6px;
          font-style: italic;
        }

        /* === Spin Animation === */
        .spin-icon {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* === Breakdown Header & Active Filter Alert === */
        .breakdown-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .clear-rating-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #fef3c7;
          color: #b45309;
          border: 1px solid #fde68a;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .clear-rating-pill:hover {
          background: #fde68a;
          color: #92400e;
        }
        .rating-filter-active-alert {
          background: #fffbeb;
          border-left: 3px solid #f59e0b;
          padding: 8px 12px;
          border-radius: 0 8px 8px 0;
          font-size: 0.8rem;
          color: #92400e;
          margin-bottom: 0.75rem;
        }
        .active-dot-indicator {
          margin-left: 6px;
          color: #f59e0b;
          font-weight: 800;
          font-size: 0.85rem;
        }

        /* === Active Filters Bar === */
        .active-filters-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
          margin-top: 1rem;
        }
        .active-filters-title {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
        }
        .active-chips-wrap {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          flex: 1;
        }
        .active-filter-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #1e293b;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 999px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .active-filter-badge button {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.15s;
        }
        .active-filter-badge button:hover {
          color: #ef4444;
        }
        .my-reviews-badge {
          background: #eff6ff !important;
          border-color: #bfdbfe !important;
          color: #1d4ed8 !important;
        }
        .clear-all-btn {
          background: none;
          border: none;
          color: #f97316;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          padding: 4px 8px;
          margin-left: auto;
          border-radius: 6px;
          transition: all 0.15s;
        }
        .clear-all-btn:hover {
          background: #fff7ed;
          text-decoration: underline;
        }
        .my-reviews-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        /* === Sentiment Badges & Author Tag === */
        .stars-cluster-top {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: flex-end;
        }
        .sentiment-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          margin-top: 4px;
          align-self: flex-end;
        }
        .sentiment-exceptional {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .sentiment-great {
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
        }
        .sentiment-good {
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        .sentiment-fair {
          background: #fff7ed;
          color: #9a3412;
          border: 1px solid #fed7aa;
        }
        .sentiment-poor {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .your-review-badge {
          display: inline-flex;
          align-items: center;
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
          letter-spacing: 0.02em;
        }

        /* === Trip Photos Lightbox & Hover === */
        .trip-photo-wrapper {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          display: inline-block;
        }
        .photo-zoom-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.38);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .trip-photo-wrapper:hover .photo-zoom-overlay {
          opacity: 1;
        }
        .trip-photo-wrapper:hover .trip-photo-thumb {
          transform: scale(1.06);
        }
        .trip-photo-thumb {
          transition: transform 0.25s ease;
          width: 80px;
          height: 60px;
          object-fit: cover;
          display: block;
        }

        /* === Lightbox Overlay === */
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.2s ease;
        }
        .lightbox-modal {
          position: relative;
          max-width: 90vw;
          max-height: 85vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lightbox-figure {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .lightbox-main-img {
          max-width: 85vw;
          max-height: 75vh;
          border-radius: 12px;
          object-fit: contain;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .lightbox-caption-tag {
          margin-top: 10px;
          color: #e2e8f0;
          font-size: 0.85rem;
          font-weight: 600;
          background: rgba(0, 0, 0, 0.5);
          padding: 4px 12px;
          border-radius: 999px;
        }
        .lightbox-close-btn {
          position: absolute;
          top: -45px;
          right: 0;
          background: rgba(255, 255, 255, 0.18);
          border: none;
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .lightbox-close-btn:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: rotate(90deg);
        }
        .lightbox-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: #fff;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 10;
        }
        .lightbox-nav-btn:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: translateY(-50%) scale(1.08);
        }
        .lightbox-nav-btn.prev {
          left: -55px;
        }
        .lightbox-nav-btn.next {
          right: -55px;
        }
        @media (max-width: 640px) {
          .lightbox-nav-btn.prev { left: 8px; }
          .lightbox-nav-btn.next { right: 8px; }
          .lightbox-close-btn { top: -40px; right: 5px; }
        }

        /* === Share Review Button === */
        .card-actions-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .share-review-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .share-review-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* === Photo Input in Wizard === */
        .photo-input-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .photo-divider-or {
          display: flex;
          align-items: center;
          text-align: center;
          color: #94a3b8;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          margin: 2px 0;
        }
        .photo-divider-or::before,
        .photo-divider-or::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }
        .photo-divider-or span {
          padding: 0 8px;
        }
        .btn-file-picker {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #fff;
          border: 1.5px dashed #cbd5e1;
          color: #475569;
          border-radius: 8px;
          padding: 9px 14px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-file-picker:hover {
          border-color: #f97316;
          color: #ea580c;
          background: #fff7ed;
        }

        /* === Shimmer Skeletons === */
        .skeleton-card {
          pointer-events: none;
        }
        .skeleton-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1rem;
        }
        .skeleton-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .skeleton-user-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .skeleton-stars {
          width: 70px;
          height: 16px;
          border-radius: 4px;
        }
        .skeleton-vehicle {
          height: 48px;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .skeleton-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 1rem;
        }
        .skeleton-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
        }
        .skeleton-pill {
          width: 90px;
          height: 28px;
          border-radius: 6px;
        }
        .skeleton-line {
          height: 12px;
          border-radius: 4px;
          width: 100%;
        }
        .skeleton-line.title {
          height: 16px;
          width: 65%;
          margin-bottom: 4px;
        }
        .skeleton-line.short {
          width: 45%;
        }
        .skeleton-line.extra-short {
          width: 30%;
        }
        .skeleton-line.medium {
          width: 75%;
        }
        .shimmer {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* === Btn Primary Enhancement === */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-cancel {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </div>
  );
};

export default ReviewsPortal;
