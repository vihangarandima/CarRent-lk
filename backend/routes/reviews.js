const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Optional & strict auth middleware
const optionalAuth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    // ignore invalid token in optional auth
  }
  next();
};

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ msg: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// @route   GET /api/reviews
// @desc    Get all reviews with filters, search, sorting & aggregated analytics
router.get("/", async (req, res) => {
  try {
    const {
      vehicleType,
      rating,
      tripType,
      search,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    let filter = {};

    // Filter by specific rating threshold
    if (rating && rating !== "all") {
      const numRating = parseInt(rating, 10);
      if (!isNaN(numRating)) {
        filter.rating = numRating;
      }
    }

    // Filter by trip type
    if (tripType && tripType !== "all") {
      filter.tripType = tripType;
    }

    // Text search in comment, title
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: searchRegex }, { comment: searchRegex }];
    }

    // Determine sorting
    let sortOptions = { createdAt: -1 };
    if (sort === "highest") {
      sortOptions = { rating: -1, createdAt: -1 };
    } else if (sort === "lowest") {
      sortOptions = { rating: 1, createdAt: -1 };
    } else if (sort === "helpful") {
      sortOptions = { helpfulCount: -1, createdAt: -1 };
    }

    // Fetch matching reviews
    let query = Review.find(filter)
      .populate("user", "name email profileImage role")
      .populate({
        path: "vehicle",
        select: "brand model year vehicleType images pricePerDay location company",
        populate: {
          path: "company",
          select: "companyName logo isVerified",
        },
      })
      .sort(sortOptions);

    let allReviews = await query.exec();

    // If filtering by vehicleType, filter on populated vehicle
    if (vehicleType && vehicleType !== "all") {
      allReviews = allReviews.filter(
        (r) => r.vehicle && r.vehicle.vehicleType === vehicleType
      );
    }

    // Calculate aggregated stats across all DB reviews
    const allDbReviews = await Review.find();
    const totalCount = allDbReviews.length;
    let avgRating = 5.0;
    let recommendPercentage = 100;
    let distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let subRatingSums = {
      cleanliness: 0,
      communication: 0,
      valueForMoney: 0,
      vehicleCondition: 0,
    };

    if (totalCount > 0) {
      let ratingSum = 0;
      let recCount = 0;

      allDbReviews.forEach((r) => {
        ratingSum += r.rating || 5;
        const rounded = Math.round(r.rating || 5);
        if (distribution[rounded] !== undefined) {
          distribution[rounded] += 1;
        }
        if (r.recommended !== false) {
          recCount += 1;
        }
        if (r.subRatings) {
          subRatingSums.cleanliness += r.subRatings.cleanliness || r.rating || 5;
          subRatingSums.communication +=
            r.subRatings.communication || r.rating || 5;
          subRatingSums.valueForMoney +=
            r.subRatings.valueForMoney || r.rating || 5;
          subRatingSums.vehicleCondition +=
            r.subRatings.vehicleCondition || r.rating || 5;
        } else {
          subRatingSums.cleanliness += r.rating || 5;
          subRatingSums.communication += r.rating || 5;
          subRatingSums.valueForMoney += r.rating || 5;
          subRatingSums.vehicleCondition += r.rating || 5;
        }
      });

      avgRating = Number((ratingSum / totalCount).toFixed(1));
      recommendPercentage = Math.round((recCount / totalCount) * 100);
    }

    const subRatingAverages = {
      cleanliness: totalCount
        ? Number((subRatingSums.cleanliness / totalCount).toFixed(1))
        : 5.0,
      communication: totalCount
        ? Number((subRatingSums.communication / totalCount).toFixed(1))
        : 5.0,
      valueForMoney: totalCount
        ? Number((subRatingSums.valueForMoney / totalCount).toFixed(1))
        : 5.0,
      vehicleCondition: totalCount
        ? Number((subRatingSums.vehicleCondition / totalCount).toFixed(1))
        : 5.0,
    };

    // Apply pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedReviews = allReviews.slice(startIndex, startIndex + limitNum);

    res.json({
      reviews: paginatedReviews,
      totalMatching: allReviews.length,
      currentPage: pageNum,
      totalPages: Math.ceil(allReviews.length / limitNum) || 1,
      stats: {
        totalReviews: totalCount,
        averageRating: avgRating,
        recommendRate: recommendPercentage,
        distribution,
        subRatingAverages,
      },
    });
  } catch (err) {
    console.error("Error fetching reviews portal data:", err);
    res.status(500).json({ msg: "Server error fetching reviews" });
  }
});

