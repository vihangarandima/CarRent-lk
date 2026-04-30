const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
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
