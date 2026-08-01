# Project Overview: UniAtlas

## Executive Summary

**UniAtlas** is an intelligence platform and web application designed to empower Turkish high school graduates, guidance counselors (*Rehber Öğretmenler*), and university researchers. It combines real-time data scraped from the official **YÖK ATLAS Tercih Kılavuzu API** (21,493 programs for 2026) with historical YKS university admissions analytics (**2019–2024**) sourced from Kaggle.

---

## Background & Problem Statement

Choosing a university program during YKS (*Yükseköğretim Kurumları Sınavı*) involves navigating thousands of choices across state (*Devlet*) and foundation (*Vakıf*) universities. Students face several challenges:

1. **Information Fragmentation**: Real-time YÖK ATLAS data, historical score changes, net subject answer stats, and official YÖK threshold rank rules are scattered across different pages or PDF guides.
2. **Missing Longitudinal Context**: YÖK ATLAS focuses heavily on single-year data, making multi-year trend analysis (e.g., 5-year rank shifts) difficult.
3. **Complex Requirements**: Academic staff ratios (Professors vs. Assistants), accreditation badges, and mandatory minimum rank thresholds (e.g., Medicine $\le$ 50,000, Engineering $\le$ 300,000, Law $\le$ 125,000) are hard to evaluate in bulk.

---

## Core Capabilities & Features

### 1. Automated Real-Time Scraping Engine
- Asynchronously fetches all 21,500+ programs from `https://yokatlas.yok.gov.tr/api/tercih-kilavuz/search`.
- Uses modern browser header & User-Agent rotation with `sec-ch-ua` Client Hints to prevent rate-limiting or blocking.
- Implements local disk caching (`.cache/`) for fault-tolerant resume execution.

### 2. Multi-Year Historical Integration (2019–2026)
- Merges 128,352 historical admission entries and 1,000,000+ subject net stats into a unified SQLite database (`unified_dashboard.db`).
- Enables side-by-side comparison of 2019, 2020, 2021, 2022, 2023, 2024, and 2026 admission cutoff ranks.

### 3. Head-to-Head University Comparator
- Compare up to 4 universities simultaneously across academic faculty strength, total program quotas, scholarship distributions, and average admission ranks.

### 4. Smart YKS Target Wizard
- Takes a student's score type (`SAY`, `EA`, `SÖZ`, `DİL`) and target success rank.
- Automatically groups suitable options into **Safe** (> 1.2x rank), **Target** (0.8x–1.2x rank), and **Reach** (< 0.8x rank) categories.
- Warns users if a program carries an official YÖK rank threshold rule.

### 5. Preference List Draft Builder
- Bookmark programs into a local preference draft (`Tercih Listesi`).
- Export preference drafts directly to CSV or JSON.
