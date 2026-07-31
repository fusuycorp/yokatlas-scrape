"""
Data Integration Script: Merges 2026 YÖK ATLAS scraped data with Kaggle 2019-2024 admissions and net stats
into a unified SQLite database: output/unified_dashboard.db
"""

import sqlite3
from pathlib import Path
import pandas as pd


def build_unified_database():
    output_dir = Path("output")
    output_dir.mkdir(parents=True, exist_ok=True)
    db_path = output_dir / "unified_dashboard.db"

    print("Opening SQLite connection to unified_dashboard.db...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Load 2026 Scraped YÖK ATLAS Data
    scraped_db = output_dir / "yokatlas_tercih_kilavuz.db"
    if scraped_db.exists():
        print("Loading 2026 Scraped YÖK ATLAS data...")
        s_conn = sqlite3.connect(scraped_db)
        df_2026 = pd.read_sql_query("SELECT * FROM programs", s_conn)
        df_conditions = pd.read_sql_query("SELECT * FROM conditions", s_conn)
        s_conn.close()

        df_2026.to_sql("programs_2026", conn, if_exists="replace", index=False)
        df_conditions.to_sql("conditions_lookup", conn, if_exists="replace", index=False)
        print(f"Loaded {len(df_2026)} programs into 'programs_2026'")
    else:
        print("Warning: yokatlas_tercih_kilavuz.db not found!")

    # 2. Load Kaggle 2019-2024 Admissions Data
    kaggle_admissions = Path("kaggle_data/01_university_admissions_turkey_2019_2024.csv")
    if kaggle_admissions.exists():
        print("Loading Kaggle 2019-2024 Admissions data...")
        df_kaggle = pd.read_csv(kaggle_admissions)
        df_kaggle.to_sql("admissions_history", conn, if_exists="replace", index=False)
        print(f"Loaded {len(df_kaggle)} historical records into 'admissions_history'")

    # 3. Load Kaggle Net Stats & Lessons Data
    kaggle_net = Path("kaggle_data/department_avg_net_stats.csv")
    kaggle_lessons = Path("kaggle_data/lessons.csv")
    if kaggle_net.exists() and kaggle_lessons.exists():
        print("Loading Kaggle Net Stats and Lessons mapping...")
        df_net = pd.read_csv(kaggle_net)
        df_lessons = pd.read_csv(kaggle_lessons)

        # Merge lesson name into net stats
        df_net_merged = df_net.merge(df_lessons, on="lesson_id", how="left")
        df_net_merged.to_sql("net_stats_history", conn, if_exists="replace", index=False)
        print(f"Loaded {len(df_net_merged)} net stats entries into 'net_stats_history'")

    # 4. Create Indexes for High Performance Queries
    print("Creating indexes...")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_code ON programs_2026(kilavuzKodu);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_uni ON programs_2026(universiteAdi);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_birim ON programs_2026(birimAdi);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_puan ON programs_2026(puanTuru);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_sira ON programs_2026(basariSirasi);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_il ON programs_2026(ilAdi);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_turu ON programs_2026(universiteTuru);")

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_hist_code ON admissions_history(program_code);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_hist_year ON admissions_history(year);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_hist_uni ON admissions_history(university_name);")

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_net_code ON net_stats_history(program_code);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_net_year ON net_stats_history(year);")

    conn.commit()
    conn.close()
    print("Unified database created successfully at output/unified_dashboard.db!")


if __name__ == "__main__":
    build_unified_database()
