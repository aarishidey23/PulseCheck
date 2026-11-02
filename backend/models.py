"""
Pydantic Schemas for PulseCheck Python Data Analytics API.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class DataCleaningReport(BaseModel):
    initial_rows: int
    cleaned_rows: int
    missing_values_imputed: int
    duplicate_rows_dropped: int
    imputation_strategy: str = "forward_backward_fill_and_median"
    columns_processed: List[str]

class DescriptiveStatistics(BaseModel):
    count: int
    mean: float
    std_dev: float
    variance: float
    min: float
    max: float
    range: float
    skewness: float
    kurtosis: float

class PercentileAnalysis(BaseModel):
    p10: float
    p25_q1: float
    p50_median: float
    p75_q3: float
    p90: float
    p95: float
    p99: float
    iqr: float
    lower_outlier_bound: float
    upper_outlier_bound: float

class OutlierPoint(BaseModel):
    index: int
    timestamp: str
    value: float
    z_score: float
    deviation_from_median: float
    detection_method: str = "iqr_and_zscore"

class RollingPoint(BaseModel):
    timestamp: str
    raw_value: float
    rolling_mean: float
    rolling_std: float
    rolling_min: float
    rolling_max: float

class TrendAnalysis(BaseModel):
    slope_per_hour: float
    intercept: float
    r_squared: float
    trend_direction: str  # "increasing", "decreasing", "stable"
    annualized_trend_pct: float
    interpretation: str

class ForecastPoint(BaseModel):
    step: int
    time_label: str
    forecast_value: float
    lower_confidence_95: float
    upper_confidence_95: float

class AnalyticsResponse(BaseModel):
    status: str = "success"
    engine: str = "Pandas & NumPy Statistical Engine"
    dataset_name: str
    analyzed_metric: str
    unit: str
    cleaning_report: DataCleaningReport
    descriptive_stats: DescriptiveStatistics
    percentile_analysis: PercentileAnalysis
    outliers_detected_count: int
    outliers_sample: List[OutlierPoint]
    rolling_series: List[RollingPoint]
    trend_analysis: TrendAnalysis
    forecast_12h: List[ForecastPoint]
    execution_time_ms: float

class HealthCheckResponse(BaseModel):
    status: str
    message: str
    python_version: str
    fastapi_version: str
    pandas_version: str
    numpy_version: str
    timestamp: str

class TelemetryRecordPayload(BaseModel):
    timestamp: Optional[int] = None
    isoTime: Optional[str] = None
    timeLabel: str
    pm25: float
    pm10: float
    pm1: Optional[float] = None
    co2: float
    o3: float
    no2: float
    vocIndex: Optional[float] = None
    temperature: float
    humidity: float
    pressure: float

class TelemetryBatchRequest(BaseModel):
    station_code: str
    station_name: str
    metric: str = "pm25"
    rolling_window: int = 6
    forecast_steps: int = 12
    records: List[TelemetryRecordPayload]
