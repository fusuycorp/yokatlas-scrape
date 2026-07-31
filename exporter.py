"""
Data Export and Normalization Module for YOK ATLAS API Scraper.
Handles flattening, CSV export, SQLite database creation, JSON Lines, and Excel/Parquet formats.
"""

import json
import sqlite3
from pathlib import Path
from typing import List, Dict, Any, Tuple
import pandas as pd


def process_items(items: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Dict[str, str]]:
    """
    Normalizes items for tabular formats (CSV, SQLite, Parquet).
    Converts nested structures like kosulList into JSON strings and extracts condition definitions.
    Returns:
        (flattened_records, condition_dict)
    """
    flattened_records = []
    condition_dict = {}

    for item in items:
        record = item.copy()
        
        # Clean whitespace in string fields
        for k, v in record.items():
            if isinstance(v, str):
                record[k] = v.strip()

        # Handle kosulList nested array
        kosul_list = record.pop("kosulList", [])
        record["kosul_json"] = json.dumps(kosul_list, ensure_ascii=False) if kosul_list else None

        # Extract conditions into dictionary
        condition_ids = []
        if isinstance(kosul_list, list):
            for c_obj in kosul_list:
                if isinstance(c_obj, dict):
                    for code, text in c_obj.items():
                        code_str = str(code).strip()
                        text_str = str(text).strip()
                        condition_dict[code_str] = text_str
                        condition_ids.append(code_str)

        record["kosul_ids_extracted"] = ", ".join(condition_ids)
        flattened_records.append(record)

    return flattened_records, condition_dict


def save_to_sqlite(records: List[Dict[str, Any]], condition_dict: Dict[str, str], db_path: Path):
    """
    Saves records into a structured SQLite database with indexed tables:
    - programs: main table of program entries
    - conditions: dictionary of OSYM condition codes and full descriptions
    - program_conditions: relational junction table
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Drop existing tables if re-exporting
    cursor.execute("DROP TABLE IF EXISTS program_conditions;")
    cursor.execute("DROP TABLE IF EXISTS conditions;")
    cursor.execute("DROP TABLE IF EXISTS programs;")

    # Use Pandas to write main programs table
    df = pd.DataFrame(records)
    df.to_sql("programs", conn, if_exists="replace", index=False)

    # Create conditions reference table
    cursor.execute("""
        CREATE TABLE conditions (
            code TEXT PRIMARY KEY,
            description TEXT
        );
    """)
    cond_rows = [(k, v) for k, v in sorted(condition_dict.items(), key=lambda x: int(x[0]) if x[0].isdigit() else x[0])]
    cursor.executemany("INSERT INTO conditions (code, description) VALUES (?, ?);", cond_rows)

    # Create junction table program_conditions
    cursor.execute("""
        CREATE TABLE program_conditions (
            kilavuz_kodu INTEGER,
            condition_code TEXT,
            PRIMARY KEY (kilavuz_kodu, condition_code),
            FOREIGN KEY (condition_code) REFERENCES conditions(code)
        );
    """)

    junction_rows = []
    for r in records:
        kilavuz_kodu = r.get("kilavuzKodu")
        kosul_str = r.get("kosul_ids_extracted", "")
        if kilavuz_kodu and kosul_str:
            codes = [c.strip() for c in kosul_str.split(",") if c.strip()]
            for c in codes:
                junction_rows.append((kilavuz_kodu, c))

    cursor.executemany("INSERT OR IGNORE INTO program_conditions (kilavuz_kodu, condition_code) VALUES (?, ?);", junction_rows)

    # Create indexes for fast querying
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_programs_uni ON programs(universiteAdi);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_programs_birim ON programs(birimAdi);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_programs_puan ON programs(puanTuru);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_programs_sira ON programs(basariSirasi);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_programs_il ON programs(ilAdi);")

    conn.commit()
    conn.close()


def export_all(items: List[Dict[str, Any]], output_dir: Path, base_name: str = "yokatlas_tercih_kilavuz"):
    """
    Exports scraped items into CSV, SQLite, JSONL, Excel, and Parquet.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. JSON Lines (Raw complete data)
    jsonl_path = output_dir / f"{base_name}.jsonl"
    with open(jsonl_path, "w", encoding="utf-8") as f:
        for item in items:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

    # 2. Process & Flatten items for tabular formats
    flattened_records, condition_dict = process_items(items)
    df = pd.DataFrame(flattened_records)

    # 3. CSV Export (utf-8-sig for Excel compatibility)
    csv_path = output_dir / f"{base_name}.csv"
    df.to_csv(csv_path, index=False, encoding="utf-8-sig")

    # 4. SQLite Export
    db_path = output_dir / f"{base_name}.db"
    save_to_sqlite(flattened_records, condition_dict, db_path)

    # 5. Parquet Export
    parquet_path = output_dir / f"{base_name}.parquet"
    df.to_parquet(parquet_path, index=False)

    # 6. Excel Export (optional / sample if row count permits)
    excel_path = output_dir / f"{base_name}.xlsx"
    try:
        df.to_excel(excel_path, index=False, engine="openpyxl")
    except Exception as e:
        print(f"Excel export notice: {e}")

    return {
        "csv": csv_path,
        "sqlite": db_path,
        "jsonl": jsonl_path,
        "parquet": parquet_path,
        "excel": excel_path,
        "total_records": len(items),
        "total_conditions": len(condition_dict)
    }
