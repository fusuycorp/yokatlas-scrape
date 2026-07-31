"""
User-Agent and HTTP Header Rotator module for YOK ATLAS API Scraper.
Provides realistic desktop browser headers with matched Client Hints (sec-ch-ua).
"""

import random
from typing import Dict, Any

# Pool of modern desktop user agents and matching Client Hints
USER_AGENT_POOL = [
    {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
    },
    {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
    },
    {
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
    },
    {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="125", "Google Chrome";v="125"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
    },
    {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
        "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="125", "Microsoft Edge";v="125"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
    },
    {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
        "sec-ch-ua": None,
        "sec-ch-ua-mobile": None,
        "sec-ch-ua-platform": None,
    },
    {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0",
        "sec-ch-ua": None,
        "sec-ch-ua-mobile": None,
        "sec-ch-ua-platform": None,
    }
]

ACCEPT_LANGUAGES = [
    "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    "en-US,en;q=0.9,tr-TR;q=0.8,tr;q=0.7",
    "tr,en-US;q=0.9,en;q=0.8",
    "tr-TR,tr;q=0.9",
    "en-US,en;q=0.9"
]

def get_random_headers() -> Dict[str, str]:
    """
    Generates a realistic randomized header set for request rotation.
    """
    profile = random.choice(USER_AGENT_POOL)
    headers = {
        "accept": "*/*",
        "accept-language": random.choice(ACCEPT_LANGUAGES),
        "content-type": "application/json",
        "origin": "https://yokatlas.yok.gov.tr",
        "priority": "u=1, i",
        "referer": "https://yokatlas.yok.gov.tr/",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": profile["user-agent"],
    }
    
    # Add sec-ch-ua headers if applicable
    if profile.get("sec-ch-ua"):
        headers["sec-ch-ua"] = profile["sec-ch-ua"]
    if profile.get("sec-ch-ua-mobile"):
        headers["sec-ch-ua-mobile"] = profile["sec-ch-ua-mobile"]
    if profile.get("sec-ch-ua-platform"):
        headers["sec-ch-ua-platform"] = profile["sec-ch-ua-platform"]

    # Add random X-Forwarded-For pseudo header to simulate IP variance if allowed by gateway
    ip_part = f"{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}"
    headers["x-forwarded-for"] = ip_part
    
    return headers
