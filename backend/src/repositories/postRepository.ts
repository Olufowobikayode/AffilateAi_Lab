import { supabase } from '../config/supabase';

export const createPostTable = async () => {
  console.log('Supabase post table assumed to exist.');
};

export const insertPost = async (post: any): Promise<any[] | null> => {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select(); // Add .select() to return the inserted data

  if (error) {
    console.error('Error inserting post:', error);
    throw error;
  }
  return data;
};

export const updatePostStatus = async (postId: string, status: string) => {
  const { data, error } = await supabase
    .from('posts')
    .update({ status: status })
    .eq('id', postId);

  if (error) {
    console.error('Error updating post status:', error);
    throw error;
  }
  return data;
};

export const getPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*');

  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
  return data;
};