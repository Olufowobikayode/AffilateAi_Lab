import googleTrends from 'google-trends-api';

interface GoogleTrendsOptions {
  keyword: string | string[];
  geo?: string;
}

export const getGoogleTrends = async (options: GoogleTrendsOptions): Promise<any> => {
  try {
    const result = await googleTrends.interestOverTime(options);
    return JSON.parse(result);
  } catch (error) {
    console.error('Error fetching Google Trends:', error);
    throw error;
  }
};

export const getGoogleDailyTrends = async (options: any): Promise<any> => {
  try {
    const result = await googleTrends.dailyTrends(options);
    return JSON.parse(result);
  } catch (error) {
    console.error('Error fetching Google Daily Trends:', error);
    throw error;
  }
};