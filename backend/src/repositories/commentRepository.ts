import { supabase } from '../config/supabase';

export const createCommentTable = async () => {
  console.log('Supabase comment table assumed to exist.');
};

export const insertComment = async (comment: any): Promise<any[] | null> => {
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select(); // Add .select() to return the inserted data

  if (error) {
    console.error('Error inserting comment:', error);
    throw error;
  }
  return data;
};

export const getComments = async () => {
  const { data, error } = await supabase
    .from('comments')
    .select('*');

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
  return data;
};

export const getUnrepliedComments = async () => {
  // Placeholder for fetching unreplied comments
  console.warn('getUnrepliedComments: Not yet implemented. Returning mock data.');
  return [];
};

export const updateCommentReply = async (commentId: string, replyText: string) => {
  // Placeholder for updating comment with reply
  console.warn(`updateCommentReply: Not yet implemented. Mock updating comment ${commentId} with reply: ${replyText}`);
  return {};
};