/**
 * Dashboard Controller
 * Serves dashboard data: server status, DB status, routes, and analytics
 */

const mongoose = require("mongoose");
const { getMetrics } = require("../middleware/metrics");

const getDashboardData = async (req, res) => {
  try {
    console.log("[Dashboard] Fetching dashboard data...");
    const metrics = getMetrics();
    const dbStatus = await checkDatabaseStatus();

    const uptime = metrics.uptime;
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    const dashboardData = {
      server: {
        status: "running",
        uptime: {
          formatted: `${hours}h ${minutes}m ${seconds}s`,
          seconds: uptime,
        },
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        port: process.env.PORT || 5000,
      },
      database: {
        status: dbStatus.status,
        name: dbStatus.name,
        collections: dbStatus.collections,
        host: dbStatus.host,
        connected: dbStatus.connected,
      },
      traffic: {
        totalRequests: metrics.totalRequests,
        totalErrors: metrics.totalErrors,
        errorRate: metrics.errorRate,
        avgResponseTime: metrics.avgResponseTime,
        requestsByMethod: metrics.requestsByMethod,
        requestsByRoute: metrics.requestsByRoute,
        recentRequests: metrics.requestHistory.slice(-20),
      },
      routes: getAvailableRoutes(),
    };

    console.log("[Dashboard] Data prepared successfully");
    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("[Dashboard] Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const checkDatabaseStatus = async () => {
  try {
    const state = mongoose.connection.readyState;
    const stateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    let collections = [];
    let db = mongoose.connection.db;

    if (db && state === 1) {
      const collectionList = await db.listCollections().toArray();
      collections = collectionList.map((c) => c.name);
    }

    return {
      status: stateMap[state],
      connected: state === 1,
      name: mongoose.connection.name,
      collections,
      host: mongoose.connection.host || "N/A",
    };
  } catch (error) {
    return {
      status: "error",
      connected: false,
      name: "unknown",
      collections: [],
      host: "N/A",
      error: error.message,
    };
  }
};

const getAvailableRoutes = () => {
  const routes = [
    {
      method: "GET",
      path: "/api",
      description: "Health check endpoint",
    },
    {
      method: "GET",
      path: "/dashboard",
      description: "Server control center dashboard",
    },
    {
      method: "GET",
      path: "/api/dashboard/data",
      description: "Dashboard analytics data (JSON)",
    },
    {
      method: "POST",
      path: "/api/auth/register",
      description: "User registration",
    },
    {
      method: "POST",
      path: "/api/auth/login",
      description: "User login",
    },
    {
      method: "GET",
      path: "/api/projects",
      description: "Get all projects",
    },
    {
      method: "POST",
      path: "/api/projects",
      description: "Create a new project",
    },
    {
      method: "GET",
      path: "/api/projects/:id",
      description: "Get project details",
    },
    {
      method: "PUT",
      path: "/api/projects/:id",
      description: "Update project",
    },
    {
      method: "PATCH",
      path: "/api/projects/:id",
      description: "Partially update project",
    },
    {
      method: "DELETE",
      path: "/api/projects/:id",
      description: "Delete project",
    },
    {
      method: "GET",
      path: "/api/study-materials",
      description: "Get all study materials",
    },
    {
      method: "POST",
      path: "/api/study-materials",
      description: "Create study material",
    },
    {
      method: "GET",
      path: "/api/study-materials/:id",
      description: "Get study material details",
    },
    {
      method: "PUT",
      path: "/api/study-materials/:id",
      description: "Update study material",
    },
    {
      method: "DELETE",
      path: "/api/study-materials/:id",
      description: "Delete study material",
    },
    {
      method: "GET",
      path: "/api/achievements",
      description: "Get all achievements",
    },
    {
      method: "POST",
      path: "/api/achievements",
      description: "Create achievement",
    },
    {
      method: "GET",
      path: "/api/achievements/:id",
      description: "Get achievement details",
    },
    {
      method: "DELETE",
      path: "/api/achievements/:id",
      description: "Delete achievement",
    },
  ];

  return routes;
};

module.exports = {
  getDashboardData,
  checkDatabaseStatus,
  getAvailableRoutes,
};
