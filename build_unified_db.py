"""
Data Integration Script: Merges 2026 YÖK ATLAS scraped data with Kaggle 2019-2024 admissions and net stats
into a unified SQLite database: output/unified_dashboard.db
"""

import gzip
from pathlib import Path
import shutil
import sqlite3
import pandas as pd


def tr_normalize(text):
    if not isinstance(text, str):
        return ""
    if not text:
        return ""
    tr_map = str.maketrans({
        "ç": "c", "Ç": "c",
        "ğ": "g", "Ğ": "g",
        "ı": "i", "I": "i", "İ": "i", "i": "i",
        "ö": "o", "Ö": "o", "ş": "s", "Ş": "s",
        "ü": "u", "Ü": "u"
    })
    return text.translate(tr_map).lower()


def check_db_needs_decompression(db_path: Path) -> bool:
    if not db_path.exists() or db_path.stat().st_size == 0:
        return True
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='programs_2026'")
        if cursor.fetchone()[0] == 0:
            conn.close()
            return True
        cursor.execute("SELECT count(*) FROM programs_2026")
        count = cursor.fetchone()[0]
        conn.close()
        return count == 0
    except Exception:
        return True


def decompress_db_if_needed(db_path: Path, db_gz_path: Path):
    if check_db_needs_decompression(db_path):
        if db_gz_path.exists():
            print(f"Decompressing {db_gz_path} to {db_path}...")
            with gzip.open(db_gz_path, "rb") as f_in:
                with open(db_path, "wb") as f_out:
                    shutil.copyfileobj(f_in, f_out)
            print("Decompression complete.")
        else:
            print(f"Compressed database {db_gz_path} not found.")


