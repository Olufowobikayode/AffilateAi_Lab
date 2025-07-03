import { supabase } from '../config/supabase';

export const createTrendTable = async () => {
  // In Supabase, tables are typically created via the UI or migrations.
  // This function can be a placeholder or used for initial data seeding if needed.
  console.log('Supabase trend table assumed to exist.');
};

export const insertTrend = async (trend: any) => {
  const { data, error } = await supabase
    .from('trends')
    .insert([trend]);

  if (error) {
    console.error('Error inserting trend:', error);
    throw error;
  }
  return data;
};

export const getTrends = async () => {
  const { data, error } = await supabase
    .from('trends')
    .select('*');

  if (error) {
    console.error('Error fetching trends:', error);
    throw error;
  }
  return data;
};