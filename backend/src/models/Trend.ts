export interface Trend {
  id?: number;
  topic: string;
  virality_score: number;
  justification: string;
  suggested_hashtags: string[];
  target_demographics: any;
  pod_design_concepts: string[];
  created_at?: Date;
}
