import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Zap, AlertCircle, CheckCircle } from 'lucide-react';

export interface EyebagAnalysis {
  darkness: number;
  puffiness: number;
  overallScore: number;
  severity: 'none' | 'very_minimal' | 'minimal' | 'very_mild' | 'mild' | 'moderate' | 'moderately_severe' | 'severe' | 'very_severe' | 'extreme';
  confidenceScore?: number;
  lightingQuality?: 'poor' | 'fair' | 'good';
  observations?: string[];
  recommendations: string[];
}

interface AnalysisResultsProps {
  analysis: EyebagAnalysis;
  capturedImage: string;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, capturedImage }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'none': return 'bg-green-100 text-green-800';
      case 'very_minimal': return 'bg-green-100 text-green-800';
      case 'minimal': return 'bg-green-100 text-green-800';
      case 'very_mild': return 'bg-lime-100 text-lime-800';
      case 'mild': return 'bg-yellow-100 text-yellow-800';
      case 'moderate': return 'bg-orange-100 text-orange-800';
      case 'moderately_severe': return 'bg-orange-200 text-orange-900';
      case 'severe': return 'bg-red-100 text-red-800';
      case 'very_severe': return 'bg-red-200 text-red-900';
      case 'extreme': return 'bg-red-300 text-red-950';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'none': return <span className="text-sm">🌟</span>;
      case 'very_minimal': return <span className="text-sm">😊</span>;
      case 'minimal': return <span className="text-sm">🙂</span>;
      case 'very_mild': return <span className="text-sm">😐</span>;
      case 'mild': return <span className="text-sm">😕</span>;
      case 'moderate': return <span className="text-sm">😟</span>;
      case 'moderately_severe': return <span className="text-sm">😰</span>;
      case 'severe': return <span className="text-sm">😱</span>;
      case 'very_severe': return <span className="text-sm">🥺</span>;
      case 'extreme': return <span className="text-sm">😵</span>;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-subtle shadow-card">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Analysis Results</h2>
          </div>
          
          <div className="relative inline-block">
            <img 
              src={capturedImage} 
              alt="Captured for analysis" 
              className="w-48 h-36 object-cover rounded-lg shadow-card mx-auto"
            />
          </div>

          <Badge className={`${getSeverityColor(analysis.severity)} px-4 py-2 text-lg font-semibold`}>
            {getSeverityIcon(analysis.severity)}
            <span className="ml-2 capitalize">{analysis.severity} Eyebags</span>
          </Badge>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 shadow-card">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-primary"></div>
              <h3 className="font-semibold">Darkness Level</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Darkness</span>
                <span className="font-medium">{analysis.darkness}%</span>
              </div>
              <Progress value={analysis.darkness} className="h-3" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <h3 className="font-semibold">Puffiness Level</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Puffiness</span>
                <span className="font-medium">{analysis.puffiness}%</span>
              </div>
              <Progress value={analysis.puffiness} className="h-3" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Overall Score</h3>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {analysis.overallScore}/100
            </div>
            <Progress value={analysis.overallScore} className="h-4 mb-4" />
            <p className="text-muted-foreground">
              Higher scores indicate more prominent eyebags
            </p>
          </div>
          
          {analysis.confidenceScore && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Confidence Score</span>
                <span className="text-sm font-bold">{analysis.confidenceScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lighting Quality</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  analysis.lightingQuality === 'good' ? 'bg-green-100 text-green-800' :
                  analysis.lightingQuality === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {analysis.lightingQuality}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {analysis.observations && analysis.observations.length > 0 && (
        <Card className="p-6 shadow-card">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Observations
            </h3>
            <ul className="space-y-2">
              {analysis.observations.map((observation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                  <p className="text-sm text-muted-foreground">{observation}</p>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {analysis.recommendations.length > 0 && (
        <Card className="p-6 shadow-card">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                  <p className="text-sm text-muted-foreground">{recommendation}</p>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};