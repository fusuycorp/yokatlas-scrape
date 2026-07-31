# YOK ATLAS API Data Scraper

Automated, high-performance scraper for YÖK ATLAS Tercih Kılavuzu API (`https://yokatlas.yok.gov.tr/api/tercih-kilavuz/search`).

## Features

- **Asynchronous Scraping**: Powered by `httpx.AsyncClient` and `asyncio` for fast batch pagination (~2,150 pages with size 10 in under 30 seconds).
- **User-Agent & Identifier Rotation**: Dynamically rotates browser User-Agents, matched Sec-CH-UA Client Hints, Accept-Languages, and IP headers.
- **Local Checkpointing**: Caches fetched pages locally to enable instant resume upon network interrupt.
- **Structured Multi-Format Exporter**: Export scraped program data to **CSV**, **SQLite Database**, **JSON Lines**, **Parquet**, and **Excel**.

## Requirements & Setup

Uses [uv](https://github.com/astral-sh/uv) for fast Python environment management.

```bash
# Clone the repository
git clone git@github.com:fusuyfusuy/yokatlas-scrape.git
cd yokatlas-scrape

# Install dependencies and setup environment
uv sync
```

## Usage

Run the scraper CLI:

```bash
# Run full scrape (all ~21,500 records across 2,150 pages with page size 10)
uv run main.py --concurrency 20

# Run with custom page size and concurrency
uv run main.py --page-size 10 --concurrency 15

# Use specific filters from original-request.txt
uv run main.py --use-request-filters
```

## Outputs

Generated files are saved in `output/`:
- `output/yokatlas_tercih_kilavuz.csv`
- `output/yokatlas_tercih_kilavuz.db`
- `output/yokatlas_tercih_kilavuz.jsonl`
- `output/yokatlas_tercih_kilavuz.parquet`
- `output/yokatlas_tercih_kilavuz.xlsx`
