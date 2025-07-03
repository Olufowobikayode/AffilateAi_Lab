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
exports.getPosts = exports.updatePostStatus = exports.insertPost = exports.createPostTable = void 0;
const supabase_1 = require("../config/supabase");
const createPostTable = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Supabase post table assumed to exist.');
});
exports.createPostTable = createPostTable;
const insertPost = (post) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('posts')
        .insert([post])
        .select(); // Add .select() to return the inserted data
    if (error) {
        console.error('Error inserting post:', error);
        throw error;
    }
    return data;
});
exports.insertPost = insertPost;
const updatePostStatus = (postId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('posts')
        .update({ status: status })
        .eq('id', postId);
    if (error) {
        console.error('Error updating post status:', error);
        throw error;
    }
    return data;
});
exports.updatePostStatus = updatePostStatus;
const getPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('posts')
        .select('*');
    if (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
    return data;
});
exports.getPosts = getPosts;
