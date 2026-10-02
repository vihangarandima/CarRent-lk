const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const Vehicle = require('../models/Vehicle');
const { auth } = require('../middleware/auth');

// @route   POST api/bids
// @desc    Tag a price (Create a bid)
router.post('/', auth, async (req, res) => {
    try {
        const { vehicleId, offerPrice, message } = req.body;
        const price = Number(offerPrice);
        if (!mongoose.Types.ObjectId.isValid(vehicleId) || !(price > 0)) {
            return res.status(400).json({ msg: 'A valid vehicle and offer price are required' });
        }
        const vehicle = await Vehicle.findById(vehicleId).select('owner');
        if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });

        const newBid = new Bid({
            vehicle: vehicleId,
            renter: req.user.id,
            offerPrice: price,
            message
        });
        const bid = await newBid.save();
        res.json(bid);
    } catch (err) {
        console.error('Error creating bid:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET api/bids/vehicle/:vehicleId
// @desc    Get all bids for a vehicle (vehicle owner only)
router.get('/vehicle/:vehicleId', auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.vehicleId)) {
            return res.status(404).json({ msg: 'Vehicle not found' });
        }
        const vehicle = await Vehicle.findById(req.params.vehicleId).select('owner');
        if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });
        if (vehicle.owner.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        const bids = await Bid.find({ vehicle: req.params.vehicleId }).populate('renter', 'name email');
        res.json(bids);
    } catch (err) {
        console.error('Error fetching bids:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
