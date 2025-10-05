# AI Scrypto Compliance Engineer

**Full-Stack Assignment:** Proving an LLM can be coached to generate compile-clean Scrypto (RadixDLT smart contract language) with automated testing, retry logic, and a web UI for prompt testing.

## 🎯 Mission

Build the smallest possible proof that an LLM can be coached to spit out compile-clean Scrypto (RadixDLT smart contract language) with no human intervention.

## ✨ Features

- **AI-Powered Code Generation**: GPT-4 integration to generate Scrypto blueprints from natural language prompts
- **Automated Testing**: Automatic execution of `cargo scrypto test` with real-time results
- **Smart Retry Logic**: Auto-retry mechanism that feeds compilation errors back to the AI for corrections
- **Results Tracking**: JSON-based logging of all test attempts with pass/fail status and retry counts
- **Real-Time Dashboard**: Beautiful web UI showing live progress, test history, and success metrics
- **Demo Mode**: Pre-loaded sample prompts for instant testing
- **Simulation Mode**: Works without Scrypto CLI installed (for demonstration purposes)

## 🏗️ Architecture

```
┌─────────────────┐
│   Web UI        │  Next.js + React + Shadcn/UI
│   (Dashboard)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Routes    │
├─────────────────┤
│ /api/generate-  │  → OpenAI GPT-4 Integration
│   scrypto       │
│                 │
│ /api/execute-   │  → Code Extraction + File Writing
│   test          │  → cargo scrypto test execution
│                 │
│ /api/results    │  → JSON Results Storage
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  File System    │
├─────────────────┤
│ scrypto_output/ │  Generated .rs files
│ results.json    │  Test history log
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (required)
- **OpenAI API Key** (required)
- **Rust + Cargo** (optional - for real Scrypto testing)
- **Scrypto CLI** (optional - for real Scrypto testing)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-scrypto-compliance

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY
```

### Single-Command Demo

```bash
# Run the complete demo
npm run demo
```

This will:
1. Start the development server
2. Open the web UI in your browser
3. Display pre-loaded demo prompts for instant testing

### Manual Start

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=sk-...your-key-here...
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

## 📖 Usage Guide

### 1. Test Interface

**Navigate to the "Test" tab:**

1. Enter a natural language description of the Scrypto blueprint you want
2. (Optional) Provide a custom blueprint name
3. Click "Generate & Test"

**Example prompts:**
- "Create a simple NFT blueprint with mint and transfer functions"
- "Build a basic token blueprint with supply management"
- "Design a vault component for storing resources"
- "Create a gumball machine that dispenses tokens"

### 2. Automated Workflow

The system automatically:

1. **Generate**: Sends your prompt to GPT-4 with Scrypto-specific instructions
2. **Extract**: Extracts Rust code from the AI response
3. **Write**: Creates `.rs` files in `scrypto_output/` directory
4. **Test**: Runs `cargo scrypto test` (or simulation mode)
5. **Retry**: If tests fail, feeds error back to AI and retries (up to 3 attempts)
6. **Log**: Records results in `results.json`

### 3. Results Tracking

**Navigate to the "Results" tab** to see:
- Complete test history
- Pass/fail status for each attempt
- Number of retries needed
- Generated code snippets
- Error messages
- Execution timestamps

### 4. Metrics Dashboard

**Navigate to the "Metrics" tab** for:
- Total tests run
- Success rate percentage
- Average retry count
- Visual progress charts

## 🧪 Testing Modes

### Simulation Mode (Default)

If Scrypto CLI is not installed, the system runs in **simulation mode**:
- Validates code structure (imports, blueprints, tests)
- Writes files for inspection
- Simulates test pass/fail based on code patterns
- Perfect for demonstrating the concept without full Scrypto setup

### Real Scrypto Testing

To enable real Scrypto testing:

1. Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Install Scrypto CLI:
```bash
cargo install radix-scrypto-cli
```

3. Run tests - the system will automatically detect Scrypto and use real compilation

