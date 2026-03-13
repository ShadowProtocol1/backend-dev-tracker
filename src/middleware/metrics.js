/**
 * Metrics Middleware
 * Tracks request analytics, response times, and error rates
 */

const metricsStore = {
  totalRequests: 0,
  totalErrors: 0,
  totalResponseTime: 0,
  requestsByRoute: {},
  requestsByMethod: {
    GET: 0,
    POST: 0,
    PUT: 0,
    PATCH: 0,
    DELETE: 0,
    OPTIONS: 0,
  },
  requestHistory: [], // Last 100 requests
  startTime: Date.now(),
};

const MAX_HISTORY = 100;

const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Override res.json to capture responses
  const originalJson = res.json;
  res.json = function (data) {
    const responseTime = Date.now() - startTime;
    const route = req.route?.path || req.path;
    const method = req.method;

    // Update metrics
    metricsStore.totalRequests++;
    metricsStore.totalResponseTime += responseTime;

    // Track by route
    if (!metricsStore.requestsByRoute[route]) {
      metricsStore.requestsByRoute[route] = {
        count: 0,
        avgResponseTime: 0,
        totalResponseTime: 0,
        methods: {},
      };
    }
    metricsStore.requestsByRoute[route].count++;
    metricsStore.requestsByRoute[route].totalResponseTime += responseTime;
    metricsStore.requestsByRoute[route].avgResponseTime =
      metricsStore.requestsByRoute[route].totalResponseTime /
      metricsStore.requestsByRoute[route].count;

    if (!metricsStore.requestsByRoute[route].methods[method]) {
      metricsStore.requestsByRoute[route].methods[method] = 0;
    }
    metricsStore.requestsByRoute[route].methods[method]++;

    // Track by method
    if (metricsStore.requestsByMethod[method] !== undefined) {
      metricsStore.requestsByMethod[method]++;
    }

    // Track errors
    if (res.statusCode >= 400) {
      metricsStore.totalErrors++;
    }

    // Add to history
    metricsStore.requestHistory.push({
      timestamp: new Date().toISOString(),
      method,
      route,
      status: res.statusCode,
      responseTime,
    });

    if (metricsStore.requestHistory.length > MAX_HISTORY) {
      metricsStore.requestHistory.shift();
    }

    // Call original json
    return originalJson.call(this, data);
  };

  next();
};

const getMetrics = () => {
  const uptime = Math.floor((Date.now() - metricsStore.startTime) / 1000);
  const avgResponseTime =
    metricsStore.totalRequests > 0
      ? Math.round(metricsStore.totalResponseTime / metricsStore.totalRequests)
      : 0;
  const errorRate =
    metricsStore.totalRequests > 0
      ? ((metricsStore.totalErrors / metricsStore.totalRequests) * 100).toFixed(2)
      : 0;

  return {
    ...metricsStore,
    uptime,
    avgResponseTime,
    errorRate,
  };
};

const resetMetrics = () => {
  metricsStore.totalRequests = 0;
  metricsStore.totalErrors = 0;
  metricsStore.totalResponseTime = 0;
  metricsStore.requestsByRoute = {};
  metricsStore.requestHistory = [];
  metricsStore.startTime = Date.now();
};

module.exports = {
  metricsMiddleware,
  getMetrics,
  resetMetrics,
};
