/**
 * Leaflet + OpenStreetMap visualization with clickable junctions.
 */
class MapVisualizer {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.graph = null;
    this.mapCenter = { lat: 18.5314, lng: 73.8446, zoom: 14 };
    this.markers = {};
    this.roadLayers = [];
    this.routeLayers = [];
    this.highlightPaths = { fastest: [], shortest: [] };
    this.selection = { source: null, destination: null };
    this.onJunctionClick = null;
    this.colors = this._readThemeColors();
  }

  _cssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return value || fallback;
  }

  _readThemeColors() {
    return {
      routeFastest: this._cssVar("--route-fastest", "#58d7ff"),
      routeShortest: this._cssVar("--route-shortest", "#a88dff"),
      trafficHigh: this._cssVar("--traffic-high", "#ff7aa2"),
      trafficMedium: this._cssVar("--traffic-medium", "#ffc76a"),
      roadNormal: this._cssVar("--road-normal", "#3a4258"),
    };
  }

  refreshTheme() {
    this.colors = this._readThemeColors();
    if (this.graph) this.render();
  }

  init() {
    if (this.map) return;

    this.map = L.map(this.containerId, { zoomControl: true }).setView(
      [this.mapCenter.lat, this.mapCenter.lng],
      this.mapCenter.zoom
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);
  }

  setGraph(graph, mapCenter) {
    this.graph = graph;
    if (mapCenter) {
      this.mapCenter = mapCenter;
      if (this.map) {
        this.map.setView([mapCenter.lat, mapCenter.lng], mapCenter.zoom || 14);
      }
    }
    this.render();
  }

  setSelection(source, destination) {
    this.selection = { source, destination };
    this._updateMarkerStyles();
  }

  setHighlightPaths(fastest = [], shortest = []) {
    this.highlightPaths = { fastest, shortest };
    this._renderRoutes();
    this._updateMarkerStyles();
  }

  clearHighlight() {
    this.highlightPaths = { fastest: [], shortest: [] };
    this._renderRoutes();
    this._updateMarkerStyles();
  }

  updateJunctionPositions(junctions) {
    junctions.forEach((j) => {
      const existing = this.graph.junctions.find((n) => n.id === j.id);
      if (existing) {
        existing.lat = j.lat;
        existing.lng = j.lng;
      }
    });
    this.render();
  }

  runAutoLayout() {
    if (!this.graph || !window.forceDirectedLayout) return;
    const laid = forceDirectedLayout(
      this.graph.junctions,
      this.graph.roads,
      this.mapCenter.lat,
      this.mapCenter.lng
    );
    this.updateJunctionPositions(laid);
    this._fitBounds();
    return laid;
  }

  _fitBounds() {
    const coords = this.graph.junctions.map((j) => [j.lat, j.lng]);
    if (coords.length) {
      this.map.fitBounds(coords, { padding: [40, 40] });
    }
  }

  _clearLayers() {
    Object.values(this.markers).forEach((m) => m.remove());
    this.markers = {};
    this.roadLayers.forEach((l) => l.remove());
    this.roadLayers = [];
    this.routeLayers.forEach((l) => l.remove());
    this.routeLayers = [];
  }

  _roadColor(road, onFastest, onShortest) {
    if (onFastest && onShortest) return this.colors.routeFastest;
    if (onFastest) return this.colors.routeFastest;
    if (onShortest) return this.colors.routeShortest;
    if (road.traffic_factor >= 2.0) return this.colors.trafficHigh;
    if (road.traffic_factor >= 1.5) return this.colors.trafficMedium;
    return this.colors.roadNormal;
  }

  _roadWeight(road, onFastest, onShortest) {
    if (onFastest || onShortest) return 6;
    if (road.traffic_factor >= 1.5) return 5;
    return 4;
  }

  _isOnPath(from, to, path) {
    for (let i = 0; i < path.length - 1; i++) {
      if (path[i] === from && path[i + 1] === to) return true;
    }
    return false;
  }

  _uniqueRoads() {
    const seen = new Set();
    const result = [];
    this.graph.roads.forEach((road) => {
      const key = [road.from, road.to].sort().join("|");
      if (seen.has(key)) return;
      seen.add(key);
      const reverse = this.graph.roads.find(
        (r) => r.from === road.to && r.to === road.from
      );
      const traffic = Math.max(road.traffic_factor, reverse?.traffic_factor || 1);
      result.push({ ...road, traffic_factor: traffic });
    });
    return result;
  }

  _getJunction(id) {
    return this.graph.junctions.find((j) => j.id === id);
  }

  _markerIcon(junction) {
    const { source, destination } = this.selection;
    const onRoute =
      this.highlightPaths.fastest.includes(junction.id) ||
      this.highlightPaths.shortest.includes(junction.id);

    let cls = "junction-marker";
    if (junction.id === source) cls += " marker-source";
    else if (junction.id === destination) cls += " marker-destination";
    else if (onRoute) cls += " marker-route";

    return L.divIcon({
      className: "",
      html: `<div class="${cls}"><span>${junction.id}</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  }

  _updateMarkerStyles() {
    if (!this.graph) return;
    this.graph.junctions.forEach((j) => {
      const marker = this.markers[j.id];
      if (marker) marker.setIcon(this._markerIcon(j));
    });
  }

  _renderRoads() {
    const roads = this._uniqueRoads();
    roads.forEach((road) => {
      const from = this._getJunction(road.from);
      const to = this._getJunction(road.to);
      if (!from || !to) return;

      const onFastest = this._isOnPath(
        road.from,
        road.to,
        this.highlightPaths.fastest
      );
      const onShortest = this._isOnPath(
        road.from,
        road.to,
        this.highlightPaths.shortest
      );

      const line = L.polyline(
        [
          [from.lat, from.lng],
          [to.lat, to.lng],
        ],
        {
          color: this._roadColor(road, onFastest, onShortest),
          weight: this._roadWeight(road, onFastest, onShortest),
          opacity: onFastest || onShortest ? 0.95 : 0.75,
        }
      ).addTo(this.map);

      if (road.traffic_factor > 1.0 && !onFastest && !onShortest) {
        const midLat = (from.lat + to.lat) / 2;
        const midLng = (from.lng + to.lng) / 2;
        L.marker([midLat, midLng], {
          icon: L.divIcon({
            className: "",
            html: `<div class="traffic-label">${road.traffic_factor}x</div>`,
            iconSize: [32, 18],
            iconAnchor: [16, 9],
          }),
          interactive: false,
        }).addTo(this.map);
      }

      this.roadLayers.push(line);
    });
  }

  _renderRoutes() {
    this.routeLayers.forEach((l) => l.remove());
    this.routeLayers = [];

    const drawPath = (path, color, dash) => {
      if (!path || path.length < 2) return;
      const coords = path
        .map((id) => {
          const j = this._getJunction(id);
          return j ? [j.lat, j.lng] : null;
        })
        .filter(Boolean);

      if (coords.length < 2) return;

      const line = L.polyline(coords, {
        color,
        weight: 7,
        opacity: 0.9,
        dashArray: dash,
      }).addTo(this.map);
      this.routeLayers.push(line);
    };

    drawPath(this.highlightPaths.fastest, this.colors.routeFastest, null);
    drawPath(this.highlightPaths.shortest, this.colors.routeShortest, "8 6");
  }

  _renderMarkers() {
    this.graph.junctions.forEach((j) => {
      const marker = L.marker([j.lat, j.lng], {
        icon: this._markerIcon(j),
        title: j.name,
      }).addTo(this.map);

      marker.bindPopup(`<strong>${j.id}</strong><br>${j.name}`);
      marker.on("click", () => {
        if (this.onJunctionClick) this.onJunctionClick(j.id);
      });

      this.markers[j.id] = marker;
    });
  }

  render() {
    if (!this.map || !this.graph) return;
    this._clearLayers();
    this._renderRoads();
    this._renderRoutes();
    this._renderMarkers();
    setTimeout(() => this.map.invalidateSize(), 50);
  }
}

window.MapVisualizer = MapVisualizer;
