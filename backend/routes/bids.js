const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const Vehicle = require('../models/Vehicle');
const Company = require('../models/Company');
const { auth } = require('../middleware/auth');

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
        const price = Number(offerPrice);
        if (!mongoose.Types.ObjectId.isValid(vehicleId) || !(price > 0)) {
            return res.status(400).json({ msg: 'A valid vehicle and offer price are required' });
        }
        const vehicle = await Vehicle.findById(vehicleId).select('owner company');
        if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });

        // Prevent self-bidding: Owner cannot bid on their own vehicle
        if (vehicle.owner && vehicle.owner.toString() === req.user.id) {
            return res.status(400).json({ msg: 'You cannot place a bid on your own vehicle' });
        }
        if (vehicle.company) {
            const userCompany = await Company.findOne({ user: req.user.id }).select('_id');
            if (userCompany && vehicle.company.toString() === userCompany._id.toString()) {
                return res.status(400).json({ msg: 'You cannot place a bid on a vehicle listed by your company' });
            }
        }

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
        if (vehicle.owner && vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        const bids = await Bid.find({ vehicle: req.params.vehicleId }).populate('renter', 'name email');
        res.json(bids);
    } catch (err) {
        console.error('Error fetching bids:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   PUT api/bids/:id
// @desc    Update bid status (accepted, rejected, pending) by vehicle owner
router.put('/:id', auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ msg: 'Bid not found' });
        }
        const { status } = req.body;
        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }
        const bid = await Bid.findById(req.params.id).populate('vehicle', 'owner');
        if (!bid) return res.status(404).json({ msg: 'Bid not found' });

        if (bid.vehicle && bid.vehicle.owner && bid.vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized to manage this bid' });
        }

        bid.status = status;
        await bid.save();

        const populatedBid = await Bid.findById(bid._id)
            .populate('vehicle', 'brand model year pricePerDay images vehicleType')
            .populate('renter', 'name email phone');

        res.json(populatedBid);
    } catch (err) {
        console.error('Error updating bid status:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
