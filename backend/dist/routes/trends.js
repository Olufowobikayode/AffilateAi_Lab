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
const express_1 = require("express");
const trendFusionService_1 = require("../services/trendFusionService");
const joi_1 = __importDefault(require("joi"));
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
const trendFusionSchema = joi_1.default.object({
    target_demographics: joi_1.default.object({
        age_range: joi_1.default.string().required(),
        gender: joi_1.default.string().required(),
        locations: joi_1.default.array().items(joi_1.default.string()).required(),
        interests: joi_1.default.array().items(joi_1.default.string()).required(),
    }).required(),
});
router.post('/trends/fusion', (0, validation_1.validate)(trendFusionSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const targetDemographics = req.body.target_demographics;
        const trends = yield (0, trendFusionService_1.performTrendFusion)(targetDemographics);
        res.json(trends);
    }
    catch (error) {
        next(error); // Pass error to centralized error handler
    }
}));
exports.default = router;
