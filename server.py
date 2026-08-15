"""
FastAPI Backend Engine for Turkish University Comparison & YKS Analytics Dashboard.
Queries output/unified_dashboard.db with high performance indexed SQLite queries.
"""

import gzip
import shutil
import sqlite3
import re
from pathlib import Path
from typing import Optional, List
from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.responses import PlainTextResponse, Response, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

DB_PATH = Path("output/unified_dashboard.db")

app = FastAPI(title="YÖK ATLAS & YKS University Comparison API", version="1.0.0")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


_uni_slug_cache = {}

def tr_lower(text: str) -> str:
    if not text:
        return ""
    return text.replace("İ", "i").replace("I", "ı").lower()

def title_turkish(text: str) -> str:
    if not text:
        return ""
    words = tr_lower(text).split()
    res = []
    for w in words:
        if w.startswith("i"):
            res.append("İ" + w[1:])
        elif w.startswith("ı"):
            res.append("I" + w[1:])
        else:
            res.append(w.capitalize())
    return " ".join(res)

def slugify_turkish(text: str) -> str:
    if not text:
        return ""
    text = tr_lower(text)
    tr_map = str.maketrans({
        "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u"
    })
    text = text.translate(tr_map)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def get_uni_name_from_slug(slug: str) -> Optional[str]:
    global _uni_slug_cache
    if not _uni_slug_cache:
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT DISTINCT universiteAdi FROM programs_2026")
        for row in c.fetchall():
            uni_name = row[0]
            if uni_name:
                _uni_slug_cache[slugify_turkish(uni_name)] = uni_name
                clean_name = uni_name.split("(")[0].strip()
                clean_slug = slugify_turkish(clean_name)
                if clean_slug and clean_slug not in _uni_slug_cache:
                    _uni_slug_cache[clean_slug] = uni_name
        conn.close()
    return _uni_slug_cache.get(slug)

def tr_normalize(text):
    if not text:
        return ""
    text = tr_lower(text)
    tr_map = str.maketrans({
        "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u"
    })
    return text.translate(tr_map)


def decompress_db_if_needed(db_path: Path, gz_path: Path):
    if not db_path.exists() or db_path.stat().st_size == 0:
        if gz_path.exists():
            db_path.parent.mkdir(parents=True, exist_ok=True)
            with gzip.open(gz_path, "rb") as f_in:
                with open(db_path, "wb") as f_out:
                    shutil.copyfileobj(f_in, f_out)


def get_db():
    if not DB_PATH.exists():
        gz_path = Path("output/unified_dashboard.db.gz")
        if gz_path.exists():
            decompress_db_if_needed(DB_PATH, gz_path)
        else:
            raise HTTPException(status_code=500, detail="Database file output/unified_dashboard.db not found.")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.create_function("TR_NORM", 1, tr_normalize)
    return conn


@app.get("/api/stats")
def get_global_stats():
    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT COUNT(DISTINCT universiteAdi) FROM programs_2026")
    total_unis = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM programs_2026")
    total_programs = c.fetchone()[0]

    c.execute("SELECT COUNT(DISTINCT ilAdi) FROM programs_2026 WHERE ilAdi IS NOT NULL AND ilAdi != ''")
    total_cities = c.fetchone()[0]

    c.execute("SELECT universiteTuru, COUNT(*) FROM programs_2026 GROUP BY universiteTuru")
    type_counts = dict(c.fetchall())

    c.execute("SELECT puanTuru, COUNT(*) FROM programs_2026 GROUP BY puanTuru")
    score_type_counts = dict(c.fetchall())

    conn.close()

    return {
        "total_universities": total_unis,
        "total_programs": total_programs,
        "total_cities": total_cities,
        "university_types": type_counts,
        "score_types": score_type_counts,
    }


@app.get("/api/universities")
def get_universities(search: Optional[str] = None):
    conn = get_db()
    c = conn.cursor()

    query = """
        SELECT 
            universiteAdi, 
            universiteTuru, 
            ilAdi,
            COUNT(*) as program_count,
            SUM(prof) as total_prof,
            SUM(doc) as total_doc,
            SUM(dou) as total_dou,
            SUM(arGor) as total_argor
        FROM programs_2026
    """
    params = []
    if search:
        query += " WHERE TR_NORM(universiteAdi) LIKE ?"
        params.append(f"%{tr_normalize(search)}%")

    query += " GROUP BY universiteAdi ORDER BY program_count DESC"

    c.execute(query, params)
    rows = [dict(r) for r in c.fetchall()]
    conn.close()

    return {"universities": rows}


