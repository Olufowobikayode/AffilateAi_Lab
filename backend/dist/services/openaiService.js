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
exports.generateContent = generateContent;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});
function generateContent(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = `As a creative content strategist and copywriter, your goal is to generate two distinct, highly compelling, and culturally nuanced pieces of content: a **Facebook post** and a separate **Facebook ad copy**. Both must be specifically tailored for the target audience with the following demographic and geographic characteristics: ${JSON.stringify(data.target_demographics)}.\n\nThe content should center around the trend: '${data.trend_topic}' and promote the Print on Demand (PoD) design concept: '${data.pod_design_concept}'.\n\n---\n\n**Content Requirements for BOTH the Post and Ad:**\n1.  **Shocking Statistic:** Include a compelling and shocking statistic relevant to '${data.trend_topic}', which is either globally significant or highly localized to resonate strongly with the specified audience.\n2.  **Security Tip:** Provide a practical, actionable general digital security tip, presented in a culturally appropriate and easy-to-understand manner for the target demographic.\n3.  **Engagement Question:** Ask a direct, open-ended question designed to spark conversation and encourage comments/shares from this specific audience.\n4.  **Hashtags:** Include 5-10 highly relevant and trending hashtags. Combine the provided core hashtags (${JSON.stringify(data.list_of_hashtags_from_gemini_and_others)}) with additional geo-specific or demographic-specific hashtags that will increase visibility and engagement within the target regions/groups.\n\n---\n\n**Specific Requirements for Facebook Post:**\n* Naturally weave in a clear call-to-action for the PoD product, using '[POD_STORE_LINK]' as a placeholder. The language should be persuasive and relatable to the target audience.\n\n---\n\n**Specific Requirements for Facebook Ad Copy:**\n* Make it concise, attention-grabbing, and suitable for a paid advertising campaign. Focus on a strong hook and benefit.\n* Include '[POD_STORE_LINK]' as a clear call-to-action.\n* Identify if there are natural, contextual placements for affiliate links within the ad copy (using '[AFFILIATE_LINK_PLACEHOLDER]').\n* Indicate if this content is naturally suitable for a sponsored post.\n\n---\n\n**Output Format:**\nProvide the output as a **JSON object** with the following fields:\n{\n  "trend_topic": "string",\n  "pod_design_concept": "string",\n  "facebook_post_text": "string (full, engaging text for the Facebook post)",\n  "facebook_ad_copy": "string (full, concise text for the Facebook ad copy)",\n  "hashtags": "array of strings (all relevant hashtags combined)",\n  "affiliate_link_potential": "boolean (true if affiliate link can be naturally integrated, false otherwise)",\n  "sponsored_post_suitability": "boolean (true if content is highly suitable for sponsored promotion, false otherwise)"\n}\n`;
        try {
            const chatCompletion = yield openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'gpt-3.5-turbo',
                response_format: { type: "json_object" },
            });
            const responseContent = chatCompletion.choices[0].message.content;
            if (!responseContent) {
                throw new Error("OpenAI response content is null");
            }
            return JSON.parse(responseContent);
        }
        catch (error) {
            console.error('Error calling OpenAI API:', error);
            throw error;
        }
    });
}
