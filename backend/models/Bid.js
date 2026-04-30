const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    offerPrice: { type: Number, required: true },
    message: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bid', BidSchema);
