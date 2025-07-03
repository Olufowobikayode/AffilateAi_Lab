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
exports.scheduleImageCleanup = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const cloudinaryService_1 = require("../services/cloudinaryService");
const IMAGE_RETENTION_HOURS = 1; // Images older than 1 hour will be deleted
const scheduleImageCleanup = () => {
    // Schedule to run every hour
    node_cron_1.default.schedule('0 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Running scheduled image cleanup job...');
        try {
            const publicIdsToDelete = yield (0, cloudinaryService_1.getImagesOlderThan)(IMAGE_RETENTION_HOURS);
            if (publicIdsToDelete.length > 0) {
                console.log(`Found ${publicIdsToDelete.length} images to delete.`);
                for (const publicId of publicIdsToDelete) {
                    yield (0, cloudinaryService_1.deleteImage)(publicId);
                }
                console.log('Image cleanup job completed.');
            }
            else {
                console.log('No images found to delete.');
            }
        }
        catch (error) {
            console.error('Error during image cleanup job:', error);
        }
    }));
};
exports.scheduleImageCleanup = scheduleImageCleanup;
