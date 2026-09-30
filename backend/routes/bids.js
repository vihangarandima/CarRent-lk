const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const Vehicle = require('../models/Vehicle');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// @route   GET api/bids/my
// @desc    Get all bids/inquiries for vehicles owned by the logged-in user/company
router.get('/my', auth, async (req, res) => {
    try {
        const userVehicles = await Vehicle.find({ owner: req.user.id }).select('_id');
        const vehicleIds = userVehicles.map((v) => v._id);
        const bids = await Bid.find({ vehicle: { $in: vehicleIds } })
            .populate('vehicle', 'brand model year pricePerDay images vehicleType')
            .populate('renter', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(bids);
    } catch (err) {
        console.error('Error fetching user bids:', err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/bids
// @desc    Tag a price (Create a bid)
router.post('/', auth, async (req, res) => {
    try {
        const { vehicleId, offerPrice, message } = req.body;
        const newBid = new Bid({
            vehicle: vehicleId,
            renter: req.user.id,
            offerPrice,
            message
        });
        const bid = await newBid.save();
        res.json(bid);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET api/bids/vehicle/:vehicleId
// @desc    Get all bids for a vehicle (Owner only or Admin)
router.get('/vehicle/:vehicleId', auth, async (req, res) => {
    try {
        const bids = await Bid.find({ vehicle: req.params.vehicleId }).populate('renter', 'name email');
        res.json(bids);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
