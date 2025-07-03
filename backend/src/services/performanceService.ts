export const getMockPerformanceData = () => {
  return {
    facebook_insights_summary: {
      total_reach: Math.floor(Math.random() * 1000000) + 500000,
      total_engagement: Math.floor(Math.random() * 500000) + 100000,
      total_link_clicks: Math.floor(Math.random() * 100000) + 10000,
      follower_growth: Math.floor(Math.random() * 5000) + 1000,
      performance_by_demographic: { /* mock data */ },
      performance_by_post_type: { /* mock data */ },
    },
    pod_sales_data: {
      total_sales_count: Math.floor(Math.random() * 1000) + 100,
      total_revenue: parseFloat(((Math.random() * 10000) + 1000).toFixed(2)),
      top_selling_designs_by_demographic_and_region: { /* mock data */ },
      link_click_to_conversion_rate: parseFloat((Math.random() * 0.1).toFixed(4)),
    },
    affiliate_performance: {
      total_affiliate_clicks: Math.floor(Math.random() * 50000) + 5000,
      estimated_affiliate_revenue: parseFloat(((Math.random() * 5000) + 500).toFixed(2)),
    },
    sponsored_post_revenue: parseFloat(((Math.random() * 2000) + 200).toFixed(2)),
    posts_published_recent: [ /* mock data */ ],
  };
};
