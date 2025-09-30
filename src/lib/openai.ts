import { EyebagAnalysis } from '@/components/AnalysisResults';

export class OpenAIAnalyzer {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeEyebags(imageData: string): Promise<EyebagAnalysis> {
    try {
      // Remove data URL prefix if present
      const base64Image = imageData.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5',
          max_completion_tokens: 500,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this person's eyebags and under-eye area. Provide a detailed assessment in JSON format with the following structure:
                  {
                    "darkness": number (0-100, where 0 is no darkness and 100 is very dark),
                    "puffiness": number (0-100, where 0 is no puffiness and 100 is very puffy),
                    "overallScore": number (0-100, where 0 is no eyebags and 100 is severe eyebags),
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
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error('Invalid response from OpenAI API');
      }

      const analysisText = result.choices[0].message.content;
      
      // Parse the JSON response (handle code fences and extra text)
      let analysis: EyebagAnalysis | null = null;
      try {
        analysis = JSON.parse(analysisText);
      } catch {
        // Try stripping Markdown code fences
        const stripped = analysisText
          .replace(/^\s*```(?:json)?\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        if (stripped) {
          try { analysis = JSON.parse(stripped); } catch {}
        }
        // Fallback: extract first JSON object in the text
        if (!analysis) {
          const match = analysisText.match(/\{[\s\S]*\}/);
          if (match) {
            try { analysis = JSON.parse(match[0]); } catch {}
          }
        }
        if (!analysis) {
          console.error('Failed to parse OpenAI response:', analysisText);
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
          } as EyebagAnalysis;
        }
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