"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, Code, Play, History, BarChart3, Sparkles } from 'lucide-react';

interface TestResult {
  id: string;
  timestamp: string;
  prompt: string;
  blueprintName: string;
  success: boolean;
  attempts: number;
  retryCount: number;
  code: string;
  error?: string;
  output?: string;
  duration?: number;
  simulationMode?: boolean;
}

interface Statistics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageRetries: string;
  successRate: string;
}

const DEMO_PROMPTS = [
  "Create a simple NFT blueprint with mint and transfer functions",
  "Build a basic token blueprint with supply management",
  "Design a simple vault component for storing resources",
  "Create a gumball machine blueprint that dispenses tokens",
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [blueprintName, setBlueprintName] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [maxRetries] = useState(3);
  const [results, setResults] = useState<TestResult[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      setResults(data.results || []);
      setStatistics(data.statistics || null);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const generateAndTest = async (retryError?: string) => {
    try {
      setCurrentStep('Generating Scrypto code with AI...');
      setProgress(25);

      const genResponse = await fetch('/api/generate-scrypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, previousError: retryError }),
      });

      const genData = await genResponse.json();
      if (!genResponse.ok) throw new Error(genData.error);

      setGeneratedCode(genData.code);
      setCurrentStep('Code generated! Running cargo scrypto test...');
      setProgress(50);

      await new Promise(resolve => setTimeout(resolve, 500));

      const testResponse = await fetch('/api/execute-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: genData.code,
          blueprintName: blueprintName || 'test_blueprint',
          testId: Date.now().toString(),
        }),
      });

      const testData = await testResponse.json();
      setTestOutput(testData.output || testData.error || '');
      setProgress(75);

      return testData;
    } catch (error: any) {
      throw new Error(error.message || 'Generation/test failed');
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setCurrentAttempt(1);
    setProgress(0);
    setGeneratedCode('');
    setTestOutput('');

    const startTime = Date.now();
    let testData;
    let lastError = '';

    try {
      // Initial attempt
      testData = await generateAndTest();

      // Retry logic
      while (!testData.success && currentAttempt < maxRetries) {
        setCurrentAttempt(prev => prev + 1);
        setCurrentStep(`Test failed. Retrying (${currentAttempt + 1}/${maxRetries})...`);
        setProgress(25);
        await new Promise(resolve => setTimeout(resolve, 1000));

        lastError = testData.error || testData.output;
        testData = await generateAndTest(lastError);
      }

      const duration = Date.now() - startTime;
      setProgress(100);
      setCurrentStep(testData.success ? '✅ Tests passed!' : '❌ Tests failed after retries');

      // Save result
      const result: TestResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        prompt,
        blueprintName: blueprintName || 'test_blueprint',
        success: testData.success,
        attempts: currentAttempt,
        retryCount: currentAttempt - 1,
        code: generatedCode,
        error: testData.success ? undefined : testData.error,
        output: testData.output,
        duration,
        simulationMode: testData.simulationMode,
      };

      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      await fetchResults();

    } catch (error: any) {
      setCurrentStep(`❌ Error: ${error.message}`);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const loadDemoPrompt = (demoPrompt: string) => {
    setPrompt(demoPrompt);
    setBlueprintName(demoPrompt.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Scrypto Compliance Engineer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Proving LLMs can generate compile-clean RadixDLT smart contracts with automated testing
          </p>
        </div>

        <Tabs defaultValue="test" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="test">
              <Play className="w-4 h-4 mr-2" />
              Test
            </TabsTrigger>
            <TabsTrigger value="results">
              <History className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>

          {/* Test Tab */}
          <TabsContent value="test" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Prompt Input</CardTitle>
                  <CardDescription>
                    Describe the Scrypto blueprint you want to generate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Blueprint Description
                    </label>
                    <Textarea
                      placeholder="e.g., Create a simple NFT blueprint with mint and transfer functions"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Blueprint Name (optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="my_blueprint"
                      value={blueprintName}
                      onChange={(e) => setBlueprintName(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !prompt.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Generate & Test
                      </>
                    )}
                  </Button>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Demo Prompts:</p>
                    <div className="space-y-2">
                      {DEMO_PROMPTS.map((demo, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => loadDemoPrompt(demo)}
                          disabled={loading}
                        >
                          {demo}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Execution Status</CardTitle>
                  <CardDescription>
                    Real-time progress with retry logic
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <Alert>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <AlertDescription>{currentStep}</AlertDescription>
                      </Alert>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Attempt {currentAttempt} of {maxRetries}
                        </span>
                        <Badge variant="outline">
                          Retries: {currentAttempt - 1}
                        </Badge>
                      </div>
                    </>
                  )}

                  {!loading && currentStep && (
                    <Alert variant={currentStep.includes('✅') ? 'default' : 'destructive'}>
                      {currentStep.includes('✅') ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <AlertDescription>{currentStep}</AlertDescription>
                    </Alert>
                  )}

                  {generatedCode && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        <span className="text-sm font-medium">Generated Code</span>
                      </div>
                      <ScrollArea className="h-64 w-full border rounded-md p-4 bg-muted/50">
                        <pre className="text-xs">
                          <code>{generatedCode}</code>
                        </pre>
                      </ScrollArea>
                    </div>
                  )}

                  {testOutput && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Test Output</span>
                      <ScrollArea className="h-32 w-full border rounded-md p-4 bg-muted/50">
                        <pre className="text-xs whitespace-pre-wrap">
                          {testOutput}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Test History</CardTitle>
                <CardDescription>
                  Complete log of all test attempts with pass/fail status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {results.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No test results yet. Run your first test!
                      </p>
                    ) : (
                      results.map((result) => (
                        <Card key={result.id} className="border-2">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-base">
                                  {result.blueprintName}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  {new Date(result.timestamp).toLocaleString()}
                                </CardDescription>
                              </div>
                              <Badge
                                variant={result.success ? 'default' : 'destructive'}
                                className="ml-2"
                              >
                                {result.success ? (
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                ) : (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                                {result.success ? 'PASSED' : 'FAILED'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm">{result.prompt}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>Attempts: {result.attempts}</span>
                              <span>Retries: {result.retryCount}</span>
                              {result.duration && (
                                <span>Duration: {(result.duration / 1000).toFixed(1)}s</span>
                              )}
                              {result.simulationMode && (
                                <Badge variant="outline" className="text-xs">
                                  Simulation
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Tests</CardDescription>
                  <CardTitle className="text-4xl">
                    {statistics?.totalTests || 0}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Passed Tests</CardDescription>
                  <CardTitle className="text-4xl text-green-600">
                    {statistics?.passedTests || 0}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Success Rate</CardDescription>
                  <CardTitle className="text-4xl text-blue-600">
                    {statistics?.successRate || 0}%
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Avg Retries</CardDescription>
                  <CardTitle className="text-4xl text-purple-600">
                    {statistics?.averageRetries || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Success Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                {statistics && statistics.totalTests > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Passed</span>
                        <span className="text-sm font-medium">
                          {statistics.passedTests} / {statistics.totalTests}
                        </span>
                      </div>
                      <Progress
                        value={(parseInt(statistics.successRate) || 0)}
                        className="h-4"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No metrics available yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}