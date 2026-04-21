# Inference

This folder contains the FastAPI service that loads the fine-tuned Gemma 3 4B translation model and serves it over HTTP on Google Cloud Run. There are three files - `main.py` is the python script, `Dockerfile` packages it into a container, and `requirements.txt` lists its dependencies.

**Live endpoint:** `https://translation-api-1050963407386.us-central1.run.app`  
**Interactive docs:** `https://translation-api-1050963407386.us-central1.run.app/docs`

---

## How the service starts up

When the container starts, FastAPI's lifespan handler immediately spawns a background async task to load the model. This means the HTTP server is up and accepting requests within seconds, even though the model itself takes several minutes to load. During this window the `/health` endpoint returns `model_ready: false` and any call to `/translate` gets a `503` response with a message to try again shortly.

The loading sequence is: first the tokenizer is pulled from HuggingFace (`google/gemma-3-4b-it`), then the base model is loaded in `bfloat16` on CPU to keep memory usage manageable, then the QLoRA adapter is downloaded from GCS and applied via PEFT. Once `model.eval()` is called the `model_ready` flag flips to `true` and translations start being served.

The adapter path defaults to `gs://livespeechinterpreter-training/models/gemma3-4b-translation-v17` and can be overridden with the `ADAPTER_GCS` environment variable - this is how new adapter versions are deployed without rebuilding the image.

---

## What happens on each translation request

The `/translate` endpoint accepts a piece of text, a direction (`en_to_es` or `es_to_en`), and a domain (`medical` or `legal`). It wraps the input in an instruction-tuning prompt that matches the format the model was trained on:

```
### Instruction:
Translate the following medical sentence from English to Spanish.

### Input:
The patient requires immediate surgery.

### Response:
```

The model generates up to 128 new tokens using greedy decoding (`do_sample=False`). Only the tokens after the prompt are decoded and returned - the input tokens are sliced off before decoding. The response includes the translated text, the original direction and domain, and the end-to-end latency in milliseconds.

After building the response the service fires a non-blocking call to BigQuery to log the request. This runs synchronously but any failure is caught and logged - it never causes the HTTP response to fail.

---

## BigQuery logging

Every inference is appended to `mlops-489703.translation_monitoring.inference_logs`. Each row stores the UTC timestamp, input and output text, direction, domain, latency in milliseconds, and word counts for both input and output. This data feeds the monitoring dashboard and is used by `scripts/evaluate_model.py` to track live translation quality over time.

---

## Configuration

The service is configured entirely through environment variables. `ADAPTER_GCS` controls which adapter version is loaded - changing it and redeploying is the standard way to roll out a new model. `HF_TOKEN` is required to pull the gated Gemma 3 base model from HuggingFace. `PROJECT_ID`, `BQ_DATASET`, and `BQ_TABLE` control where inference logs go. `PORT` defaults to `8080` to match Cloud Run's expected port.

---

## Docker and Cloud Run

The `Dockerfile` is based on `pytorch/pytorch:2.3.0-cuda11.8-cudnn8-runtime`, which includes CUDA support for GPU inference if available. The image is built and pushed to Artifact Registry by Cloud Build on any push that changes the `inference/` directory, and then Cloud Run is redeployed automatically.

Cloud Run is configured with 16 GiB of RAM and 4 CPUs because the base model in `bfloat16` alone occupies around 8 GB. The minimum instance count is set to 1 so there is always a warm instance - cold starts would require reloading the model from scratch. Concurrency is set to 1 since the model is not thread-safe.

---

## Quick test

```bash
# Check if the model is ready
curl https://translation-api-1050963407386.us-central1.run.app/health

# Medical EN → ES
curl -X POST https://translation-api-1050963407386.us-central1.run.app/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "The patient requires immediate surgery.", "direction": "en_to_es", "domain": "medical"}'

# Legal ES → EN
curl -X POST https://translation-api-1050963407386.us-central1.run.app/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "El contrato debe ser firmado antes del viernes.", "direction": "es_to_en", "domain": "legal"}'
```
