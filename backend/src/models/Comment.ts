export interface Comment {
  id?: number;
  facebook_comment_id: string;
  post_id: number; // Foreign key to Post
  user_name: string;
  user_demographics: any;
  comment_text: string;
  reply_text?: string;
  replied_at?: Date;
  created_at?: Date;
}
