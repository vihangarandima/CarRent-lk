const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Company = require('../models/Company');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Review = require('../models/Review');
const { auth, escapeRegex } = require('../middleware/auth');

// Listings the owner paused or an admin flagged are not shown publicly
// Only approved, live listings are shown publicly (not pending, rejected, paused, flagged or rented)
const PUBLIC_STATUS_FILTER = { status: 'active' };

// @route   GET /api/companies
// @desc    Get all companies with vehicle counts (public)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = { isVerified: true };
        if (search) query.companyName = new RegExp(escapeRegex(search), 'i');

        const companies = await Company.find(query)
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        // Vehicle counts and ratings for all companies in two aggregate queries
        const companyIds = companies.map((c) => c._id);
        const vehicles = await Vehicle.find({ company: { $in: companyIds }, ...PUBLIC_STATUS_FILTER })
            .select('_id company')
            .lean();
        const companyByVehicle = new Map(vehicles.map((v) => [v._id.toString(), v.company.toString()]));
        const reviewStats = await Review.aggregate([
            { $match: { vehicle: { $in: vehicles.map((v) => v._id) } } },
            { $group: { _id: '$vehicle', count: { $sum: 1 }, sum: { $sum: '$rating' } } },
        ]);

        const totals = {};
        for (const v of vehicles) {
            const key = v.company.toString();
            totals[key] = totals[key] || { vehicleCount: 0, reviewCount: 0, ratingSum: 0 };
            totals[key].vehicleCount += 1;
        }
        for (const r of reviewStats) {
            const key = companyByVehicle.get(r._id.toString());
            if (!key) continue;
            totals[key].reviewCount += r.count;
            totals[key].ratingSum += r.sum;
        }

        const result = companies.map((c) => {
            const t = totals[c._id.toString()] || { vehicleCount: 0, reviewCount: 0, ratingSum: 0 };
            return {
                ...c.toObject(),
                vehicleCount: t.vehicleCount,
                reviewCount: t.reviewCount,
                rating: t.reviewCount ? t.ratingSum / t.reviewCount : 0,
            };
        });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET /api/companies/me
// @desc    Get logged-in company's profile (company auth required)
router.get('/me', auth, async (req, res) => {
    try {
        let company = await Company.findOne({ user: req.user.id }).populate('user', 'name email');
        if (!company) {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ msg: 'User not found' });

            // Only company accounts get a profile auto-created. Other roles must opt in via PUT.
            if (user.role !== 'company') {
                return res.status(404).json({ msg: 'No company profile for this account' });
            }

            company = new Company({
                user: user._id,
                companyName: user.name ? `${user.name} Rentals` : 'My Rental Company',
                contactEmail: user.email || '',
                phone: user.phone || '',
                address: '',
                isVerified: true
            });
            await company.save();
            company = await Company.findById(company._id).populate('user', 'name email');
        }
        res.json(company);
    } catch (err) {
        console.error('Error in GET /api/companies/me:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   PUT /api/companies/me
// @desc    Create or update the logged-in user's company profile
router.put('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const update = {};
        for (const key of ['companyName', 'logo', 'description', 'phone', 'address', 'contactEmail']) {
            if (typeof req.body[key] === 'string') update[key] = req.body[key].trim();
        }
        if (update.companyName === '') {
            return res.status(400).json({ msg: 'Company name cannot be empty' });
        }

        const existing = await Company.findOne({ user: req.user.id });
        if (!existing && !update.companyName) {
            return res.status(400).json({ msg: 'Company name is required' });
        }

        const company = await Company.findOneAndUpdate(
            { user: req.user.id },
            { $set: update, $setOnInsert: { user: req.user.id, isVerified: true } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).populate('user', 'name email');

        // Upgrade renters/owners to company accounts; never touch admins
        if (user.role === 'renter' || user.role === 'owner') {
            user.role = 'company';
            await user.save();
            // Existing listings of this user now belong to the company fleet
            await Vehicle.updateMany({ owner: user._id, company: null }, { company: company._id });
        }

        res.json(company);
    } catch (err) {
        console.error('Error in PUT /api/companies/me:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET /api/companies/:id
// @desc    Get a single company profile + their vehicles (public)
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ msg: 'Company not found' });
        }
        const company = await Company.findById(req.params.id).populate('user', 'name');
        if (!company) return res.status(404).json({ msg: 'Company not found' });

        const vehicles = await Vehicle.find({ company: company._id, ...PUBLIC_STATUS_FILTER });
        const vehicleIds = vehicles.map(v => v._id);
        const reviews = await Review.find({ vehicle: { $in: vehicleIds } });
        const reviewCount = reviews.length;
        const rating = reviewCount > 0
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount)
            : 0;

        res.json({ ...company.toObject(), vehicles, rating, reviewCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