@app.get("/api/universities/{uni_name}/departments")
def get_university_departments(uni_name: str):
    conn = get_db()
    c = conn.cursor()

    c.execute("""
        SELECT 
            universiteAdi,
            universiteTuru,
            ilAdi,
            COUNT(*) as total_programs,
            COALESCE(SUM(kontenjan), 0) as total_quota,
            COALESCE(SUM(prof), 0) as total_prof,
            COALESCE(SUM(doc), 0) as total_doc,
            COALESCE(SUM(dou), 0) as total_dou,
            COALESCE(SUM(arGor), 0) as total_argor,
            AVG(CASE WHEN basariSirasi IS NOT NULL AND basariSirasi > 0 THEN basariSirasi END) as avg_basari_sirasi
        FROM programs_2026
        WHERE universiteAdi = ?
        GROUP BY universiteAdi
    """, (uni_name,))

    summary = c.fetchone()
    if not summary:
        c.execute("""
            SELECT 
                universiteAdi,
                universiteTuru,
                ilAdi,
                COUNT(*) as total_programs,
                COALESCE(SUM(kontenjan), 0) as total_quota,
                COALESCE(SUM(prof), 0) as total_prof,
                COALESCE(SUM(doc), 0) as total_doc,
                COALESCE(SUM(dou), 0) as total_dou,
                COALESCE(SUM(arGor), 0) as total_argor,
                AVG(CASE WHEN basariSirasi IS NOT NULL AND basariSirasi > 0 THEN basariSirasi END) as avg_basari_sirasi
            FROM programs_2026
            WHERE TR_NORM(universiteAdi) LIKE ?
            GROUP BY universiteAdi
        """, (f"%{tr_normalize(uni_name)}%",))
        summary = c.fetchone()

    if not summary:
        conn.close()
        raise HTTPException(status_code=404, detail=f"University '{uni_name}' not found.")

    summary_dict = dict(summary)
    actual_uni_name = summary_dict["universiteAdi"]

    c.execute("""
        SELECT 
            kilavuzKodu, osymKilavuzId, universiteAdi, universiteTuru, ilAdi,
            fymkAdi, birimAdi, puanTuru, bursOraniAdi, kontenjan,
            basariSirasi, minPuan, minBasariSirasiKosul, kosul_ids_extracted,
            prof, doc, dou, arGor, akreditasyon, akreditasyonAck
        FROM programs_2026
        WHERE universiteAdi = ?
        ORDER BY basariSirasi IS NULL, basariSirasi ASC, birimAdi ASC
    """, (actual_uni_name,))

    departments = [dict(r) for r in c.fetchall()]
    conn.close()

    return {
        "university": summary_dict,
        "departments": departments,
        "total": len(departments)
    }


