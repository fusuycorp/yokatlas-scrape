"""
Asynchronous Scraper Module for YOK ATLAS API.
Supports header/User-Agent rotation, rate-limit retries, local page checkpointing,
and concurrent page fetching.
"""

import asyncio
import hashlib
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import httpx
from tqdm.asyncio import tqdm

from user_agents import get_random_headers

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logger = logging.getLogger("yokatlas_scraper")

BASE_URL = "https://yokatlas.yok.gov.tr/api/tercih-kilavuz/search"

DEFAULT_FILTERS = {
    "puanTuru": None,
    "universiteId": [],
    "birimGrupId": [],
    "ilKodu": [],
    "birimTuruId": None,
    "universiteTuru": None,
    "bursOraniId": None,
    "ogrenimTuruId": None,
    "kilavuzKodu": None,
    "minBasariSirasi": None,
    "maxBasariSirasi": None
}


class YokAtlasScraper:
    def __init__(
        self,
        filters: Optional[Dict[str, Any]] = None,
        page_size: int = 10,
        concurrency: int = 15,
        cache_dir: Path = Path(".cache"),
        max_retries: int = 5
    ):
        self.filters = filters if filters is not None else DEFAULT_FILTERS
        self.page_size = page_size
        self.concurrency = concurrency
        # Include a stable hash of the filters so runs with different filter payloads
        # never silently reuse each other's cached pages.
        filter_key = str(sorted(self.filters.items()) if isinstance(self.filters, dict) else self.filters)
        cache_suffix = hashlib.sha1(filter_key.encode("utf-8")).hexdigest()[:10]
        self.cache_dir = cache_dir / f"pages_size_{page_size}_{cache_suffix}"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.max_retries = max_retries

    def _get_page_cache_path(self, page_num: int) -> Path:
        return self.cache_dir / f"page_{page_num:05d}.json"

    async def fetch_page(
        self, client: httpx.AsyncClient, page_num: int, semaphore: asyncio.Semaphore
    ) -> Dict[str, Any]:
        """
        Fetches a single page with caching, User-Agent rotation, and retry logic.
        """
        cache_file = self._get_page_cache_path(page_num)
        if cache_file.exists():
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Corrupted cache file at page {page_num}, re-fetching: {e}")

        payload = {
            "filters": self.filters,
            "page": page_num,
            "size": self.page_size,
            "sortBy": "basariSirasi",
            "direction": "ASC"
        }

        async with semaphore:
            for attempt in range(1, self.max_retries + 1):
                try:
                    # Rotate headers & User-Agent on each request attempt
                    headers = get_random_headers()
                    response = await client.post(BASE_URL, json=payload, headers=headers, timeout=20.0)
                    
                    if response.status_code == 200:
                        data = response.json()
                        # Save to local cache checkpoint
                        with open(cache_file, "w", encoding="utf-8") as f:
                            json.dump(data, f, ensure_ascii=False)
                        return data
                    elif response.status_code in [429, 500, 502, 503, 504]:
                        sleep_time = attempt * 2
                        logger.warning(f"Page {page_num} returned HTTP {response.status_code}, retrying in {sleep_time}s (Attempt {attempt}/{self.max_retries})")
                        await asyncio.sleep(sleep_time)
                    else:
                        logger.error(f"Unexpected HTTP status {response.status_code} for page {page_num}: {response.text[:200]}")
                        response.raise_for_status()

                except Exception as e:
                    if attempt == self.max_retries:
                        logger.error(f"Failed to fetch page {page_num} after {self.max_retries} attempts: {e}")
                        raise
                    sleep_time = attempt * 1.5
                    await asyncio.sleep(sleep_time)

        raise RuntimeError(f"Could not fetch page {page_num}")

    async def get_initial_info(self) -> Dict[str, Any]:
        """
        Fetches metadata (totalPages, totalElements) from page 0.
        """
        async with httpx.AsyncClient(verify=False) as client:
            semaphore = asyncio.Semaphore(1)
            data = await self.fetch_page(client, 0, semaphore)
            return {
                "totalPages": data.get("totalPages", 0),
                "totalElements": data.get("totalElements", 0),
                "size": data.get("size", self.page_size)
            }

    async def scrape_all(self, max_pages_limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Scrapes all pages asynchronously and returns all program content items.
        """
        initial_info = await self.get_initial_info()
        total_pages = initial_info["totalPages"]
        total_elements = initial_info["totalElements"]

        if max_pages_limit:
            total_pages = min(total_pages, max_pages_limit)

        logger.info(f"Targeting {total_elements} records across {total_pages} pages (size={self.page_size}). Concurrency={self.concurrency}")

        semaphore = asyncio.Semaphore(self.concurrency)
        all_items: List[Dict[str, Any]] = []

        # Configure connection limits for httpx AsyncClient
        limits = httpx.Limits(max_keepalive_connections=self.concurrency, max_connections=self.concurrency * 2)
        async with httpx.AsyncClient(limits=limits, timeout=30.0, verify=False) as client:
            tasks = [self.fetch_page(client, page, semaphore) for page in range(total_pages)]
            
            # Use tqdm to monitor progress
            results = await tqdm.gather(*tasks, desc=f"Scraping {total_pages} pages")

            for page_data in results:
                content = page_data.get("content", [])
                all_items.extend(content)

        logger.info(f"Successfully scraped {len(all_items)} records from {total_pages} pages.")
        return all_items
