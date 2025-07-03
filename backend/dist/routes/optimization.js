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
const optimizationService_1 = require("../services/optimizationService");
const router = (0, express_1.Router)();
router.post('/performance/analyze', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body; // Expecting the PerformanceData structure
        const analysis = yield (0, optimizationService_1.analyzePerformance)(data);
        res.json(analysis);
    }
    catch (error) {
        console.error('Error in /performance/analyze route:', error);
        res.status(500).json({ error: 'Failed to analyze performance' });
    }
}));
exports.default = router;
