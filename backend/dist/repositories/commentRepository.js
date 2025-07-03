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
exports.updateCommentReply = exports.getUnrepliedComments = exports.getComments = exports.insertComment = exports.createCommentTable = void 0;
const supabase_1 = require("../config/supabase");
const createCommentTable = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Supabase comment table assumed to exist.');
});
exports.createCommentTable = createCommentTable;
const insertComment = (comment) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('comments')
        .insert([comment])
        .select(); // Add .select() to return the inserted data
    if (error) {
        console.error('Error inserting comment:', error);
        throw error;
    }
    return data;
});
exports.insertComment = insertComment;
const getComments = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('comments')
        .select('*');
    if (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
    return data;
});
exports.getComments = getComments;
const getUnrepliedComments = () => __awaiter(void 0, void 0, void 0, function* () {
    // Placeholder for fetching unreplied comments
    console.warn('getUnrepliedComments: Not yet implemented. Returning mock data.');
    return [];
});
exports.getUnrepliedComments = getUnrepliedComments;
const updateCommentReply = (commentId, replyText) => __awaiter(void 0, void 0, void 0, function* () {
    // Placeholder for updating comment with reply
    console.warn(`updateCommentReply: Not yet implemented. Mock updating comment ${commentId} with reply: ${replyText}`);
    return {};
});
exports.updateCommentReply = updateCommentReply;
