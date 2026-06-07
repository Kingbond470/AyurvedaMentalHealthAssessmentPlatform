# Product Requirements Document
## Manas Prakriti & Anxiety Assessment Platform (MPAAP)
**Version:** 1.0  
**Status:** Ready for Engineering  
**Authors:** Senior Product Manager | Tech Lead | Senior Designer  
**Platform:** Responsive Web Application (Mobile-first)  
**Intended Audience:** Claude Code / Engineering Team

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Users & Personas](#4-users--personas)
5. [Functional Requirements](#5-functional-requirements)
6. [Data Architecture & Scoring Engine](#6-data-architecture--scoring-engine)
7. [Screen-by-Screen Specifications](#7-screen-by-screen-specifications)
8. [Design System](#8-design-system)
9. [Technical Architecture](#9-technical-architecture)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Out of Scope (V1)](#11-out-of-scope-v1)
12. [Appendix: Scoring Reference](#12-appendix-scoring-reference)

---

## 1. Executive Summary

The Manas Prakriti & Anxiety Assessment Platform (MPAAP) is a **practitioner-administered, research-grade clinical interview tool** that simultaneously assesses:

1. **Manas Prakriti** — psycho-constitutional type per Ayurvedic classics, using the 118-item Manas Prakriti Personality Inventory (MPPI) across 16 psychological sections
2. **Anxiety severity** — using the validated 7-item GAD-7 scale

The long-term research objective is to establish whether specific Manas Prakriti subtypes carry a statistically higher susceptibility to anxiety disorders, bridging classical Ayurvedic constitutional theory with modern clinical psychiatry.

**This is a research data collection platform in V1. The primary user is a trained Ayurvedic/clinical practitioner, not the general public.**

---

## 2. Problem Statement

### Research Problem
Ayurvedic literature describes 16 Manas Prakriti (mental constitution) subtypes with distinct psychological, behavioral, and emotional characteristics. Modern psychiatry has established that anxiety disorders have constitutional and dispositional precursors. No validated tool currently exists to correlate these two systems.

### Operational Problem
The MPPI questionnaire — 118 items, each with 3 scorable follow-up probes across 16 sections — is currently a paper-based instrument. Manual scoring is complex due to:
- Items distributing scores across multiple subtypes simultaneously
- Items sequenced for respondent comfort but scored by subtype classification (a dual-structure)
- Percentage normalization required because subtypes have unequal item counts
- Section 16 requiring practitioner-only observer scoring (not respondent-answered)
- Gender-adaptive versions in Section 14

A digital platform eliminates manual scoring error, enables research data aggregation, and makes the interview experience structured and efficient.

---

## 3. Goals & Success Metrics

### V1 Goals
| Goal | Metric | Target |
|---|---|---|
| Enable complete assessment sessions end-to-end | Sessions completed without error | >95% |
| Accurate automated scoring | Score output matches manual calculation | 100% |
| Reduce session administration time | Time per session vs. paper | ≤20% reduction |
| Research data capture | Anonymized records stored per session | 100% |
| Practitioner adoption | Sessions completed per practitioner/week | Baseline in first 3 months |

---

## 4. Users & Personas

### Primary User: Practitioner
**Who:** Trained Ayurvedic physician, clinical researcher, or mental health professional administering the MPPI + GAD-7 in a research or clinical setting.

**Context:** Seated with or across from the respondent. Uses a tablet or laptop. Reads questions aloud, records scores in real time.

**Needs:**
- Clean, distraction-free interface that keeps them focused on the conversation
- One item at a time display — no visual clutter
- Fast, intuitive score input (tap/click, not type)
- Progress visibility across 16 sections
- Ability to pause and resume a session
- Automatic score calculation at session end
- Downloadable session report

**Pain points with paper:** Losing track of section, math errors in subtype calculation, misrouting scores to wrong subtypes, no data backup.

---

### Secondary User: Research Administrator / Principal Investigator
**Who:** Study coordinator or PI managing multiple practitioners and aggregate data.

**Needs:**
- Overview of all completed sessions
- Export of anonymized data (CSV) for statistical analysis
- Basic aggregate view: distribution of Prakriti types, GAD-7 severity breakdown

---

### Non-User (V1): The Respondent
The person being assessed is NOT a platform user. They interact only through conversation with the practitioner. They never touch the screen or see the interface.

---

## 5. Functional Requirements

### FR-01: Authentication
- Practitioner login with email + password
- Session-based authentication
- Role: `practitioner` or `admin`
- No public access; all routes protected

---

### FR-02: Respondent Registration (Pre-Session)
Before starting assessment, practitioner records:
- Respondent ID (auto-generated or manual entry)
- Age
- Gender (Male / Female / Other) — drives Section 14 question variant
- Education level
- Occupation
- Date of assessment
- Language preference (English / Hindi / Marathi)

All fields mandatory except occupation.

---

### FR-03: Assessment Session — MPPI (118 Items)

#### FR-03.1: Session Structure
- 16 Sections displayed sequentially
- Within each section, items displayed one at a time
- Navigation: Next / Previous within section; section jump only with confirmation modal ("Are you sure? Scores in this section will be preserved.")

#### FR-03.2: Item Display
Each item screen must show:
1. **Section indicator** — "Section 3 of 16 · Cognitive Strengths"
2. **Item number and predictor name** — "Item 19 · Smritimantam (स्मृतिमन्तं)"
3. **Interpreted meaning** — shown as a subtitle below predictor name
4. **Core probe** — displayed prominently in selected language. NOT scored, purely for practitioner to read aloud. Visually distinguished (e.g., italic, lighter weight) from follow-up probes.
5. **Three follow-up probes** — each displayed with:
   - Probe question text (in selected language)
   - Score selector: 5 options (0, 1, 2, 3, 4) displayed as selectable chips/buttons
   - Interpretation label visible on hover/tap for each score value
6. **Item scoresheet** — live running total for that item (e.g., "7 / 12") updating as scores are entered
7. **Progress bar** — showing % completion of current section and overall

#### FR-03.3: Scoring Input
- Score chips: horizontal row of 5 buttons labeled 0 / 1 / 2 / 3 / 4
- Tapping a chip selects it (highlighted state); tapping again deselects
- All 3 probes must be scored before "Next" button activates
- Keyboard shortcut: keys 0–4 score the focused probe (for speed on laptop)

#### FR-03.4: Section 14 — Gender Adaptation
- If respondent gender = Male → show male version of Section 14 questions
- If respondent gender = Female → show female version of Section 14 questions
- If respondent gender = Other → show both versions; practitioner selects applicable one via toggle

#### FR-03.5: Section 16 — Observer-Rated Traits (Practitioner Only)
- Displayed as a separate, clearly labeled phase: "Observer Assessment — Practitioner Scoring Only"
- Visual treatment distinct from respondent-facing sections (e.g., different header color/badge)
- Same item structure (core probe + 3 follow-up probes + scores)
- 9 items: Paingalya, Harikeshata, Vikruta-Anana, Viroopa, Tejasopetam, Nitya-Oshtha-Lehinam, Mahatmyam, Priya-vaditvam, Vikruta-Atmano

#### FR-03.6: Session Persistence
- Auto-save after every item scored
- "Resume Session" on dashboard for incomplete sessions
- Sessions time out after 4 hours of inactivity (with warning at 30 min)

#### FR-03.7: Reverse-Scored Items
- Items where a high positive score implies a low negative subtype score (e.g., Samvibhaginam high = Asamvibhaginam low) must be handled automatically in the scoring engine
- Practitioner sees no complexity — they score what they observe. Backend handles inversion.

---

### FR-04: Assessment Session — GAD-7
- Administered as a **separate, sequential module** after MPPI completes — or can be administered first, at practitioner's discretion (selectable at session start)
- 7 standard items, each with 4 response options (Not at all / Several days / More than half the days / Nearly every day) mapping to scores 0 / 1 / 2 / 3
- 1 functional impairment follow-up question (Not difficult / Somewhat / Very / Extremely)
- GAD-7 total score calculated and severity label shown immediately on completion
- GAD-7 module uses the same clean one-question-at-a-time layout as MPPI

---

### FR-05: Session Completion & Report

#### FR-05.1: Scoring Calculation (auto, no practitioner input needed)
On session completion, the platform calculates:

**MPPI:**
- Raw score per subtype = sum of all item scores mapped to that subtype
- Max obtainable score per subtype = (number of items mapped) × 12
- Percentage score per subtype = (raw / max) × 100
- Predominant Prakriti = subtype with highest %
- Secondary Prakriti = subtype with second highest %

**GAD-7:**
- Total score = sum of 7 item scores
- Severity label: Minimal (0–4) / Mild (5–9) / Moderate (10–14) / Severe (15–21)
- Functional impairment rating

#### FR-05.2: Results Screen
Must display:
1. Respondent ID and session date
2. **Predominant Manas Prakriti** — large, prominent display with subtype name and parent category (Sattvika / Rajasika / Tamasika)
3. **Secondary Prakriti** — shown below
4. **Full subtype percentage breakdown** — horizontal bar chart, all 16 subtypes ranked
5. **GAD-7 score** — score and severity label with visual indicator
6. **GAD-7 functional impairment** — rating displayed
7. Section-wise MPPI score summary (collapsed by default, expandable)

#### FR-05.3: Downloadable Report
- PDF report generated on demand
- Contains: respondent metadata, full score table, Prakriti result, GAD-7 result
- Practitioner name and date stamped
- Report is anonymized (Respondent ID only, no personal identifiers unless practitioner configured it)

---

### FR-06: Dashboard (Practitioner)
- List of all sessions: Respondent ID, date, status (In Progress / Completed), Predominant Prakriti, GAD-7 severity
- Filter by: date range, Prakriti type, GAD-7 severity, status
- Click any session → view full results
- Start New Session button

---

### FR-07: Admin Dashboard
- All practitioners' sessions in aggregate
- Total sessions, completion rate, date range filters
- Export all completed sessions as CSV (anonymized)
- Basic distribution chart: Prakriti type frequency, GAD-7 severity distribution

---

### FR-08: Language Switching
- Language selector available on every screen (EN / HI / MR)
- All question text (core probe + follow-up probes) renders in selected language
- UI labels remain in English (V1)
- Language preference set at respondent registration but changeable mid-session

---

## 6. Data Architecture & Scoring Engine

### 6.1 Core Data Models

```
Respondent
  id: uuid
  respondent_code: string (auto or manual)
  age: integer
  gender: enum (male | female | other)
  education: string
  occupation: string (optional)
  language: enum (en | hi | mr)
  created_at: timestamp

Session
  id: uuid
  respondent_id: FK → Respondent
  practitioner_id: FK → User
  status: enum (in_progress | completed | abandoned)
  mppi_order: enum (before_gad7 | after_gad7)
  started_at: timestamp
  completed_at: timestamp
  current_section: integer
  current_item: integer

ItemResponse
  id: uuid
  session_id: FK → Session
  item_number: integer (1–118)
  probe_1_score: integer (0–4)
  probe_2_score: integer (0–4)
  probe_3_score: integer (0–4)
  item_total: integer (computed: sum of 3 probes, max 12)
  created_at: timestamp
  updated_at: timestamp

GAD7Response
  id: uuid
  session_id: FK → Session
  item_scores: integer[7] (each 0–3)
  impairment_score: integer (0–3)
  total_score: integer (computed)
  severity: enum (minimal | mild | moderate | severe)

SessionResult
  id: uuid
  session_id: FK → Session
  subtype_raw_scores: jsonb { subtype_name: raw_score }
  subtype_max_scores: jsonb { subtype_name: max_score }
  subtype_percentages: jsonb { subtype_name: percentage }
  predominant_prakriti: string
  secondary_prakriti: string
  gad7_total: integer
  gad7_severity: enum
  gad7_impairment: enum
  computed_at: timestamp
```

---

### 6.2 Scoring Engine — Subtype Mapping Table

Each item maps to one or more of the 16 subtypes. If an item maps to multiple subtypes, the **full item score** contributes to ALL mapped subtypes. This is a multi-to-multi relationship.

The scoring engine must maintain a static mapping table:

```
ITEM_SUBTYPE_MAP = {
  1:  ["AINDRA"],           // Ojaswin
  2:  ["KAUBERA", "GANDHARVA"],  // Sukhaviharam / Vihara-sheelata
  3:  ["VARUNA", "MATSYA"], // Ambho-vihar-ratim / Toyakamam
  4:  ["VARUNA"],           // Sheeta-seva
  5:  ["GANDHARVA"],        // Priya-nritya-geet...
  6:  ["GANDHARVA"],        // Gandha-malya...
  7:  ["KAUBERA"],          // Sthana-mana-upabhoga
  8:  ["KAUBERA"],          // Parivar-sampannam
  9:  ["BRAMHA"],           // Samvibhaginam (+ reverse for PRETA, PRETA)
  10: ["BRAMHA"],           // Gurupoojanam
  11: ["BRAMHA", "ARSHA"],  // Priya-atithitvam / Param-atithivratam
  12: ["AINDRA"],           // Bhrityanam-bharanam
  13: ["BRAMHA"],           // Samam-sarvabhooteshu
  14: ["YAAMYA"],           // Samam Mitre Cha Shatru Cha
  15: ["KAUBERA"],          // Madhyasthata
  16: ["GANDHARVA"],        // Anasooyakam
  17: ["MATSYA"],           // Saransheela
  18: ["VANASPATYA"],       // Ruju
  19: ["BRAMHA", "YAAMYA"], // Smritimantam
  20: ["ARSHA"],            // Dharnashakti-sampannam
  21: ["ARSHA"],            // Pratibha
  22: ["BRAMHA", "ARSHA"],  // Gyana-vigyaana-sampannam
  23: ["AINDRA"],           // Vidvansam
  24: ["BRAMHA", "ARSHA"],  // Vachana-prativachana-sampannam
  25: ["AINDRA"],           // Adeyavakyam
  26: ["AINDRA"],           // Deerghadarshinam
  27: ["YAAMYA"],           // Sunishchitam
  28: ["AINDRA"],           // Satatam-shastrabuddhita
  29: ["GANDHARVA"],        // Itihas-puraneshu-kushal
  30: ["AINDRA", "VARUNA", "ASURA"], // Shooram
  31: ["VARUNA"],           // Dheeram
  32: ["YAAMYA"],           // Nirbhayah
  33: ["YAAMYA"],           // Utthanvanta
  34: ["AINDRA"],           // Adhishthata
  35: ["KAUBERA"],          // Prahurujitam
  36: ["YAAMYA"],           // Asampraharya
  37: ["VARUNA", "KAUBERA"], // Sahishnutvam
  38: ["VANASPATYA"],       // Pariklesha-Sheeta-Vata-Atapa-Kshamam
  39: ["AINDRA", "ASURA"],  // Aishwaryavanta
  40: ["AINDRA", "VARUNA"], // Mahabhagam
  41: ["KAUBERA"],          // Arthasya-agam-sanchayo
  42: ["BRAMHA"],           // Astikyam
  43: ["BRAMHA"],           // Abhyaso-vedeshu
  44: ["BRAMHA", "AINDRA", "VARUNA"], // Ijya / Yajvanam
  45: ["AINDRA", "KAUBERA", "VANASPATYA"], // Dharma-artha-kama
  46: ["BRAMHA", "ARSHA"],  // Tapa-satya-daya-shaucha-dana / Shaucha-Ijya
  47: ["BRAMHA", "YAAMYA", "KAUBERA"], // Shuchim
  48: ["VARUNA"],           // Shuchim-Ashuchim-dveshinam
  49: ["BRAMHA"],           // Satyabhisandham
  50: ["AINDRA", "VARUNA"], // Aklishtakarmanam
  51: ["VARUNA"],           // Punyasheelah
  52: ["YAAMYA"],           // Lekhasthavrittam / Praptakarinam
  53: ["BRAMHA"],           // Jitendriyam
  54: ["KAUBERA"],          // Krodha-prasadam-phaladam
  55: ["VARUNA"],           // Sthana-kopa-prasadam
  56: ["YAAMYA"],           // Tyakta-Dambha-Bhaya-Krodham
  57: ["BRAMHA", "ARSHA", "YAAMYA"], // Kama-krodha-lobha / Upashant / Vyagpata
  58: ["PAISHACH", "SHAKUNA", "MATSYA"], // Bheerum / Bheeshyitaram
  59: ["SARPA"],            // Kruddha-Shooram-Akruddha-bheerum
  60: ["SARPA"],            // Santrasta-gochar
  61: ["SARPA"],            // Mayanvit
  62: ["PAISHACH", "SHAKUNA"], // Shanki / Nitya-Shankitam
  63: ["PASHAVA"],          // Mandata
  64: ["SHAKUNA", "MATSYA"], // Param-anavasthitam / Anavasthitam / Chalam
  65: ["SHAKUNA", "PASHAVA"], // Durmedhasam
  66: ["MATSYA"],           // Apragyam
  67: ["VANASPATYA"],       // Sarva-buddhayangaheena
  68: ["PASHAVA"],          // Nirakarishnum
  69: ["ASURA"],            // Ananukrosham
  70: ["PRETA"],            // Ahankrita
  71: ["PAISHACH"],         // Nairlajjyam
  72: ["RAKSHAS"],          // Ekantagrahita
  73: ["VANASPATYA"],       // Ekasthan-ratiah
  74: ["SHAKUNA"],          // Vagdhoonam
  75: ["ASURA", "SARPA"],   // Chandam
  76: ["ASURA", "RAKSHAS"], // Raudram
  77: ["RAKSHAS", "PAISHACH"], // Krooram
  78: ["PAISHACH", "SARPA"], // Taikshnyam
  79: ["ASURA", "MATSYA"],  // Hanta / Hinsram
  80: ["PRETA"],            // Atidukhasheela-achara-upachar
  81: ["RAKSHAS", "SHAKUNA"], // Amarshinam
  82: ["RAKSHAS"],          // Anubandhakopa
  83: ["RAKSHAS"],          // Chhidra-praharinam
  84: ["RAKSHAS"],          // Rosha-Irshya-Marsha-Santatah
  85: ["RAKSHAS", "PRETA", "SARPA"], // Vaira / Vairino / Bahu-Vairinam
  86: ["RAKSHAS"],          // Kalaharthi
  87: ["PAISHACH"],         // Sahas-priyata
  88: ["MATSYA"],           // Kama-Krodha-Avasham Gatam
  89: ["MATSYA"],           // Paraspara-abhimarda
  90: ["RAKSHAS", "SARPA", "PRETA"], // Ayas-bahulam / Akarmasheela
  91: ["VANASPATYA"],       // Alasam
  92: ["RAKSHAS"],          // Swapna-bahulam
  93: ["SARPA"],            // Nidralum
  94: ["ASURA", "PRETA", "SHAKUNA", "VANASPATYA"], // Audarikam / Ahara-kamam
  95: ["RAKSHAS", "SARPA", "PAISHACH", "MATSYA"], // Ahara-atimatra / Ahara-vihara-param / Mahashanam / Ahara-lubdham
  96: ["PAISHACH", "SHAKUNA", "PASHAVA"], // Vikrit-ahara / Kutsita / Jugupsit
  97: ["RAKSHAS", "PAISHACH"], // Amish-priyatamam / Madya-Mansa
  98: ["ASURA"],            // Ekashinam
  99: ["PRETA"],            // Nisha-Priyah
  100: ["PASHAVA"],         // Rujalankar-Varjitam
  101: ["GANDHARVA", "PAISHACH", "SARPA"], // Stree-vihar / Strainam / Streerahaskamam
  102: ["PASHAVA", "SHAKUNA"], // Maithun-param / Pravruddha-kamasevi
  103: ["PASHAVA"],         // Svapne maithuna-niyata
  104: ["KAUBERA", "MATSYA"], // Maha-prasavshakti / Suprajasam
  105: ["RAKSHAS"],         // Dharma-bahyata
  106: ["ASURA", "RAKSHAS", "MATSYA"], // Atmapoojakam / Bhrisam / Atmaparam
  107: ["ASURA"],           // Aupadhikam
  108: ["MATSYA"],          // Shatham
  109: ["PRETA"],           // Ati-lolupa
  // Section 16 - Observer Rated
  110: ["VARUNA"],          // Paingalya
  111: ["VARUNA"],          // Harikeshata
  112: ["PRETA"],           // Vikruta-Anana
  113: ["PRETA"],           // Viroopa
  114: ["AINDRA"],          // Tejasopetam
  115: ["SARPA"],           // Nitya-Oshtha-Lehinam
  116: ["AINDRA"],          // Mahatmyam
  117: ["VARUNA"],          // Priya-vaditvam
  118: ["PRETA"],           // Vikruta-Atmano
}

// Subtypes with item counts and max scores
SUBTYPE_CONFIG = {
  BRAMHA:     { total_items: 15, max_score: 180 },
  ARSHA:      { total_items: 7,  max_score: 84  },
  AINDRA:     { total_items: 15, max_score: 180 },
  YAAMYA:     { total_items: 12, max_score: 144 },
  VARUNA:     { total_items: 14, max_score: 168 },
  KAUBERA:    { total_items: 11, max_score: 132 },
  GANDHARVA:  { total_items: 7,  max_score: 84  },
  ASURA:      { total_items: 11, max_score: 132 },
  RAKSHAS:    { total_items: 16, max_score: 192 },
  PAISHACH:   { total_items: 12, max_score: 144 },
  SARPA:      { total_items: 11, max_score: 132 },
  PRETA:      { total_items: 13, max_score: 156 },
  SHAKUNA:    { total_items: 11, max_score: 132 },
  PASHAVA:    { total_items: 7,  max_score: 84  },
  MATSYA:     { total_items: 12, max_score: 144 },
  VANASPATYA: { total_items: 7,  max_score: 84  },
}

// Parent category mapping
PRAKRITI_CATEGORY = {
  BRAMHA: "Sattvika",    ARSHA: "Sattvika",   AINDRA: "Sattvika",
  YAAMYA: "Sattvika",   VARUNA: "Sattvika",  KAUBERA: "Sattvika",
  GANDHARVA: "Sattvika", ASURA: "Rajasika",   RAKSHAS: "Rajasika",
  PAISHACH: "Rajasika",  SARPA: "Rajasika",   PRETA: "Rajasika",
  SHAKUNA: "Rajasika",   PASHAVA: "Tamasika", MATSYA: "Tamasika",
  VANASPATYA: "Tamasika"
}
```

### 6.3 Scoring Algorithm (Pseudocode)

```
function calculateSubtypeScores(itemResponses):
  subtypeRawScores = { all 16 subtypes: 0 }
  
  for each itemResponse in itemResponses:
    itemTotal = probe1 + probe2 + probe3   // max 12
    mappedSubtypes = ITEM_SUBTYPE_MAP[itemResponse.item_number]
    
    for each subtype in mappedSubtypes:
      subtypeRawScores[subtype] += itemTotal
  
  subtypePercentages = {}
  for each subtype:
    subtypePercentages[subtype] = 
      (subtypeRawScores[subtype] / SUBTYPE_CONFIG[subtype].max_score) * 100
  
  sortedSubtypes = sort subtypePercentages descending
  predominant = sortedSubtypes[0]
  secondary = sortedSubtypes[1]
  
  return { subtypeRawScores, subtypePercentages, predominant, secondary }

function calculateGAD7(gad7Responses):
  total = sum(gad7Responses.item_scores)  // 0–21
  severity = 
    total <= 4  → "Minimal"
    total <= 9  → "Mild"
    total <= 14 → "Moderate"
    else        → "Severe"
  return { total, severity, impairment: gad7Responses.impairment_score }
```

### 6.4 Reverse Scoring Note
Items 9 (Samvibhaginam) where a high score implies a low score for Asamvibhaginam and Adataram subtypes — since PRETA is the subtype for Asamvibhaginam and Adataram, Item 9's **inverted score** (12 − item_total) should be added to PRETA's raw score. This is the only reversal pattern. Must be hardcoded in the scoring engine.

---

## 7. Screen-by-Screen Specifications

### Screen 1: Login
- Email + Password
- "Forgot password" link
- No self-registration (admin creates accounts)

---

### Screen 2: Practitioner Dashboard
**Layout:**
- Header: Platform name, practitioner name, logout
- Primary CTA: "Start New Assessment" button (prominent)
- Session list table:
  - Columns: Respondent ID | Date | Status | Predominant Prakriti | GAD-7 Severity | Actions
  - Actions: View Results / Resume (if in_progress) / Download Report
- Filter bar: Date range | Status | Prakriti type | GAD-7 severity
- Pagination: 20 records per page

**Mobile:** Table collapses to card list

---

### Screen 3: New Session Setup
**Two-step form:**

**Step 1 — Respondent Info**
- Respondent ID (auto-generated code shown, editable)
- Age (number input)
- Gender (segmented control: Male / Female / Other)
- Education (dropdown: Primary / Secondary / Graduate / Postgraduate / Doctoral / Other)
- Occupation (text, optional)
- Language (segmented control: English / Hindi / Marathi)

**Step 2 — Session Config**
- "Which instrument first?" — Radio: MPPI first / GAD-7 first
- Confirm & Begin button

---

### Screen 4: Assessment — MPPI Item View
This is the most critical screen. Practitioner spends ~60–90 minutes here.

**Layout (Desktop):**
```
[Header: Section 3 of 16 · Cognitive Strengths     ●●●●●●●●●●○○○○○○  62%]

[Item 19 of 118]
Smritimantam (स्मृतिमन्तं)
One who possesses strong memory and remembrance

────────────────────────────────────────────────────────────
CORE PROBE (Read aloud — not scored)
"How well are you able to remember and recall important 
information, events, or experiences from your life?"
────────────────────────────────────────────────────────────

FOLLOW-UP PROBE 1
How accurately and readily do you recall past events, 
conversations, or important information when needed?

  [0]  [1]  [2]  [3]  [4]
  
  ↑ hover/tap score to see interpretation

FOLLOW-UP PROBE 2
Do you tend to remember details of situations or 
conversations that others might forget?

  [0]  [1]  [2]  [3]  [4]

FOLLOW-UP PROBE 3  
Is your memory generally reliable and consistent 
across different types of information?

  [0]  [1]  [2]  [3]  [4]

                    Item Score: 9 / 12

[← Previous]                              [Next Item →]
```

**Layout (Mobile/Tablet):**
- Full-screen single item
- Probes stacked vertically
- Score chips as large tap targets (min 48×48px)
- Sticky bottom bar: Item score + Next button
- Section progress shown as thin top bar

**Interaction details:**
- Core probe block: slightly subdued style, labelled "Read to respondent"
- Follow-up probes: each has a clear label "Probe 1 / 2 / 3"
- Score chips: 0–4 in a row, selected state = filled/highlighted
- Score interpretation: visible as small text below selected chip, or tooltip on hover
- "Next" button: disabled (greyed) until all 3 probes scored
- Item score counter updates live

---

### Screen 5: Section Transition
Between sections, show a brief transition screen:
- "Section 3 Complete"
- Scores recorded for this section (count of items)
- "Begin Section 4: Leadership, Courage & Resilience"
- Estimated items: N
- [Continue] button

---

### Screen 6: Section 16 — Observer Assessment
- Distinct visual header: "Observer Assessment — Practitioner Scoring Only"
- Badge/label: "Not for respondent"
- Same item layout as Screen 4 but with visual differentiation (header color change)
- Items 110–118 shown sequentially

---

### Screen 7: GAD-7 Assessment
**Layout:** Same single-item-at-a-time approach

Each item:
- Question text in full (selected language)
- 4 response options as large selectable cards:
  - Not at all (0)
  - Several days (1)
  - More than half the days (2)
  - Nearly every day (3)
- Running total score shown after each item

Final item: functional impairment question
- 4 options: Not difficult / Somewhat difficult / Very difficult / Extremely difficult

---

### Screen 8: Session Complete — Results
**Sections:**

**1. Summary Banner**
- Respondent ID + Date
- "Assessment Complete"

**2. Manas Prakriti Result (Prominent)**
```
PREDOMINANT MANAS PRAKRITI
━━━━━━━━━━━━━━━━━━━━━━
BRAMHA SATTVA
Sattvika Category
Percentage Score: 74.4%

Secondary Influence: Aindra Sattva (62.1%)
```

**3. Full Subtype Distribution**
- Horizontal bar chart, all 16 subtypes
- Color-coded by category (Sattvika: one color, Rajasika: second, Tamasika: third)
- Percentage label at end of each bar
- Sorted descending

**4. GAD-7 Result**
```
GAD-7 ANXIETY ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━
Score: 8 / 21
Severity: MILD ANXIETY

Functional Impairment: Somewhat Difficult
```

**5. Actions**
- [Download PDF Report]
- [Return to Dashboard]
- [Start New Assessment]

---

### Screen 9: Admin Dashboard
- Summary cards: Total sessions | Completed | In Progress
- Chart: Prakriti distribution (bar chart)
- Chart: GAD-7 severity distribution (donut)
- Sessions table (all practitioners)
- [Export CSV] button

---

## 8. Design System

### 8.1 Aesthetic Direction
**"Clinical Calm"** — refined, authoritative, and serene. This is a research-grade medical tool used in high-focus interview settings. The design must convey trust, precision, and calm. It should feel like a well-designed clinical tool — not a consumer wellness app, not a generic SaaS dashboard.

Inspired by: Ayurvedic aesthetics (warm earth tones, natural depth) grounded in clinical precision (clean type, generous whitespace, structured hierarchy).

---

### 8.2 Color Palette
```css
/* Backgrounds */
--bg-primary: #FAFAF7;         /* Warm off-white */
--bg-surface: #FFFFFF;
--bg-section: #F5F2EC;         /* Warm parchment */
--bg-observer: #EEF4F0;        /* Soft sage — Section 16 distinction */

/* Brand / Primary */
--color-primary: #3D6B4F;      /* Deep forest green — Ayurvedic earth */
--color-primary-dark: #2A4E39;
--color-primary-light: #E8F0EB;

/* Accent */
--color-accent: #C4823A;       /* Warm amber — sacred/classical */
--color-accent-light: #F5E8D6;

/* Text */
--text-primary: #1A1A18;
--text-secondary: #5A5A55;
--text-tertiary: #8A8A82;
--text-inverse: #FFFFFF;

/* Severity (GAD-7) */
--severity-minimal: #4A8C6A;   /* Muted green */
--severity-mild: #C4A23A;      /* Amber */
--severity-moderate: #C46B3A;  /* Orange */
--severity-severe: #B03A3A;    /* Muted red */

/* Category (Prakriti) */
--sattvika: #3D6B4F;           /* Forest green */
--rajasika: #8B5A2B;           /* Earth brown */
--tamasika: #5A5A7A;           /* Muted indigo */

/* Functional */
--border: #E0DDD5;
--border-strong: #C8C4BA;
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
```

---

### 8.3 Typography
```css
/* Display — Sanskrit/classical feel, distinctive */
--font-display: 'Cormorant Garamond', serif;   /* For headings, predictor names, results */

/* Body — clean, highly legible */
--font-body: 'Source Serif 4', serif;          /* For question text, probes */

/* UI — crisp, functional */
--font-ui: 'DM Sans', sans-serif;              /* For labels, buttons, nav */

/* Devanagari (Hindi/Marathi) */
--font-devanagari: 'Noto Sans Devanagari', sans-serif;

/* Scale */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
```

---

### 8.4 Spacing & Layout
```css
/* Spacing scale */
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-5: 20px;  --space-6: 24px;
--space-8: 32px;  --space-10: 40px; --space-12: 48px;
--space-16: 64px;

/* Layout */
--max-width-content: 720px;   /* Assessment items */
--max-width-dashboard: 1200px;
--max-width-results: 900px;

/* Border radius */
--radius-sm: 4px;   --radius-md: 8px;
--radius-lg: 12px;  --radius-xl: 16px;
--radius-full: 9999px;
```

---

### 8.5 Component Specifications

#### Score Chip
```
Size: 48px × 48px (mobile), 44px × 44px (desktop)
Default: border 1.5px solid --border, bg transparent, text --text-secondary
Hover: border --color-primary, bg --color-primary-light
Selected: bg --color-primary, text white, border --color-primary
Font: --font-ui, font-weight 600, text-base
Spacing between chips: 8px
```

#### Progress Bar (Section)
```
Height: 4px
Track: --bg-section
Fill: --color-primary
Border-radius: full
Transition: width 300ms ease
```

#### Core Probe Block
```
Background: --bg-section
Border-left: 3px solid --color-accent
Padding: 16px 20px
Border-radius: 0 --radius-md --radius-md 0
Font: --font-body italic, text-base, --text-secondary
Label above: "Read aloud to respondent" — --font-ui text-xs --text-tertiary uppercase letter-spacing
```

#### Section Header Badge
```
For Section 16:
Background: --bg-observer
Border: 1px solid #B8D4BC
Badge text: "Observer Assessment" — green toned
```

#### GAD-7 Response Card
```
Width: full-width
Padding: 16px 20px
Border: 1.5px solid --border
Border-radius: --radius-md
Selected: border --color-primary, bg --color-primary-light
Hover: border --color-primary-light, shadow-sm
Font: --font-body text-base
Score value: --font-ui text-sm --text-tertiary, right-aligned
```

---

### 8.6 Responsive Breakpoints
```css
--bp-mobile: 375px;    /* Base: single column */
--bp-tablet: 768px;    /* Mid: wider content area */
--bp-desktop: 1024px;  /* Full: sidebars enabled */
--bp-wide: 1440px;     /* Max-width capped */
```

**Mobile-first approach:**
- Assessment screens: Full viewport, one item fills screen, bottom-fixed action bar
- Dashboard: Card stack, no table (or horizontal scroll table)
- Results: Single column, charts full width
- Navigation: Bottom tab bar (mobile), top header (desktop)

---

### 8.7 Motion & Animation
```css
/* Page transitions */
.page-enter: opacity 0 → 1, translateY 8px → 0, duration 200ms ease-out

/* Item transitions (next/previous) */
.item-exit: opacity 1 → 0, translateX 0 → -20px, duration 150ms
.item-enter: opacity 0 → 1, translateX 20px → 0, duration 200ms

/* Score chip selection */
.chip-select: scale 1 → 0.95 → 1, duration 100ms, bg transition 150ms

/* Progress bar fill */
transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1)

/* Results — bar chart */
.bar-enter: width 0 → final%, duration 600ms, staggered by 50ms per bar
```

---

## 9. Technical Architecture

### 9.1 Recommended Stack
Given this is a research platform prioritizing reliability, offline resilience, and clean data handling:

**Frontend**
- React 18 (with Vite)
- React Router v6
- Zustand (state management — simpler than Redux for this scope)
- TanStack Query (server state + caching)
- Recharts (bar charts, donut chart on results/admin screen)
- React PDF (report generation)
- i18next (EN/HI/MR language support)
- Tailwind CSS (utility-first, customized with design system tokens)

**Backend**
- Node.js + Express (or Next.js API routes if preferred)
- PostgreSQL (primary database — JSONB for scoring maps)
- Prisma ORM
- JWT authentication (access + refresh tokens)
- bcrypt (password hashing)

**Infrastructure (suggested)**
- Vercel or Railway for deployment
- Supabase or Neon for managed PostgreSQL
- Cloudflare for CDN/edge

---

### 9.2 API Endpoints

```
AUTH
  POST   /api/auth/login
  POST   /api/auth/logout
  POST   /api/auth/refresh

RESPONDENTS
  POST   /api/respondents              — create
  GET    /api/respondents/:id          — fetch

SESSIONS
  POST   /api/sessions                 — create (with respondent_id)
  GET    /api/sessions                 — list (practitioner's own)
  GET    /api/sessions/:id             — fetch single
  PATCH  /api/sessions/:id/status      — update status

ITEM RESPONSES
  PUT    /api/sessions/:id/items/:item_number   — save/update item response
  GET    /api/sessions/:id/items                — all item responses for session

GAD7
  PUT    /api/sessions/:id/gad7                 — save GAD-7 responses

RESULTS
  POST   /api/sessions/:id/calculate            — trigger scoring computation
  GET    /api/sessions/:id/results              — fetch computed results

REPORTS
  GET    /api/sessions/:id/report               — generate + return PDF

ADMIN
  GET    /api/admin/sessions                    — all sessions
  GET    /api/admin/export                      — CSV export
  GET    /api/admin/stats                       — aggregate stats
```

---

### 9.3 Offline / Resilience Considerations
Sessions should be resilient to network drops mid-interview:

- Item responses auto-saved to localStorage as backup on every score input
- On reconnect, sync local state to server
- "Unsaved changes" indicator if network is unavailable
- On session load, merge server state + local state (server wins for completed items)

---

### 9.4 Data Content — Question Bank
All 118 MPPI items + 7 GAD-7 items must be stored as structured data (JSON or seeded DB records), not hardcoded in components.

```json
// Item schema
{
  "item_number": 19,
  "section": 3,
  "section_name": "Cognitive Strengths, Learning and Intellectual Functioning",
  "predictor_sanskrit": "Smritimantam",
  "predictor_devanagari": "स्मृतिमन्तं",
  "interpretation": "One who possesses strong memory and remembrance",
  "core_probe": {
    "en": "How well are you able to remember and recall...",
    "hi": "...",
    "mr": "..."
  },
  "probes": [
    {
      "probe_number": 1,
      "question": {
        "en": "How accurately and readily do you recall...",
        "hi": "...",
        "mr": "..."
      },
      "score_labels": {
        "0": "Consistently poor recall",
        "1": "Often struggles with recall",
        "2": "Moderate recall ability",
        "3": "Usually recalls well",
        "4": "Consistently accurate and ready recall"
      }
    },
    // probe 2, probe 3
  ],
  "mapped_subtypes": ["BRAMHA", "YAAMYA"],
  "is_observer_rated": false,
  "section_14_gender_variant": null  // "male" | "female" | null
}
```

---

### 9.5 Security
- All routes require valid JWT
- Respondent records contain no PII beyond researcher-defined ID codes
- HTTPS enforced
- Admin role scoped separately from practitioner role
- Rate limiting on auth endpoints
- Input sanitization on all text fields

---

## 10. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load time | <2s on 4G |
| Item navigation (next/prev) | <100ms perceived |
| Score calculation (on completion) | <1s |
| PDF report generation | <5s |
| Uptime | 99.5% |
| Browser support | Chrome 90+, Safari 14+, Firefox 90+, Edge 90+ |
| Accessibility | WCAG 2.1 AA — min touch target 48px, sufficient contrast ratios, keyboard navigable |
| Data backup | Daily automated DB backup |
| Session recovery | Auto-resume within 4 hours of last activity |

---

## 11. Out of Scope (V1)

- Consumer-facing self-assessment version
- Automated interpretation / AI-generated commentary on Prakriti results
- Recommendations engine (diet, lifestyle, treatment)
- Multi-language UI labels (UI in English only; question content trilingual)
- Real-time multi-practitioner collaboration on one session
- SMS/email notifications
- Video call integration
- Mobile native app (iOS/Android)
- Statistical analysis module (export CSV; analysis done externally in V1)
- Integration with hospital EMR systems

---

## 12. Appendix: Scoring Reference

### Subtype Full Names & Parent Categories

| Subtype Code | Full Name | Category |
|---|---|---|
| BRAMHA | Bramha Sattva / Bramha Kaya | Sattvika |
| ARSHA | Arsha Sattva / Rishi Kaya | Sattvika |
| AINDRA | Aindra Sattva / Mahendra Kaya | Sattvika |
| YAAMYA | Yaamya Sattva / Yaamya Kaya | Sattvika |
| VARUNA | Varuna Sattva / Varuna Kaya | Sattvika |
| KAUBERA | Kaubera Sattva / Kaubera Kaya | Sattvika |
| GANDHARVA | Gandharva Sattva / Gandharva Kaya | Sattvika |
| ASURA | Asura Sattva / Asura Kaya | Rajasika |
| RAKSHAS | Rakshas Sattva / Rakshas Kaya | Rajasika |
| PAISHACH | Paishach Sattva / Paishach Kaya | Rajasika |
| SARPA | Sarpa Sattva / Sarpa Kaya | Rajasika |
| PRETA | Preta Sattva / Preta Kaya | Rajasika |
| SHAKUNA | Shakuna Sattva / Shakuna Kaya | Rajasika |
| PASHAVA | Pashava Sattva / Pashava Kaya | Tamasika |
| MATSYA | Matsya Sattva / Matsya Kaya | Tamasika |
| VANASPATYA | Vanaspatya Sattva / Vanaspatya Kaya | Tamasika |

### GAD-7 Severity Reference

| Score | Severity |
|---|---|
| 0–4 | Minimal Anxiety |
| 5–9 | Mild Anxiety |
| 10–14 | Moderate Anxiety |
| 15–21 | Severe Anxiety |

### Section Map

| Section | Items | Domain |
|---|---|---|
| 1 | 1–8 | Lifestyle & Sensory Preferences |
| 2 | 9–18 | Social Harmony & Compassion |
| 3 | 19–29 | Cognitive Strengths & Learning |
| 4 | 30–38 | Leadership, Courage & Resilience |
| 5 | 39–41 | Prosperity & Material Orientation |
| 6 | 42–46 | Spirituality, Dharma & Values |
| 7 | 47–52 | Morality, Ethics & Self-Discipline |
| 8 | 53–57 | Emotional Regulation & Personality Balance |
| 9 | 58–64 | Fearfulness & Emotional Vulnerability |
| 10 | 65–68 | Reduced Adaptive Cognitive Functioning |
| 11 | 69–74 | Social Withdrawal & Rigidity |
| 12 | 75–89 | Aggression, Hostility & Antisocial Reactivity |
| 13 | 90–100 | Lifestyle Dysregulation & Lethargy |
| 14 | 101–104 | Sexuality & Intimacy (Gender-adaptive) |
| 15 | 105–109 | Moral/Spiritual Deviation |
| 16 | 110–118 | Observer-Rated Traits (Practitioner only) |

---

*End of PRD v1.0*  
*For questions on scoring logic, refer to Scoring_Format.pdf. For question content, refer to Questionnaire.pdf. For GAD-7, refer to GAD-7_Anxiety-updated_0.pdf.*