@app.get("/api/programs")
def get_programs(
    search: Optional[str] = None,
    university: Optional[str] = None,
    city: Optional[str] = None,
    score_type: Optional[str] = None,
    uni_type: Optional[str] = None,
    min_rank: Optional[int] = None,
    max_rank: Optional[int] = None,
    page: int = 1,
    limit: int = 20,
    sort_by: str = "basariSirasi",
    sort_dir: str = "ASC"
):
    conn = get_db()
    c = conn.cursor()

    conditions = []
    params = []

    if search:
        search_norm = tr_normalize(search)
        conditions.append("search_text_norm LIKE ?")
        params.append(f"%{search_norm}%")

    if university:
        conditions.append("universiteAdi = ?")
        params.append(university)

    if city:
        conditions.append("ilAdi = ?")
        params.append(city)

    if score_type:
        st_list = [s.strip() for s in score_type.split(",") if s.strip()]
        if len(st_list) == 1:
            conditions.append("puanTuru = ?")
            params.append(st_list[0])
        elif len(st_list) > 1:
            placeholders = ",".join("?" for _ in st_list)
            conditions.append(f"puanTuru IN ({placeholders})")
            params.extend(st_list)

    if uni_type:
        ut_list = [u.strip() for u in uni_type.split(",") if u.strip()]
        if len(ut_list) == 1:
            conditions.append("universiteTuru = ?")
            params.append(ut_list[0])
        elif len(ut_list) > 1:
            placeholders = ",".join("?" for _ in ut_list)
            conditions.append(f"universiteTuru IN ({placeholders})")
            params.extend(ut_list)

    if min_rank is not None:
        conditions.append("basariSirasi >= ?")
        params.append(min_rank)

    if max_rank is not None:
        conditions.append("basariSirasi <= ?")
        params.append(max_rank)

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

    # Count total
    c.execute(f"SELECT COUNT(*) FROM programs_2026 {where_clause}", params)
    total_count = c.fetchone()[0]

    # Allowed sort fields
    allowed_sorts = {
        "basariSirasi": "basariSirasi",
        "minPuan": "minPuan",
        "kontenjan": "kontenjan",
        "universiteAdi": "universiteAdi",
        "birimAdi": "birimAdi"
    }
    sort_col = allowed_sorts.get(sort_by, "basariSirasi")
    direction = "DESC" if sort_dir.upper() == "DESC" else "ASC"

    offset = (page - 1) * limit
    # Place NULL ranks at the end when sorting ASC
    order_clause = f"ORDER BY {sort_col} IS NULL, {sort_col} {direction}"

    sql = f"""
        SELECT 
            kilavuzKodu, osymKilavuzId, universiteAdi, universiteTuru, ilAdi,
            fymkAdi, birimAdi, puanTuru, bursOraniAdi, kontenjan,
            basariSirasi, minPuan, minBasariSirasiKosul, kosul_ids_extracted,
            prof, doc, dou, arGor, akreditasyon, akreditasyonAck
        FROM programs_2026
        {where_clause}
        {order_clause}
        LIMIT ? OFFSET ?
    """
    params.extend([limit, offset])

    c.execute(sql, params)
    rows = [dict(r) for r in c.fetchall()]
    conn.close()

    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit,
        "programs": rows
    }


@app.get("/api/compare")
def compare_universities(unis: List[str] = Query(...)):
    if not unis or len(unis) < 2:
        raise HTTPException(status_code=400, detail="Please select at least 2 universities to compare.")

    conn = get_db()
    c = conn.cursor()

    placeholders = ",".join(["?"] * len(unis))

    # Basic stats
    c.execute(f"""
        SELECT 
            universiteAdi,
            universiteTuru,
            ilAdi,
            COUNT(*) as program_count,
            SUM(kontenjan) as total_quota,
            SUM(prof) as total_prof,
            SUM(doc) as total_doc,
            SUM(dou) as total_dou,
            SUM(arGor) as total_argor,
            AVG(CASE WHEN basariSirasi IS NOT NULL AND basariSirasi > 0 THEN basariSirasi END) as avg_basari_sirasi
        FROM programs_2026
        WHERE universiteAdi IN ({placeholders})
        GROUP BY universiteAdi
    """, unis)
    base_stats = [dict(r) for r in c.fetchall()]

    # Score type breakdown per university
    c.execute(f"""
        SELECT 
            universiteAdi,
            puanTuru,
            COUNT(*) as count,
            AVG(CASE WHEN basariSirasi IS NOT NULL AND basariSirasi > 0 THEN basariSirasi END) as avg_rank
        FROM programs_2026
        WHERE universiteAdi IN ({placeholders})
        GROUP BY universiteAdi, puanTuru
    """, unis)
    score_breakdown = [dict(r) for r in c.fetchall()]

    # Scholarship distribution
    c.execute(f"""
        SELECT 
            universiteAdi,
            COALESCE(bursOraniAdi, 'Diğer/Devlet') as burs,
            COUNT(*) as count
        FROM programs_2026
        WHERE universiteAdi IN ({placeholders})
        GROUP BY universiteAdi, burs
    """, unis)
    burs_breakdown = [dict(r) for r in c.fetchall()]

    conn.close()

    return {
        "comparison": base_stats,
        "score_type_breakdown": score_breakdown,
        "scholarship_breakdown": burs_breakdown
    }


