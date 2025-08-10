import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Card, Form, Row, Col, Alert } from "react-bootstrap";
import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-dist-min";

const Plot = createPlotlyComponent(Plotly);

export default function ChartAutoPlotly({ data }) {
  const [error, setError] = useState(null);
  const [fraction, setFraction] = useState(100);
  const [maxPoints, setMaxPoints] = useState(4000);
  const [topKCategories, setTopKCategories] = useState(15);
  const [timeAggregation, setTimeAggregation] = useState("auto");

  const dataInfo = useMemo(() => {
    try {
      if (!Array.isArray(data) || data.length === 0) return null;
      return analyzeDataStructure(data); 
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [data]);

  const uiFlags = useMemo(() => {
    if (!dataInfo) return { showFraction: false, showMaxPoints: false, showTopK: false, showAgg: false };
    const hasTemporal = dataInfo.temporalFields.length > 0;
    const firstCat = dataInfo.categoricalFields[0];
    const catUnique = firstCat ? (dataInfo.fieldStats[firstCat]?.unique || 0) : 0;
    const wouldDownsample = Math.ceil((fraction / 100 * (data?.length || 0)) / maxPoints) > 1;
    return {
      showFraction: (data?.length || 0) > maxPoints,
      showMaxPoints: (data?.length || 0) > maxPoints || wouldDownsample,
      showTopK: catUnique > topKCategories,
      showAgg: hasTemporal
    };
  }, [data, dataInfo, fraction, maxPoints, topKCategories]);

  // Generate comprehensive chart set
  const figures = useMemo(() => {
    if (!dataInfo) return [];
    try {
      const options = { fraction, maxPoints, topKCategories, timeAggregation };
      const chartTypes = getAllAvailableCharts(dataInfo);
      
      return chartTypes.map((chartType) => ({
        title: getChartTypeName(chartType),
        type: chartType,
        size: getChartSize(),
        ...generatePlotlyFigure(data, chartType, dataInfo, options)
      }));
    } catch (e) {
      setError(e.message);
      return [];
    }
  }, [data, dataInfo, fraction, maxPoints, topKCategories, timeAggregation]);

  if (error) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">📈 Charts</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">
            <Alert.Heading>Chart Error</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">📈 Charts</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <Alert.Heading>No Chart Data Available</Alert.Heading>
            <p>No data available for visualization.</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">📈 Data Visualization</h5>
      </Card.Header>
      <Card.Body>
        {/* Chart Controls */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-light">
            <div className="d-flex align-items-center">
              <i className="fas fa-cog me-2 text-primary"></i>
              <h6 className="mb-0 fw-semibold">Chart Controls</h6>
            </div>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              {uiFlags.showAgg && (
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-muted">Time Aggregation</Form.Label>
                    <Form.Select
                      value={timeAggregation}
                      onChange={(e) => setTimeAggregation(e.target.value)}
                      size="sm"
                      className="border-2"
                    >
                      <option value="auto">Auto</option>
                      <option value="none">None</option>
                      <option value="day">Daily</option>
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
              
              {uiFlags.showFraction && (
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-muted">Data Sample ({fraction}%)</Form.Label>
                    <Form.Range
                      min={10}
                      max={100}
                      step={5}
                      value={fraction}
                      onChange={(e) => setFraction(Number(e.target.value))}
                      className="custom-range"
                    />
                  </Form.Group>
                </Col>
              )}
              
              {uiFlags.showMaxPoints && (
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-muted">Max Points</Form.Label>
                    <Form.Control
                      type="number"
                      min={200}
                      max={20000}
                      step={200}
                      value={maxPoints}
                      onChange={(e) => setMaxPoints(Number(e.target.value))}
                      size="sm"
                      className="border-2"
                    />
                  </Form.Group>
                </Col>
              )}
              
              {uiFlags.showTopK && (
                <Col md={6} lg={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-muted">Top Categories</Form.Label>
                    <Form.Control
                      type="number"
                      min={5}
                      max={50}
                      step={1}
                      value={topKCategories}
                      onChange={(e) => setTopKCategories(Number(e.target.value))}
                      size="sm"
                      className="border-2"
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>

        {/* Charts Display - Vertical Stack Layout */}
        <div className="charts-container">
          {figures.map((fig, i) => (
            <div key={i} className="chart-wrapper">
              <Card className="chart-card border-0 shadow-sm">
                <Card.Header className="chart-header bg-light border-0">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className={`chart-icon me-3 ${getChartIconColor(fig.type)}`}>
                        <span className="chart-emoji">{getChartIcon(fig.type)}</span>
                      </div>
                      <div>
                        <h5 className="mb-1 fw-bold text-dark chart-title">{fig.title}</h5>
                        <small className="text-muted chart-description">{getChartDescription(fig.type)}</small>
                      </div>
                    </div>
                    <div className="chart-badge">
                      <span className={`badge ${getChartBadgeColor(fig.type)} px-3 py-2`}>
                        {fig.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="chart-body p-0">
                  <div className={`plotly-container ${shouldUseScrollableContainer(fig.type, fig.data) ? 'chart-scrollable' : ''}`}>
                    <Plot
                      data={fig.data}
                      layout={{ 
                        ...fig.layout, 
                        height: getDynamicChartHeight(fig.type, fig.data),
                        margin: getOptimizedMargins(fig.type, fig.data),
                        autosize: true,
                        font: { 
                          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', 
                          size: 12,
                          color: '#374151'
                        },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(248, 249, 250, 0.8)',
                        showlegend: shouldShowLegend(fig.type),
                        legend: getOptimizedLegend(fig.type),
                        hovermode: 'closest',
                        dragmode: 'pan',
                        // Prevent text overlapping
                        xaxis: {
                          ...fig.layout?.xaxis,
                          automargin: true,
                          tickmode: 'auto',
                          tickangle: getOptimalTickAngle(fig.type),
                          tickfont: { size: 11 }
                        },
                        yaxis: {
                          ...fig.layout?.yaxis,
                          automargin: true,
                          tickfont: { size: 11 },
                          tickformat: '~s'
                        }
                      }}
                      config={{
                        responsive: true,
                        displaylogo: false,
                        modeBarButtonsToRemove: getOptimizedModeBarButtons(fig.type),
                        doubleClick: 'reset',
                        showTips: false,
                        editable: false,
                        autosizable: true,
                        fillFrame: false,
                        frameMargins: 0,
                        scrollZoom: window.innerWidth > 768, // Mobile optimizations
                        ...fig.config,
                        displayModeBar: true,
                        toImageButtonOptions: {
                          format: 'png',
                          filename: `${fig.title.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
                          height: getDynamicChartHeight(fig.type, fig.data),
                          width: Math.min(1200, window.innerWidth || 1200),
                          scale: window.devicePixelRatio || 2
                        }
                      }}
                      useResizeHandler
                      className="w-100"
                      style={{ 
                        width: '100%', 
                        height: `${getDynamicChartHeight(fig.type, fig.data)}px`,
                        minHeight: '400px'
                      }}
                    />
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}

/**
 * Analyze the first record of `data` to infer field types and basic statistics.
 * Returns a summary with numeric, categorical, temporal fields and stats.
 */
function analyzeDataStructure(data) {
  const sample = data[0] || {};
  const keys = Object.keys(sample);
  const analysis = {
    recordCount: data.length,
    totalFields: keys.length,
    numericFields: [],
    categoricalFields: [],
    temporalFields: [],
    fieldStats: {}
  };

  for (const key of keys) {
    const values = data.map((d) => d[key]).filter((v) => v != null);
    const first = values[0];
    if (typeof first === "number") {
      analysis.numericFields.push(key);
      analysis.fieldStats[key] = {
        type: "numeric",
        min: Math.min(...values),
        max: Math.max(...values),
        unique: new Set(values).size,
      };
      continue;
    }
    if (typeof first === "string") {
      if (isDateField(key, values)) {
        analysis.temporalFields.push(key);
        analysis.fieldStats[key] = { type: "temporal" };
      } else {
        analysis.categoricalFields.push(key);
        const uniqueVals = new Set(values);
        analysis.fieldStats[key] = {
          type: "categorical",
          unique: uniqueVals.size,
          categories: Array.from(uniqueVals).slice(0, 20),
        };
      }
      continue;
    }
    // Fallback
    analysis.categoricalFields.push(key);
    analysis.fieldStats[key] = { type: "other" };
  }

  return analysis;
}

/**
 * Heuristically decide if a field is likely a date by name or parsable string values.
 */
function isDateField(fieldName, values) {
  const keywords = ["date", "time", "month", "year", "day", "created", "updated", "timestamp"];
  if (keywords.some((k) => fieldName.toLowerCase().includes(k))) return true;
  const tests = values.slice(0, 6);
  const ok = tests.filter((v) => {
    const t = Date.parse(v);
    return !Number.isNaN(t) && t > new Date("1900-01-01").getTime();
  }).length;
  return ok >= Math.ceil(tests.length * 0.7);
}

/**
 * Get all available chart types based on data structure
 */
function getAllAvailableCharts(analysis) {
  const charts = [];
  const { numericFields, categoricalFields, temporalFields } = analysis;
  
  // Time series charts (if temporal data exists)
  if (temporalFields.length > 0 && numericFields.length > 0) {
    charts.push("line", "area");
  }
  
  // Categorical charts (if categorical + numeric data exists)
  if (categoricalFields.length > 0 && numericFields.length > 0) {
    charts.push("bar", "hbar", "pie", "donut");
  }
  
  // Distribution charts (if numeric data exists)
  if (numericFields.length > 0) {
    charts.push("hist", "box", "violin");
  }
  
  // Correlation charts (if multiple numeric fields)
  if (numericFields.length >= 2) {
    charts.push("scatter", "bubble");
  }
  
  // Multi-dimensional charts
  if (categoricalFields.length >= 2) {
    charts.push("heatmap", "treemap");
  }
  
  // Comparison charts
  if (categoricalFields.length > 0 && numericFields.length > 0) {
    charts.push("funnel", "waterfall");
  }
  
  // Geographic charts (if location data detected)
  if (hasGeographicData(analysis)) {
    charts.push("choropleth", "scattergeo");
  }
  
  // Ensure we have at least some basic charts
  if (charts.length === 0) {
    if (numericFields.length > 0) charts.push("hist");
    if (categoricalFields.length > 0) charts.push("bar");
  }
  
  return charts.slice(0, 8); // Limit to 8 charts for better performance
}

/**
 * Check if data contains geographic information
 */
function hasGeographicData(analysis) {
  const geoFields = ['country', 'state', 'city', 'region', 'location', 'lat', 'lng', 'latitude', 'longitude'];
  return analysis.categoricalFields.some(field => 
    geoFields.some(geoField => field.toLowerCase().includes(geoField))
  ) || analysis.numericFields.some(field => 
    ['lat', 'lng', 'latitude', 'longitude'].some(coord => field.toLowerCase().includes(coord))
  );
}

/**
 * Get chart size based on chart type (all charts now full width)
 */
function getChartSize() {
  // All charts are now full width in vertical stack layout
  return 'full';
}

/**
 * Get dynamic chart height based on chart type and data
 */
function getDynamicChartHeight(chartType, data) {
  const baseHeight = 450;
  const dataLength = Array.isArray(data) ? data.length : (data && data[0] ? data[0].x ? data[0].x.length : 10 : 10);
  
  switch (chartType) {
    case 'line':
    case 'area':
      return Math.max(400, Math.min(600, baseHeight + dataLength * 2));
    
    case 'bar':
      return Math.max(400, Math.min(800, 350 + Math.min(dataLength, 20) * 30)); // Limit categories to prevent overlap
      
    case 'hbar':
      return Math.max(450, Math.min(900, 400 + Math.min(dataLength, 15) * 35)); // More height for horizontal bars
    
    case 'pie':
    case 'donut':
      return 550; // Increased height for better proportional view and legend spacing
    
    case 'scatter':
    case 'bubble':
      return 520;
    
    case 'heatmap':
      return Math.max(450, Math.min(800, 350 + Math.min(dataLength, 25) * 18));
    
    case 'box':
    case 'violin':
      return Math.max(480, Math.min(700, 400 + Math.min(dataLength, 6) * 30)); // Increased height for better distribution view
    
    case 'hist':
      return 420;
    
    case 'treemap':
      return 520;
    
    case 'funnel':
      return Math.max(400, Math.min(700, 350 + Math.min(dataLength, 12) * 35));
    
    case 'waterfall':
      return Math.max(450, Math.min(750, 400 + Math.min(dataLength, 10) * 30));
    
    case 'choropleth':
    case 'scattergeo':
      return 580;
    
    default:
      return baseHeight;
  }
}

/**
 * Get optimized margins based on chart type to prevent overlapping
 */
function getOptimizedMargins(chartType, data) {
  const dataLength = Array.isArray(data) ? data.length : (data && data[0] ? data[0].x ? data[0].x.length : 10 : 10);
  
  switch (chartType) {
    case 'bar':
      return { l: 80, r: 40, t: 60, b: Math.max(100, 80 + Math.min(dataLength, 15) * 3) }; // Dynamic bottom margin for labels
      
    case 'hbar':
      return { l: Math.max(120, 100 + Math.min(dataLength, 10) * 8), r: 40, t: 60, b: 80 }; // Dynamic left margin for labels
      
    case 'pie':
    case 'donut':
      return { l: 40, r: 150, t: 80, b: 60 }; // Extra right margin for side legend, less bottom space
      
    case 'scatter':
    case 'bubble':
      return { l: 80, r: 60, t: 60, b: 100 };
      
    case 'heatmap':
      return { l: 120, r: 80, t: 60, b: 120 }; // More space for axis labels
      
    case 'box':
    case 'violin':
      return { l: 90, r: 50, t: 80, b: 120 }; // Enhanced margins for distribution shape clarity
      
    case 'funnel':
      return { l: 100, r: 60, t: 60, b: 80 };
      
    case 'waterfall':
      return { l: 80, r: 40, t: 60, b: 120 };
      
    case 'treemap':
      return { l: 20, r: 20, t: 60, b: 40 }; // Minimal margins for treemaps
      
    case 'choropleth':
    case 'scattergeo':
      return { l: 20, r: 80, t: 60, b: 40 }; // Space for colorbar
      
    default:
      return { l: 80, r: 60, t: 60, b: 100 };
  }
}

/**
 * Get optimized legend configuration
 */
function getOptimizedLegend(chartType) {
  switch (chartType) {
    case 'pie':
    case 'donut':
      return {
        orientation: 'v',
        yanchor: 'top',
        y: 1,
        xanchor: 'left',
        x: 1.02,
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: 'rgba(0,0,0,0.1)',
        borderwidth: 1
      };
      
    case 'treemap':
      return { showlegend: false }; // Hide legend for treemaps to save space
      
    case 'heatmap':
      return { showlegend: false }; // Heatmaps use colorbar instead
      
    case 'scatter':
    case 'bubble':
    case 'line':
    case 'area':
      return {
        orientation: 'h',
        yanchor: 'bottom',
        y: -0.15,
        xanchor: 'center',
        x: 0.5,
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: 'rgba(0,0,0,0.1)',
        borderwidth: 1
      };
      
    default:
      return {
        orientation: 'h',
        yanchor: 'bottom',
        y: -0.2,
        xanchor: 'center',
        x: 0.5
      };
  }
}

/**
 * Get optimal tick angle to prevent label overlap
 */
function getOptimalTickAngle(chartType) {
  switch (chartType) {
    case 'bar':
      return -45; // Angled labels for bar charts
    case 'hbar':
      return 0; // Horizontal labels for horizontal bars
    case 'heatmap':
      return -30; // Slight angle for heatmaps
    default:
      return 0;
  }
}

/**
 * Get optimized mode bar buttons based on chart type
 */
function getOptimizedModeBarButtons(chartType) {
  const baseRemoved = ['lasso2d', 'select2d', 'autoScale2d', 'resetScale2d'];
  
  switch (chartType) {
    case 'pie':
    case 'donut':
    case 'treemap':
      return [...baseRemoved, 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d']; // Remove zoom controls for non-zoomable charts
    case 'choropleth':
    case 'scattergeo':
      return [...baseRemoved, 'lasso2d', 'select2d']; // Keep geo-specific controls
    case 'heatmap':
      return [...baseRemoved]; // Keep standard controls for heatmaps
    default:
      return baseRemoved;
  }
}

/**
 * Determine if chart should show legend
 */
function shouldShowLegend(chartType) {
  return ['line', 'area', 'scatter', 'bubble', 'box', 'violin'].includes(chartType);
}

/**
 * Determine if chart should use scrollable container for large datasets
 */
function shouldUseScrollableContainer(chartType, data) {
  const dataLength = Array.isArray(data) ? data.length : (data && data[0] ? data[0].x ? data[0].x.length : 0 : 0);
  
  // Use scrollable container for charts with many data points or categories
  switch (chartType) {
    case 'bar':
    case 'hbar':
      return dataLength > 15;
    case 'heatmap':
      return dataLength > 20;
    case 'box':
    case 'violin':
      return dataLength > 10;
    case 'line':
    case 'area':
      return dataLength > 100;
    case 'scatter':
    case 'bubble':
      return dataLength > 200;
    default:
      return false;
  }
}

/**
 * Get chart icon
 */
function getChartIcon(chartType) {
  const icons = {
    line: '📈', area: '📊', bar: '📊', hbar: '📋', 
    pie: '🥧', donut: '🍩', hist: '📈', box: '📦',
    violin: '🎻', scatter: '🔸', bubble: '💭', 
    heatmap: '🔥', treemap: '🌳', funnel: '🔻',
    waterfall: '🌊', choropleth: '🗺️', scattergeo: '🌍'
  };
  return icons[chartType] || '📊';
}

/**
 * Get chart icon color
 */
function getChartIconColor(chartType) {
  const colors = {
    line: 'text-success', area: 'text-info', bar: 'text-primary', 
    hbar: 'text-secondary', pie: 'text-warning', donut: 'text-danger',
    hist: 'text-success', box: 'text-primary', violin: 'text-info',
    scatter: 'text-warning', bubble: 'text-success', heatmap: 'text-danger',
    treemap: 'text-success', funnel: 'text-warning', waterfall: 'text-info',
    choropleth: 'text-primary', scattergeo: 'text-success'
  };
  return colors[chartType] || 'text-primary';
}

/**
 * Get chart badge color
 */
function getChartBadgeColor(chartType) {
  const colors = {
    line: 'bg-success', area: 'bg-info', bar: 'bg-primary',
    hbar: 'bg-secondary', pie: 'bg-warning', donut: 'bg-danger',
    hist: 'bg-success', box: 'bg-primary', violin: 'bg-info',
    scatter: 'bg-warning', bubble: 'bg-success', heatmap: 'bg-danger',
    treemap: 'bg-success', funnel: 'bg-warning', waterfall: 'bg-info',
    choropleth: 'bg-primary', scattergeo: 'bg-success'
  };
  return colors[chartType] || 'bg-primary';
}

/**
 * Get chart description
 */
function getChartDescription(chartType) {
  const descriptions = {
    line: 'Trends over time', area: 'Filled time trends', 
    bar: 'Category comparison', hbar: 'Horizontal comparison',
    pie: 'Proportion View (Part-to-whole)', donut: 'Hollow Proportion Chart',
    hist: 'Data distribution', box: 'Statistical summary',
    violin: 'Distribution Shape (Clear View)', scatter: 'Correlation plot',
    bubble: 'Multi-variable scatter', heatmap: 'Correlation matrix',
    treemap: 'Hierarchical data', funnel: 'Process flow',
    waterfall: 'Cumulative changes', choropleth: 'Geographic regions',
    scattergeo: 'Geographic points'
  };
  return descriptions[chartType] || 'Data visualization';
}

/**
 * Friendly display name for a chart type.
 */
function getChartTypeName(chartType) {
  const map = {
    line: "📈 Trend Analysis",
    area: "📊 Area Trend",
    scatter: "🔸 Scatter Analysis",
    bar: "📊 Category Comparison",
    hbar: "📋 Horizontal Comparison",
    hist: "📈 Distribution",
    heatmap: "🔥 Correlation Heatmap",
    box: "📦 Statistical Summary",
    pie: "🥧 Proportion View",
    auto: "🤖 Smart Chart",
  };
  return map[chartType] || "📊 Visualization";
}

/**
 * Choose the best chart given inferred dataset properties.
 * `priority` indicates 1st, 2nd, or 3rd best; `excludeTypes` are already chosen.
 * Currently unused but kept for potential future use.
 */
// eslint-disable-next-line no-unused-vars
function determineBestChart(info, priority, ...excludeTypes) {
  const { numericFields, categoricalFields, temporalFields, recordCount } = info;
  const candidates = [];
  if (temporalFields.length > 0 && numericFields.length > 0) {
    candidates.push({ type: "line", score: 10 });
    candidates.push({ type: "area", score: 9 });
  }
  if (numericFields.length >= 2) {
    candidates.push({ type: "scatter", score: 9 });
  }
  if (categoricalFields.length > 0 && numericFields.length > 0) {
    candidates.push({ type: "bar", score: 8 });
    candidates.push({ type: "hbar", score: 7 });
  }
  if (numericFields.length > 0 && recordCount > 20) {
    candidates.push({ type: "hist", score: 6 });
  }
  if (categoricalFields.length >= 2) {
    candidates.push({ type: "heatmap", score: 5 });
  }
  if (categoricalFields.length > 0 && numericFields.length > 0) {
    candidates.push({ type: "box", score: 5 });
    candidates.push({ type: "pie", score: 4 });
  }
  const filtered = candidates.filter((c) => !excludeTypes.includes(c.type));
  filtered.sort((a, b) => b.score - a.score);
  return filtered[0]?.type || "bar";
}

/**
 * Produce Plotly figure (data, layout, config) for a chart type.
 * Uses light sampling and optional time bucketing for performance.
 */
function generatePlotlyFigure(data, chartType, info, options = {}) {
  const { numericFields, categoricalFields, temporalFields } = info;

  const { fraction = 100, maxPoints = 4000, topKCategories = 15, timeAggregation = "auto" } = options;

  // Fractional sampling first
  const sliceCount = Math.max(1, Math.floor((fraction / 100) * data.length));
  const fractioned = data.slice(0, sliceCount);

  // Then cap points uniformly
  const step = Math.max(1, Math.ceil(fractioned.length / maxPoints));
  const sampled = fractioned.filter((_, i) => i % step === 0);

  const baseLayout = {
    margin: { l: 64, r: 24, t: 48, b: 64 },
    paper_bgcolor: "white",
    plot_bgcolor: "white",
    hovermode: "closest",
    xaxis: { 
      gridcolor: "#f0f0f0",
      automargin: true,
      tickfont: { size: 11, color: '#374151' }
    },
    yaxis: { 
      gridcolor: "#f0f0f0",
      automargin: true,
      tickfont: { size: 11, color: '#374151' }
    },
    autosize: true,
    showlegend: true,
    font: {
      family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      size: 12,
      color: '#374151'
    }
  };

  const baseConfig = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["lasso2d", "select2d", "autoScale2d", "resetScale2d"],
    scrollZoom: false, // Disabled to prevent accidental zooming on mobile
    doubleClick: 'reset', // Double click to reset zoom
    showTips: false, // Reduce visual clutter
    staticPlot: false, // Keep interactive
    editable: false,
    autosizable: true,
    fillFrame: false,
    frameMargins: 0
  };

  const cat0 = categoricalFields[0];
  const cat1 = categoricalFields[1];
  const num0 = numericFields[0];
  const num1 = numericFields[1];
  const time0 = temporalFields[0];

  switch (chartType) {
    case "line":
    case "area": {
      const xField = time0 || num0;
      const yField = num0 || num1;
      const seriesData = maybeAggregateTime(sampled, xField, yField, temporalFields, timeAggregation);
      const grouped = groupBy(seriesData.rows, cat0);
      const traces = [];
      if (cat0 && Object.keys(grouped).length > 1) {
        for (const [key, rows] of Object.entries(grouped)) {
          traces.push({
            type: "scatter",
            mode: "lines",
            name: String(key),
            x: rows.map((r) => r[xField]),
            y: rows.map((r) => r[yField]),
            line: { width: 2 },
            fill: chartType === "area" ? "tozeroy" : "none",
          });
        }
      } else {
        traces.push({
          type: "scatter",
          mode: "lines",
          name: yField,
          x: seriesData.rows.map((r) => r[xField]),
          y: seriesData.rows.map((r) => r[yField]),
          line: { width: 3, color: "#2563eb" },
          fill: chartType === "area" ? "tozeroy" : "none",
        });
      }
      const layout = {
        ...baseLayout,
        title: { text: `Trend of ${prettify(yField)} over ${prettify(xField)}` + (seriesData.bucket ? ` (aggregated by ${seriesData.bucket})` : ""), x: 0, xanchor: "left" },
        xaxis: {
          ...baseLayout.xaxis,
          title: prettify(xField),
          type: temporalFields.includes(xField) ? "date" : undefined,
        },
        yaxis: { ...baseLayout.yaxis, title: prettify(yField), tickformat: "~s" },
        legend: cat0 ? { title: { text: prettify(cat0) } } : undefined,
      };
      return { data: traces, layout, config: baseConfig };
    }

    case "scatter": {
      const colorBy = cat0;
      const traces = colorBy
        ? Object.entries(groupBy(sampled, colorBy)).map(([k, rows]) => ({
            type: "scatter",
            mode: "markers",
            name: String(k),
            x: rows.map((r) => r[num0]),
            y: rows.map((r) => r[num1]),
            marker: { size: 8, opacity: 0.85 },
          }))
        : [{
            type: "scatter",
            mode: "markers",
            name: `${prettify(num0)} vs ${prettify(num1)}`,
            x: sampled.map((r) => r[num0]),
            y: sampled.map((r) => r[num1]),
            marker: { size: 8, color: "#2563eb", opacity: 0.85 },
          }];
      const layout = {
        ...baseLayout,
        title: { text: `${prettify(num0)} vs ${prettify(num1)}` + (colorBy ? ` by ${prettify(colorBy)}` : ""), x: 0, xanchor: "left" },
        xaxis: { ...baseLayout.xaxis, title: prettify(num0) },
        yaxis: { ...baseLayout.yaxis, title: prettify(num1), tickformat: "~s" },
        legend: colorBy ? { title: { text: prettify(colorBy) } } : { },
      };
      return { data: traces, layout, config: baseConfig };
    }

    case "bar":
    case "hbar": {
      const isH = chartType === "hbar";
      const cat = cat0 || (time0 ? time0 : String(Object.keys(sampled[0])[0]));
      const val = num0;
      const limitedCats = limitCategories(sampled, cat, isH ? 12 : 15); // Limit categories to prevent overlap
      const filtered = sampled.filter((r) => limitedCats.includes(r[cat] ?? "(null)"));
      const agg = aggregateBy(filtered, cat, val).sort((a, b) => isH ? a.value - b.value : b.value - a.value); // Sort for better readability
      const labels = agg.map((d) => truncateLabel(d.key, isH ? 25 : 15)); // Truncate long labels
      const values = agg.map((d) => d.value);
      const trace = {
        type: "bar",
        x: isH ? values : labels,
        y: isH ? labels : values,
        orientation: isH ? "h" : "v",
        marker: { color: "#2563eb", opacity: 0.85 },
        text: values.map(v => formatNumber(v)),
        textposition: isH ? 'outside' : 'auto',
        textfont: { size: 10, color: '#374151' },
        hovertemplate: isH ? 
          '<b>%{y}</b><br>Value: %{x:,.0f}<extra></extra>' :
          '<b>%{x}</b><br>Value: %{y:,.0f}<extra></extra>'
      };
      const layout = {
        ...baseLayout,
        title: { text: `Sum of ${prettify(val)} by ${prettify(cat)}`, x: 0, xanchor: "left" },
        xaxis: { 
          ...baseLayout.xaxis, 
          title: isH ? prettify(val) : prettify(cat),
          automargin: true,
          tickangle: isH ? 0 : -45,
          tickfont: { size: 10 }
        },
        yaxis: { 
          ...baseLayout.yaxis, 
          title: isH ? prettify(cat) : prettify(val), 
          tickformat: "~s",
          automargin: true,
          tickfont: { size: 10 }
        },
        bargap: isH ? 0.3 : 0.2, // Add spacing between bars
      };
      return { data: [trace], layout, config: baseConfig };
    }

    case "hist": {
      const trace = {
        type: "histogram",
        x: sampled.map((r) => r[num0]),
        marker: { color: "#2563eb", opacity: 0.85 },
        nbinsx: Math.min(30, Math.ceil(Math.sqrt(sampled.length))),
      };
      const layout = { ...baseLayout, title: { text: `Distribution of ${prettify(num0)}`, x: 0, xanchor: "left" }, xaxis: { ...baseLayout.xaxis, title: prettify(num0) }, yaxis: { ...baseLayout.yaxis, title: "Frequency" } };
      return { data: [trace], layout, config: baseConfig };
    }

    case "box": {
      if (cat0) {
        const grouped = groupBy(sampled, cat0);
        const limitedGroups = Object.entries(grouped).slice(0, 8); // Limit groups to prevent overlap
        const traces = limitedGroups.map(([k, rows]) => ({
          type: "box",
          name: truncateLabel(String(k), 15),
          y: rows.map((r) => r[num0]),
          boxmean: 'sd', // Show mean and standard deviation
          marker: { opacity: 0.7, size: 4 },
          line: { width: 2 },
          boxpoints: rows.length < 50 ? 'outliers' : false, // Show outliers only for smaller datasets
          jitter: 0.3,
          pointpos: -1.8,
          hovertemplate: '<b>%{x}</b><br>Value: %{y:,.2f}<extra></extra>'
        }));
        const layout = { 
          ...baseLayout, 
          title: { text: `Distribution of ${prettify(num0)} by ${prettify(cat0)}`, x: 0, xanchor: "left" }, 
          xaxis: { 
            ...baseLayout.xaxis, 
            title: prettify(cat0),
            automargin: true,
            tickfont: { size: 10 }
          }, 
          yaxis: { 
            ...baseLayout.yaxis, 
            title: prettify(num0),
            tickformat: '~s',
            automargin: true,
            tickfont: { size: 10 }
          },
          boxgap: 0.3 // Add space between boxes
        };
        return { data: traces, layout, config: baseConfig };
      }
      const trace = { 
        type: "box", 
        name: prettify(num0), 
        y: sampled.map((r) => r[num0]), 
        boxmean: 'sd',
        marker: { opacity: 0.7 },
        boxpoints: sampled.length < 100 ? 'outliers' : false,
        hovertemplate: 'Value: %{y:,.2f}<extra></extra>'
      };
      const layout = { 
        ...baseLayout, 
        title: { text: `Distribution of ${prettify(num0)}`, x: 0, xanchor: "left" }, 
        yaxis: { 
          ...baseLayout.yaxis, 
          title: prettify(num0),
          tickformat: '~s',
          automargin: true
        } 
      };
      return { data: [trace], layout, config: baseConfig };
    }

    case "heatmap": {
      const xCats = getTopCategories(sampled, cat0, 15).map(c => truncateLabel(c, 12)); // Limit and truncate labels
      const yCats = getTopCategories(sampled, cat1, 12).map(c => truncateLabel(c, 15));
      const z = yCats.map(() => Array(xCats.length).fill(0));
      const originalXCats = getTopCategories(sampled, cat0, 15);
      const originalYCats = getTopCategories(sampled, cat1, 12);
      for (const row of sampled) {
        const xi = originalXCats.indexOf(row[cat0]);
        const yi = originalYCats.indexOf(row[cat1]);
        if (xi >= 0 && yi >= 0) z[yi][xi] += 1;
      }
      const trace = { 
        type: "heatmap", 
        z, 
        x: xCats, 
        y: yCats, 
        colorscale: "Blues", 
        colorbar: { 
          title: { text: "Count", side: 'right' },
          titlefont: { size: 11 },
          tickfont: { size: 10 },
          len: 0.7
        },
        hoverongaps: false,
        hovertemplate: '<b>%{x}</b> × <b>%{y}</b><br>Count: %{z}<extra></extra>'
      };
      const layout = { 
        ...baseLayout, 
        title: { text: `Count by ${prettify(cat0)} and ${prettify(cat1)}`, x: 0, xanchor: "left" }, 
        xaxis: { 
          ...baseLayout.xaxis, 
          title: prettify(cat0),
          tickangle: -30,
          automargin: true,
          tickfont: { size: 9 }
        }, 
        yaxis: { 
          ...baseLayout.yaxis, 
          title: prettify(cat1),
          automargin: true,
          tickfont: { size: 9 }
        },
        margin: { l: 120, r: 100, t: 80, b: 120 } // Extra margin for colorbar and labels
      };
      return { data: [trace], layout, config: baseConfig };
    }

    case "pie": {
      const cat = cat0;
      const val = num0;
      const agg = aggregateBy(sampled, cat, val).slice(0, 8); // Limit to prevent overlap
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
      const trace = { 
        type: "pie", 
        labels: agg.map((d) => truncateLabel(d.key, 18)), 
        values: agg.map((d) => d.value), 
        hole: 0.0, // Full pie chart
        textinfo: "percent", 
        textposition: "auto", // Auto positioning to prevent overlap
        textfont: { size: 11, color: '#ffffff', family: 'Inter' },
        marker: { 
          colors: colors.slice(0, agg.length), 
          line: { color: 'white', width: 2 }
        },
        hovertemplate: "<b>%{label}</b><br>Value: %{value:,.0f}<br>Percentage: %{percent}<extra></extra>",
        pull: 0.03, // Slightly separate slices
        hoverlabel: { bgcolor: 'rgba(0,0,0,0.8)', bordercolor: 'white', font: { color: 'white' } }
      };
      const layout = { 
        ...baseLayout, 
        title: { 
          text: `🥧 Proportion View (Part-to-whole): ${prettify(val)} by ${prettify(cat)}`, 
          x: 0, 
          xanchor: "left",
          font: { size: 16, color: '#374151' }
        },
        showlegend: true,
        legend: {
          orientation: 'v',
          yanchor: 'middle',
          y: 0.5,
          xanchor: 'left',
          x: 1.05,
          font: { size: 12, family: 'Inter' },
          bgcolor: 'rgba(255,255,255,0.9)',
          bordercolor: 'rgba(0,0,0,0.1)',
          borderwidth: 1,
          itemsizing: 'constant',
          itemwidth: 30
        },
        margin: { l: 40, r: 150, t: 80, b: 40 } // Extra right margin for legend
      };
      return { data: [trace], layout, config: baseConfig };
    }

    case "donut": {
      const cat = cat0;
      const val = num0;
      const agg = aggregateBy(sampled, cat, val).slice(0, 8); // Limit to 8 slices to prevent overlap
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
      const trace = { 
        type: "pie", 
        labels: agg.map((d) => truncateLabel(d.key, 18)), // Truncate long labels
        values: agg.map((d) => d.value), 
        hole: 0.5, // Larger hole for better proportion visibility
        textinfo: "percent", // Only show percentages to reduce clutter
        textposition: "auto", // Let Plotly decide best position
        textfont: { size: 11, color: '#ffffff', family: 'Inter' }, // White text for contrast
        marker: { 
          colors: colors.slice(0, agg.length),
          line: { color: 'white', width: 3 } // White borders for separation
        },
        pull: agg.map((_, i) => i === 0 ? 0.1 : 0.02), // Emphasize largest slice
        hovertemplate: "<b>%{label}</b><br>Value: %{value:,.0f}<br>Percentage: %{percent}<extra></extra>",
        hoverlabel: { bgcolor: 'rgba(0,0,0,0.8)', bordercolor: 'white', font: { color: 'white' } }
      };
      
      const layout = { 
        ...baseLayout, 
        title: { 
          text: `📊 Proportion View (Part-to-whole): ${prettify(val)} by ${prettify(cat)}`, 
          x: 0, 
          xanchor: "left",
          font: { size: 16, color: '#374151' }
        }, 
        showlegend: true,
        legend: {
          orientation: 'v',
          yanchor: 'middle',
          y: 0.5,
          xanchor: 'left',
          x: 1.05,
          font: { size: 12, family: 'Inter' },
          bgcolor: 'rgba(255,255,255,0.9)',
          bordercolor: 'rgba(0,0,0,0.1)',
          borderwidth: 1,
          itemsizing: 'constant',
          itemwidth: 30
        },
        margin: { l: 40, r: 150, t: 80, b: 40 }, // Extra right margin for legend
        annotations: [{
          text: `<b>${formatNumber(agg.reduce((sum, d) => sum + d.value, 0))}</b><br><span style="font-size:12px; color:#666;">Total ${prettify(val)}</span>`,
          x: 0.5, y: 0.5,
          xref: 'paper', yref: 'paper',
          showarrow: false,
          font: { size: 16, color: '#374151', family: 'Inter' },
          align: 'center'
        }]
      };
      return { data: [trace], layout, config: baseConfig };
    }

    case "violin": {
      if (cat0) {
        const grouped = groupBy(sampled, cat0);
        const limitedGroups = Object.entries(grouped).slice(0, 6); // Limit to 6 groups to prevent overlap
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        
        const traces = limitedGroups.map(([k, rows], index) => ({
          type: "violin",
          name: truncateLabel(String(k), 12),
          y: rows.map((r) => r[num0]),
          x: Array(rows.length).fill(truncateLabel(String(k), 12)), // Explicit x positioning
          box: { 
            visible: true,
            width: 0.3,
            line: { color: colors[index], width: 2 },
            fillcolor: colors[index]
          },
          meanline: { 
            visible: true,
            color: colors[index],
            width: 2
          },
          line: { 
            color: colors[index],
            width: 2
          },
          fillcolor: colors[index],
          opacity: 0.7,
          points: rows.length < 50 ? 'outliers' : false, // Show points only for smaller datasets
          pointpos: 0, // Center points
          jitter: 0.3,
          scalemode: 'width', // Consistent width scaling
          spanmode: 'hard', // Use data range
          bandwidth: rows.length > 20 ? undefined : 0.2, // Smooth for small datasets
          hovertemplate: `<b>${truncateLabel(String(k), 15)}</b><br>` +
                        `Value: %{y:,.2f}<br>` +
                        `<extra></extra>`,
          hoverlabel: {
            bgcolor: colors[index],
            bordercolor: 'white',
            font: { color: 'white', size: 12 }
          }
        }));
        
        const layout = { 
          ...baseLayout, 
          title: { 
            text: `🎻 Distribution Shape: ${prettify(num0)} by ${prettify(cat0)}`, 
            x: 0, 
            xanchor: "left",
            font: { size: 16, color: '#374151' }
          }, 
          xaxis: { 
            ...baseLayout.xaxis, 
            title: {
              text: prettify(cat0),
              font: { size: 14, color: '#374151' }
            },
            tickangle: -30, // Angle labels to prevent overlap
            automargin: true,
            tickfont: { size: 11, color: '#374151' }
          }, 
          yaxis: { 
            ...baseLayout.yaxis, 
            title: {
              text: prettify(num0),
              font: { size: 14, color: '#374151' }
            },
            tickformat: '~s',
            automargin: true,
            tickfont: { size: 11, color: '#374151' },
            gridcolor: 'rgba(128,128,128,0.2)'
          },
          violinmode: 'group', // Group violins by category
          violingap: 0.3, // Space between violins
          violingroupgap: 0.1, // Space between groups
          showlegend: true,
          legend: {
            orientation: 'h',
            yanchor: 'bottom',
            y: -0.15,
            xanchor: 'center',
            x: 0.5,
            font: { size: 11, family: 'Inter' },
            bgcolor: 'rgba(255,255,255,0.9)',
            bordercolor: 'rgba(0,0,0,0.1)',
            borderwidth: 1
          },
          margin: { l: 80, r: 40, t: 80, b: 120 }, // Extra space for labels and legend
          plot_bgcolor: 'rgba(248, 249, 250, 0.8)',
          paper_bgcolor: 'white'
        };
        return { data: traces, layout, config: baseConfig };
      }
      
      // Single violin plot
      const trace = { 
        type: "violin", 
        name: prettify(num0), 
        y: sampled.map((r) => r[num0]),
        box: { 
          visible: true,
          width: 0.4,
          line: { color: '#2563eb', width: 2 },
          fillcolor: '#2563eb'
        }, 
        meanline: { 
          visible: true,
          color: '#2563eb',
          width: 3
        },
        line: { color: '#2563eb', width: 2 },
        fillcolor: '#2563eb',
        opacity: 0.7,
        points: sampled.length < 100 ? 'outliers' : false,
        pointpos: 0,
        jitter: 0.3,
        scalemode: 'width',
        hovertemplate: `<b>${prettify(num0)}</b><br>` +
                      `Value: %{y:,.2f}<br>` +
                      `<extra></extra>`,
        hoverlabel: {
          bgcolor: '#2563eb',
          bordercolor: 'white',
          font: { color: 'white', size: 12 }
        }
      };
      
      const layout = { 
        ...baseLayout, 
        title: { 
          text: `🎻 Distribution Shape: ${prettify(num0)}`, 
          x: 0, 
          xanchor: "left",
          font: { size: 16, color: '#374151' }
        }, 
        yaxis: { 
          ...baseLayout.yaxis, 
          title: {
            text: prettify(num0),
            font: { size: 14, color: '#374151' }
          },
          tickformat: '~s',
          automargin: true,
          tickfont: { size: 11, color: '#374151' },
          gridcolor: 'rgba(128,128,128,0.2)'
        },
        xaxis: {
          ...baseLayout.xaxis,
          showticklabels: false, // Hide x-axis labels for single violin
          zeroline: false
        },
        showlegend: false,
        margin: { l: 80, r: 40, t: 80, b: 60 },
        plot_bgcolor: 'rgba(248, 249, 250, 0.8)',
        paper_bgcolor: 'white'
      };
      return { data: [trace], layout, config: baseConfig };
    }

    case "bubble": {
      const traces = cat0
        ? Object.entries(groupBy(sampled, cat0)).map(([k, rows]) => ({
            type: "scatter",
            mode: "markers",
            name: String(k),
            x: rows.map((r) => r[num0]),
            y: rows.map((r) => r[num1]),
            marker: { 
              size: rows.map((r) => Math.abs(r[num1]) / 10 + 8),
              opacity: 0.7,
              line: { width: 1, color: 'white' }
            },
          }))
        : [{
            type: "scatter",
            mode: "markers",
            name: `${prettify(num0)} vs ${prettify(num1)}`,
            x: sampled.map((r) => r[num0]),
            y: sampled.map((r) => r[num1]),
            marker: { 
              size: sampled.map((r) => Math.abs(r[num1]) / 10 + 8), 
              color: '#2563eb', 
              opacity: 0.7,
              line: { width: 1, color: 'white' }
            },
          }];
      const layout = {
        ...baseLayout,
        title: { text: `Bubble Chart: ${prettify(num0)} vs ${prettify(num1)}`, x: 0, xanchor: "left" },
        xaxis: { ...baseLayout.xaxis, title: prettify(num0) },
        yaxis: { ...baseLayout.yaxis, title: prettify(num1) },
      };
      return { data: traces, layout, config: baseConfig };
    }

    case "treemap": {
      const cat = cat0;
      const val = num0;
      const agg = aggregateBy(sampled, cat, val).slice(0, 15);
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA', '#AED6F1', '#E8DAEF', '#FADBD8'];
      const trace = {
        type: "treemap",
        labels: agg.map((d) => d.key),
        values: agg.map((d) => d.value),
        parents: Array(agg.length).fill(""),
        marker: { colors: colors.slice(0, agg.length) },
        textinfo: "label+value+percent parent"
      };
      const layout = { ...baseLayout, title: { text: `Treemap: ${prettify(val)} by ${prettify(cat)}`, x: 0, xanchor: "left" } };
      return { data: [trace], layout, config: baseConfig };
    }

    case "funnel": {
      const cat = cat0;
      const val = num0;
      const agg = aggregateBy(sampled, cat, val).sort((a, b) => b.value - a.value).slice(0, 8);
      const trace = {
        type: "funnel",
        y: agg.map((d) => d.key),
        x: agg.map((d) => d.value),
        textinfo: "value+percent initial",
        marker: { color: '#45B7D1' },
        connector: { line: { color: '#2563eb', dash: 'dot', width: 3 } }
      };
      const layout = { ...baseLayout, title: { text: `Funnel Chart: ${prettify(val)} by ${prettify(cat)}`, x: 0, xanchor: "left" } };
      return { data: [trace], layout, config: baseConfig };
    }

    case "waterfall": {
      const cat = cat0;
      const val = num0;
      const agg = aggregateBy(sampled, cat, val).slice(0, 8);
      const trace = {
        type: "waterfall",
        name: "Waterfall",
        orientation: "v",
        measure: Array(agg.length).fill("relative"),
        x: agg.map((d) => d.key),
        y: agg.map((d) => d.value),
        connector: { line: { color: "rgb(63, 63, 63)" } },
        decreasing: { marker: { color: "#FF6B6B" } },
        increasing: { marker: { color: "#4ECDC4" } },
        totals: { marker: { color: "#45B7D1" } }
      };
      const layout = { 
        ...baseLayout, 
        title: { text: `Waterfall Chart: ${prettify(val)} by ${prettify(cat)}`, x: 0, xanchor: "left" },
        xaxis: { ...baseLayout.xaxis, title: prettify(cat) },
        yaxis: { ...baseLayout.yaxis, title: prettify(val) },
        showlegend: false
      };
      return { data: [trace], layout, config: baseConfig };
    }

    case "choropleth": {
      // For geographic data - simplified example
      const locationField = info.categoricalFields.find(field => 
        ['country', 'state', 'region'].some(geo => field.toLowerCase().includes(geo))
      ) || cat0;
      const agg = aggregateBy(sampled, locationField, num0);
      const trace = {
        type: "choropleth",
        locations: agg.map((d) => d.key),
        z: agg.map((d) => d.value),
        locationmode: 'country names',
        colorscale: 'Blues',
        colorbar: { title: prettify(num0) }
      };
      const layout = {
        ...baseLayout,
        title: { text: `Geographic Distribution: ${prettify(num0)}`, x: 0, xanchor: "left" },
        geo: { showframe: false, showcoastlines: false, projection: { type: 'natural earth' } }
      };
      return { data: [trace], layout, config: baseConfig };
    }

    case "scattergeo": {
      // For geographic scatter plots
      const latField = info.numericFields.find(f => f.toLowerCase().includes('lat')) || num0;
      const lonField = info.numericFields.find(f => f.toLowerCase().includes('lon')) || num1;
      const trace = {
        type: "scattergeo",
        mode: "markers",
        lat: sampled.map((r) => r[latField]).filter(v => v != null).slice(0, 1000),
        lon: sampled.map((r) => r[lonField]).filter(v => v != null).slice(0, 1000),
        marker: {
          size: 8,
          color: '#2563eb',
          opacity: 0.7,
          line: { color: 'white', width: 1 }
        },
        name: 'Geographic Points'
      };
      const layout = {
        ...baseLayout,
        title: { text: `Geographic Scatter Plot`, x: 0, xanchor: "left" },
        geo: { 
          projection: { type: 'natural earth' },
          showland: true,
          landcolor: 'rgb(217, 217, 217)',
          coastlinewidth: 2,
        }
      };
      return { data: [trace], layout, config: baseConfig };
    }

    default: {
      // Fallback to bar
      const cat = cat0 || String(Object.keys(sampled[0])[0]);
      const val = num0;
      const agg = aggregateBy(sampled, cat, val);
      const trace = { type: "bar", x: agg.map((d) => d.key), y: agg.map((d) => d.value), marker: { color: "#2563eb" } };
      const layout = { ...baseLayout, title: { text: `Sum of ${prettify(val)} by ${prettify(cat)}`, x: 0, xanchor: "left" }, xaxis: { ...baseLayout.xaxis, title: prettify(cat) }, yaxis: { ...baseLayout.yaxis, title: prettify(val), tickformat: "~s" } };
      return { data: [trace], layout, config: baseConfig };
    }
  }
}

/** Pretty-print a field label */
function prettify(s) {
  if (!s) return "";
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}

/**
 * Truncate labels to prevent overlapping
 */
function truncateLabel(label, maxLength = 15) {
  if (!label || typeof label !== 'string') return String(label || '');
  return label.length > maxLength ? label.substring(0, maxLength - 3) + '...' : label;
}

/**
 * Format numbers for better readability
 */
function formatNumber(num) {
  if (typeof num !== 'number') return String(num);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

/** Group rows by the value found at `key` */
function groupBy(rows, key) {
  if (!key) return { All: rows };
  const out = {};
  for (const r of rows) {
    const k = r[key] ?? "(null)";
    if (!out[k]) out[k] = [];
    out[k].push(r);
  }
  return out;
}

/** Aggregate numeric values by `key` using an operation (sum only here) */
function aggregateBy(rows, key, valueField) {
  const map = new Map();
  for (const r of rows) {
    const k = r[key] ?? "(null)";
    const v = typeof r[valueField] === "number" ? r[valueField] : 1;
    map.set(k, (map.get(k) || 0) + v);
  }
  return Array.from(map.entries()).map(([k, v]) => ({ key: k, value: v }));
}

/** Get top N category labels by frequency */
function getTopCategories(rows, key, limit = 20) {
  if (!key) return [];
  const counts = new Map();
  for (const r of rows) {
    const k = r[key] ?? "(null)";
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
}

function limitCategories(rows, key, limit) {
  if (!key) return [];
  return getTopCategories(rows, key, limit);
}

/** Optional aggregation of time-like x-axis values into buckets */
function maybeAggregateTime(rows, xField, yField, temporalFields, mode) {
  if (!temporalFields.includes(xField)) return { rows };
  if (mode === "none") return { rows };
  const parsed = rows
    .map((r) => ({ ...r, __t: new Date(r[xField]) }))
    .filter((r) => !Number.isNaN(+r.__t));

  const bucketFn = (d) => {
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const day = d.getUTCDate();
    if (mode === "day") return Date.UTC(year, month, day);
    if (mode === "week") {
      // ISO week start (Mon). Approx by shifting to previous Monday
      const wd = (d.getUTCDay() + 6) % 7; // 0..6 Mon..Sun
      const monday = new Date(Date.UTC(year, month, day - wd));
      return Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate());
    }
    // month or auto
    return Date.UTC(year, month, 1);
  };

  const grouped = new Map();
  for (const r of parsed) {
    const bucket = bucketFn(r.__t);
    const key = String(bucket);
    const val = typeof r[yField] === "number" ? r[yField] : 0;
    grouped.set(key, (grouped.get(key) || 0) + val);
  }
  const out = Array.from(grouped.entries())
    .map(([k, v]) => ({ [xField]: new Date(Number(k)).toISOString(), [yField]: v }))
    .sort((a, b) => new Date(a[xField]) - new Date(b[xField]));

  return { rows: out };
}

ChartAutoPlotly.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
};

