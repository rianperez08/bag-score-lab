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
                  text: `Analyze the under-eye area of the person in the provided webcam-quality image and output a detailed, objective JSON assessment.
Calibrate results as follows:

Image 1 (Baseline): Treat this as 0 for all metrics (no visible darkness/puffiness).

Image 2 (Maximum): Treat this as 100 for all metrics (extreme darkness/puffiness).

Any new input image should be scaled proportionally between these two reference points.

If new input appears worse than Image 2, you may allow scores to slightly exceed 100 (cap at 110).

If new input appears better than Image 1, scores may go slightly below 0 (cap at -10) — but overallScore must not exceed these bounds.

Respond ONLY with valid JSON following this schema:

{
  "darkness": number,
  "puffiness": number,
  "overallScore": number,
  "severity": "none" | "very_minimal" | "minimal" | "very_mild" | "mild" | "moderate" | "moderately_severe" | "severe" | "very_severe" | "extreme",
  "confidenceScore": number,
  "lightingQuality": "poor" | "fair" | "good",
  "observations": [string],
  "recommendations": [string]
}

Parameter Guidelines:

darkness (0–100): Compare under-eye skin tone to cheeks and forehead. Image 1 = 0, Image 2 = 100.

puffiness (0–100): Rate visible swelling under eyes. Image 1 = 0, Image 2 = 100.

overallScore (0–100): Average of darkness & puffiness. Image 1 = 0, Image 2 = 100.

severity: Choose from 10 levels based on overallScore (0 = none, 100 = extreme).

Range	Severity
0–9	none
10–19	very_minimal
20–29	minimal
30–39	very_mild
40–49	mild
50–59	moderate
60–69	moderately_severe
70–79	severe
80–89	very_severe
90–100	extreme

confidenceScore: 0–100, rate trustworthiness of result (good lighting & clear focus = higher score).

lightingQuality: "good" if evenly lit, "poor" if shadows or harsh contrast.

observations: 2–4 specific notes (symmetry, visible folds, left/right difference).

recommendations: 3–5 practical, evidence-based suggestions (hydration, cold compress, sleep hygiene, topical retinol, dermatologist consult).

Special Instructions:

Always normalize results relative to the calibration images.

Force use of the full 0–100 scale whenever possible to maximize contrast between mild and severe eyebags.

If multiple images are provided at once, output a JSON object per image and ensure differences are clearly reflected (at least 10-point spread between images if differences are visible).

Return only valid JSON — no text outside the braces.`
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
        severity: ['none', 'very_minimal', 'minimal', 'very_mild', 'mild', 'moderate', 'moderately_severe', 'severe', 'very_severe', 'extreme'].includes(analysis.severity) 
          ? analysis.severity 
          : 'moderate',
        confidenceScore: analysis.confidenceScore ? Math.min(100, Math.max(0, analysis.confidenceScore)) : undefined,
        lightingQuality: analysis.lightingQuality || undefined,
        observations: Array.isArray(analysis.observations) ? analysis.observations : undefined,
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