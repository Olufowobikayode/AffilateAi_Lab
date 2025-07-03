import ApiClient from '../utils/apiClient';

const redditApiClient = new ApiClient({
  baseURL: 'https://www.reddit.com',
  timeout: 5000, // 5 seconds timeout
  retries: 3,
  retryDelay: 1000, // 1 second delay between retries
  circuitBreaker: {
    failureThreshold: 5, // Open circuit after 5 consecutive failures
    resetTimeout: 60000, // Try again after 60 seconds
  },
});

export const getSubredditHotPosts = async (subreddit: string, limit: number = 10): Promise<any> => {
  try {
    const response = await redditApiClient.request({
      method: 'GET',
      url: `/r/${subreddit}/hot.json?limit=${limit}`,
    });
    return (response.data as any).data.children.map((child: any) => child.data);
  } catch (error) {
    console.error(`Error fetching hot posts from r/${subreddit}:`, error);
    throw error;
  }
};

export const getSubredditTopPosts = async (subreddit: string, time: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' = 'day', limit: number = 10): Promise<any> => {
  try {
    const response = await redditApiClient.request({
      method: 'GET',
      url: `/r/${subreddit}/top.json?t=${time}&limit=${limit}`,
    });
    return (response.data as any).data.children.map((child: any) => child.data);
  } catch (error) {
    console.error(`Error fetching top posts from r/${subreddit}:`, error);
    throw error;
  }
};