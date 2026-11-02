"""
FastAPI Server for PulseCheck Environmental Intelligence Data Analytics.
Provides RESTful APIs for Pandas/NumPy data cleaning, descriptive moments,
percentile distribution, outlier detection, trend fitting, and forecasting.
"""

import os
import sys
import platform
from datetime import datetime
from typing import Optional, List
import pandas as pd
import numpy as np

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .models import (
    AnalyticsResponse,
    HealthCheckResponse,
    TelemetryBatchRequest,
)
from .analytics import (
    compute_statistics_and_analytics,
)

# Reference dataset path
DATASET_PATH = os.path.join(os.path.dirname(__file__), "datasets", "epa_air_quality_reference.csv")

app = FastAPI(
    title="PulseCheck Atmospheric Data Analytics API",
    description=(
        "Production-grade Python scientific backend powering environmental intelligence, "
        "sensor data cleaning, statistical distribution analysis, IQR outlier detection, "
        "and time-series forecasting using Pandas and NumPy."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS for Vite / Express frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
def root():
    return {
        "service": "PulseCheck Environmental Intelligence Python Engine",
        "status": "operational",
        "documentation": "/docs",
        "health": "/api/health",
    }

@app.get("/api/health", response_model=HealthCheckResponse, tags=["System Health"])
def get_health():
    """Verify backend health, runtime environment, and data science library versions."""
    return HealthCheckResponse(
        status="healthy",
        message="PulseCheck Python Data Analytics Engine is operational.",
        python_version=platform.python_version(),
        fastapi_version="0.162.0",
        pandas_version=pd.__version__,
        numpy_version=np.__version__,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )

@app.get("/api/datasets", tags=["Dataset Catalog"])
def list_available_datasets():
    """List benchmark datasets bundled with the analytical engine."""
    datasets = []
    if os.path.exists(DATASET_PATH):
        df = pd.read_csv(DATASET_PATH)
        datasets.append({
            "id": "epa-aqs-reference",
            "name": "US EPA Air Quality System (AQS) Benchmark",
            "source": "US EPA AQS & Swiss Federal FOEN NABEL Network",
            "total_records": len(df),
            "columns": list(df.columns),
            "parameters": ["PM2.5", "PM10", "CO2", "O3", "NO2", "VOC", "Temperature", "Humidity", "Pressure"],
            "averaging_resolution": "1-Hour Continuous",
        })
    return {"datasets": datasets}

@app.post("/api/analyze/reference", response_model=AnalyticsResponse, tags=["Analytics Engine"])
def analyze_reference_dataset(
    metric: str = Query("pm25", description="Target pollutant: pm25, pm10, co2, o3, no2, vocIndex, temperature"),
    rolling_window: int = Query(6, ge=2, le=48, description="Rolling moving average window size (hours)"),
    forecast_steps: int = Query(12, ge=1, le=24, description="Forecast horizon steps ahead"),
):
    """
    Run the Pandas and NumPy data science pipeline on the EPA AQS benchmark dataset.
    Executes data imputation, statistical moments, percentile calculations, IQR outlier detection,
    and 12-hour double exponential smoothing forecast.
    """
    if not os.path.exists(DATASET_PATH):
        raise HTTPException(status_code=404, detail="Benchmark dataset not found.")

    try:
        df = pd.read_csv(DATASET_PATH)
        result = compute_statistics_and_analytics(
            df=df,
            target_metric=metric,
            dataset_name="US EPA Air Quality System (AQS) Benchmark",
            rolling_window=rolling_window,
            forecast_steps=forecast_steps,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics execution failed: {str(e)}")

@app.post("/api/analyze/upload", response_model=AnalyticsResponse, tags=["Analytics Engine"])
async def analyze_uploaded_csv(
    file: UploadFile = File(..., description="CSV file containing environmental or atmospheric time series"),
    metric: str = Form("pm25", description="Target pollutant or column to analyze"),
    rolling_window: int = Form(6, description="Rolling average window size"),
    forecast_steps: int = Form(12, description="Forecast steps ahead"),
):
    """
    Upload an external CSV dataset for full Pandas & NumPy preprocessing and analysis.
    The pipeline handles missing values, detects anomalous spikes, and computes trend regressions.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV formatted files are supported.")

    try:
        contents = await file.read()
        import io
        df = pd.read_csv(io.BytesIO(contents))
        
        result = compute_statistics_and_analytics(
            df=df,
            target_metric=metric,
            dataset_name=file.filename,
            rolling_window=int(rolling_window),
            forecast_steps=int(forecast_steps),
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse and analyze CSV: {str(e)}")

@app.post("/api/analyze/telemetry", response_model=AnalyticsResponse, tags=["Analytics Engine"])
def analyze_telemetry_batch(payload: TelemetryBatchRequest):
    """
    Analyze live telemetry records exported from the PulseCheck frontend.
    Converts incoming telemetry JSON into a Pandas DataFrame and applies the analytics suite.
    """
    if not payload.records:
        raise HTTPException(status_code=400, detail="Telemetry records list cannot be empty.")

    try:
        data_dicts = [r.dict() for r in payload.records]
        df = pd.DataFrame(data_dicts)

        result = compute_statistics_and_analytics(
            df=df,
            target_metric=payload.metric,
            dataset_name=f"{payload.station_name} ({payload.station_code})",
            rolling_window=payload.rolling_window,
            forecast_steps=payload.forecast_steps,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process telemetry payload: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
