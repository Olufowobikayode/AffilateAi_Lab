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
const engagementService_1 = require("../services/engagementService");
const router = (0, express_1.Router)();
router.post('/engagement/reply', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body; // Expecting the EngagementInput structure
        const reply = yield (0, engagementService_1.generateReply)(data);
        res.json(reply);
    }
    catch (error) {
        console.error('Error in /engagement/reply route:', error);
        res.status(500).json({ error: 'Failed to generate reply' });
    }
}));
exports.default = router;
