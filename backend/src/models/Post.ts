export interface Post {
  id?: number;
  trend_topic: string;
  pod_design_concept: string;
  facebook_post_text: string;
  facebook_ad_copy: string;
  hashtags: string[];
  affiliate_link_potential: boolean;
  sponsored_post_suitability: boolean;
  image_url?: string;
  cloudinary_url?: string;
  facebook_post_id?: string;
  created_at?: Date;
}
