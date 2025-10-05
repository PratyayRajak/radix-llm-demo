# Setup Instructions

## Quick Setup (3 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key

Create `.env.local` file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 3. Run the Demo
```bash
npm run demo
```

That's it! The dashboard will open at http://localhost:3000

## What Happens Next?

The demo runner will:
1. ✅ Check for environment variables
2. ✅ Install dependencies (if needed)
3. ✅ Start the development server
4. ✅ Open the web UI in your browser

## Using the Dashboard

### Test Tab
1. Click any **Demo Prompt** button (or write your own)
2. Click **Generate & Test**
3. Watch the AI:
   - Generate Scrypto code
   - Extract and save to `.rs` files
   - Run tests automatically
   - Retry with error feedback if tests fail

### Results Tab
- View complete test history
- See pass/fail status
- Check retry counts
- Inspect generated code

### Metrics Tab
- Total tests run
- Success rate percentage
- Average retries needed
- Visual progress charts

## Testing Modes

### Simulation Mode (Default)
- Works immediately without Scrypto CLI
- Validates code structure
- Perfect for demonstration

### Real Scrypto Mode (Optional)
Install Rust and Scrypto CLI for actual compilation:

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Scrypto CLI
cargo install radix-scrypto-cli
```

The system automatically detects and uses Scrypto when available.

## Troubleshooting

### "OpenAI API key not configured"
- Make sure `.env.local` exists in project root
- Verify the key starts with `sk-`
- Restart the dev server: `Ctrl+C` then `npm run dev`

### Port 3000 already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Missing dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## File Structure After Setup

```
ai-scrypto-compliance/
├── .env.local              # Your API keys (git-ignored)
├── results.json            # Test results (created on first test)
├── scrypto_output/         # Generated Scrypto code (created on first test)
├── src/
│   ├── app/
│   │   ├── api/            # Backend endpoints
│   │   └── page.tsx        # Dashboard UI
└── README.md               # Full documentation
```

## Success Criteria Checklist

After running the demo, you should see:

- ✅ Web UI loads at http://localhost:3000
- ✅ Demo prompts are clickable
- ✅ AI generates Scrypto code
- ✅ Code appears in the interface
- ✅ Tests execute (simulation or real)
- ✅ Results are logged
- ✅ Retry logic works on failures
- ✅ Metrics update in real-time

## Next Steps

1. **Try the demo prompts** - Test the pre-loaded examples
2. **Create custom prompts** - Write your own Scrypto blueprint descriptions
3. **Review results** - Check the Results tab for test history
4. **Analyze metrics** - View success rates in the Metrics tab
5. **Inspect code** - Check `scrypto_output/` for generated files

## Support

For issues or questions:
1. Check `results.json` for detailed test logs
2. Review browser console for client-side errors
3. Check terminal output for server-side errors
4. Verify `.env.local` has valid API key

---

**Ready to prove LLMs can generate production-quality smart contracts?**

Run: `npm run demo`