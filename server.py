"""
FastAPI Backend Engine for Turkish University Comparison & YKS Analytics Dashboard.
Queries output/unified_dashboard.db with high performance indexed SQLite queries.
"""

import sqlite3
from pathlib import Path
from typing import Optional, List
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

DB_PATH = Path("output/unified_dashboard.db")

app = FastAPI(title="YÖK ATLAS & YKS University Comparison API", version="1.0.0")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    if not DB_PATH.exists():
        raise HTTPException(status_code=500, detail="Database file output/unified_dashboard.db not found. Please run build_unified_db.py.")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
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
        query += " WHERE universiteAdi LIKE ?"
        params.append(f"%{search}%")

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
            WHERE universiteAdi LIKE ?
            GROUP BY universiteAdi
        """, (f"%{uni_name}%",))
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
        conditions.append("(birimAdi LIKE ? OR universiteAdi LIKE ? OR fymkAdi LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

    if university:
        conditions.append("universiteAdi = ?")
        params.append(university)

    if city:
        conditions.append("ilAdi = ?")
        params.append(city)

    if score_type:
        conditions.append("puanTuru = ?")
        params.append(score_type)

    if uni_type:
        conditions.append("universiteTuru = ?")
        params.append(uni_type)

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

    # Kaggle Net stats history
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
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")
