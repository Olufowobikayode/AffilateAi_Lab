"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const index_1 = require("../queue/index");
const router = (0, express_1.Router)();
// Facebook Webhook Verification
router.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        }
        else {
            res.sendStatus(403);
        }
    }
    else {
        res.sendStatus(400);
    }
});
// Facebook Webhook Event Handling
router.post('/webhook', (req, res) => {
    const WEBHOOK_SECRET = process.env.FACEBOOK_WEBHOOK_SECRET;
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
        console.warn('Webhook received without signature.');
        return res.sendStatus(400);
    }
    const [algo, hash] = signature.split('=');
    const hmac = crypto_1.default.createHmac(algo, WEBHOOK_SECRET);
    hmac.update(JSON.stringify(req.body));
    const digest = hmac.digest('hex');
    if (hash !== digest) {
        console.warn('Webhook signature mismatch.');
        return res.sendStatus(403);
    }
    const body = req.body;
    console.log('Webhook event received:', JSON.stringify(body, null, 2));
    if (body.object === 'page') {
        body.entry.forEach((entry) => {
            entry.changes.forEach((change) => {
                if (change.field === 'feed' && change.value.item === 'comment') {
                    const comment = change.value;
                    // Add comment to engagement queue for processing
                    index_1.engagementQueue.add('processComment', {
                        facebook_comment_id: comment.comment_id,
                        post_id: comment.post_id, // You'll need to map this to your internal post ID
                        user_name: comment.from.name,
                        user_demographics: {}, // Facebook webhook might not provide this directly, need to fetch user profile
                        comment_text: comment.message,
                    });
                }
            });
        });
    }
    res.status(200).send('EVENT_RECEIVED');
});
exports.default = router;
