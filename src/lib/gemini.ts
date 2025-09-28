import { EyebagAnalysis } from '@/components/AnalysisResults';

export class GeminiAnalyzer {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeEyebags(imageData: string): Promise<EyebagAnalysis> {
    try {
      // Remove data URL prefix
      const base64Image = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this person's eyebags and under-eye area. Provide a detailed assessment in JSON format with the following structure:
                {
                  "darkness": number (0-100, where 0 is no darkness and 100 is very dark),
                  "puffiness": number (0-100, where 0 is no puffiness and 100 is very puffy),
                  "overallScore": number (0-100, where 100 is perfect and 0 is severe eyebags),
                  "severity": "minimal" | "mild" | "moderate" | "severe",
                  "recommendations": [array of 3-5 specific recommendations]
                }

                Focus on:
                - Dark circles and discoloration under the eyes
                - Puffiness and swelling of the under-eye area
                - Overall appearance and health of the eye area
                - Provide practical recommendations for improvement

                Respond ONLY with valid JSON, no other text.`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      const analysisText = result.candidates[0].content.parts[0].text;
      
      // Parse the JSON response
      let analysis: EyebagAnalysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', analysisText);
        // Fallback analysis if parsing fails
        analysis = {
          darkness: 50,
          puffiness: 50,
          overallScore: 50,
          severity: 'moderate',
          recommendations: [
            'Get adequate sleep (7-9 hours per night)',
            'Stay hydrated by drinking plenty of water',
            'Use a cold compress to reduce puffiness'
          ]
        };
      }

      // Validate and sanitize the analysis
      return {
        darkness: Math.min(100, Math.max(0, analysis.darkness || 0)),
        puffiness: Math.min(100, Math.max(0, analysis.puffiness || 0)),
        overallScore: Math.min(100, Math.max(0, analysis.overallScore || 0)),
        severity: ['minimal', 'mild', 'moderate', 'severe'].includes(analysis.severity) 
          ? analysis.severity 
          : 'moderate',
        recommendations: Array.isArray(analysis.recommendations) 
          ? analysis.recommendations.slice(0, 6) 
          : ['Consider consulting with a healthcare professional for personalized advice']
      };

    } catch (error) {
      console.error('Error analyzing eyebags:', error);
      throw error;
    }
  }
}