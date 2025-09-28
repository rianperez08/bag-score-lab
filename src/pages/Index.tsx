import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CameraInterface } from '@/components/CameraInterface';
import { AnalysisResults, EyebagAnalysis } from '@/components/AnalysisResults';
import { GeminiAnalyzer } from '@/lib/gemini';
import { toast } from '@/hooks/use-toast';
import { Eye, Sparkles, Shield, Zap } from 'lucide-react';

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<EyebagAnalysis | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [step, setStep] = useState<'setup' | 'camera' | 'results'>('setup');

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to continue",
        variant: "destructive"
      });
      return;
    }
    setStep('camera');
  };

  const handleCapture = async (imageData: string) => {
    setIsAnalyzing(true);
    setCapturedImage(imageData);

    try {
      const analyzer = new GeminiAnalyzer(apiKey);
      const result = await analyzer.analyzeEyebags(imageData);
      setAnalysis(result);
      setStep('results');
      
      toast({
        title: "Analysis Complete!",
        description: "Your eyebag analysis is ready",
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the image. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setStep('camera');
    setAnalysis(null);
    setCapturedImage('');
  };

  if (step === 'results' && analysis) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Button 
              onClick={resetAnalysis}
              variant="outline"
              className="mb-4"
            >
              ← New Analysis
            </Button>
          </div>
          <AnalysisResults analysis={analysis} capturedImage={capturedImage} />
        </div>
      </div>
    );
  }

  if (step === 'camera') {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Button 
              onClick={() => setStep('setup')}
              variant="outline"
              className="mb-4"
            >
              ← Back to Setup
            </Button>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              EyeBag Analyzer
            </h1>
            <p className="text-xl text-muted-foreground">
              Position your face in the camera for AI analysis
            </p>
          </div>
          <CameraInterface onCapture={handleCapture} isAnalyzing={isAnalyzing} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Eye Analysis
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              EyeBag
            </span>
            <br />
            <span className="text-foreground">Analyzer</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get instant AI-powered analysis of your under-eye area. Measure darkness, puffiness, 
            and receive personalized recommendations for healthier-looking eyes.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <Card className="p-6 shadow-card">
              <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Precise Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI analyzes darkness and puffiness levels with medical-grade precision
              </p>
            </Card>
            
            <Card className="p-6 shadow-card">
              <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Instant Results</h3>
              <p className="text-sm text-muted-foreground">
                Get comprehensive analysis in seconds with actionable recommendations
              </p>
            </Card>
            
            <Card className="p-6 shadow-card">
              <Shield className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-muted-foreground">
                Your images are processed securely and never stored or shared
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* API Key Setup */}
      <section className="py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8 shadow-elegant">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Get Started</h2>
              <p className="text-muted-foreground">
                Enter your Gemini API key to begin analyzing your eyebags
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey">Gemini API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <Button 
                onClick={handleApiKeySubmit}
                className="w-full bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow"
                size="lg"
              >
                Start Analysis
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Your API key is only used for this session and is never stored
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;