import React, { useState } from 'react';
import './App.css';
import { GeneratedContent, Trend, TrendFusionResults, OptimizationResults } from './types';

function App() {
  const [trendTopic, setTrendTopic] = useState('');
  const [podDesignConcept, setPodDesignConcept] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [errorContent, setErrorContent] = useState<string | null>(null);

  const [trendFusionResults, setTrendFusionResults] = useState<TrendFusionResults | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [errorTrends, setErrorTrends] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [optimizationResults, setOptimizationResults] = useState<OptimizationResults | null>(null);
  const [loadingOptimization, setLoadingOptimization] = useState(false);
  const [errorOptimization, setErrorOptimization] = useState<string | null>(null);

  const handleOptimizePerformance = async () => {
    setLoadingOptimization(true);
    setErrorOptimization(null);
    setOptimizationResults(null);

    try {
      const response = await fetch('/api/optimization/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mockPerformanceData: {} }), // Placeholder for actual data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze performance');
      }

      const data = await response.json();
      setOptimizationResults(data);
    } catch (err) {
      if (err instanceof Error) {
        setErrorOptimization(err.message);
      }
    } finally {
      setLoadingOptimization(false);
    }
  };

  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingContent(true);
    setErrorContent(null);
    setGeneratedContent(null);

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trend_topic: trendTopic,
          pod_design_concept: podDesignConcept,
          target_demographics: { age_range: 'all', gender: 'all', locations: ['Global'], interests: ['all'] }, // Placeholder
          list_of_hashtags_from_gemini_and_others: ['#trending', '#viral'], // Placeholder
          pageId: 'YOUR_FACEBOOK_PAGE_ID', // Replace with your Facebook Page ID
          accessToken: 'YOUR_FACEBOOK_ACCESS_TOKEN', // Replace with your Facebook Access Token
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data);
    } catch (err) {
      if (err instanceof Error) {
        setErrorContent(err.message);
      }
    } finally {
      setLoadingContent(false);
    }
  };

  const handleFetchTrends = async () => {
    setLoadingTrends(true);
    setErrorTrends(null);
    setTrendFusionResults(null);

    try {
      const response = await fetch('/api/trends/fusion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_demographics: { age_range: 'all', gender: 'all', locations: ['Global'], interests: ['all'] }, // Placeholder
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch trends');
      }

      const data = await response.json();
      setTrendFusionResults(data);
    } catch (err) {
      if (err instanceof Error) {
        setErrorTrends(err.message);
      }
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploadingImage(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      setUploadSuccess(`Image uploaded successfully! Public ID: ${data.publicId}`);
      setSelectedFile(null); // Clear selected file after successful upload
    } catch (err) {
      if (err instanceof Error) {
        setUploadError(err.message);
      }
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="App">
      <h1>Content Generation Dashboard</h1>

      <form onSubmit={handleGenerateContent}>
        <div>
          <label htmlFor="trendTopic">Trend Topic:</label>
          <input
            type="text"
            id="trendTopic"
            value={trendTopic}
            onChange={(e) => setTrendTopic(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="podDesignConcept">PoD Design Concept:</label>
          <input
            type="text"
            id="podDesignConcept"
            value={podDesignConcept}
            onChange={(e) => setPodDesignConcept(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loadingContent}>
          {loadingContent ? 'Generating...' : 'Generate Content'}
        </button>
      </form>

      {errorContent && <p style={{ color: 'red' }}>Error: {errorContent}</p>}

      {generatedContent && (
        <div>
          <h2>Generated Content:</h2>
          <h3>Facebook Post:</h3>
          <p>{generatedContent.facebook_post_text}</p>
          <h3>Facebook Ad Copy:</h3>
          <p>{generatedContent.facebook_ad_copy}</p>
          <h3>Hashtags:</h3>
          <p>{generatedContent.hashtags.join(', ')}</p>
          <p>Affiliate Link Potential: {generatedContent.affiliate_link_potential ? 'Yes' : 'No'}</p>
          <p>Sponsored Post Suitability: {generatedContent.sponsored_post_suitability ? 'Yes' : 'No'}</p>
        </div>
      )}

      <hr />

      <h2>Trend Fusion</h2>
      <button onClick={handleFetchTrends} disabled={loadingTrends}>
        {loadingTrends ? 'Fetching Trends...' : 'Fetch Latest Trends'}
      </button>

      {errorTrends && <p style={{ color: 'red' }}>Error: {errorTrends}</p>}

      {trendFusionResults && (
        <div>
          <h3>Ranked Trends:</h3>
          {trendFusionResults.ranked_trends && trendFusionResults.ranked_trends.length > 0 ? (
            <ul>
              {trendFusionResults.ranked_trends.map((trend: Trend, index: number) => (
                <li key={index}>
                  <h4>{trend.topic}</h4>
                  <p>Virality Score: {trend.virality_score}</p>
                  <p>Justification: {trend.justification}</p>
                  <p>Suggested Hashtags: {trend.suggested_hashtags.join(', ')}</p>
                  <p>PoD Design Concepts: {trend.pod_design_concepts.join(', ')}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No trends found.</p>
          )}
        </div>
      )}

      <hr />

      <h2>Image Upload</h2>
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleImageUpload} disabled={!selectedFile || uploadingImage}>
          {uploadingImage ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
      {uploadError && <p style={{ color: 'red' }}>Error: {uploadError}</p>}
      {uploadSuccess && <p style={{ color: 'green' }}>{uploadSuccess}</p>}

      <hr />

      <h2>Engagement Analytics (Mock)</h2>
      <div>
        <p>Total Reach: 1,234,567</p>
        <p>Total Engagement: 876,543</p>
        <p>Total Link Clicks: 123,456</p>
        <p>Follower Growth: +5,432</p>
      </div>

      <hr />

      <h2>Performance Optimization</h2>
      <button onClick={handleOptimizePerformance} disabled={loadingOptimization}>
        {loadingOptimization ? 'Analyzing...' : 'Analyze Performance'}
      </button>

      {errorOptimization && <p style={{ color: 'red' }}>Error: {errorOptimization}</p>}

      {optimizationResults && (
        <div>
          <h3>Overall Assessment:</h3>
          <p>{optimizationResults.overall_assessment}</p>
          <h3>Key Insights:</h3>
          <ul>
            {optimizationResults.key_insights.map((insight: string, index: number) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
          <h3>Actionable Recommendations:</h3>
          <ul>
            {optimizationResults.actionable_recommendations.map((rec: string, index: number) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
          <h3>Monetization Report:</h3>
          <p>{optimizationResults.monetization_report}</p>
        </div>
      )}

    </div>
  );
}

export default App;
