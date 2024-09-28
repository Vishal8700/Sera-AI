from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],  # You can restrict allowed methods, e.g., ['GET', 'POST']
    allow_headers=["*"],  # You can restrict allowed headers, e.g., ['Authorization', 'Content-Type']
)

# Get your API key from environment variable
SERPAPI_KEY = os.getenv("SERPAPI_KEY")


class SearchRequest(BaseModel):
    query: str


def get_search_results_and_summaries(query):
    url = "https://serpapi.com/search"
    params = {
        "q": query,
        "api_key": SERPAPI_KEY,
        "num": 6  # Hardcoded to 6 results
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        results = []
        for result in data.get("organic_results", [])[:6]:  # Limit to 6 results
            results.append({
                "title": result.get("title"),
                "link": result.get("link"),
                "snippet": result.get("snippet")
            })

        return results
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching search results: {str(e)}")


@app.post("/search")
async def search_and_summarize(search_request: SearchRequest):
    try:
        results = get_search_results_and_summaries(search_request.query)

        # Combine snippets to form a summary
        combined_summary = " ".join([result["snippet"] for result in results if result["snippet"]])

        return {
            "summary": combined_summary,
            "sources": [result["link"] for result in results],
            # "detailed_results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8004)