@app.get("/api/trends/{program_code}")
def get_program_trends(program_code: int):
    conn = get_db()
    c = conn.cursor()

    # 2026 program info
    c.execute("SELECT * FROM programs_2026 WHERE kilavuzKodu = ?", (program_code,))
    prog_2026 = c.fetchone()
    if not prog_2026:
        raise HTTPException(status_code=404, detail=f"Program code {program_code} not found in 2026 database.")

    prog_dict = dict(prog_2026)

    # Kaggle admissions history (2019-2024)
    c.execute("""
        SELECT 
            year, total_quota, total_enrolled, male, female,
            final_score_012, final_rank_012, initial_placement_rate,
            total_preferences, demand_per_quota, avg_preference_rank,
            top_1_pref_count, top_3_pref_count, placed_pref_rank_avg
        FROM admissions_history
        WHERE program_code = ?
        ORDER BY year ASC
    """, (program_code,))
    history = [dict(r) for r in c.fetchall()]

    # Fallback: if program code changed across years (e.g. Boğaziçi YBS), match by university & department name
    if not history:
        uni_name = prog_dict.get("universiteAdi", "").split("(")[0].strip()
        raw_dept = prog_dict.get("birimAdi", "").strip()
        base_dept = raw_dept.split("(")[0].strip()
        score_type = prog_dict.get("puanTuru")

        norm_dept = tr_normalize(raw_dept)
        conditions = ["TR_NORM(university_name) LIKE ?", "TR_NORM(department_name) LIKE ?"]
        params = [f"%{tr_normalize(uni_name)}%", f"%{tr_normalize(base_dept)}%"]

        if "(ingilizce)" in norm_dept:
            conditions.append("TR_NORM(department_name) LIKE ?")
            params.append("%ingilizce%")

        if score_type:
            conditions.append("score_type = ?")
            params.append(score_type)

        where_clause = " AND ".join(conditions)
        c.execute(f"""
            SELECT DISTINCT program_code
            FROM admissions_history
            WHERE {where_clause}
        """, params)
        matched_codes = [row["program_code"] for row in c.fetchall()]

        if matched_codes:
            placeholders = ",".join("?" for _ in matched_codes)
            c.execute(f"""
                SELECT 
                    year, total_quota, total_enrolled, male, female,
                    final_score_012, final_rank_012, initial_placement_rate,
                    total_preferences, demand_per_quota, avg_preference_rank,
                    top_1_pref_count, top_3_pref_count, placed_pref_rank_avg
                FROM admissions_history
                WHERE program_code IN ({placeholders})
                ORDER BY year ASC
            """, matched_codes)
            history = [dict(r) for r in c.fetchall()]

            c.execute(f"""
                SELECT year, lesson_name, exam_type, average_net, max_questions
                FROM net_stats_history
                WHERE program_code IN ({placeholders})
                ORDER BY year ASC, exam_type ASC, lesson_name ASC
            """, matched_codes)
            net_stats = [dict(r) for r in c.fetchall()]
        else:
            net_stats = []
    else:
        # Kaggle Net stats history for primary code
        c.execute("""
            SELECT year, lesson_name, exam_type, average_net, max_questions
            FROM net_stats_history
            WHERE program_code = ?
            ORDER BY year ASC, exam_type ASC, lesson_name ASC
        """, (program_code,))
        net_stats = [dict(r) for r in c.fetchall()]

    conn.close()

    # Build annual data map across 2019-2026
    yearly_map = {}

    for h in history:
        yr = int(h["year"])
        yearly_map[yr] = {
            "year": yr,
            "rank": h.get("final_rank_012"),
            "score": h.get("final_score_012"),
            "quota": h.get("total_quota"),
            "enrolled": h.get("total_enrolled"),
            "demand_per_quota": h.get("demand_per_quota"),
            "total_preferences": h.get("total_preferences"),
        }

    # Add/Update 2026 entry from 2026 program scraper data
    if 2026 not in yearly_map:
        yearly_map[2026] = {
            "year": 2026,
            "rank": prog_dict.get("basariSirasi"),
            "score": prog_dict.get("minPuan"),
            "quota": prog_dict.get("kontenjan"),
            "enrolled": None,
            "demand_per_quota": None,
            "total_preferences": None,
        }
    else:
        if yearly_map[2026].get("rank") is None:
            yearly_map[2026]["rank"] = prog_dict.get("basariSirasi")
        if yearly_map[2026].get("score") is None:
            yearly_map[2026]["score"] = prog_dict.get("minPuan")
        if yearly_map[2026].get("quota") is None:
            yearly_map[2026]["quota"] = prog_dict.get("kontenjan")

    sorted_years = sorted(yearly_map.keys())

    yoy_comparisons = []
    for i, yr in enumerate(sorted_years):
        curr = yearly_map[yr]
        if i == 0:
            yoy_comparisons.append({
                "year": yr,
                "prev_year": None,
                "rank": curr["rank"],
                "score": curr["score"],
                "quota": curr["quota"],
                "enrolled": curr["enrolled"],
                "rank_delta": None,
                "rank_pct_change": None,
                "score_delta": None,
                "score_pct_change": None,
                "quota_delta": None,
                "quota_pct_change": None,
                "enrolled_delta": None,
                "enrolled_pct_change": None,
            })
        else:
            prev_yr = sorted_years[i - 1]
            prev = yearly_map[prev_yr]

            # Rank delta (lower numerical rank is better/more selective, so negative delta means improved rank position)
            r_curr = curr["rank"]
            r_prev = prev["rank"]
            if r_curr is not None and r_prev is not None:
                rank_delta = int(r_curr - r_prev)
                rank_pct = round(((r_curr - r_prev) / r_prev) * 100, 2) if r_prev > 0 else 0.0
            else:
                rank_delta = None
                rank_pct = None

            # Score delta
            s_curr = curr["score"]
            s_prev = prev["score"]
            if s_curr is not None and s_prev is not None:
                score_delta = round(s_curr - s_prev, 2)
                score_pct = round(((s_curr - s_prev) / s_prev) * 100, 2) if s_prev > 0 else 0.0
            else:
                score_delta = None
                score_pct = None

            # Quota delta
            q_curr = curr["quota"]
            q_prev = prev["quota"]
            if q_curr is not None and q_prev is not None:
                quota_delta = int(q_curr - q_prev)
                quota_pct = round(((q_curr - q_prev) / q_prev) * 100, 2) if q_prev > 0 else 0.0
            else:
                quota_delta = None
                quota_pct = None

            # Enrolled delta
            e_curr = curr["enrolled"]
            e_prev = prev["enrolled"]
            if e_curr is not None and e_prev is not None:
                enrolled_delta = int(e_curr - e_prev)
                enrolled_pct = round(((e_curr - e_prev) / e_prev) * 100, 2) if e_prev > 0 else 0.0
            else:
                enrolled_delta = None
                enrolled_pct = None

            yoy_comparisons.append({
                "year": yr,
                "prev_year": prev_yr,
                "rank": r_curr,
                "score": s_curr,
                "quota": q_curr,
                "enrolled": e_curr,
                "rank_delta": rank_delta,
                "rank_pct_change": rank_pct,
                "score_delta": score_delta,
                "score_pct_change": score_pct,
                "quota_delta": quota_delta,
                "quota_pct_change": quota_pct,
                "enrolled_delta": enrolled_delta,
                "enrolled_pct_change": enrolled_pct,
            })

    # Summary YoY Deltas (for cards)
    latest_comp = None
    for comp in reversed(yoy_comparisons):
        if comp.get("prev_year") is not None and comp.get("rank_delta") is not None:
            latest_comp = comp
            break

    if not latest_comp and len(yoy_comparisons) > 1:
        latest_comp = yoy_comparisons[-1]

    earliest = yoy_comparisons[0] if yoy_comparisons else None
    latest = yoy_comparisons[-1] if yoy_comparisons else None

    total_rank_delta = None
    total_rank_pct = None
    total_score_delta = None
    total_score_pct = None
    total_quota_delta = None
    total_quota_pct = None

    if earliest and latest and earliest["year"] != latest["year"]:
        if latest["rank"] is not None and earliest["rank"] is not None:
            total_rank_delta = int(latest["rank"] - earliest["rank"])
            total_rank_pct = round(((latest["rank"] - earliest["rank"]) / earliest["rank"]) * 100, 2) if earliest["rank"] > 0 else 0.0

        if latest["score"] is not None and earliest["score"] is not None:
            total_score_delta = round(latest["score"] - earliest["score"], 2)
            total_score_pct = round(((latest["score"] - earliest["score"]) / earliest["score"]) * 100, 2) if earliest["score"] > 0 else 0.0

        if latest["quota"] is not None and earliest["quota"] is not None:
            total_quota_delta = int(latest["quota"] - earliest["quota"])
            total_quota_pct = round(((latest["quota"] - earliest["quota"]) / earliest["quota"]) * 100, 2) if earliest["quota"] > 0 else 0.0

    yoy_deltas = {
        "latest_comparison": latest_comp,
        "overall_trajectory": {
            "earliest_year": earliest["year"] if earliest else None,
            "latest_year": latest["year"] if latest else None,
            "earliest_rank": earliest["rank"] if earliest else None,
            "latest_rank": latest["rank"] if latest else None,
            "total_rank_delta": total_rank_delta,
            "total_rank_pct_change": total_rank_pct,
            "total_score_delta": total_score_delta,
            "total_score_pct_change": total_score_pct,
            "total_quota_delta": total_quota_delta,
            "total_quota_pct_change": total_quota_pct,
        }
    }

    return {
        "program": prog_dict,
        "history": history,
        "net_stats": net_stats,
        "yoy_comparisons": yoy_comparisons,
        "yoy_deltas": yoy_deltas,
    }