def build_unified_database():
    output_dir = Path("output")
    output_dir.mkdir(parents=True, exist_ok=True)
    db_path = output_dir / "unified_dashboard.db"
    db_gz_path = output_dir / "unified_dashboard.db.gz"

    decompress_db_if_needed(db_path, db_gz_path)

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

        df_2026['search_text_norm'] = df_2026.apply(
            lambda row: tr_normalize(" ".join([str(x) for x in [row.get('universiteAdi'), row.get('birimAdi'), row.get('fymkAdi'), row.get('ilAdi')] if pd.notnull(x) and str(x).strip()])),
            axis=1
        )

        df_2026.to_sql("programs_2026", conn, if_exists="replace", index=False)
        df_conditions.to_sql("conditions_lookup", conn, if_exists="replace", index=False)
        print(f"Loaded {len(df_2026)} programs into 'programs_2026'")
    else:
        print("Warning: yokatlas_tercih_kilavuz.db not found!")
        # Fallback: create empty schema if table doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS programs_2026 (
                kilavuzKodu INTEGER PRIMARY KEY,
                osymKilavuzId INTEGER,
                universiteAdi TEXT,
                universiteTuru TEXT,
                ilAdi TEXT,
                fymkAdi TEXT,
                birimAdi TEXT,
                puanTuru TEXT,
                bursOraniAdi TEXT,
                kontenjan INTEGER,
                basariSirasi INTEGER,
                minPuan REAL,
                minBasariSirasiKosul TEXT,
                kosul_ids_extracted TEXT,
                prof INTEGER DEFAULT 0,
                doc INTEGER DEFAULT 0,
                dou INTEGER DEFAULT 0,
                arGor INTEGER DEFAULT 0,
                akreditasyon TEXT,
                akreditasyonAck TEXT,
                search_text_norm TEXT
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conditions_lookup (
                id INTEGER PRIMARY KEY,
                kosulNo TEXT,
                kosulMetni TEXT
            )
        """)

    # 2. Load Kaggle 2019-2024 Admissions Data
    kaggle_admissions = Path("kaggle_data/01_university_admissions_turkey_2019_2024.csv")
    if kaggle_admissions.exists():
        print("Loading Kaggle 2019-2024 Admissions data...")
        df_kaggle = pd.read_csv(kaggle_admissions)
        df_kaggle["uni_norm"] = df_kaggle["university_name"].fillna("").map(tr_normalize)
        df_kaggle["dept_norm"] = df_kaggle["department_name"].fillna("").map(tr_normalize)
        df_kaggle["tags_norm"] = df_kaggle["all_tags"].fillna("").map(tr_normalize)
        df_kaggle.to_sql("admissions_history", conn, if_exists="replace", index=False)
        print(f"Loaded {len(df_kaggle)} historical records into 'admissions_history'")
    else:
        print("Warning: Kaggle admissions CSV not found!")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admissions_history (
                year INTEGER,
                program_code INTEGER,
                university_name TEXT,
                department_name TEXT,
                score_type TEXT,
                scholarship_type TEXT,
                all_tags TEXT,
                uni_norm TEXT,
                dept_norm TEXT,
                tags_norm TEXT,
                total_quota INTEGER,
                total_enrolled INTEGER,
                male INTEGER,
                female INTEGER,
                final_score_012 REAL,
                final_rank_012 INTEGER,
                initial_placement_rate REAL,
                total_preferences INTEGER,
                demand_per_quota REAL,
                avg_preference_rank REAL,
                top_1_pref_count INTEGER,
                top_3_pref_count INTEGER,
                placed_pref_rank_avg REAL
            )
        """)

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
    else:
        print("Warning: Kaggle net stats CSVs not found!")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS net_stats_history (
                program_code INTEGER,
                year INTEGER,
                lesson_name TEXT,
                exam_type TEXT,
                average_net REAL,
                max_questions INTEGER
            )
        """)

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
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_hist_norm ON admissions_history(score_type, uni_norm, dept_norm, scholarship_type, tags_norm, program_code);")

    # 3b. Precompute static 2026 -> Historical Program Code Mapping
    print("Precomputing static program_code_map for fallback historical trends...")
    cursor.execute("DROP TABLE IF EXISTS program_code_map;")
    cursor.execute("""
        CREATE TABLE program_code_map (
            code_2026 INTEGER NOT NULL,
            historical_code INTEGER NOT NULL,
            PRIMARY KEY (code_2026, historical_code)
        )
    """)

    cursor.execute("""
        SELECT p.kilavuzKodu, p.universiteAdi, p.birimAdi, p.puanTuru, p.bursOraniAdi
        FROM programs_2026 p
        LEFT JOIN (SELECT DISTINCT program_code FROM admissions_history) h
          ON p.kilavuzKodu = h.program_code
        WHERE h.program_code IS NULL
    """)
    missing_progs = cursor.fetchall()

    cursor.execute("""
        SELECT DISTINCT program_code, score_type, scholarship_type, uni_norm, dept_norm, tags_norm
        FROM admissions_history
    """)
    hist_progs = cursor.fetchall()

    by_score = {}
    for hp in hist_progs:
        st = hp[1]
        if st:
            by_score.setdefault(st, []).append(hp)

    mapping_rows = []
    for code_2026, uni_raw, dept_raw, score_type, burs_raw in missing_progs:
        uni_name = (uni_raw or "").split("(")[0].strip()
        raw_dept = (dept_raw or "").strip()
        base_dept = raw_dept.split("(")[0].strip()
        norm_uni = tr_normalize(uni_name)
        norm_base_dept = tr_normalize(base_dept)
        norm_dept = tr_normalize(raw_dept)
        need_eng = "(ingilizce)" in norm_dept
        tier_value = burs_raw or "Ücretsiz"

        candidates = by_score.get(score_type, []) if score_type else hist_progs
        matched = [
            hp for hp in candidates
            if norm_uni in (hp[3] or "")
            and norm_base_dept in (hp[4] or "")
            and (not need_eng or "ingilizce" in (hp[5] or ""))
        ]
        if matched:
            tier_matched = [hp[0] for hp in matched if hp[2] == tier_value]
            final_codes = sorted(set(tier_matched if tier_matched else [hp[0] for hp in matched]))
            for hc in final_codes:
                mapping_rows.append((code_2026, hc))

    cursor.executemany("INSERT INTO program_code_map (code_2026, historical_code) VALUES (?, ?)", mapping_rows)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_code_map_2026 ON program_code_map(code_2026);")
    print(f"Precomputed {len(mapping_rows)} fallback mappings into 'program_code_map'")

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_net_code ON net_stats_history(program_code);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_net_year ON net_stats_history(year);")

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_search_norm ON programs_2026(search_text_norm);")

    # Composite / expression indexes so the landing-page ORDER BY (basariSirasi IS NULL,
    # basariSirasi) and the filter+sort combos don't fall back to a full 80 MB table scan.
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_sira_nulls ON programs_2026(basariSirasi IS NULL, basariSirasi);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_puan_sira_nulls ON programs_2026(puanTuru, basariSirasi IS NULL, basariSirasi);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_turu_sira_nulls ON programs_2026(universiteTuru, basariSirasi IS NULL, basariSirasi);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_puan_sira ON programs_2026(puanTuru, basariSirasi);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_p2026_uni_cover ON programs_2026(universiteAdi, universiteTuru, ilAdi, prof, doc, dou, arGor);")
    cursor.execute("ANALYZE;")

    cursor.execute("SELECT COUNT(*) FROM programs_2026")
    prog_count = cursor.fetchone()[0]
    print(f"Total programs in 'programs_2026': {prog_count}")

    conn.commit()
    conn.close()
    print("Unified database created successfully at output/unified_dashboard.db!")

    print(f"Compressing {db_path} to {db_gz_path}...")
    with open(db_path, "rb") as f_in:
        with gzip.open(db_gz_path, "wb", compresslevel=9) as f_out:
            shutil.copyfileobj(f_in, f_out)
    print("Database compressed successfully.")


if __name__ == "__main__":
    build_unified_database()
