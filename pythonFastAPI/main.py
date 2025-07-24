from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import tiktoken
import time

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = "5752d15c55df315184a82fdca124ecbad6e08be30ca5bb5bd578e68a95426a49"
MODEL = "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"
TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"

class PromptRequest(BaseModel):
    prompt: str

def count_tokens(text: str, model_name: str = "gpt-4") -> int:
    try:
        encoding = tiktoken.encoding_for_model(model_name)
        return len(encoding.encode(text))
    except:
        # Fallback: rough estimation
        return len(text.split()) * 1.3

@app.post("/api/generate")
async def generate_code(data: PromptRequest):
    start_time = time.time()
    system_instruction = """
    Tu es un assistant expert en programmation. Lorsqu'on te fournit du code avec des erreurs:
    1. Analyse les erreurs et propose une correction
    2. Affiche toujours le code original et le code corrigé côte à côte
    3. Surligne en rouge les parties problématiques dans le code original
    4. Surligne en vert les corrections apportées dans le code corrigé
    5. Explique brièvement les corrections apportées

    Format de réponse attendu:
    ### Code Original (avec erreurs)
    ```langage
    // Code avec parties problématiques surlignées
    ```

    ### Code Corrigé
    ```langage
    // Code avec corrections surlignées
    ```

    ### Explications
    - Explication des erreurs
    - Explication des corrections
    """

    full_prompt = f"{system_instruction.strip()}\n\n{data.prompt.strip()}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": full_prompt}],  # ici
        "temperature": 0.2,
        "max_tokens": 2048,
    }

    response = requests.post(TOGETHER_API_URL, headers=headers, json=payload)
    
    if response.status_code != 200:
        return {"error": f"API Error: {response.status_code} - {response.text}"}

    end_time = time.time()
    result = response.json()
    
    output = result["choices"][0]["message"]["content"].strip()
    input_tokens = count_tokens(full_prompt)
    output_tokens = count_tokens(output)

    return {
        "output": output,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "response_time_ms": round((end_time - start_time) * 1000, 2)
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)