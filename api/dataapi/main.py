# import requests
# from bs4 import BeautifulSoup
# from fastapi import FastAPI
# from pydantic import BaseModel
# import re
#
# app = FastAPI()
#
# class NameRequest(BaseModel):
#     name: str
#
# def clean_text(text):
#     return ' '.join(text.split()).strip()
#
# def get_google_search_results(name):
#     query = f"site:linkedin.com/in/ {name}"
#     headers = {
#         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
#     }
#     search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
#
#     response = requests.get(search_url, headers=headers)
#     if response.status_code != 200:
#         raise Exception(f"Failed to fetch search results. Status code: {response.status_code}")
#
#     return response.text
#
# def parse_search_results(html_content):
#     soup = BeautifulSoup(html_content, 'html.parser')
#     profiles = []
#
#     # Fetch all profile containers
#     profile_divs = soup.find_all('div', class_='MjjYud')
#
#     for div in profile_divs:
#         try:
#             # Extract username and LinkedIn URL
#             user_info_div = div.find('div', class_='kb0PBd cvP2Ce A9Y9g jGGQ5e')
#             profile_link_tag = user_info_div.find('a', href=True)
#             linkedin_url = profile_link_tag['href']
#             user_name_tag = profile_link_tag.find('h3', class_="LC20lb MBeuO DKV0Md")
#             user_name = clean_text(user_name_tag.text)
#
#             # Extract company and about section
#             additional_info_div = div.find('div', class_='kb0PBd cvP2Ce A9Y9g')
#             company_address_span = additional_info_div.find('span', class_='YrbPuc')
#             #company_address = clean_text(company_address_span.text) if company_address_span else "Address not found"
#
#             about_section_span = additional_info_div.find('div', class_='VwiC3b yXK7lf lVm3ye r025kc hJNv6b Hdw6tb')
#             about_section = clean_text(about_section_span.text) if about_section_span else "About section not found"
#
#             # Store the profile information
#             profile_info = {
#                 "name": user_name,
#                 "linkedin_url": linkedin_url,
#                 #"company_address": company_address,
#                 "about_section": about_section
#             }
#             profiles.append(profile_info)
#
#             # Break once we have 10 unique profiles
#             if len(profiles) >= 10:
#                 break
#         except Exception as e:
#             # Continue with the next profile in case of any parsing error
#             print(f"Error parsing profile: {e}")
#             continue
#
#     return profiles
#
# @app.post("/scrape_linkedin_profiles")
# async def scrape_linkedin_profiles(request: NameRequest):
#     try:
#         # Step 1: Get Google search results
#         search_results_html = get_google_search_results(request.name)
#
#         # Step 2: Parse the results to extract profile details
#         profiles = parse_search_results(search_results_html)
#
#         if not profiles:
#             return {"message": "No profiles found"}
#
#         return profiles
#
#     except Exception as e:
#         return {"error": str(e)}
#
# # To run the FastAPI app:
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8003)

import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import re

app = FastAPI()

# Add CORS middleware to allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


class NameRequest(BaseModel):
    name: str


def clean_text(text):
    return ' '.join(text.split()).strip()


def get_google_search_results(name):
    query = f"site:linkedin.com/in/ {name}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"

    response = requests.get(search_url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch search results. Status code: {response.status_code}")

    return response.text


def parse_search_results(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    profiles = []

    profile_divs = soup.find_all('div', class_='MjjYud')

    for div in profile_divs:
        try:
            user_info_div = div.find('div', class_='kb0PBd cvP2Ce A9Y9g jGGQ5e')
            profile_link_tag = user_info_div.find('a', href=True)
            linkedin_url = profile_link_tag['href']
            user_name_tag = profile_link_tag.find('h3', class_="LC20lb MBeuO DKV0Md")
            user_name = clean_text(user_name_tag.text)

            additional_info_div = div.find('div', class_='kb0PBd cvP2Ce A9Y9g')
            about_section_span = additional_info_div.find('div', class_='VwiC3b yXK7lf lVm3ye r025kc hJNv6b Hdw6tb')
            about_section = clean_text(about_section_span.text) if about_section_span else "About section not found"

            profile_info = {
                "name": user_name,
                "linkedin_url": linkedin_url,
                "about_section": about_section
            }
            profiles.append(profile_info)

            if len(profiles) >= 10:
                break
        except Exception as e:
            print(f"Error parsing profile: {e}")
            continue

    return profiles


@app.post("/scrape_linkedin_profiles")
async def scrape_linkedin_profiles(request: NameRequest):
    try:
        search_results_html = get_google_search_results(request.name)
        profiles = parse_search_results(search_results_html)

        if not profiles:
            return {"message": "No profiles found"}

        return profiles

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8003)