// @route   GET /api/reviews/my
// @desc    Get all reviews created by current user
router.get("/my", auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate("vehicle", "brand model year images vehicleType pricePerDay")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching my reviews:", err);
    res.status(500).json({ msg: "Server error fetching user reviews" });
  }
});

// @route   POST /api/reviews
// @desc    Submit a review with ratings, sub-ratings, photos & trip info
router.post("/", auth, async (req, res) => {
  try {
    const {
      vehicleId,
      rating,
      title,
      comment,
      subRatings,
      tripType,
      recommended,
      images,
    } = req.body;

    if (!rating || !comment || comment.trim().length < 5) {
      return res
        .status(400)
        .json({ msg: "Rating and a detailed comment (at least 5 chars) are required" });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    // Check if vehicle exists if vehicleId is provided
    let vehicle = null;
    if (vehicleId) {
      vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ msg: "Specified vehicle not found" });
      }

      // Check if user already reviewed this vehicle
      const existing = await Review.findOne({
        vehicle: vehicleId,
        user: req.user.id,
      });
      if (existing) {
        return res
          .status(400)
          .json({ msg: "You have already reviewed this vehicle. You can edit your existing review." });
      }
    }

    const validImages = Array.isArray(images)
      ? images.filter((img) => typeof img === "string" && img.trim() !== "")
      : [];

    const newReview = new Review({
      vehicle: vehicleId || null,
      user: req.user.id,
      rating: numRating,
      title: title ? title.trim() : "",
      comment: comment.trim(),
      subRatings: {
        cleanliness: subRatings?.cleanliness ? Number(subRatings.cleanliness) : numRating,
        communication: subRatings?.communication ? Number(subRatings.communication) : numRating,
        valueForMoney: subRatings?.valueForMoney ? Number(subRatings.valueForMoney) : numRating,
        vehicleCondition: subRatings?.vehicleCondition ? Number(subRatings.vehicleCondition) : numRating,
      },
      tripType: tripType || "Road Trip & Leisure",
      recommended: recommended !== false,
      images: validImages,
      isVerifiedTrip: true,
    });

    const savedReview = await newReview.save();

    const populated = await Review.findById(savedReview._id)
      .populate("user", "name email profileImage role")
      .populate({
        path: "vehicle",
        select: "brand model year vehicleType images pricePerDay location company",
        populate: {
          path: "company",
          select: "companyName logo isVerified",
        },
      });

    res.status(201).json(populated);
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ msg: err.message || "Server error creating review" });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful
router.post("/:id/helpful", optionalAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ msg: "Review not found" });
    }

    if (req.user) {
      const userId = req.user.id;
      const alreadyVoted = review.helpfulUsers.some(
        (u) => u.toString() === userId
      );

      if (alreadyVoted) {
        review.helpfulUsers = review.helpfulUsers.filter(
          (u) => u.toString() !== userId
        );
        review.helpfulCount = Math.max(0, review.helpfulCount - 1);
      } else {
        review.helpfulUsers.push(userId);
        review.helpfulCount += 1;
      }
    } else {
      // Guest vote
      review.helpfulCount += 1;
    }

    await review.save();
    res.json({
      helpfulCount: review.helpfulCount,
      hasVoted: req.user
        ? review.helpfulUsers.some((u) => u.toString() === req.user.id)
        : true,
    });
  } catch (err) {
    console.error("Error marking review helpful:", err);
    res.status(500).json({ msg: "Server error marking review as helpful" });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review (owner of review or admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ msg: "Review not found" });

    const currentUser = await User.findById(req.user.id);
    const isAdmin = currentUser && currentUser.role === "admin";
    const isOwner = review.user.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ msg: "Not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ msg: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ msg: "Server error deleting review" });
  }
});

module.exports = router;
