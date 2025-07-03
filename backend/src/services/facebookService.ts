import ApiClient from '../utils/apiClient';
import dotenv from 'dotenv';

dotenv.config();

const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v19.0'; // Use a stable API version

const facebookApiClient = new ApiClient({
  baseURL: FACEBOOK_GRAPH_API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  retries: 3,
  retryDelay: 2000, // 2 seconds delay between retries
  circuitBreaker: {
    failureThreshold: 5, // Open circuit after 5 consecutive failures
    resetTimeout: 120000, // Try again after 120 seconds (2 minutes)
  },
});

export const postToFacebookPage = async (pageId: string, accessToken: string, message: string, imageUrl?: string): Promise<any> => {
  try {
    const params: any = {
      message,
      access_token: accessToken,
    };

    if (imageUrl) {
      params.url = imageUrl;
      const response = await facebookApiClient.request({
        method: 'POST',
        url: `/${pageId}/photos`,
        data: params,
      });
      return response.data;
    } else {
      const response = await facebookApiClient.request({
        method: 'POST',
        url: `/${pageId}/feed`,
        data: params,
      });
      return response.data;
    }
  } catch (error: any) {
    console.error('Error posting to Facebook page:', error.response?.data || error.message);
    throw error;
  }
};

export const getPageAccessToken = async (userId: string, userAccessToken: string, pageId: string): Promise<string> => {
  try {
    const response = await facebookApiClient.request({
      method: 'GET',
      url: `/${userId}/accounts`,
      params: {
        access_token: userAccessToken,
      },
    });
    const page = (response.data as any).data.find((p: any) => p.id === pageId);
    if (page) {
      return page.access_token;
    } else {
      throw new Error('Page not found or no access token available.');
    }
  } catch (error: any) {
    console.error('Error getting page access token:', error.response?.data || error.message);
    throw error;
  }
};

export const getPageInsights = async (pageId: string, accessToken: string, metrics: string[]): Promise<any> => {
  try {
    const response = await facebookApiClient.request({
      method: 'GET',
      url: `/${pageId}/insights`,
      params: {
        metric: metrics.join(','),
        access_token: accessToken,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error getting page insights:', error.response?.data || error.message);
    throw error;
  }
};

export const getPostComments = async (postId: string, accessToken: string): Promise<any> => {
  try {
    const response = await facebookApiClient.request({
      method: 'GET',
      url: `/${postId}/comments`,
      params: {
        access_token: accessToken,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error getting post comments:', error.response?.data || error.message);
    throw error;
  }
};

export const postCommentReply = async (commentId: string, accessToken: string, message: string): Promise<any> => {
  try {
    const response = await facebookApiClient.request({
      method: 'POST',
      url: `/${commentId}/comments`,
      data: {
        message,
        access_token: accessToken,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error replying to comment:', error.response?.data || error.message);
    throw error;
  }
};