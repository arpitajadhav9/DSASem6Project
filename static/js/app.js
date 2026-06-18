const viz = new MapVisualizer("cityMap");
const sourceSelect = document.getElementById("sourceSelect");
const targetSelect = document.getElementById("targetSelect");
const modeSelect = document.getElementById("modeSelect");
const routeForm = document.getElementById("routeForm");
const compareBtn = document.getElementById("compareBtn");
const simulateBtn = document.getElementById("simulateBtn");
const resetTrafficBtn = document.getElementById("resetTrafficBtn");
const autoLayoutBtn = document.getElementById("autoLayoutBtn");
const routeResultCard = document.getElementById("routeResultCard");
const compareCard = document.getElementById("compareCard");
const routeSummary = document.getElementById("routeSummary");
const routeSteps = document.getElementById("routeSteps");
const compareContent = document.getElementById("compareContent");
const mapHint = document.getElementById("mapHint");
const modePills = document.getElementById("modePills");
const infoPanelBody = document.getElementById("infoPanelBody");
const themeToggle = document.getElementById("themeToggle");
const citySelect = document.getElementById("citySelect");
const cityTitle = document.getElementById("cityTitle");
const cityMeta = document.getElementById("cityMeta");

let graphData = null;
let mapCenter = { lat: 18.5314, lng: 73.8446, zoom: 14 };
let clickStep = 0;
let currentCity = "pune";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("cityflow-theme", theme);
  themeToggle.textContent = theme === "light" ? "Dark mode" : "Light mode";
  viz.refreshTheme();
}

function initTheme() {
  const savedTheme = localStorage.getItem("cityflow-theme");
  const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (preferredDark ? "dark" : "light");
  applyTheme(initialTheme);
}

function setHint(html) {
  mapHint.innerHTML = html;
}

function updateInfoPanel() {
  const hasResults =
    !routeResultCard.hidden || !compareCard.hidden;
  infoPanelBody.classList.toggle("has-results", hasResults);
}

modePills.addEventListener("change", (e) => {
  if (e.target.name === "mode") {
    modeSelect.value = e.target.value;
    modePills.querySelectorAll(".mode-pill").forEach((pill) => {
      pill.classList.toggle("active", pill.querySelector("input").value === e.target.value);
    });
  }
});

viz.init();
initTheme();

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(current === "dark" ? "light" : "dark");
});

viz.onJunctionClick = (junctionId) => {
  if (clickStep === 0) {
    sourceSelect.value = junctionId;
    clickStep = 1;
    setHint('Now click map — set <strong>destination</strong>');
  } else {
    if (junctionId === sourceSelect.value) {
      setHint("Pick a different junction for destination");
      return;
    }
    targetSelect.value = junctionId;
    clickStep = 0;
    setHint('Click map — set <strong>source</strong> then <strong>destination</strong>');
  }
  syncMapSelection();
};

sourceSelect.addEventListener("change", () => {
  clickStep = 1;
  syncMapSelection();
});

targetSelect.addEventListener("change", () => {
  clickStep = 0;
  syncMapSelection();
});

function syncMapSelection() {
  viz.setSelection(sourceSelect.value, targetSelect.value);
}

async function loadGraph() {
  const res = await fetch(`/api/graph?city=${encodeURIComponent(currentCity)}`);
  const data = await res.json();
  graphData = data;
  currentCity = data.city || currentCity;
  if (data.map_center) mapCenter = data.map_center;
  viz.setGraph(graphData, mapCenter);
  setCityMeta(data);
  populateSelects();
  syncMapSelection();
  viz._fitBounds();
}

function setCityMeta(data) {
  const cityName = currentCity.charAt(0).toUpperCase() + currentCity.slice(1);
  cityTitle.textContent = `${cityName} City Grid`;
  cityMeta.textContent = `OpenStreetMap · ${data.junctions.length} junctions`;
}

async function loadCities() {
  const res = await fetch("/api/cities");
  const data = await res.json();
  currentCity = data.current_city || "pune";
  citySelect.innerHTML = data.cities
    .map((city) => `<option value="${city.id}">${city.name}</option>`)
    .join("");
  citySelect.value = currentCity;
}

function populateSelects() {
  const options = graphData.junctions
    .map((j) => `<option value="${j.id}">${j.id} — ${j.name}</option>`)
    .join("");

  sourceSelect.innerHTML = options;
  targetSelect.innerHTML = options;
  targetSelect.value = graphData.junctions[graphData.junctions.length - 1].id;
}

