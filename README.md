# PromptShield AI

A two-layer firewall for AI prompts. Every prompt is screened by a rule engine and then an LLM toxicity check before it would reach a model. Each decision is logged. Built end to end: Spring Boot backend, PostgreSQL, React frontend, and a labeled-set evaluation harness.

> **Status:** runs locally (backend on `8082`, frontend on `3000`, database on Neon Postgres). **Not deployed yet.**

---

## How it works

```
Browser (React)
   │  POST /api/scan
   ▼
Spring Boot API
   ├─► 1. Rule engine ── whole-word keyword match on normalized text
   │        └─ hit → BLOCKED (score 1.0), AI call skipped
   └─► 2. AI check ───── OpenRouter LLM returns a toxicity score 0.0–1.0
            └─ score ≥ 0.4 → BLOCKED, otherwise ALLOWED
   ▼
PostgreSQL (scan_logs, rules) → decision returned to the UI
```

**Normalization before matching:** lowercase, leetspeak mapping (`0→o 1→i 3→e 4→a 5→s 7→t 8→b @→a $→s`), non-alphanumerics become spaces, runs of a repeated letter are capped at 2. Matching is **whole-word** (`" " + keyword + " "`), so `skill` does not trigger a `kill` rule.

## Pages

| Page | Purpose |
|---|---|
| Home | Live scanner with threat dial |
| Dashboard | Totals, block rate, score trend, recent scans |
| Logs | Searchable history of every decision |
| Rules | Admin-gated rule management (add / delete / toggle) |
| How It Works | Visual explanation of the pipeline |

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS 3, Framer Motion, Recharts, axios |
| Backend | Java 17, Spring Boot, JPA/Hibernate, Bean Validation |
| Database | PostgreSQL (local or Neon) |
| AI layer | OpenRouter chat-completions (free-tier model) |

## API

| Method | Endpoint | Admin password |
|---|---|---|
| POST | `/api/scan` | no |
| GET | `/api/logs` | no |
| GET | `/api/stats` | no |
| GET | `/api/rules` | no |
| POST | `/api/rules` | yes |
| DELETE | `/api/rules/{id}` | yes |
| PUT | `/api/rules/{id}/toggle` | yes |
| POST | `/api/auth/verify` | – |

Admin endpoints require an `X-Admin-Password` header.

---

## Getting started

### 1. Backend

Create `backend/src/main/resources/application.yaml` (it is gitignored, so secrets never reach the repo):

```yaml
spring:
  application:
    name: PromptShield AI
  datasource:
    url: ${DATABASE_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
promptshield:
  toxicity-threshold: 0.4
  max-prompt-length: 5000
  openrouter-api-key: ${OPENROUTER_API_KEY}
  admin-password: ${ADMIN_PASSWORD}
server:
  port: 8082
```

Set environment variables (PowerShell shown; they last only for that terminal session):

```powershell
$env:DATABASE_URL="jdbc:postgresql://<host>/<db>?sslmode=require"   # no credentials inside the URL
$env:DB_USERNAME="<user>"
$env:DB_PASSWORD="<password>"
$env:OPENROUTER_API_KEY="<key>"
$env:ADMIN_PASSWORD="<4-10 characters>"
cd backend
./mvnw spring-boot:run
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

The API base URL is in `frontend/src/services/api.js` (`http://localhost:8082/api`).

### 3. Add starter rules

The `rules` table starts empty. Open the **Rules** page, enter the admin password, and add phrases (phrases work better than single words):

| Keyword | Category | Severity |
|---|---|---|
| `kill yourself` | self-harm | HIGH |
| `i want to end my life` | self-harm | HIGH |
| `how to make a bomb` | weapons | HIGH |
| `i will kill you` | threat | HIGH |
| `make a weapon` | weapons | HIGH |

---

## Evaluation

`EvaluationRunner.java` sends 41 hand-labeled prompts (clean, clearly toxic, borderline) to the live `/api/scan` endpoint and computes accuracy, precision, recall, F1 and false-positive rate.

| Run | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| Baseline (original rules, threshold 0.7) | 78.0% | 100% | 43.8% | 60.9% |
| After adding 9 targeted rules | 90.2% | 100% | 75.0% | 85.7% |
| Threshold lowered to 0.25 | 87.8% | 100% | 68.8% | – |

Rule additions raised recall by 31 points with no loss of precision. Lowering the threshold did not help.

**Read these numbers with care:**
- The set is small (41 prompts) and written by the author, so results are optimistic and not a benchmark.
- They were measured with an earlier AI model and before whole-word matching was introduced. They have **not been re-run** since.
- The AI layer was non-deterministic on borderline prompts, so repeated runs can differ.

Run it (backend must be running; set `SCAN_URL` in the file to port `8082`):

```powershell
cd backend
./mvnw compile
./mvnw dependency:build-classpath "-Dmdep.outputFile=cp.txt"
$cp = "target/classes;" + (Get-Content cp.txt)
java -cp $cp com.promptshield.eval.EvaluationRunner
```

---

## Security

**In place**
- No secrets in the repo; all credentials come from environment variables.
- Request validation (`@Valid`, `@Size`), a 5000-character prompt cap, and a 2 MB request limit.
- Admin-only write endpoints checked server-side; admin password limited to 4–10 characters.
- Centralized error handling (`@RestControllerAdvice`).

**Not in place**
- Admin auth is a single shared password, not per-user accounts. A real version needs Spring Security, hashed credentials and JWT.
- No rate limiting on `/api/scan`.
- `@CrossOrigin` is permissive for local development.

## Known limitations

- **Keywords are context-blind.** A rule matches the words, not the meaning, so a phrase used harmlessly can still be blocked.
- **Evasion handling is partial.** Leetspeak and symbol padding are handled; heavy letter-stretching can still slip through (`boooomb` normalizes to `boomb`, not `bomb`).
- **Vague or indirect requests get through** unless the AI layer scores them.
- **Plain insults depend entirely on the AI layer**, which is the weakest part of the system.
- **Free-model dependency.** If the OpenRouter call fails (model removed, rate limit, bad key), the service **silently returns a score of 0.0**, so the AI layer effectively turns off while everything still shows ALLOWED. This happened when a free model became paid-only.
- **Coarse scores.** Rule hits are hard-coded to 1.0 and the LLM tends to answer near 0 or 1, so the dial rarely shows in-between values.
- No prompt-injection detection.

## Roadmap

- Make the AI model name a setting, add fallback models, and show an explicit "AI unavailable" status instead of a silent 0%.
- Severity-based scores for rule hits and a scoring rubric in the AI prompt.
- Re-run the evaluation with the current model and whole-word matching.
- Train a small classifier (TF-IDF + logistic regression) on a public toxicity dataset as a deterministic second layer.
- Bulk rule import from CSV.
- Deploy: backend on Render (Dockerfile, `PORT` env var), frontend on Vercel, database on Neon.

## Project structure

```
PromptShieldAI/
├── backend/
│   └── src/main/java/com/promptshield/
│       ├── controller/   FirewallController, RuleController, StatsController, AuthController
│       ├── service/      RuleEngineService, OpenAIModerationService
│       ├── model/        Rule, ScanLog
│       ├── repository/   RuleRepository, ScanLogRepository
│       ├── dto/          ScanRequest, ScanResponse, RuleRequest, AuthRequest
│       ├── exception/    GlobalExceptionHandler
│       ├── config/       AppConfig
│       └── eval/         EvaluationRunner (+ resources/eval-dataset.csv)
└── frontend/
    └── src/              pages/, components/, services/api.js
```