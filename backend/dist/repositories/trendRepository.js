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
exports.getTrends = exports.insertTrend = exports.createTrendTable = void 0;
const supabase_1 = require("../config/supabase");
const createTrendTable = () => __awaiter(void 0, void 0, void 0, function* () {
    // In Supabase, tables are typically created via the UI or migrations.
    // This function can be a placeholder or used for initial data seeding if needed.
    console.log('Supabase trend table assumed to exist.');
});
exports.createTrendTable = createTrendTable;
const insertTrend = (trend) => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('trends')
        .insert([trend]);
    if (error) {
        console.error('Error inserting trend:', error);
        throw error;
    }
    return data;
});
exports.insertTrend = insertTrend;
const getTrends = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data, error } = yield supabase_1.supabase
        .from('trends')
        .select('*');
    if (error) {
        console.error('Error fetching trends:', error);
        throw error;
    }
    return data;
});
exports.getTrends = getTrends;
