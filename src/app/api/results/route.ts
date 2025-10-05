import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const RESULTS_FILE = path.join(process.cwd(), 'results.json');

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

async function readResults(): Promise<TestResult[]> {
  try {
    const data = await fs.readFile(RESULTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeResults(results: TestResult[]): Promise<void> {
  await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const results = await readResults();
    
    // Calculate statistics
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const averageRetries = totalTests > 0 
      ? results.reduce((sum, r) => sum + r.retryCount, 0) / totalTests 
      : 0;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return NextResponse.json({
      results,
      statistics: {
        totalTests,
        passedTests,
        failedTests,
        averageRetries: averageRetries.toFixed(2),
        successRate: successRate.toFixed(1),
      },
    });
  } catch (error) {
    console.error('Error reading results:', error);
    return NextResponse.json(
      { error: 'Failed to read results' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const result: TestResult = await request.json();
    
    const results = await readResults();
    results.unshift(result); // Add to beginning
    
    // Keep only last 100 results
    if (results.length > 100) {
      results.splice(100);
    }
    
    await writeResults(results);
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error saving result:', error);
    return NextResponse.json(
      { error: 'Failed to save result' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await writeResults([]);
    return NextResponse.json({ success: true, message: 'Results cleared' });
  } catch (error) {
    console.error('Error clearing results:', error);
    return NextResponse.json(
      { error: 'Failed to clear results' },
      { status: 500 }
    );
  }
}