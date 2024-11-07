import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import re
from typing import List, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NameRequest(BaseModel):
    name: str

class ProfileResponse(BaseModel):
    name: str
    linkedin_url: str
    about_section: Optional[str] = None

def clean_text(text: str) -> str:
    """Clean and normalize text by removing extra whitespace."""
    return ' '.join(text.split()).strip() if text else ""

def get_google_search_results(name: str) -> str:
    """Fetch Google search results for LinkedIn profiles."""
    try:
        query = f"site:linkedin.com/in/ {name}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        }
        search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
        response = requests.get(search_url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        logger.error(f"Error fetching search results for '{name}': {str(e)}")
        raise HTTPException(status_code=503, detail="Failed to fetch search results")

def extract_linkedin_url(href: str) -> Optional[str]:
    """Extract LinkedIn profile URL from Google search result href."""
    linkedin_pattern = r'https?://[w\.]*linkedin\.com/in/[a-zA-Z0-9-]+(?:/[a-zA-Z0-9-]+)?'
    match = re.search(linkedin_pattern, href)
    return match.group(0) if match else None

def parse_search_results(html_content: str) -> List[ProfileResponse]:
    """Parse Google search results to extract LinkedIn profile information."""
    profiles = []
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        search_results = soup.find_all('div', {'class': ['g', 'tF2Cxc']})

        for result in search_results:
            try:
                link = result.find('a')
                if not link:
                    continue

                linkedin_url = extract_linkedin_url(link.get('href'))
                if not linkedin_url:
                    continue

                title = result.find('h3')
                name = clean_text(title.text) if title else ""
                description = result.find('div', {'class': ['VwiC3b', 'yXK7lf']})
                about_section = clean_text(description.text) if description else ""

                if name and linkedin_url:
                    profiles.append(ProfileResponse(name=name, linkedin_url=linkedin_url, about_section=about_section))

                if len(profiles) >= 10:
                    break

            except Exception as e:
                logger.warning(f"Error parsing individual result: {str(e)}")
                continue

    except Exception as e:
        logger.error(f"Error parsing search results: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to parse search results")

    return profiles

@app.post("/scrape_linkedin_profiles", response_model=List[ProfileResponse])
async def scrape_linkedin_profiles(request: NameRequest):
    """Endpoint to scrape LinkedIn profiles based on name search."""
    try:
        if not request.name.strip():
            raise HTTPException(status_code=400, detail="Name cannot be empty")

        logger.info(f"Scraping LinkedIn profiles for name: {request.name}")
        search_results_html = get_google_search_results(request.name)
        profiles = parse_search_results(search_results_html)

        logger.info(f"Found {len(profiles)} profiles for name: {request.name}")
        return profiles

    except HTTPException as http_ex:
        logger.error(f"HTTP error occurred: {http_ex.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while scraping profiles: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)