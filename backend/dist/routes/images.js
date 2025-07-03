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
const imageService_1 = require("../services/imageService");
const router = (0, express_1.Router)();
router.post('/images/generate-and-upload', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { target_demographics, trend_topic, pod_design_concept, facebook_post_text, facebook_ad_copy, pageId, accessToken, message } = req.body;
        // 1. Generate image prompt using Gemini
        const imagePrompt = yield (0, imageService_1.generateImagePrompt)({ target_demographics, trend_topic, pod_design_concept, facebook_post_text, facebook_ad_copy });
        // 2. Generate image using the prompt
        const imageUrl = yield (0, imageService_1.generateImage)(imagePrompt);
        // 3. Upload image to Cloudinary
        const cloudinaryUrl = yield (0, imageService_1.uploadImageToCloudinary)(imageUrl);
        // 4. Upload image to Facebook
        const facebookUploadResult = yield (0, imageService_1.uploadImageToFacebook)(pageId, accessToken, imageUrl, message);
        res.json({
            imagePrompt,
            generatedImageUrl: imageUrl,
            cloudinaryUrl,
            facebookUploadResult
        });
    }
    catch (error) {
        console.error('Error in /images/generate-and-upload route:', error);
        res.status(500).json({ error: 'Failed to generate and upload image' });
    }
}));
exports.default = router;
