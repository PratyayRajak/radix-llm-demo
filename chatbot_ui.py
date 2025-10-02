# chatbot_ui.py
import os
import subprocess
import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI

# Load env variables
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL") or "openai/chatgpt-4o-latest"

# OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY
)

# ------------------- STREAMLIT UI CONFIG -------------------

# --- INDUSTRY-READY UI ENHANCEMENTS ---
st.set_page_config(
    page_title="Radix AI Chatbot",
    page_icon="🤖",
    layout="wide"
)

st.markdown(
    """
    <style>
    body {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%) !important;
        color: #22223b;
    }
    .stTextInput > div > div > input {
        background-color: #fffbe7;
        color: #22223b;
        border-radius: 14px;
        padding: 14px;
        font-size: 1.15em;
        border: 2px solid #fcb69f;
        box-shadow: 0 2px 8px 0 #fcb69f33;
        transition: border 0.2s;
    }
    .stTextInput > div > div > input:focus {
        border: 2px solid #ff6f61;
        outline: none;
    }
    .chat-bubble {
        padding: 18px 24px;
        margin: 14px 0;
        border-radius: 24px;
        max-width: 75%;
        line-height: 1.6;
        box-shadow: 0 2px 16px 0 #fcb69f44;
        display: flex;
        align-items: flex-end;
        transition: background 0.3s, box-shadow 0.3s;
    }
    .chat-bubble:hover {
        box-shadow: 0 4px 24px 0 #ff6f6133;
    }
    .user-bubble {
        background: linear-gradient(90deg, #ff6f61 60%, #fcb69f 100%);
        color: white;
        margin-left: auto;
        border-radius: 24px 24px 8px 24px;
        box-shadow: 0 4px 20px 0 #ff6f6133;
    }
    .bot-bubble {
        background: linear-gradient(90deg, #43cea2 60%, #185a9d 100%);
        color: #fffbe7;
        margin-right: auto;
        border-radius: 24px 24px 24px 8px;
        box-shadow: 0 4px 20px 0 #43cea233;
    }
    .avatar {
        width: 38px; height: 38px; border-radius: 50%; margin: 0 12px 0 0; border: 2px solid #fffbe7; box-shadow: 0 2px 8px 0 #fcb69f33;
        background-size: cover; background-position: center;
    }
    .user-avatar { background-image: url('https://api.dicebear.com/7.x/identicon/svg?seed=user'); }
    .bot-avatar { background-image: url('https://api.dicebear.com/7.x/bottts/svg?seed=radix'); }
    .typing {
        font-style: italic;
        color: #ff6f61;
    }
    pre {
        background-color: #fffbe7;
        color: #22223b;
        padding: 14px;
        border-radius: 14px;
        overflow-x: auto;
        font-size: 1.08em;
        box-shadow: 0 2px 8px 0 #fcb69f33;
    }
    .footer {
        text-align: center;
        color: #22223b;
        font-size: 1.05em;
        margin-top: 36px;
        opacity: 0.8;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ------------------- SIDEBAR -------------------

with st.sidebar:
    st.image("https://avatars.githubusercontent.com/u/37784886?s=200&v=4", width=64)
    st.markdown("<h2 style='margin-bottom:0;'>⚙️ Settings</h2>", unsafe_allow_html=True)
    model_choice = st.selectbox(
        "Choose Model",
        ["openai/chatgpt-4o-latest", "anthropic/claude-3-opus", "meta-llama/llama-3-70b-instruct"],
        index=0
    )
    if model_choice != OPENROUTER_MODEL:
        OPENROUTER_MODEL = model_choice
    if st.button("🧹 Clear Chat"):
        st.session_state["messages"] = []
    st.markdown("<hr>", unsafe_allow_html=True)
    st.caption("<span style='color:#3b82f6;'>Built with ❤️ for Radix & Scrypto</span>", unsafe_allow_html=True)

# ------------------- MAIN TITLE -------------------

st.markdown("""
<div style='display:flex;align-items:center;gap:12px;'>
    <img src='https://avatars.githubusercontent.com/u/37784886?s=200&v=4' width='48' style='border-radius:12px;'>
    <h1 style='margin-bottom:0;'>Radix LLM Chatbot</h1>
</div>
<div style='margin-bottom:16px;color:#8b949e;'>Ask me about Radix, Scrypto, or generate blueprints!</div>
""", unsafe_allow_html=True)

# ------------------- SESSION STATE -------------------
if "messages" not in st.session_state:
    st.session_state["messages"] = []

# ------------------- LAYOUT: CHAT + FILES -------------------
chat_col, file_col = st.columns([2, 1])


with chat_col:
    # Display chat history with avatars
    for role, content in st.session_state["messages"]:
        css_class = "user-bubble" if role == "user" else "bot-bubble"
        avatar_class = "user-avatar" if role == "user" else "bot-avatar"
        st.markdown(f"<div style='display:flex;align-items:flex-end;gap:10px;{'flex-direction:row-reverse;' if role=='user' else ''}'>"
                    f"<div class='avatar {avatar_class}'></div>"
                    f"<div class='chat-bubble {css_class}'>{content}</div>"
                    f"</div>", unsafe_allow_html=True)

    # User input
    user_q = st.chat_input("💬 Type your question here...")

    if user_q:
        st.session_state["messages"].append(("user", user_q))

        with st.spinner("🤖 Thinking..."):
            # If user asked for code generation
            if "generate code" in user_q.lower():
                with open("prompt_tmp.txt", "w") as f:
                    f.write(user_q)
                result = subprocess.run(
                    ["python", "scripts/prompt_to_code.py", "--prompt-file", "prompt_tmp.txt", "--no-retry"],
                    capture_output=True, text=True
                )
                reply = result.stdout or "⚠️ Error running code generation."
            else:
                resp = client.chat.completions.create(
                    model=OPENROUTER_MODEL,
                    messages=[{"role": "system", "content": "You are a helpful Radix/Scrypto assistant."}] +
                             [{"role": r, "content": c} for r, c in st.session_state["messages"]],
                    max_tokens=800,
                    temperature=0.3
                )
                reply = resp.choices[0].message.content

        st.session_state["messages"].append(("assistant", reply))
        st.rerun()


with file_col:
    st.subheader("📂 Project Files")
    st.markdown("<div style='color:#8b949e;'>Latest generated code will appear below.</div>", unsafe_allow_html=True)
    if os.path.exists("tmp_project/src/lib.rs"):
        st.markdown("**lib.rs (generated)**")
        with open("tmp_project/src/lib.rs", "r", encoding="utf8") as f:
            code = f.read()
            st.code(code, language="rust")
    else:
        st.info("No code generated yet. Ask me to *generate code*.")

# --- FOOTER ---
st.markdown("""
<div class='footer'>
    &copy; 2025 Radix LLM Demo &mdash; <a href='https://radixdlt.com' style='color:#3b82f6;' target='_blank'>radixdlt.com</a>
</div>
""", unsafe_allow_html=True)