## 📁 Project Structure

```
ai-scrypto-compliance/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-scrypto/  # AI code generation endpoint
│   │   │   │   └── route.ts
│   │   │   ├── execute-test/      # Test execution endpoint
│   │   │   │   └── route.ts
│   │   │   └── results/           # Results storage endpoint
│   │   │       └── route.ts
│   │   ├── page.tsx               # Main dashboard UI
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── components/
│       └── ui/                    # Shadcn/UI components
├── scrypto_output/                # Generated Scrypto projects
├── results.json                   # Test results log
├── package.json
└── README.md
```

## 🎨 Dashboard Features

### Real-Time Progress Tracking
- Live progress bar during code generation
- Step-by-step status updates
- Current attempt counter
- Retry count display

### Code Preview
- Syntax-highlighted generated code
- Raw test output display
- Error message formatting

### Success Metrics
- Total tests run
- Pass/fail statistics
- Average retry counts
- Success rate percentage

## 🔄 Retry Logic

The system implements intelligent retry logic:

1. **Initial Attempt**: Generate code and run tests
2. **On Failure**: Extract error messages from compiler output
3. **Retry**: Send error back to AI with instruction to fix
4. **Max Retries**: Up to 3 attempts per prompt
5. **Logging**: Record all attempts and final outcome

This demonstrates the AI's ability to self-correct and improve code quality.

## 📊 Results JSON Format

```json
{
  "id": "1234567890",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "prompt": "Create a simple NFT blueprint",
  "blueprintName": "nft_blueprint",
  "success": true,
  "attempts": 2,
  "retryCount": 1,
  "code": "use scrypto::prelude::*; ...",
  "output": "test result: ok. 1 passed; 0 failed",
  "duration": 15420,
  "simulationMode": true
}
```

## 🎯 Success Criteria

✅ **Data Foundations**: Stand up repo, harvest Radix docs + examples
✅ **First Closed Loop**: ChatGPT interface → generate code → run tests
✅ **Automation**: Wrap prompt-to-code in script with retry logic
✅ **Scorecard**: JSON logging of pass/fail + retry counts
✅ **Polish**: One-file web UI for prompt testing
✅ **Hand-off**: Single-command demo runner + comprehensive README

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: Shadcn/UI + Tailwind CSS
- **AI Integration**: OpenAI GPT-4
- **Smart Contract**: Scrypto (Radix DLT)
- **Testing**: Cargo + Scrypto CLI
- **Storage**: File system (JSON)

## 🐛 Troubleshooting

### "OpenAI API key not configured"
- Ensure `.env.local` exists with valid `OPENAI_API_KEY`
- Restart the dev server after adding environment variables

### "Scrypto CLI not found"
- System will automatically use simulation mode
- Install Scrypto CLI for real testing (optional)

### Tests failing in simulation mode
- Check that generated code includes:
  - `use scrypto::prelude::*;`
  - `#[blueprint]` macro
  - `#[cfg(test)]` module
  - `#[test]` functions

## 📝 API Endpoints

### POST /api/generate-scrypto
Generate Scrypto code from prompt
```json
{
  "prompt": "Create an NFT blueprint",
  "previousError": "optional error to fix"
}
```

### POST /api/execute-test
Execute tests on generated code
```json
{
  "code": "use scrypto::prelude::*; ...",
  "blueprintName": "test_blueprint",
  "testId": "1234567890"
}
```

### GET /api/results
Retrieve all test results and statistics

### POST /api/results
Save a new test result

### DELETE /api/results
Clear all results

## 🎥 Demo Video

To record a demo:
1. Run `npm run demo`
2. Use demo prompts to generate code
3. Show real-time progress and retry logic
4. Navigate through Results and Metrics tabs
5. Highlight success rate and automation

## 📄 License

MIT

## 👨‍💻 Author

Built as proof-of-concept for AI-assisted smart contract development

---

**🚀 Ready to prove LLMs can generate production-quality Scrypto code? Run `npm run demo` now!**