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
const performanceService_1 = require("../services/performanceService");
const optimizationService_1 = require("../services/optimizationService");
const router = (0, express_1.Router)();
router.get('/performance/data', (req, res) => {
    try {
        const data = (0, performanceService_1.getMockPerformanceData)();
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching performance data:', error);
        res.status(500).json({ error: 'Failed to fetch performance data' });
    }
});
router.post('/performance/optimize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const performanceData = req.body.performance_data; // Expecting performance data
        // Call Gemini API for optimization analysis
        const optimizationResults = yield (0, optimizationService_1.analyzePerformance)(performanceData);
        res.json(optimizationResults);
    }
    catch (error) {
        console.error('Error optimizing performance:', error);
        res.status(500).json({ error: 'Failed to optimize performance' });
    }
}));
exports.default = router;
