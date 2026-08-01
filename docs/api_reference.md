# REST API Reference Documentation

The UniAtlas backend is powered by FastAPI. When running locally or in Docker, interact with the interactive OpenAPI docs at `http://localhost:8000/docs`.

---

## Endpoints Summary

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/stats` | Global metrics (total universities, total programs, city count, score types). |
| `GET` | `/api/universities` | List all universities with program counts, location, and staff totals. |
| `GET` | `/api/programs` | Filter and paginate 2026 programs by rank, field, city, type, and keyword. |
| `GET` | `/api/compare` | Compare 2 to 4 universities side-by-side. |
| `GET` | `/api/trends/{program_code}` | Historical cutoff rank trends (2019–2026) and student TYT/AYT net averages. |
| `GET` | `/api/wizard` | Target preference wizard categorizing safe, target, and reach programs. |

---

## 1. Global Metrics

### `GET /api/stats`

**Response (`200 OK`)**:
```json
{
  "total_universities": 228,
  "total_programs": 21493,
  "total_cities": 83,
  "university_types": {
    "DEVLET": 12042,
    "VAKIF": 8095,
    "KKTC": 1187,
    "YURTDISI KAMU": 123
  },
  "score_types": {
    "SAY": 5744,
    "EA": 3900,
    "SÖZ": 1914,
    "DİL": 679,
    "TYT": 9254
  }
}
```

---

## 2. Program Explorer

### `GET /api/programs`

**Query Parameters**:
- `search` *(string, optional)*: Search term for university or department name.
- `university` *(string, optional)*: Exact university name filter.
- `city` *(string, optional)*: City filter (e.g. `İSTANBUL`).
- `score_type` *(string, optional)*: Score field (`SAY`, `EA`, `SÖZ`, `DİL`, `TYT`).
- `uni_type` *(string, optional)*: `DEVLET` or `VAKIF`.
- `min_rank` *(int, optional)*: Minimum cutoff rank.
- `max_rank` *(int, optional)*: Maximum cutoff rank.
- `page` *(int, default: 1)*: Page number.
- `limit` *(int, default: 20)*: Page size limit.
- `sort_by` *(string, default: `basariSirasi`)*: Field to sort by (`basariSirasi`, `minPuan`, `kontenjan`, `universiteAdi`).
- `sort_dir` *(string, default: `ASC`)*: `ASC` or `DESC`.

**Sample Response (`200 OK`)**:
```json
{
  "total": 5744,
  "page": 1,
  "limit": 2,
  "total_pages": 2872,
  "programs": [
    {
      "kilavuzKodu": 203110477,
      "osymKilavuzId": 256348,
      "universiteAdi": "İSTANBUL MEDİPOL ÜNİVERSİTESİ",
      "universiteTuru": "VAKIF",
      "ilAdi": "İSTANBUL",
      "birimAdi": "Tıp (İngilizce) (Burslu)",
      "puanTuru": "SAY",
      "bursOraniAdi": "Burslu",
      "kontenjan": 3,
      "basariSirasi": 38,
      "minPuan": 551.13218,
      "minBasariSirasiKosul": "Bu programı tercih edebilmek için...",
      "prof": 41,
      "doc": 12,
      "dou": 28,
      "arGor": 5,
      "akreditasyon": "TEPDAD"
    }
  ]
}
```

---

## 3. Head-to-Head University Comparator

### `GET /api/compare`

**Query Parameters**:
- `unis` *(array of strings, required)*: Minimum 2 university names (e.g., `unis=ORTA DOĞU TEKNİK ÜNİVERSİTESİ&unis=BOĞAZİÇİ ÜNİVERSİTESİ`).

**Sample Response (`200 OK`)**:
```json
{
  "comparison": [
    {
      "universiteAdi": "BOĞAZİÇİ ÜNİVERSİTESİ",
      "universiteTuru": "DEVLET",
      "ilAdi": "İSTANBUL",
      "program_count": 38,
      "total_quota": 2450,
      "total_prof": 210,
      "total_doc": 95,
      "avg_basari_sirasi": 4820.5
    }
  ]
}
```

---

## 4. Historical Trends & Subject Nets

### `GET /api/trends/{program_code}`

**Path Parameters**:
- `program_code` *(integer)*: OSYM Program Guide Code (e.g. `106510077`).

**Sample Response (`200 OK`)**:
```json
{
  "program": {
    "kilavuzKodu": 106510077,
    "universiteAdi": "ABDULLAH GÜL ÜNİVERSİTESİ",
    "birimAdi": "Bilgisayar Mühendisliği (İngilizce)",
    "basariSirasi": 40724
  },
  "history": [
    {
      "year": 2019,
      "total_quota": 62,
      "final_score_012": 433.29704,
      "final_rank_012": 40724
    }
  ],
  "net_stats": [
    {
      "year": 2024,
      "lesson_name": "AYT Matematik",
      "exam_type": "AYT",
      "average_net": 31.4,
      "max_questions": 40
    }
  ]
}
```

---

## 5. Smart YKS Target Wizard

### `GET /api/wizard`

**Query Parameters**:
- `score_type` *(string, required)*: `SAY`, `EA`, `SÖZ`, `DİL`.
- `target_rank` *(integer, required)*: Student's success rank (e.g. `25000`).
- `limit` *(integer, default: 15)*: Maximum records per category.

**Sample Response (`200 OK`)**:
```json
{
  "student_target_rank": 25000,
  "score_type": "SAY",
  "categories": {
    "reach": { "min_rank": 10000, "max_rank": 20000, "programs": [...] },
    "target": { "min_rank": 20000, "max_rank": 30000, "programs": [...] },
    "safe": { "min_rank": 30000, "max_rank": 62500, "programs": [...] }
  }
}
```