@app.get("/api/wizard")
def preference_wizard(
    score_type: str = Query(..., description="SAY, EA, SÖZ, DİL"),
    target_rank: int = Query(..., description="Estimated student success rank"),
    limit: int = 15
):
    conn = get_db()
    c = conn.cursor()

    # Safe: rank > 1.2 * target_rank
    # Target: 0.8 * target_rank <= rank <= 1.2 * target_rank
    # Reach: rank < 0.8 * target_rank

    safe_min = int(target_rank * 1.2)
    safe_max = int(target_rank * 2.5)

    target_min = int(target_rank * 0.8)
    target_max = safe_min

    reach_min = max(1, int(target_rank * 0.4))
    reach_max = target_min

    query = """
        SELECT 
            kilavuzKodu, universiteAdi, universiteTuru, ilAdi, birimAdi,
            puanTuru, bursOraniAdi, kontenjan, basariSirasi, minPuan,
            minBasariSirasiKosul, kosul_ids_extracted, prof, doc, akreditasyon
        FROM programs_2026
        WHERE puanTuru = ? AND basariSirasi BETWEEN ? AND ?
        ORDER BY basariSirasi ASC
        LIMIT ?
    """

    c.execute(query, (score_type, reach_min, reach_max, limit))
    reach_list = [dict(r) for r in c.fetchall()]

    c.execute(query, (score_type, target_min, target_max, limit))
    target_list = [dict(r) for r in c.fetchall()]

    c.execute(query, (score_type, safe_min, safe_max, limit))
    safe_list = [dict(r) for r in c.fetchall()]

    conn.close()

    return {
        "student_target_rank": target_rank,
        "score_type": score_type,
        "categories": {
            "reach": {"min_rank": reach_min, "max_rank": reach_max, "programs": reach_list},
            "target": {"min_rank": target_min, "max_rank": target_max, "programs": target_list},
            "safe": {"min_rank": safe_min, "max_rank": safe_max, "programs": safe_list},
        }
    }


