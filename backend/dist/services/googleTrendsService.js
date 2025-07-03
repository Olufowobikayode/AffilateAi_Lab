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
exports.getGoogleDailyTrends = exports.getGoogleTrends = void 0;
const google_trends_api_1 = __importDefault(require("google-trends-api"));
const getGoogleTrends = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield google_trends_api_1.default.interestOverTime(options);
        return JSON.parse(result);
    }
    catch (error) {
        console.error('Error fetching Google Trends:', error);
        throw error;
    }
});
exports.getGoogleTrends = getGoogleTrends;
const getGoogleDailyTrends = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield google_trends_api_1.default.dailyTrends(options);
        return JSON.parse(result);
    }
    catch (error) {
        console.error('Error fetching Google Daily Trends:', error);
        throw error;
    }
});
exports.getGoogleDailyTrends = getGoogleDailyTrends;
