# Data Pipeline & ETL Architecture

## Overview

The UniAtlas data pipeline ingests, cleans, normalizes, and indexes data from two major sources:
1. **YÖK ATLAS Real-Time Guide API** (`https://yokatlas.yok.gov.tr/api/tercih-kilavuz/search`)
2. **Kaggle Turkish University Admissions Historical Dataset (2019–2024)**

---

## 1. Scraping Engine & Header Rotation

### Target Endpoint Specifications
- **URL**: `POST https://yokatlas.yok.gov.tr/api/tercih-kilavuz/search`
- **Content-Type**: `application/json`
- **Request Payload**:
  ```json
  {
    "filters": {
      "puanTuru": null,
      "universiteId": [],
      "birimGrupId": [],
      "ilKodu": [],
      "birimTuruId": null,
      "universiteTuru": null,
      "bursOraniId": null,
      "ogrenimTuruId": null,
      "kilavuzKodu": null,
      "minBasariSirasi": null,
      "maxBasariSirasi": null
    },
    "page": 0,
    "size": 10,
    "sortBy": "basariSirasi",
    "direction": "ASC"
  }
  ```

### User-Agent & Header Rotation Strategy (`user_agents.py`)
To prevent anti-bot blocking or rate limits, every HTTP request sent by `scraper.py` dynamically rotates:
- **User-Agent**: Chrome on macOS, Chrome on Windows, Chrome on Linux, Firefox, Edge.
- **Client Hints (`Sec-CH-UA`)**: Matched browser engine versions (`"Chromium";v="126"`, `"macOS"`, `"Windows"`, `"Linux"`).
- **Accept-Language**: Rotated language strings (`tr-TR,tr;q=0.9`, `en-US,en;q=0.9`).
- **IP Variance**: Simulated `X-Forwarded-For` header.

### Concurrency & Resilience
- **Worker Pool**: Uses `asyncio.Semaphore` (configurable concurrency, default: 15–20 workers).
- **Exponential Backoff**: Automatic retry handler for `429`, `500`, `502`, `503`, and timeout errors.
- **Local Checkpointing**: Stores raw responses in `.cache/pages_size_10/page_XXXXX.json`. If execution is interrupted, re-running `main.py` resumes from the exact missing page without re-fetching completed pages.

---

## 2. Dataset Normalization & Multi-Format Exporter (`exporter.py`)

Scraped item records contain complex nested objects (e.g. `kosulList`: `[{"18": "..."}, {"21": "..."}]`).

`exporter.py` processes these into flat tabular formats:
- **`kosul_json`**: Raw JSON string representation.
- **`kosul_ids_extracted`**: Clean comma-separated condition codes (e.g., `"18, 21, 22, 24, 64, 155"`).
- **Output Formats**:
  - `yokatlas_tercih_kilavuz.csv` (UTF-8 with BOM for universal Excel display)
  - `yokatlas_tercih_kilavuz.db` (SQLite relational database with `programs` and `conditions` tables)
  - `yokatlas_tercih_kilavuz.jsonl` (Raw JSON Lines format)
  - `yokatlas_tercih_kilavuz.parquet` (Columnar binary dataset)

---

## 3. Database Unified Merger (`build_unified_db.py`)

The unified database script merges the 2026 scraped database with Kaggle historical CSV files into `output/unified_dashboard.db`.

### Unified SQLite Schema

```sql
-- 1. Main 2026 Programs Table (Scraped from YÖK ATLAS)
CREATE TABLE programs_2026 (
    kilavuzKodu INTEGER PRIMARY KEY,
    osymKilavuzId INTEGER,
    universiteAdi TEXT,
    universiteTuru TEXT,
    ilAdi TEXT,
    birimAdi TEXT,
    puanTuru TEXT,
    bursOraniAdi TEXT,
    kontenjan INTEGER,
    basariSirasi INTEGER,
    minPuan REAL,
    minBasariSirasiKosul TEXT,
    kosul_ids_extracted TEXT,
    prof INTEGER,
    doc INTEGER,
    dou INTEGER,
    arGor INTEGER,
    akreditasyon TEXT,
    akreditasyonAck TEXT
);

-- 2. Historical Admissions (2019 - 2024 Kaggle Data)
CREATE TABLE admissions_history (
    program_code INTEGER,
    year INTEGER,
    university_name TEXT,
    department_name TEXT,
    score_type TEXT,
    total_quota INTEGER,
    total_enrolled INTEGER,
    male INTEGER,
    female INTEGER,
    final_score_012 REAL,
    final_rank_012 INTEGER,
    initial_placement_rate REAL,
    total_preferences INTEGER,
    demand_per_quota REAL,
    PRIMARY KEY (program_code, year)
);

-- 3. Subject Net Stats (2019 - 2024 Kaggle Data)
CREATE TABLE net_stats_history (
    program_code INTEGER,
    year INTEGER,
    lesson_id INTEGER,
    lesson_name TEXT,
    exam_type TEXT,
    average_net REAL,
    max_questions INTEGER
);

-- 4. Condition Code Lookup Dictionary
CREATE TABLE conditions_lookup (
    code TEXT PRIMARY KEY,
    description TEXT
);
```

### Indexed Query Paths
To guarantee sub-10ms response times:
```sql
CREATE INDEX idx_p2026_code ON programs_2026(kilavuzKodu);
CREATE INDEX idx_p2026_uni ON programs_2026(universiteAdi);
CREATE INDEX idx_p2026_puan ON programs_2026(puanTuru);
CREATE INDEX idx_p2026_sira ON programs_2026(basariSirasi);
CREATE INDEX idx_hist_code ON admissions_history(program_code);
CREATE INDEX idx_net_code ON net_stats_history(program_code);
```
