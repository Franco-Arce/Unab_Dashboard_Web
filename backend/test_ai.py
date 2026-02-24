import asyncio
from cache import cache
import os
import httpx
# Need to import our routes to test
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from routes.ai import _openai_chat, _groq_chat

async def main():
    print("Testing Fallback...")
    
    # Intentionally ruin Groq Key temporarily to test OpenAI switch
    original_groq = os.environ.get("GROQ_API_KEY", "notset")
    os.environ["GROQ_API_KEY"] = "sk-fake-groq-key"
    
    messages = [{"role": "user", "content": "Di hola en 1 palabra"}]
    
    # 1. Test pure OpenAI
    print("1. Calling _openai_chat...")
    try:
        resp1 = await _openai_chat(messages, max_tokens=10)
        print("   -> Success:", resp1)
    except Exception as e:
        print("   -> Failed:", e)
        
    # 2. Test groq fallback logic
    # (Since we mocked the key it should raise an exception in _groq_chat,
    # but normally the endpoint catches it and calls openai)
    print("2. Calling _groq_chat with fake key...")
    try:
        await _groq_chat(messages, max_tokens=10)
        print("   -> Failed: Groq succeeded with a fake key?!")
    except Exception as e:
        print("   -> Success: Groq failed as expected -", type(e).__name__)
        print("      Now the endpoint would call `await _openai_chat()` instead!")

    # Cleanup
    os.environ["GROQ_API_KEY"] = original_groq


if __name__ == "__main__":
    asyncio.run(main())
