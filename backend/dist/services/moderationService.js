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
exports.moderateText = void 0;
const language_1 = require("@google-cloud/language");
const { Type } = language_1.protos.google.cloud.language.v1.Document;
const client = new language_1.LanguageServiceClient();
const moderateText = (text) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.warn('GOOGLE_APPLICATION_CREDENTIALS environment variable not set. Skipping advanced moderation.');
        // Fallback to basic moderation or throw an error
        return true; // For now, assume safe if advanced moderation is not configured
    }
    try {
        const document = {
            content: text,
            type: Type.PLAIN_TEXT,
        };
        // Detects the sentiment of the text
        const [sentimentResult] = yield client.analyzeSentiment({ document: document });
        const sentiment = sentimentResult.documentSentiment;
        const score = ((_a = sentimentResult.documentSentiment) === null || _a === void 0 ? void 0 : _a.score) || 0;
        // Detects categories of the text
        const [classificationResult] = yield client.classifyText({ document: document });
        const categories = classificationResult.categories || [];
        // Basic moderation logic: if sentiment is very negative or certain categories are detected
        if (score < -0.5) { // Example threshold for negative sentiment
            console.log('Content flagged due to negative sentiment.');
            return false;
        }
        // Example: Flag content if it falls into certain harmful categories
        const harmfulCategories = ['/Adult', '/Violence', '/Hate Speech'];
        for (const category of categories) {
            if (harmfulCategories.some(hc => { var _a; return (_a = category.name) === null || _a === void 0 ? void 0 : _a.startsWith(hc); })) {
                console.log(`Content flagged due to harmful category: ${category.name}`);
                return false;
            }
        }
        return true; // Content is considered safe
    }
    catch (error) {
        console.error('Error during advanced moderation with Google Cloud Natural Language API:', error);
        // Fallback to basic moderation or assume safe on error
        return true; // For now, assume safe on error
    }
});
exports.moderateText = moderateText;
