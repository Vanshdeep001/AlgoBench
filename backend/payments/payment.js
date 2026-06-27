const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../src/models/user');
const userMiddleware = require('../src/middleware/userMiddleware');

const paymentRouter = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order endpoint
paymentRouter.post('/create-order', userMiddleware, async (req, res) => {
    try {
        const userId = req.result._id;
        const options = {
            amount: 4900, // INR 49 in paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.status(201).json({
            orderId: order.id,
            keyId: process.env.RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (err) {
        console.error('Error creating Razorpay order:', err.message);
        res.status(500).json({
            message: 'Failed to create order',
        });
    }
});

// Verify Payment endpoint
paymentRouter.post('/verify', userMiddleware, async (req, res) => {
    try {
        const userId = req.result._id;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: 'Missing payment details',
            });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Signature verified successfully
            const user = await User.findByIdAndUpdate(
                userId,
                { isPremium: true },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                user: {
                    firstName: user.firstName,
                    emailId: user.emailId,
                    _id: user._id,
                    role: user.role,
                    photoURL: user.photoURL,
                    authProvider: user.authProvider,
                    githubUsername: user.githubUsername,
                    isPremium: user.isPremium,
                },
            });
        } else {
            console.error('Razorpay signature verification failed');
            res.status(400).json({
                success: false,
                message: 'Signature verification failed',
            });
        }
    } catch (err) {
        console.error('Error verifying payment:', err.message);
        res.status(500).json({
            message: 'Payment verification failed',
        });
    }
});

module.exports = paymentRouter;
