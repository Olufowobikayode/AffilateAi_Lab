export interface GeneratedContent {
  facebook_post_text: string;
  facebook_ad_copy: string;
  hashtags: string[];
  affiliate_link_potential: boolean;
  sponsored_post_suitability: boolean;
}

export interface Trend {
  topic: string;
  virality_score: number;
  justification: string;
  suggested_hashtags: string[];
  pod_design_concepts: string[];
}

export interface TrendFusionResults {
  ranked_trends: Trend[];
}

export interface OptimizationResults {
  overall_assessment: string;
  key_insights: string[];
  actionable_recommendations: string[];
  monetization_report: string;
}
