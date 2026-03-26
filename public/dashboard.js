import { inject } from "@vercel/analytics";

inject();

let methodChart = null;
let responseTimeChart = null;

async function loadDashboard() {
  try {
    const response = await fetch("/api/dashboard/data");
    
    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      showError(`Server error: ${response.status}`);
      return;
    }
    
    const result = await response.json();

    if (!result.success) {
      console.error("API returned success: false", result);
      showError("Failed to load dashboard data");
      return;
    }

    const data = result.data;
    updateStatusCards(data);
    updateDatabaseInfo(data);
    updateCharts(data);
    updateRecentRequests(data);
    updateRoutes(data);
    updateTimestamp();
  } catch (error) {
    console.error("Dashboard Error Details:", error);
    showError(`Failed to connect: ${error.message}`);
  }
}

function updateStatusCards(data) {
  document.getElementById("uptime").textContent = data.server.uptime.formatted;
  document.getElementById("total-requests").textContent = data.traffic.totalRequests;
  document.getElementById("avg-response").innerHTML = 
    `${data.traffic.avgResponseTime}<span style="font-size: 18px">ms</span>`;
  document.getElementById("error-rate").innerHTML = 
    `${data.traffic.errorRate}<span style="font-size: 18px">%</span>`;

  // Update status badges
  const dbStatus = document.getElementById("db-status");
  if (data.database.connected) {
    dbStatus.className = "status-badge status-online";
    dbStatus.innerHTML = '<span class="dot dot-green"></span> Database Connected';
  } else {
    dbStatus.className = "status-badge status-offline";
    dbStatus.innerHTML = '<span class="dot dot-red"></span> Database Disconnected';
  }
}

function updateDatabaseInfo(data) {
  document.getElementById("db-status-text").textContent = 
    data.database.connected ? "Connected" : "Disconnected";
  document.getElementById("db-name").textContent = data.database.name;
  document.getElementById("db-host").textContent = data.database.host;
  document.getElementById("db-collections").textContent = 
    data.database.collections.join(", ") || "No collections";
}

function updateCharts(data) {
  const methodCtx = document.getElementById("methodChart").getContext("2d");
  const methodData = data.traffic.requestsByMethod;

  if (methodChart) {
    methodChart.destroy();
  }

  methodChart = new Chart(methodCtx, {
    type: "doughnut",
    data: {
      labels: Object.keys(methodData),
      datasets: [
        {
          data: Object.values(methodData),
          backgroundColor: [
            "#667eea",
            "#764ba2",
            "#f09433",
            "#ea6c00",
            "#d63031",
            "#00b894",
          ],
          borderColor: "white",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });

  // Response Time Distribution
  const responseCtx = document.getElementById("responseTimeChart").getContext("2d");
  const recentTimes = data.traffic.recentRequests.map((r) => r.responseTime);
  const avgTime = data.traffic.avgResponseTime;

  if (responseTimeChart) {
    responseTimeChart.destroy();
  }

  responseTimeChart = new Chart(responseCtx, {
    type: "line",
    data: {
      labels: data.traffic.recentRequests.map((_, i) => i + 1),
      datasets: [
        {
          label: "Response Time (ms)",
          data: recentTimes,
          borderColor: "#667eea",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          tension: 0.3,
          fill: true,
          pointBackgroundColor: "#667eea",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Average",
          data: Array(recentTimes.length).fill(avgTime),
          borderColor: "#f09433",
          borderDash: [5, 5],
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function updateRecentRequests(data) {
  const requestsList = data.traffic.recentRequests || [];
  
  if (requestsList.length === 0) {
    document.getElementById("recent-requests").innerHTML = 
      '<p style="color: #999; text-align: center; padding: 20px">No requests yet</p>';
    return;
  }

  const html = requestsList
    .map((req) => {
      const statusClass = 
        req.statusCode < 400 ? "status-2xx" : 
        req.statusCode < 500 ? "status-4xx" : 
        "status-5xx";

      return `
        <div class="request-item">
          <div class="request-left">
            <span class="request-status ${statusClass}">${req.statusCode}</span>
            <span>${req.method} ${req.path}</span>
          </div>
          <span>${req.responseTime}ms</span>
        </div>
      `;
    })
    .join("");

  document.getElementById("recent-requests").innerHTML = html;
}

function updateRoutes(data) {
  const routes = data.routes || [];
  document.getElementById("routes-tbody").innerHTML = routes
    .map((route) => {
      const methodClass = `method-${route.method.toLowerCase()}`;
      return `
        <tr>
          <td><span class="method-badge ${methodClass}">${route.method}</span></td>
          <td><code>${route.path}</code></td>
          <td>${route.description}</td>
        </tr>
      `;
    })
    .join("");
}

function updateTimestamp() {
  const now = new Date();
  document.getElementById("timestamp").textContent =
    now.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
}

function showError(message) {
  const container = document.querySelector(".container");
  const errorDiv = document.createElement("div");
  errorDiv.className = "error";
  errorDiv.textContent = message;
  container.insertBefore(errorDiv, container.firstChild);
  setTimeout(() => errorDiv.remove(), 5000);
}

// Event listeners
document.getElementById("refresh-btn").addEventListener("click", async function () {
  this.classList.add("loading");
  await loadDashboard();
  this.classList.remove("loading");
});

// Initial load
loadDashboard();

// Auto-refresh every 5 seconds
setInterval(loadDashboard, 5000);
