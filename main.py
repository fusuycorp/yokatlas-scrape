"""
Main entry point for YOK ATLAS Scraper CLI.
Loads original request configuration, executes asynchronous scraping with user-agent rotation,
and exports structured outputs to CSV, SQLite, JSONL, Parquet, and Excel.
"""

import argparse
import asyncio
import json
import re
import sys
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from scraper import YokAtlasScraper, DEFAULT_FILTERS
from exporter import export_all

console = Console()


def parse_original_request(file_path: Path) -> dict:
    """
    Parses the JSON payload from a curl command in original-request.txt.
    """
    if not file_path.exists():
        return DEFAULT_FILTERS

    content = file_path.read_text(encoding="utf-8")
    # Match --data-raw '...' or -d '...'
    match = re.search(r"--data(?:-raw)?\s+'({.*?})'", content, re.DOTALL)
    if match:
        try:
            payload = json.loads(match.group(1))
            return payload.get("filters", DEFAULT_FILTERS)
        except Exception as e:
            console.print(f"[yellow]Warning: Could not parse JSON from {file_path}: {e}[/yellow]")
    return DEFAULT_FILTERS


def main():
    parser = argparse.ArgumentParser(description="YOK ATLAS Tercih Klavuzu API Scraper")
    parser.add_argument("--page-size", type=int, default=10, help="Page size for pagination (default: 10, total 2150 pages)")
    parser.add_argument("--concurrency", type=int, default=15, help="Number of concurrent requests (default: 15)")
    parser.add_argument("--max-pages", type=int, default=None, help="Limit max pages to scrape (for testing)")
    parser.add_argument("--use-request-filters", action="store_true", help="Use specific filters found in original-request.txt")
    parser.add_argument("--output-dir", type=str, default="output", help="Directory to save exported files (default: output)")
    
    args = parser.parse_args()

    console.print(Panel.fit("[bold blue]YOK ATLAS API Data Extractor & Pipeline[/bold blue]"))

    # Determine filters
    req_file = Path("original-request.txt")
    if args.use_request_filters and req_file.exists():
        console.print("[cyan]Loading filters from original-request.txt...[/cyan]")
        filters = parse_original_request(req_file)
    else:
        console.print("[cyan]Using full extract filters (empty filters to fetch all 21,493+ records)...[/cyan]")
        filters = DEFAULT_FILTERS.copy()

    output_dir = Path(args.output_dir)

    # Initialize scraper
    scraper = YokAtlasScraper(
        filters=filters,
        page_size=args.page_size,
        concurrency=args.concurrency
    )

    # Run async scraping loop
    items = asyncio.run(scraper.scrape_all(max_pages_limit=args.max_pages))

    if not items:
        console.print("[bold red]No items collected. Exiting.[/bold red]")
        sys.exit(1)

    console.print(f"\n[bold green]Successfully collected {len(items)} records![/bold green]")
    console.print("[cyan]Exporting to multiple structured formats (CSV, SQLite, JSONL, Parquet, Excel)...[/cyan]")

    # Export datasets
    summary = export_all(items, output_dir=output_dir)

    table = Table(title="Generated Files & Output Summary")
    table.add_column("Format", style="cyan")
    table.add_column("File Path", style="magenta")
    table.add_column("Details", style="green")

    table.add_row("CSV", str(summary["csv"]), f"{summary['total_records']} rows")
    table.add_row("SQLite DB", str(summary["sqlite"]), f"Tables: programs ({summary['total_records']}), conditions ({summary['total_conditions']})")
    table.add_row("JSON Lines", str(summary["jsonl"]), "Complete raw JSON records")
    table.add_row("Parquet", str(summary["parquet"]), "Columnar compressed format")
    table.add_row("Excel", str(summary["excel"]), "Spreadsheet file")

    console.print(table)
    console.print(Panel.fit("[bold green]Done! All datasets created successfully.[/bold green]"))


if __name__ == "__main__":
    main()
