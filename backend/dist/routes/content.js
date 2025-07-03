"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const openaiService_1 = require("../services/openaiService");
const facebookService_1 = require("../services/facebookService");
const router = (0, express_1.Router)();
router.post('/content/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body; // Expecting the ContentGenerationInput structure
        const generatedContent = yield (0, openaiService_1.generateContent)(data);
        // Moderation check removed as moderationService is deprecated.
        // Consider implementing moderation using Gemini's safety features or OpenAI's moderation API.
        // Assuming pageId and accessToken are provided in the request body for now
        // In a real app, these would be securely retrieved (e.g., from a database)
        const { pageId, accessToken } = req.body;
        if (!pageId || !accessToken) {
            return res.status(400).json({ error: 'pageId and accessToken are required for posting to Facebook' });
        }
        // Post to Facebook
        yield (0, facebookService_1.postToFacebookPage)(pageId, accessToken, generatedContent.facebook_post_text);
        res.json(generatedContent);
    }
    catch (error) {
        console.error('Error in /content/generate route:', error);
        res.status(500).json({ error: 'Failed to generate content or post to Facebook' });
    }
}));
exports.default = router;
