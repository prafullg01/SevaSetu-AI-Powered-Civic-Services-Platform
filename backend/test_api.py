import os, requests, json
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

prompt = """Rewrite the following government text into three distinct reading levels.
Format your response EXACTLY as a JSON object with keys: "simple", "standard", "legal". Do not include Markdown blocks or json tags.
Text: Pursuant to section 15 of the aforementioned act..."""

payload = {"contents": [{"parts": [{"text": prompt}]}]}

for model in ['gemini-2.0-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite']:
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}'
    print(f'Testing {model}...')
    try:
        res = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, timeout=10)
        data = res.json()
        if "error" in data:
            print("ERROR:", data["error"])
        else:
            print("SUCCESS! Length:", len(str(data)))
    except Exception as e:
        print("FAILED:", str(e))
    print("-" * 20)
