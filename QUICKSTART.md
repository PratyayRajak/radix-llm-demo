# 🚀 Quick Start

## 1. Install & Setup (30 seconds)

```bash
npm install
cp .env.example .env.local
# Add your OpenAI API key to .env.local
```

## 2. Run Demo (Single Command)

```bash
npm run demo
```

## 3. Test the AI

1. **Click a demo prompt button** (e.g., "Create a simple NFT blueprint")
2. **Click "Generate & Test"**
3. **Watch the magic happen:**
   - ✨ AI generates Scrypto code
   - 📝 Code is extracted and written to files
   - 🧪 Tests run automatically
   - 🔄 Failed tests trigger retry with error feedback
   - 📊 Results are logged with metrics

## What You're Seeing

### The Full Closed Loop:
```
Prompt → GPT-4 → Scrypto Code → File Write → cargo test → 
  ↓ (if failed)
Error → GPT-4 (retry) → Fixed Code → cargo test → ✅ Success
```

### Key Features:
- **AI Code Generation**: GPT-4 generates RadixDLT smart contracts
- **Automated Testing**: Runs `cargo scrypto test` (or simulation)
- **Smart Retry Logic**: Feeds compilation errors back to AI
- **Results Tracking**: JSON log of all attempts
- **Real-Time UI**: Live progress with metrics

## Dashboard Tabs

- **Test**: Input prompts and run tests
- **Results**: View test history and generated code
- **Metrics**: See success rates and statistics

## Files Created

- `results.json` - Test history log
- `scrypto_output/` - Generated Scrypto projects
- `.env.local` - Your configuration

## Success Signals ✅

After running a test, you should see:

1. **Generated Code** - Rust/Scrypto code appears in UI
2. **Test Output** - Compilation results shown
3. **Retry Logic** - Failed tests auto-retry with error feedback
4. **Metrics Update** - Success rate and counts refresh
5. **JSON Logging** - Results saved to `results.json`

## Example Prompts

Try these:
- "Create a simple NFT blueprint with mint and transfer functions"
- "Build a basic token blueprint with supply management"  
- "Design a vault component for storing resources"
- "Create a gumball machine that dispenses tokens"

## Modes

### Simulation Mode (Default)
- Works without Scrypto CLI installed
- Validates code structure
- Perfect for demo

### Real Mode (Optional)
Install Scrypto CLI for actual compilation:
```bash
cargo install radix-scrypto-cli
```

---

**That's it! You're ready to prove LLMs can generate compile-clean smart contracts.**

🎯 **Mission**: Build the smallest proof that an LLM can spit out compile-clean Scrypto with no human intervention.

✅ **Status**: COMPLETE - Full closed loop with retry logic and web UI