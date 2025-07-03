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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCommentReply = exports.getPostComments = exports.getPageInsights = exports.getPageAccessToken = exports.postToFacebookPage = void 0;
const apiClient_1 = __importDefault(require("../utils/apiClient"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v19.0'; // Use a stable API version
const facebookApiClient = new apiClient_1.default({
    baseURL: FACEBOOK_GRAPH_API_BASE_URL,
    timeout: 10000, // 10 seconds timeout
    retries: 3,
    retryDelay: 2000, // 2 seconds delay between retries
    circuitBreaker: {
        failureThreshold: 5, // Open circuit after 5 consecutive failures
        resetTimeout: 120000, // Try again after 120 seconds (2 minutes)
    },
});
const postToFacebookPage = (pageId, accessToken, message, imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const params = {
            message,
            access_token: accessToken,
        };
        if (imageUrl) {
            params.url = imageUrl;
            const response = yield facebookApiClient.request({
                method: 'POST',
                url: `/${pageId}/photos`,
                data: params,
            });
            return response.data;
        }
        else {
            const response = yield facebookApiClient.request({
                method: 'POST',
                url: `/${pageId}/feed`,
                data: params,
            });
            return response.data;
        }
    }
    catch (error) {
        console.error('Error posting to Facebook page:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
});
exports.postToFacebookPage = postToFacebookPage;
const getPageAccessToken = (userId, userAccessToken, pageId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield facebookApiClient.request({
            method: 'GET',
            url: `/${userId}/accounts`,
            params: {
                access_token: userAccessToken,
            },
        });
        const page = response.data.data.find((p) => p.id === pageId);
        if (page) {
            return page.access_token;
        }
        else {
            throw new Error('Page not found or no access token available.');
        }
    }
    catch (error) {
        console.error('Error getting page access token:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
});
exports.getPageAccessToken = getPageAccessToken;
const getPageInsights = (pageId, accessToken, metrics) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield facebookApiClient.request({
            method: 'GET',
            url: `/${pageId}/insights`,
            params: {
                metric: metrics.join(','),
                access_token: accessToken,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('Error getting page insights:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
});
exports.getPageInsights = getPageInsights;
const getPostComments = (postId, accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield facebookApiClient.request({
            method: 'GET',
            url: `/${postId}/comments`,
            params: {
                access_token: accessToken,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('Error getting post comments:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
});
exports.getPostComments = getPostComments;
const postCommentReply = (commentId, accessToken, message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield facebookApiClient.request({
            method: 'POST',
            url: `/${commentId}/comments`,
            data: {
                message,
                access_token: accessToken,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('Error replying to comment:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
});
exports.postCommentReply = postCommentReply;
