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
exports.getImagesOlderThan = exports.deleteImage = exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadImage = (imagePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.upload(imagePath);
        return result.public_id;
    }
    catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
});
exports.uploadImage = uploadImage;
const deleteImage = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield cloudinary_1.v2.uploader.destroy(publicId);
        console.log(`Deleted image with public ID: ${publicId}`);
    }
    catch (error) {
        console.error(`Error deleting image ${publicId} from Cloudinary:`, error);
        throw error;
    }
});
exports.deleteImage = deleteImage;
const getImagesOlderThan = (hours) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - hours);
        const result = yield cloudinary_1.v2.api.resources({
            type: 'upload',
            max_results: 500, // Adjust as needed
            direction: 'asc',
            start_at: cutoff.toISOString(),
        });
        return result.resources.map((resource) => resource.public_id);
    }
    catch (error) {
        console.error(`Error fetching images older than ${hours} hours from Cloudinary:`, error);
        throw error;
    }
});
exports.getImagesOlderThan = getImagesOlderThan;