function showRouteResult(data, title) {
  routeResultCard.hidden = false;
  updateInfoPanel();
  routeSummary.innerHTML = `
    <div class="stat">
      <div class="stat-label">Total Distance</div>
      <div class="stat-value">${data.total_distance_km} km</div>
    </div>
    <div class="stat">
      <div class="stat-label">Travel Time</div>
      <div class="stat-value">${data.total_time_min} min</div>
    </div>
    <div class="stat">
      <div class="stat-label">Stops</div>
      <div class="stat-value">${data.path.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Route Type</div>
      <div class="stat-value" style="font-size:0.9rem">${title}</div>
    </div>
  `;

  routeSteps.innerHTML = data.segments
    .map(
      (s) =>
        `<li><strong>${s.from_name}</strong> → ${s.to_name} 
        · ${s.distance_km} km · ${s.time_min} min${s.traffic_factor > 1 ? ` · ${s.traffic_factor}x traffic` : ""}</li>`
    )
    .join("");
}

function showCompareReport(report) {
  compareCard.hidden = false;
  updateInfoPanel();
  const { fastest, shortest, comparison } = report;

  compareContent.innerHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Fastest Route</th>
          <th>Shortest Route</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Path</td>
          <td>${fastest.path.join(" → ")}</td>
          <td>${shortest.path.join(" → ")}</td>
        </tr>
        <tr>
          <td>Distance</td>
          <td>${fastest.total_distance_km} km</td>
          <td>${shortest.total_distance_km} km</td>
        </tr>
        <tr>
          <td>Travel Time</td>
          <td>${fastest.total_time_min} min</td>
          <td>${shortest.total_time_min} min</td>
        </tr>
        <tr>
          <td>Same Route?</td>
          <td colspan="2">${comparison.same_route ? "Yes" : "No"}</td>
        </tr>
      </tbody>
    </table>
    <p class="recommendation">${comparison.recommendation}</p>
  `;

  viz.setHighlightPaths(fastest.path, shortest.path);
}

routeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  compareCard.hidden = true;
  updateInfoPanel();

  const res = await fetch("/api/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: sourceSelect.value,
      target: targetSelect.value,
      mode: modeSelect.value,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    routeResultCard.hidden = false;
    updateInfoPanel();
    routeSummary.innerHTML = `<div class="error-msg">${data.error}</div>`;
    routeSteps.innerHTML = "";
    viz.clearHighlight();
    return;
  }

  const title = modeSelect.value === "time" ? "Fastest" : "Shortest";
  showRouteResult(data, title);
  updateInfoPanel();
  viz.setHighlightPaths(
    modeSelect.value === "time" ? data.path : [],
    modeSelect.value === "distance" ? data.path : []
  );
});

compareBtn.addEventListener("click", async () => {
  const res = await fetch("/api/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: sourceSelect.value,
      target: targetSelect.value,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    compareCard.hidden = false;
    updateInfoPanel();
    compareContent.innerHTML = `<div class="error-msg">${data.error}</div>`;
    return;
  }

  showCompareReport(data);
  routeResultCard.hidden = true;
  updateInfoPanel();
});

simulateBtn.addEventListener("click", async () => {
  const res = await fetch("/api/traffic/simulate", { method: "POST" });
  const data = await res.json();
  graphData = data.graph;
  viz.setGraph(graphData, mapCenter);
  syncMapSelection();
  viz.clearHighlight();
  routeResultCard.hidden = true;
  compareCard.hidden = true;
  updateInfoPanel();
});

resetTrafficBtn.addEventListener("click", async () => {
  const res = await fetch("/api/traffic/reset", { method: "POST" });
  graphData = await res.json();
  viz.setGraph(graphData, mapCenter);
  syncMapSelection();
  viz.clearHighlight();
  routeResultCard.hidden = true;
  compareCard.hidden = true;
  updateInfoPanel();
});

autoLayoutBtn.addEventListener("click", () => {
  viz.runAutoLayout();
  setHint("Layout rearranged — click junctions to plan a route");
});

citySelect.addEventListener("change", async () => {
  currentCity = citySelect.value;
  compareCard.hidden = true;
  routeResultCard.hidden = true;
  updateInfoPanel();
  setHint('Click map — set <strong>source</strong> then <strong>destination</strong>');
  clickStep = 0;
  await loadGraph();
});

(async function init() {
  await loadCities();
  await loadGraph();
})();