# Serve React build frontend files if output directory exists
frontend_dist = Path("dashboard-ui/dist")

if frontend_dist.exists():
    # Mount static assets for direct loading
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/robots.txt", response_class=PlainTextResponse)
def get_robots_txt():
    content = (
        "User-agent: *\n"
        "Allow: /\n"
        "Sitemap: https://atlas.bogazici.app/sitemap.xml\n"
    )
    return content

@app.get("/sitemap.xml", response_class=Response)
def sitemap_index():
    xml_content = """<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <sitemap>
      <loc>https://atlas.bogazici.app/sitemap-static.xml</loc>
   </sitemap>
   <sitemap>
      <loc>https://atlas.bogazici.app/sitemap-universities.xml</loc>
   </sitemap>
   <sitemap>
      <loc>https://atlas.bogazici.app/sitemap-programs.xml</loc>
   </sitemap>
</sitemapindex>"""
    return Response(content=xml_content, media_type="application/xml")

@app.get("/sitemap-static.xml", response_class=Response)
def sitemap_static():
    urls = ["/", "/karsilastir", "/trendler", "/tercih-sihirbazi"]
    url_tags = "\n".join([f"  <url><loc>https://atlas.bogazici.app{url}</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>" for url in urls])
    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{url_tags}
</urlset>"""
    return Response(content=xml_content, media_type="application/xml")

@app.get("/sitemap-universities.xml", response_class=Response)
def sitemap_universities():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT DISTINCT universiteAdi FROM programs_2026")
    urls = []
    for row in c.fetchall():
        uni_name = row[0]
        if uni_name:
            slug = slugify_turkish(uni_name)
            urls.append(f"  <url><loc>https://atlas.bogazici.app/universite/{slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>")
    conn.close()
    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{"\n".join(urls)}
</urlset>"""
    return Response(content=xml_content, media_type="application/xml")

