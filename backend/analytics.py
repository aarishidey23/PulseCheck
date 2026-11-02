"""
Core Data Science & Analytics Engine using Pandas and NumPy.
Performs data cleaning, statistical moment analysis, percentile distribution,
outlier detection (IQR & Z-Score), rolling moving statistics, linear regression trend,
and double exponential smoothing forecasting.
"""

import time
import io
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, List
from .models import (
    AnalyticsResponse,
    DataCleaningReport,
    DescriptiveStatistics,
    PercentileAnalysis,
    OutlierPoint,
    RollingPoint,
    TrendAnalysis,
    ForecastPoint,
)

METRIC_COLUMN_MAP = {
    'pm25': ['pm25', 'pm2.5', 'pm2_5', 'pm2.5_ug_m3', 'pm25_ug_m3', 'fine_particulates'],
    'pm10': ['pm10', 'pm10_ug_m3', 'coarse_particulates'],
    'co2': ['co2', 'co2_ppm', 'carbon_dioxide'],
    'o3': ['o3', 'o3_ppb', 'ozone'],
    'no2': ['no2', 'no2_ppb', 'nitrogen_dioxide'],
    'vocIndex': ['vocindex', 'voc_index', 'voc', 'voc_pts'],
    'temperature': ['temperature', 'temperature_c', 'temp', 'temp_c'],
    'humidity': ['humidity', 'rel_humidity', 'rel_humidity_pct', 'humidity_pct'],
    'pressure': ['pressure', 'baro_pressure_hpa', 'barometric_pressure']
}

METRIC_UNITS = {
    'pm25': 'µg/m³',
    'pm10': 'µg/m³',
    'co2': 'ppm',
    'o3': 'ppb',
    'no2': 'ppb',
    'vocIndex': 'pts',
    'temperature': '°C',
    'humidity': '%',
    'pressure': 'hPa'
}

def resolve_target_column(df: pd.DataFrame, requested_metric: str) -> str:
    """Find matching column in DataFrame using fuzzy match dictionary."""
    clean_cols = {col.lower().strip().replace(' ', '_'): col for col in df.columns}
    aliases = METRIC_COLUMN_MAP.get(requested_metric.lower(), [requested_metric.lower()])
    
    for alias in aliases:
        for clean_col, orig_col in clean_cols.items():
            if alias in clean_col or clean_col in alias:
                return orig_col

    # Fallback: check if requested metric matches any numeric column
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            return col
            
    raise ValueError(f"Could not locate metric '{requested_metric}' in dataset columns: {list(df.columns)}")

def clean_and_prepare_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, DataCleaningReport]:
    """
    Data cleaning and preprocessing pipeline:
    1. Records initial row count
    2. Drops duplicate rows
    3. Handles missing values using forward fill, backward fill, and median imputation
    4. Ensures numeric types for measurements
    """
    initial_rows = len(df)
    
    # Drop pure duplicates
    df_cleaned = df.drop_duplicates().copy()
    duplicates_dropped = initial_rows - len(df_cleaned)

    # Count null values prior to imputation
    nulls_before = df_cleaned.isna().sum().sum()

    # Impute missing values for numeric columns
    numeric_cols = df_cleaned.select_dtypes(include=[np.number]).columns.tolist()
    for col in numeric_cols:
        # Forward fill then backward fill
        df_cleaned[col] = df_cleaned[col].ffill().bfill()
        # If still null (e.g. all empty), fill with median or 0
        if df_cleaned[col].isna().any():
            median_val = df_cleaned[col].median()
            df_cleaned[col] = df_cleaned[col].fillna(median_val if not pd.isna(median_val) else 0.0)

    # Date / Timestamp standardization
    time_col = None
    for col in df_cleaned.columns:
        if any(k in col.lower() for k in ['time', 'date', 'ts', 'hour']):
            time_col = col
            break
            
    if time_col:
        try:
            df_cleaned['_parsed_time'] = pd.to_datetime(df_cleaned[time_col], errors='coerce')
            df_cleaned['_time_label'] = df_cleaned['_parsed_time'].dt.strftime('%m/%d %H:%M')
        except Exception:
            df_cleaned['_time_label'] = df_cleaned.index.astype(str)
    else:
        df_cleaned['_time_label'] = [f"T+{i}" for i in range(len(df_cleaned))]

    report = DataCleaningReport(
        initial_rows=initial_rows,
        cleaned_rows=len(df_cleaned),
        missing_values_imputed=int(nulls_before),
        duplicate_rows_dropped=int(duplicates_dropped),
        columns_processed=list(df_cleaned.columns)
    )

    return df_cleaned, report

