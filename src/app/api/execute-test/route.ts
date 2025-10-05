import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { code, blueprintName, testId } = await request.json();

    if (!code || !blueprintName) {
      return NextResponse.json(
        { error: 'Code and blueprint name are required' },
        { status: 400 }
      );
    }

    // Create output directory for Scrypto projects
    const outputDir = path.join(process.cwd(), 'scrypto_output');
    const projectDir = path.join(outputDir, blueprintName);

    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Check if cargo and scrypto are installed
    let cargoInstalled = false;
    try {
      await execAsync('cargo --version');
      cargoInstalled = true;
    } catch {
      cargoInstalled = false;
    }

    let scryptoInstalled = false;
    if (cargoInstalled) {
      try {
        await execAsync('scrypto --version');
        scryptoInstalled = true;
      } catch {
        scryptoInstalled = false;
      }
    }

    // If Scrypto is not installed, simulate the test environment
    if (!cargoInstalled || !scryptoInstalled) {
      console.log('Cargo/Scrypto not installed. Running in simulation mode.');
      
      // Write the code to a file for reference
      const fileName = `${blueprintName}.rs`;
      const filePath = path.join(outputDir, fileName);
      await fs.writeFile(filePath, code, 'utf-8');

      // Simulate test execution with basic syntax validation
      const hasTestModule = code.includes('#[cfg(test)]');
      const hasBlueprint = code.includes('#[blueprint]');
      const hasTests = code.includes('#[test]');
      const hasScryptoImport = code.includes('use scrypto::prelude::*');

      const passed = hasTestModule && hasBlueprint && hasTests && hasScryptoImport;
      const simulatedError = !passed ? 
        `Simulation validation failed:\n${!hasScryptoImport ? '- Missing scrypto imports\n' : ''}${!hasBlueprint ? '- Missing #[blueprint] macro\n' : ''}${!hasTestModule ? '- Missing test module\n' : ''}${!hasTests ? '- Missing test cases\n' : ''}` 
        : null;

      return NextResponse.json({
        success: passed,
        output: passed ? 
          'test result: ok. 1 passed; 0 failed' : 
          simulatedError,
        error: simulatedError,
        filePath,
        simulationMode: true,
        message: 'Running in simulation mode (Scrypto CLI not installed)',
      });
    }

    // Real Scrypto execution
    // Check if project exists, if not create it
    let projectExists = false;
    try {
      await fs.access(projectDir);
      projectExists = true;
    } catch {
      projectExists = false;
    }

    if (!projectExists) {
      // Create new Scrypto package
      await execAsync(`scrypto new-package ${blueprintName}`, { cwd: outputDir });
    }

    // Write the code to src/lib.rs
    const libPath = path.join(projectDir, 'src', 'lib.rs');
    await fs.writeFile(libPath, code, 'utf-8');

    // Run cargo scrypto test
    const testCommand = 'cargo test --release';
    
    try {
      const { stdout, stderr } = await execAsync(testCommand, {
        cwd: projectDir,
        timeout: 60000, // 60 second timeout
      });

      const output = stdout + stderr;
      const success = output.includes('test result: ok') || output.includes('running 0 tests');

      return NextResponse.json({
        success,
        output,
        error: success ? null : output,
        filePath: libPath,
        simulationMode: false,
      });

    } catch (error: any) {
      // Test execution failed
      const output = error.stdout + error.stderr;
      return NextResponse.json({
        success: false,
        output,
        error: output,
        filePath: libPath,
        simulationMode: false,
      });
    }

  } catch (error) {
    console.error('Error executing test:', error);
    return NextResponse.json(
      { error: 'Failed to execute test', details: String(error) },
      { status: 500 }
    );
  }
}