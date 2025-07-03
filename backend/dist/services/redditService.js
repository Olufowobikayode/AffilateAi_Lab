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
exports.getSubredditTopPosts = exports.getSubredditHotPosts = void 0;
const apiClient_1 = __importDefault(require("../utils/apiClient"));
const redditApiClient = new apiClient_1.default({
    baseURL: 'https://www.reddit.com',
    timeout: 5000, // 5 seconds timeout
    retries: 3,
    retryDelay: 1000, // 1 second delay between retries
    circuitBreaker: {
        failureThreshold: 5, // Open circuit after 5 consecutive failures
        resetTimeout: 60000, // Try again after 60 seconds
    },
});
const getSubredditHotPosts = (subreddit_1, ...args_1) => __awaiter(void 0, [subreddit_1, ...args_1], void 0, function* (subreddit, limit = 10) {
    try {
        const response = yield redditApiClient.request({
            method: 'GET',
            url: `/r/${subreddit}/hot.json?limit=${limit}`,
        });
        return response.data.data.children.map((child) => child.data);
    }
    catch (error) {
        console.error(`Error fetching hot posts from r/${subreddit}:`, error);
        throw error;
    }
});
exports.getSubredditHotPosts = getSubredditHotPosts;
const getSubredditTopPosts = (subreddit_1, ...args_1) => __awaiter(void 0, [subreddit_1, ...args_1], void 0, function* (subreddit, time = 'day', limit = 10) {
    try {
        const response = yield redditApiClient.request({
            method: 'GET',
            url: `/r/${subreddit}/top.json?t=${time}&limit=${limit}`,
        });
        return response.data.data.children.map((child) => child.data);
    }
    catch (error) {
        console.error(`Error fetching top posts from r/${subreddit}:`, error);
        throw error;
    }
});
exports.getSubredditTopPosts = getSubredditTopPosts;
