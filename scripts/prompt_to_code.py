#!/usr/bin/env python3
# scripts/prompt_to_code.py
import os, re, json, subprocess, argparse, time
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o")  # <-- Added default model
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY not set. Add it to your .env file")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY
)

def call_model_openrouter(prompt, model=OPENROUTER_MODEL):
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
    max_tokens=500,  # Further reduced to fit within current credit limit
        temperature=0.2
    )
    return resp.choices[0].message.content

def generate_code(prompt):
    return call_model_openrouter(prompt)

def extract_rust_blocks(text):
    blocks = re.findall(r"```(?:rust)?\n(.*?)```", text, flags=re.S)
    if not blocks:
        m = re.search(r"(pub\s+fn[\s\S]{50,}|blueprint![\s\S]{50,})", text)
        if m:
            blocks = [m.group(0)]
    return blocks

def write_project_from_block(block, workdir):
    os.makedirs(workdir, exist_ok=True)
    srcdir = os.path.join(workdir, "src")
    os.makedirs(srcdir, exist_ok=True)
    lib_path = os.path.join(srcdir, "lib.rs")
    with open(lib_path, "w", encoding="utf8") as f:
        f.write(block)
    toml_path = os.path.join(workdir, "Cargo.toml")
    if not os.path.exists(toml_path):
        with open(toml_path, "w", encoding="utf8") as f:
            f.write('[package]\nname = "generated_blueprint"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\nscrypto = "0.10.0"\n')
    return workdir

def run_cargo_test(workdir, use_docker=False, timeout=300):
    if use_docker:
        cmd = [
            "docker", "run", "--rm",
            "-v", f"{os.path.abspath(workdir)}:/workdir:ro",
            "-w", "/workdir",
            "rust:1.72",
            "bash", "-lc", "scrypto test"
        ]
        try:
            p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            ok = p.returncode == 0
            return ok, p.stdout + "\n" + p.stderr
        except Exception as e:
            return False, str(e)
    else:
        cmd = ["scrypto", "test"]
        try:
            p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=workdir)
            ok = p.returncode == 0
            return ok, p.stdout + "\n" + p.stderr
        except Exception as e:
            return False, str(e)

def attempt_run(prompt, workdir, retry_on_error=True):
    timestamp = int(time.time())
    results = {"prompt": prompt, "attempts": [], "timestamp": timestamp}
    out_text = generate_code(prompt)
    blocks = extract_rust_blocks(out_text)
    if not blocks:
        results["attempts"].append({"retry": 0, "ok": False, "error": "no_code_block", "model_output": out_text})
        return results

    write_project_from_block(blocks[0], workdir)
    ok, log = run_cargo_test(workdir, use_docker=False)
    results["attempts"].append({"retry": 0, "ok": ok, "log": log, "model_output": out_text})

    if not ok and retry_on_error:
        followup_prompt = prompt + "\n\nThe test failed. cargo returned:\n" + log + "\nPlease provide a corrected Scrypto blueprint that compiles and passes tests."
        out_text2 = generate_code(followup_prompt)
        blocks2 = extract_rust_blocks(out_text2)
        if blocks2:
            write_project_from_block(blocks2[0], workdir)
            ok2, log2 = run_cargo_test(workdir, use_docker=True)
            results["attempts"].append({"retry": 1, "ok": ok2, "log": log2, "model_output": out_text2})

    results["success"] = any(a["ok"] for a in results["attempts"])
    with open("results.json", "w", encoding="utf8") as f:
        json.dump(results, f, indent=2)
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--prompt-file", help="Path to plain text file with prompt", required=True)
    parser.add_argument("--workdir", default="output/tmp_project", help="Temporary project dir to write files")
    parser.add_argument("--no-retry", action="store_true", help="Disable retry")
    args = parser.parse_args()
    with open(args.prompt_file, "r", encoding="utf8") as pf:
        prompt = pf.read()
    res = attempt_run(prompt, args.workdir, retry_on_error=not args.no_retry)
    print("RESULT:", json.dumps(res, indent=2)[:2000])
    if res.get("success"):
        print("One blueprint passed tests — success signal met.")
    else:
        print("No successful pass. Check results.json and logs.")