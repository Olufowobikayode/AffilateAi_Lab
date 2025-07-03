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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load environment variables from .env file
const envValidation_1 = require("./config/envValidation");
(0, envValidation_1.validateEnv)(); // Validate environment variables
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const trends_1 = __importDefault(require("./routes/trends"));
const content_1 = __importDefault(require("./routes/content"));
const images_1 = __importDefault(require("./routes/images"));
const engagement_1 = __importDefault(require("./routes/engagement"));
const optimization_1 = __importDefault(require("./routes/optimization"));
const scheduling_1 = __importDefault(require("./routes/scheduling"));
const performance_1 = __importDefault(require("./routes/performance"));
const facebook_1 = __importDefault(require("./routes/facebook")); // Import the new router
const index_1 = require("./queue/index");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Apply rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/api', trends_1.default);
app.use('/api', content_1.default);
app.use('/api', images_1.default);
app.use('/api', engagement_1.default);
app.use('/api', optimization_1.default);
app.use('/api', scheduling_1.default);
app.use('/api', performance_1.default);
app.use('/facebook', facebook_1.default); // Mount Facebook webhook router
app.get('/', (req, res) => {
    res.send('Backend is running!');
});
// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send({
        message: err.message || 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack,
    });
});
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server is running on http://localhost:${port}`);
    (0, index_1.startWorkers)();
    (0, index_1.setupScheduledJobs)();
}));
