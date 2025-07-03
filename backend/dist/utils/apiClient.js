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
const axios_1 = __importDefault(require("axios"));
class ApiClient {
    constructor(options) {
        this.failureCount = 0;
        this.circuitOpen = false;
        this.nextAttemptTime = 0;
        this.options = options;
        this.client = axios_1.default.create({
            baseURL: options.baseURL,
            timeout: options.timeout,
        });
    }
    openCircuit() {
        this.circuitOpen = true;
        this.nextAttemptTime = Date.now() + this.options.circuitBreaker.resetTimeout;
        console.warn(`Circuit opened for ${this.options.baseURL}. Next attempt at ${new Date(this.nextAttemptTime).toLocaleTimeString()}`);
    }
    closeCircuit() {
        this.circuitOpen = false;
        this.failureCount = 0;
        console.log(`Circuit closed for ${this.options.baseURL}`);
    }
    halfOpenCircuit() {
        this.circuitOpen = false; // Temporarily close to allow one request
        console.log(`Circuit half-opened for ${this.options.baseURL}. Trying next request.`);
    }
    checkCircuit() {
        if (this.circuitOpen) {
            if (Date.now() > this.nextAttemptTime) {
                this.halfOpenCircuit();
            }
            else {
                throw new Error(`Circuit is open for ${this.options.baseURL}. Too many failures.`);
            }
        }
    }
    request(config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkCircuit();
            for (let i = 0; i <= this.options.retries; i++) {
                try {
                    const response = yield this.client.request(config);
                    this.closeCircuit(); // Reset circuit on success
                    return response;
                }
                catch (error) {
                    if (axios_1.default.isAxiosError(error)) {
                        console.error(`Request to ${this.options.baseURL}${config.url} failed (attempt ${i + 1}/${this.options.retries + 1}):`, error.message);
                        if (error.response) {
                            console.error('Response data:', error.response.data);
                            console.error('Response status:', error.response.status);
                        }
                        this.failureCount++;
                        if (this.options.circuitBreaker && this.failureCount >= this.options.circuitBreaker.failureThreshold) {
                            this.openCircuit();
                        }
                        if (i < this.options.retries) {
                            yield new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
                        }
                        else {
                            throw new Error(`Max retries reached for ${this.options.baseURL}${config.url}: ${error.message}`);
                        }
                    }
                    else {
                        // Non-Axios error
                        throw error;
                    }
                }
            }
            throw new Error('Should not reach here'); // Fallback, should be caught by the loop
        });
    }
}
exports.default = ApiClient;