@app.get("/sitemap-programs.xml", response_class=Response)
def sitemap_programs():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT kilavuzKodu FROM programs_2026 WHERE kilavuzKodu IS NOT NULL")
    urls = []
    for row in c.fetchall():
        code = row[0]
        urls.append(f"  <url><loc>https://atlas.bogazici.app/program/{code}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>")
    conn.close()
    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{"\n".join(urls)}
</urlset>"""
    return Response(content=xml_content, media_type="application/xml")

# Fallback route for SPA
@app.get("/{full_path:path}", response_class=HTMLResponse)
def catch_all(request: Request, full_path: str):
    # Static files fallback if they weren't matched (vite usually puts them in root or assets)
    file_path = frontend_dist / full_path
    if file_path.exists() and file_path.is_file():
        from fastapi.responses import FileResponse
        return FileResponse(file_path)

    index_path = frontend_dist / "index.html"
    if not index_path.exists():
        return HTMLResponse("Frontend build not found.", status_code=404)
        
    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    title = "UniAtlas | YÖK ATLAS & YKS University Comparison"
    description = "2026 YKS taban puanları, kontenjanları ve üniversite karşılaştırma platformu."
    url = f"https://atlas.bogazici.app/{full_path}" if full_path else "https://atlas.bogazici.app/"
    
    if full_path.startswith("universite/"):
        parts = full_path.split("/")
        if len(parts) > 1:
            slug = parts[1]
            uni_name = get_uni_name_from_slug(slug)
            if uni_name:
                uni_name = title_turkish(uni_name)
                title = f"{uni_name} Taban Puanları, Kontenjanları ve Bölümleri | UniAtlas"
                description = f"{uni_name} güncel taban puanları, kontenjan bilgileri ve bölüm detayları."
            
    elif full_path.startswith("program/"):
        parts = full_path.split("/")
        if len(parts) > 1:
            code = parts[1]
            try:
                conn = get_db()
                c = conn.cursor()
                c.execute("SELECT universiteAdi, birimAdi, puanTuru FROM programs_2026 WHERE kilavuzKodu = ?", (code,))
                prog = c.fetchone()
                conn.close()
                if prog:
                    uni_name, dept_name, score_type = prog
                    uni_name = title_turkish(uni_name)
                    dept_name = title_turkish(dept_name)
                    title = f"{uni_name} {dept_name} ({score_type}) YKS Sıralama ve Puanı | UniAtlas"
                    description = f"{uni_name} {dept_name} {score_type} puan türü başarı sıralaması ve güncel taban puanı."
            except Exception:
                pass

    if "<title>" in html:
        html = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', html, count=1)
    else:
        html = html.replace("</head>", f"<title>{title}</title>\n</head>")

    og_tags = f"""
    <meta name="description" content="{description}" />
    <link rel="canonical" href="{url}" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:url" content="{url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="UniAtlas" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{description}" />
    """
    html = html.replace("</head>", f"{og_tags}</head>")
    
    return HTMLResponse(content=html, status_code=200)