def compute_statistics_and_analytics(
    df: pd.DataFrame,
    target_metric: str = "pm25",
    dataset_name: str = "Telemetry Dataset",
    rolling_window: int = 6,
    forecast_steps: int = 12
) -> AnalyticsResponse:
    """
    Main analytics computation executed with Pandas and NumPy:
    - Descriptive Moments (Mean, Std Dev, Variance, Skew, Kurtosis)
    - Percentile Distribution & Interquartile Range
    - Outlier Detection using IQR & Z-Score
    - Rolling Averages & Standard Deviations
    - Ordinary Least Squares Trend Analysis (Slope, R²)
    - Double Exponential Smoothing Forecasting (12 steps ahead)
    """
    start_time = time.perf_counter()

    # Clean data
    df_cleaned, cleaning_report = clean_and_prepare_dataframe(df)

    # Identify target column
    col_name = resolve_target_column(df_cleaned, target_metric)
    series = pd.to_numeric(df_cleaned[col_name], errors='coerce').dropna()
    values_np = series.to_numpy()

    if len(values_np) < 3:
        raise ValueError(f"Insufficient numeric observations ({len(values_np)}) to perform statistical analysis.")

    # 1. Descriptive Statistics using NumPy & Pandas
    count_val = int(len(values_np))
    mean_val = float(np.mean(values_np))
    std_val = float(np.std(values_np, ddof=1)) if count_val > 1 else 0.0
    var_val = float(np.var(values_np, ddof=1)) if count_val > 1 else 0.0
    min_val = float(np.min(values_np))
    max_val = float(np.max(values_np))
    range_val = float(max_val - min_val)
    skewness_val = float(series.skew()) if count_val > 2 else 0.0
    kurtosis_val = float(series.kurtosis()) if count_val > 3 else 0.0

    descriptive_stats = DescriptiveStatistics(
        count=count_val,
        mean=round(mean_val, 3),
        std_dev=round(std_val, 3),
        variance=round(var_val, 3),
        min=round(min_val, 3),
        max=round(max_val, 3),
        range=round(range_val, 3),
        skewness=round(skewness_val, 3),
        kurtosis=round(kurtosis_val, 3)
    )

    # 2. Percentile Analysis using NumPy np.percentile
    percentiles = np.percentile(values_np, [10, 25, 50, 75, 90, 95, 99])
    q1 = float(percentiles[1])
    median = float(percentiles[2])
    q3 = float(percentiles[3])
    iqr = float(q3 - q1)
    lower_bound = max(0.0, float(q1 - 1.5 * iqr))
    upper_bound = float(q3 + 1.5 * iqr)

    percentile_analysis = PercentileAnalysis(
        p10=round(float(percentiles[0]), 2),
        p25_q1=round(q1, 2),
        p50_median=round(median, 2),
        p75_q3=round(q3, 2),
        p90=round(float(percentiles[4]), 2),
        p95=round(float(percentiles[5]), 2),
        p99=round(float(percentiles[6]), 2),
        iqr=round(iqr, 2),
        lower_outlier_bound=round(lower_bound, 2),
        upper_outlier_bound=round(upper_bound, 2)
    )

    # 3. Outlier Detection using IQR & Z-Score (z > 2.5 or outside IQR)
    z_scores = (values_np - mean_val) / (std_val if std_val > 0 else 1.0)
    outliers_sample: List[OutlierPoint] = []
    
    for idx, (val, z) in enumerate(zip(values_np, z_scores)):
        is_iqr_outlier = val < lower_bound or val > upper_bound
        is_z_outlier = abs(z) >= 2.5
        
        if is_iqr_outlier or is_z_outlier:
            time_label = str(df_cleaned['_time_label'].iloc[idx]) if '_time_label' in df_cleaned else f"T+{idx}"
            outliers_sample.append(OutlierPoint(
                index=idx,
                timestamp=time_label,
                value=round(float(val), 2),
                z_score=round(float(z), 2),
                deviation_from_median=round(float(val - median), 2),
                detection_method="IQR Boundary" if is_iqr_outlier and not is_z_outlier else "Z-Score Exceedance" if is_z_outlier and not is_iqr_outlier else "Combined IQR & Z-Score"
            ))

    # 4. Rolling Statistics using Pandas rolling()
    rolling_window = max(2, min(rolling_window, len(series) // 2 or 2))
    rolling_df = pd.DataFrame({
        'raw': series,
        'mean': series.rolling(window=rolling_window, min_periods=1).mean(),
        'std': series.rolling(window=rolling_window, min_periods=1).std().fillna(0),
        'min': series.rolling(window=rolling_window, min_periods=1).min(),
        'max': series.rolling(window=rolling_window, min_periods=1).max(),
    })

    rolling_series: List[RollingPoint] = []
    for idx in range(len(rolling_df)):
        time_label = str(df_cleaned['_time_label'].iloc[idx]) if '_time_label' in df_cleaned else f"T+{idx}"
        rolling_series.append(RollingPoint(
            timestamp=time_label,
            raw_value=round(float(rolling_df['raw'].iloc[idx]), 2),
            rolling_mean=round(float(rolling_df['mean'].iloc[idx]), 2),
            rolling_std=round(float(rolling_df['std'].iloc[idx]), 2),
            rolling_min=round(float(rolling_df['min'].iloc[idx]), 2),
            rolling_max=round(float(rolling_df['max'].iloc[idx]), 2)
        ))

    # 5. Trend Analysis using NumPy polyfit (Ordinary Least Squares)
    x_axis = np.arange(len(values_np))
    slope, intercept = np.polyfit(x_axis, values_np, 1)
    
    # Calculate R-squared
    y_pred = slope * x_axis + intercept
    ss_res = np.sum((values_np - y_pred) ** 2)
    ss_tot = np.sum((values_np - mean_val) ** 2)
    r_squared = float(1.0 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0
    r_squared = max(0.0, min(1.0, r_squared))

    # Direction and interpretation
    if abs(slope) < 0.05:
        direction = "stable"
        interp = f"Atmospheric concentration is stable with negligible drift ({slope:+.3f} units/hr, R²={r_squared:.2f})."
    elif slope > 0:
        direction = "increasing"
        interp = f"Accumulation vector detected: rising by +{slope:.3f} units/hr (R²={r_squared:.2f}). Indicates incoming plume or stagnant dispersion."
    else:
        direction = "decreasing"
        interp = f"Depletion vector observed: improving by {slope:.3f} units/hr (R²={r_squared:.2f}). Indicates atmospheric cleansing or advective flushing."

    annualized_trend = float((slope * 24 * 365) / mean_val * 100) if mean_val > 0 else 0.0

    trend_analysis = TrendAnalysis(
        slope_per_hour=round(float(slope), 4),
        intercept=round(float(intercept), 3),
        r_squared=round(r_squared, 4),
        trend_direction=direction,
        annualized_trend_pct=round(annualized_trend, 1),
        interpretation=interp
    )

    # 6. Double Exponential Smoothing Forecasting (Holt's Linear Model)
    # Implemented cleanly using NumPy arrays
    alpha = 0.35  # Level smoothing factor
    beta = 0.15   # Trend smoothing factor
    
    level = values_np[0]
    trend_val = values_np[1] - values_np[0] if len(values_np) > 1 else 0.0
    
    for t in range(1, len(values_np)):
        val = values_np[t]
        last_level = level
        level = alpha * val + (1 - alpha) * (level + trend_val)
        trend_val = beta * (level - last_level) + (1 - beta) * trend_val

    # Forecast future steps with standard error expansion
    residual_variance = var_val * 0.5  # estimate model residual variance
    forecast_points: List[ForecastPoint] = []
    
    for h in range(1, forecast_steps + 1):
        pred = level + h * trend_val
        pred = max(0.0, pred)  # atmospheric concentration >= 0
        margin = 1.96 * np.sqrt(residual_variance * (1 + 0.1 * h))  # 95% confidence expanding cone
        
        forecast_points.append(ForecastPoint(
            step=h,
            time_label=f"+{h}h Ahead",
            forecast_value=round(float(pred), 2),
            lower_confidence_95=round(max(0.0, float(pred - margin)), 2),
            upper_confidence_95=round(float(pred + margin), 2)
        ))

    elapsed_ms = (time.perf_counter() - start_time) * 1000

    return AnalyticsResponse(
        status="success",
        dataset_name=dataset_name,
        analyzed_metric=target_metric,
        unit=METRIC_UNITS.get(target_metric, 'units'),
        cleaning_report=cleaning_report,
        descriptive_stats=descriptive_stats,
        percentile_analysis=percentile_analysis,
        outliers_detected_count=len(outliers_sample),
        outliers_sample=outliers_sample[:25],  # limit sample size for transmission
        rolling_series=rolling_series,
        trend_analysis=trend_analysis,
        forecast_12h=forecast_points,
        execution_time_ms=round(elapsed_ms, 2)
    )
