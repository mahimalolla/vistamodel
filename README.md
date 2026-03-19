* * * * *
 
Live Interpreter
==============================
 
Live Interpreter is a real-time **speech-to-speech translation system** that enables live, bidirectional communication between **Spanish and English** speakers, backed by an MLOps **offline→online** pipeline.
 
The system converts spoken language into translated speech with low latency and provides an end-to-end workflow to **build, validate, version, and serve** bilingual translation data/models.
 
This repository includes:
 
-   Offline data pipeline orchestration (Airflow DAG + Python nodes)
 
-   Dataset QA (schema, stats, anomaly checks, slicing, approval gate)
 
-   Cloud storage integration (uploading approved artifacts to GCS)
 
-   Online inference service (FastAPI translation API with BigQuery logging)
 
-   Live speech client (Google STT → translation API → Google TTS)
 
* * * * *
 
Why English--Spanish?
-----------------------
 
We selected **English--Spanish** as the initial language pair because Spanish is one of the most widely spoken languages globally and is highly relevant in U.S. public-sector and community settings. English--Spanish translation represents one of the most common real-world communication gaps in healthcare, education, and civic engagement environments.
 
For the scope of this course project, we intentionally focused on a single language pair to prioritize depth in streaming architecture, monitoring, latency optimization, and MLOps infrastructure. The system is architected to support additional languages in future expansions (e.g., French, Mandarin) with minimal structural changes.
 
* * * * *
 
Key Features
---------------
 
-    **Offline Data Pipeline (Airflow)**
 
-    **Dataset preprocessing into instruction format (EN↔ES, domain-aware)**
 
-    **Train/Val/Test splitting + dataset approval gate**
 
-    **Schema + statistics reporting and anomaly detection**
 
-    **Dataset slicing (domain, direction, sentence length)**
 
-    **Upload approved artifacts to Google Cloud Storage (GCS)**
 
-    **Trigger payload generation for downstream/online steps**
 
-    **Online Translation API (FastAPI)**
 
-    **BigQuery inference logging (latency, lengths, direction, domain)**
 
-    **Live speech-to-speech demo (Google STT + TTS)**
 
* * * * *
 
System Architecture
-----------------------
 
```
Offline (Airflow DAG: `offline_translation_pipeline`)
  1) Download datasets (HF) → `data/raw/*.jsonl` + manifest
  2) Preprocess + instruction formatting → `data/processed/dataset.jsonl`
  3) Split train/val/test → `data/processed/{train,val,test}.jsonl`
  4) Stats + schema reports → `reports/tfdv_stats_summary.json`, `reports/schema.json`
  5) Schema load (confirmation step)
  6) Anomaly detection (fails DAG if issues) → `reports/anomalies.json`
  7) Dataset slicing → `data/processed/slices/*.jsonl`
  8) Dataset approval gate → `reports/dataset_approval.json`
  9) Upload approved artifacts to GCS
  10) Write trigger payload for downstream online pipeline → `reports/trigger_payload.json`
 
Online (serving + demo)
  FastAPI translation service (Gemma 3 4B + LoRA adapter from GCS) → `/translate`
  BigQuery logs for requests/responses/latency
  Live speech client: Microphone → Google STT → API translate → Google TTS
 
```
 
The system is designed so the offline pipeline produces validated/versioned artifacts and the online services consume those artifacts for low-latency translation and monitoring.
 
* * * * *
 
 
 
 
 
 
Evaluation & Benchmarking
----------------------------
 
This repo focuses on **system-level validation and monitoring** around translation data and serving.
 
###  Evaluation Strategy
 
-   Data QA in the offline pipeline:
 
    -   Schema + field presence checks (via generated `reports/schema.json`)
 
    -   Summary statistics on the training split (`reports/tfdv_stats_summary.json`)
 
    -   Anomaly checks on the validation split (length bounds, nulls, invalid labels) via `reports/anomalies.json`
 
    -   Dataset slicing to spot gaps by domain, direction, and sentence length
 
### Translation Evaluation Strategy
 
-   Parallel corpora sources used in the offline pipeline:
 
    -   `Helsinki-NLP/opus-100` (EN–ES)
 
    -   `Helsinki-NLP/europarl` (EN–ES)
 
-   Serving-time monitoring:
 
    -   Per-request latency returned by the API and logged to BigQuery
 
### Robustness Testing
 
-   Live speech demo robustness (runtime):
 
    -   Google streaming STT interim/final results
 
    -   End-to-end latency visibility in the terminal demo
 
    -   Domain + direction switching (`medical` / `legal`, `en_to_es` / `es_to_en`)
 
* * * * *
 
Metrics to be tracked
------------------
 
-   End-to-end latency (speech demo)
 
-   API latency per request (returned in `/translate`)
 
-   Dataset health signals (null counts, length stats, label validity)
 
-   Slice coverage counts (domain/direction/length)
 
-   BigQuery inference logs (timestamp, domain, direction, lengths, latency)
 
-   Pipeline pass/fail gates (anomaly detection + approval)
 
* * * * *
 
Target Use Cases
--------------------
 
-   Public meetings and civic engagement
 
-   Healthcare intake and front-desk assistance
 
-   Community centers and education
 
-   Multilingual service kiosks
 
-   Accessibility for non-native speakers
 
* * * * *
 
Project Focus
----------------
 
This project emphasizes:
 
-   Offline dataset engineering with orchestration and quality gates
 
-   Low-friction handoff from offline artifacts → online services
 
-   Production-minded cloud integration (GCS + BigQuery)
 
-   Monitoring hooks for inference latency and outputs
 
-   A practical live demo path (STT → translate → TTS)
 
* * * * *
 
Running the Code
-------------------
 
This repo supports two main execution paths:
 
-   Offline pipeline (Airflow): run the 10-node DAG locally via Docker Compose.
 
-   Online + demo: call the hosted API and/or run the live speech client.
 
### Offline Data Pipeline (Airflow)
 
-   Start services: `docker compose up -d`
 
-   Airflow UI: `http://localhost:8080` (credentials created by compose: `admin` / `admin`)
 
-   DAG: `offline_translation_pipeline` in `dags/offline_pipeline.py`
 
-   Outputs (mounted locally): `data/raw/`, `data/processed/`, `reports/`
 
### Online Translation API (Hosted)
 
Example hosted endpoint documented in `commands.txt`:
 
-   Health check: `curl https://translation-api-1050963407386.us-central1.run.app/health`
 
-   Translate: `curl -X POST https://translation-api-1050963407386.us-central1.run.app/translate ...`
 
### Live Speech-to-Speech Demo (Local client)
 
-   Run `speech_pipeline.py` after ensuring Google credentials are available (the script expects `gcp-key.json` next to it and sets `GOOGLE_APPLICATION_CREDENTIALS` automatically).
 
-   Configure translation direction/domain inside `speech_pipeline.py`:
 
    -   `DIRECTION`: `en_to_es` or `es_to_en`
 
    -   `DOMAIN`: `medical` or `legal`
 
* * * * *
 
Future Enhancements
----------------------
 
-   Multi-language expansion beyond English--Spanish
 
-   Speaker diarization
 
-   Simultaneous translation models
 
-   Direct speech-to-speech architectures
 
-   Enhanced domain adaptation
 
* * * * *
 
