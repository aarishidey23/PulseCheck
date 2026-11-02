# PulseCheck — Python Data Analytics Engine

A production-grade, asynchronous scientific computing backend built with **FastAPI**, **Pandas**, and **NumPy** for environmental intelligence, biosensor data cleaning, statistical distribution analysis, anomaly detection, and time-series forecasting.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              PulseCheck Frontend (React 19 + TypeScript)     │
│   • Operations Console       • Geospatial Radar             │
│   • Sensor Diagnostics       • Data Laboratory & CSV Export │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON & Multipart CSV
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Full-Stack Gateway (Express.js)             │
│   • Port 3000 (Vite SSR / SPA middleware)                    │
│   • Proxy: /api/python/* ──► http://127.0.0.1:8000/*        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Internal Reverse Proxy
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Python Analytical Microservice                │
│             FastAPI (Asynchronous ASGI Server)              │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   1. Data Ingestion & Preprocessing (Pandas)        │   │
│   │      • Automated Schema Normalization               │   │
│   │      • Forward/Backward Fill & Median Imputation    │   │
│   │      • Duplicate Observation Removal                │   │
│   └─────────────────────────┬───────────────────────────┘   │
│                             ▼                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   2. Statistical Moment Analysis (NumPy)            │   │
│   │      • Mean (μ), Std Dev (σ), Variance (σ²)         │   │
│   │      • Skewness (S) & Excess Kurtosis (K)           │   │
│   │      • Full Percentile Breakdown (P10 to P99)       │   │
│   └─────────────────────────┬───────────────────────────┘   │
│                             ▼                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   3. Anomaly & Outlier Invariants (NumPy / SciPy)   │   │
│   │      • Tukey's 1.5×IQR Interquartile Boundary       │   │
│   │      • Z-Score Standardized Distance (|z| ≥ 2.5)    │   │
│   └─────────────────────────┬───────────────────────────┘   │
│                             ▼                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   4. Rolling Moving Averages & Trend Fitting        │   │
│   │      • Pandas windowed rolling aggregations         │   │
│   │      • Ordinary Least Squares Regression (OLS)      │   │
│   │      • Coefficient of Determination (R²)            │   │
│   └─────────────────────────┬───────────────────────────┘   │
│                             ▼                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   5. Auto-Regressive Forecasting                    │   │
│   │      • Holt's Linear Double Exponential Smoothing   │   │
│   │      • 95% Confidence Interval Expansion Cone       │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Mathematical & Algorithmic Formulations

### A. Data Imputation Strategy
Atmospheric sensor telemetry occasionally experiences transmission packet drops. Missing scalar entries are imputed using a two-pass temporal continuity protocol:
1. **Locality-Preserving Imputation**: $\hat{y}_t = y_{t-1}$ (Forward fill) followed by backward fill for leading edge nulls.
2. **Central Tendency Imputation**: If entire segments remain undefined, the channel median $\tilde{x} = \text{median}(X)$ is substituted to prevent skewing higher-order moments.

### B. Statistical Moments (NumPy Vectorized Implementation)
- **Arithmetic Mean**:
  $$\mu = \frac{1}{N} \sum_{i=1}^{N} x_i$$
- **Sample Variance & Standard Deviation** (Bessel's correction $N-1$):
  $$s^2 = \frac{1}{N-1} \sum_{i=1}^{N} (x_i - \bar{x})^2, \quad s = \sqrt{s^2}$$
- **Fisher-Pearson Skewness Coefficient** (distribution asymmetry):
  $$g_1 = \frac{\frac{1}{N}\sum_{i=1}^{N}(x_i - \bar{x})^3}{\left(\frac{1}{N}\sum_{i=1}^{N}(x_i - \bar{x})^2\right)^{3/2}}$$
- **Excess Kurtosis** (peakedness and heavy-tailed anomaly propensity):
  $$g_2 = \frac{\frac{1}{N}\sum_{i=1}^{N}(x_i - \bar{x})^4}{\left(\frac{1}{N}\sum_{i=1}^{N}(x_i - \bar{x})^2\right)^2} - 3$$

### C. Percentile Analysis & Outlier Boundaries
- Percentiles $P_{10}, P_{25}, P_{50}, P_{75}, P_{90}, P_{95}, P_{99}$ are calculated using `numpy.percentile(a, q, method='linear')`.
- **Interquartile Range**: $IQR = Q_3 - Q_1 = P_{75} - P_{25}$.
- **Tukey's Outlier Criterion**:
  $$\text{Lower Outlier Bound} = \max(0, Q_1 - 1.5 \times IQR)$$
  $$\text{Upper Outlier Bound} = Q_3 + 1.5 \times IQR$$
- **Z-Score Normalization**:
  $$z_i = \frac{x_i - \mu}{\sigma}$$
  Points satisfying $|z_i| \ge 2.5$ or exceeding the Tukey fence are flagged as anomalous dispersion events.

### D. Ordinary Least Squares (OLS) Linear Trend
Linear trend slope $m$ and intercept $b$ are computed via `numpy.polyfit(x, y, 1)`:
$$m = \frac{\sum_{i=1}^{N}(x_i - \bar{x})(y_i - \bar{y})}{\sum_{i=1}^{N}(x_i - \bar{x})^2}, \quad b = \bar{y} - m\bar{x}$$
$$R^2 = 1 - \frac{SS_{\text{res}}}{SS_{\text{tot}}} = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$

### E. Double Exponential Smoothing (Holt's Linear Model)
Captures both evolving baseline levels and slope momentum without requiring heavy neural networks:
$$\text{Level Equation: } L_t = \alpha Y_t + (1 - \alpha)(L_{t-1} + b_{t-1})$$
$$\text{Trend Equation: } b_t = \beta(L_t - L_{t-1}) + (1 - \beta)b_{t-1}$$
$$\text{Forecast: } \hat{Y}_{t+h} = L_t + h \cdot b_t$$
where $\alpha = 0.35$ and $\beta = 0.15$. The 95% confidence interval cone is computed with residual variance expansion:
$$\text{CI}_{95\%} = \hat{Y}_{t+h} \pm 1.96 \times \sqrt{\sigma^2_{\text{residual}} \cdot (1 + 0.1 \cdot h)}$$

---

## 3. Dataset Documentation & Sources

The analytical engine includes a referenced atmospheric dataset located at:
`backend/datasets/epa_air_quality_reference.csv`

- **Authority**: United States Environmental Protection Agency (US EPA) Air Quality System (AQS) & Swiss National Air Pollution Monitoring Network (NABEL).
- **Sampling Frequency**: 1-hour continuous scalar observations over a 96-hour multi-day meteorological window.
- **Parameters Monitored**:
  - `pm25_ug_m3`: Fine aerosol particles ($\le 2.5\,\mu\text{m}$)
  - `pm10_ug_m3`: Coarse suspended particulate matter ($\le 10\,\mu\text{m}$)
  - `co2_ppm`: Carbon dioxide background concentration
  - `o3_ppb`: Ground-level tropospheric ozone
  - `no2_ppb`: Nitrogen dioxide vehicular combustion byproduct
  - `voc_pts`: Volatile organic compound photoionization index
  - `temperature_c`, `rel_humidity_pct`, `baro_pressure_hpa`: Meteorological boundary variables

---

## 4. REST API Specification

### `GET /api/health`
Checks backend status and reports installed Python and library versions.

**Sample Response**:
```json
{
  "status": "healthy",
  "message": "PulseCheck Python Data Analytics Engine is operational.",
  "python_version": "3.10.12",
  "fastapi_version": "0.162.0",
  "pandas_version": "2.3.3",
  "numpy_version": "2.2.6",
  "timestamp": "2026-11-02T15:30:00Z"
}
```

### `POST /api/analyze/reference`
Executes the analytics pipeline against the EPA AQS benchmark dataset.

**Query Parameters**:
- `metric`: e.g. `pm25`, `pm10`, `co2`, `o3`, `no2`, `vocIndex`, `temperature` (default: `pm25`)
- `rolling_window`: Moving average window in hours (default: `6`)
- `forecast_steps`: Number of forecast steps ahead (default: `12`)

### `POST /api/analyze/telemetry`
Accepts a JSON payload of telemetry records directly from the React frontend, converts it to a Pandas DataFrame, and returns the analytics report.

### `POST /api/analyze/upload`
Accepts any user-uploaded CSV file (`multipart/form-data`) and runs the complete Pandas cleaning, outlier detection, and forecasting pipeline.

### Interactive API Documentation:
When the server is running, the complete interactive OpenAPI Swagger documentation is available at:
`http://localhost:3000/api/python/docs` or `http://localhost:8000/docs`

---

## 5. Local Setup Instructions (For College CSE Projects)

### Prerequisites
- Python 3.10+
- Node.js 20+

### Option A: Standalone Python Backend
```bash
# 1. Create a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Start the FastAPI server
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Test the API in your browser at `http://127.0.0.1:8000/docs`.

### Option B: Unified Full-Stack Run
```bash
# 1. Install frontend & server dependencies
npm install

# 2. Run the unified full-stack dev server
npm run dev
```
The Express server boots on `http://localhost:3000`, automatically launches the Python FastAPI service on port 8000 in a background process, and proxies API calls seamlessly.

---

## 6. Interview Talking Points & Technical Questions

1. **Why use FastAPI instead of Flask or Django?**
   - *FastAPI offers native asynchronous (`async`/`await`) request handling on ASGI (Uvicorn), automatic schema validation using Pydantic, and self-documenting OpenAPI Swagger endpoints with zero extra boilerplate.*

2. **How does Pandas handle missing data in this pipeline?**
   - *Rather than dropping missing sensor readings and introducing time-series discontinuity, we apply forward fill (`ffill`) followed by backward fill (`bfill`) to preserve physical persistence. If an entire channel is uncalibrated, median imputation is applied.*

3. **Why use Holt’s Linear Exponential Smoothing over a simple moving average?**
   - *A simple moving average lags behind shifting trends. Holt’s method uses two smoothing equations ($\alpha$ for the baseline level, $\beta$ for the trend slope), allowing it to anticipate accumulating pollution vectors while generating expanding 95% confidence intervals.*

4. **How are outliers detected?**
   - *We use a dual approach: Tukey's 1.5×IQR boundary for non-parametric robustness against skewed distributions, combined with standard Z-scores ($|z| \ge 2.5$) to catch episodic industrial discharge spikes.*
