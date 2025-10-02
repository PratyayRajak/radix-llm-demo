# app.py
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from pydantic import BaseModel
from openai import OpenAI
import subprocess

load_dotenv()

# Setup OpenRouter client
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL") or "openai/chatgpt-4o-latest"

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY
)

app = FastAPI()

# Request schema
class ChatRequest(BaseModel):
    question: str

@app.post("/chat")
async def chat(req: ChatRequest):
    user_q = req.question

    # If user explicitly asks for "generate code", use your prompt_to_code.py pipeline
    if "generate code" in user_q.lower():
        with open("prompt_tmp.txt", "w") as f:
            f.write(user_q)

        # run your existing script
        result = subprocess.run(
            ["python", "scripts/prompt_to_code.py", "--prompt-file", "prompt_tmp.txt"],
            capture_output=True, text=True
        )
        return {"response": result.stdout}

    # Otherwise, just use LLM for normal Q&A
    resp = client.chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=[{"role": "user", "content": user_q}],
        max_tokens=1000,
        temperature=0.3
    )
    return {"response": resp.choices[0].message.content}
