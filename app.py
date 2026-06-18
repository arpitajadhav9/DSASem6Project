"""Smart City Traffic Navigation System — Flask API."""

from __future__ import annotations

import json
import random
import os
import socket
from pathlib import Path

from flask import Flask, jsonify, render_template, request

from graph import CityGraph, compare_routes, dijkstra

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
CITY_FILES = {
    "pune": DATA_DIR / "city_map.json",
    "mumbai": DATA_DIR / "city_mumbai.json",
    "bengaluru": DATA_DIR / "city_bengaluru.json",
}

app = Flask(__name__)
city_graph: CityGraph
MAP_CENTER: dict
current_city = "pune"
CONGESTED_ROADS: list[tuple[str, str]] = []


def _is_port_free(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind(("127.0.0.1", port))
            return True
        except OSError:
            return False


def _find_available_port(start: int = 8080, end: int = 8090) -> int:
    for port in range(start, end + 1):
        if _is_port_free(port):
            return port
    raise RuntimeError(f"No free port found in range {start}-{end}.")


def _build_congested_roads(graph: CityGraph, max_edges: int = 5) -> list[tuple[str, str]]:
    roads: list[tuple[str, str]] = []
    seen = set()
    for road in graph.roads:
        key = (road.from_id, road.to_id)
        if key in seen:
            continue
        seen.add(key)
        roads.append(key)
        if len(roads) >= max_edges:
            break
    return roads


def _load_city(city: str) -> bool:
    global city_graph, MAP_CENTER, current_city, CONGESTED_ROADS
    file_path = CITY_FILES.get(city)
    if file_path is None or not file_path.exists():
        return False
    data = json.loads(file_path.read_text(encoding="utf-8"))
    city_graph = CityGraph.from_dict(data)
    MAP_CENTER = data.get("map_center", {"lat": 18.5314, "lng": 73.8446, "zoom": 14})
    current_city = city
    CONGESTED_ROADS = _build_congested_roads(city_graph)
    return True


_load_city(current_city)


def _simulate_traffic() -> list[dict]:
    """Apply random congestion to simulate live traffic conditions."""
    city_graph.reset_traffic()
    updates = []
    for from_id, to_id in CONGESTED_ROADS:
        factor = round(random.uniform(1.5, 3.5), 1)
        city_graph.update_traffic(from_id, to_id, factor)
        updates.append(
            {
                "from": from_id,
                "to": to_id,
                "traffic_factor": factor,
                "from_name": city_graph.junctions[from_id].name,
                "to_name": city_graph.junctions[to_id].name,
            }
        )
    return updates


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/graph")
def get_graph():
    requested_city = request.args.get("city")
    if requested_city:
        if not _load_city(requested_city):
            return jsonify({"error": f"Unknown city '{requested_city}'."}), 404
    data = city_graph.to_dict()
    data["map_center"] = MAP_CENTER
    data["city"] = current_city
    data["available_cities"] = [
        {"id": city_id, "name": city_id.title()} for city_id in CITY_FILES.keys()
    ]
    return jsonify(data)


@app.route("/api/cities")
def list_cities():
    return jsonify(
        {
            "cities": [{"id": city_id, "name": city_id.title()} for city_id in CITY_FILES.keys()],
            "current_city": current_city,
        }
    )


@app.route("/api/route", methods=["POST"])
def find_route():
    data = request.get_json(silent=True) or {}
    source = data.get("source")
    target = data.get("target")
    mode = data.get("mode", "time")

    if not source or not target:
        return jsonify({"error": "Source and target junctions are required."}), 400
    if mode not in ("time", "distance"):
        return jsonify({"error": "Mode must be 'time' or 'distance'."}), 400

    result = dijkstra(city_graph, source, target, weight_mode=mode)
    if not result.reachable:
        return jsonify({"error": "No route found between selected locations."}), 404

    return jsonify(result.to_dict())


@app.route("/api/compare", methods=["POST"])
def compare():
    data = request.get_json(silent=True) or {}
    source = data.get("source")
    target = data.get("target")

    if not source or not target:
        return jsonify({"error": "Source and target junctions are required."}), 400

    report = compare_routes(city_graph, source, target)
    if not report["fastest"]["reachable"]:
        return jsonify({"error": "No route found between selected locations."}), 404

    return jsonify(report)


@app.route("/api/traffic/simulate", methods=["POST"])
def simulate_traffic():
    updates = _simulate_traffic()
    data = city_graph.to_dict()
    data["map_center"] = MAP_CENTER
    data["city"] = current_city
    return jsonify({"updates": updates, "graph": data})


@app.route("/api/traffic/reset", methods=["POST"])
def reset_traffic():
    city_graph.reset_traffic()
    data = city_graph.to_dict()
    data["map_center"] = MAP_CENTER
    data["city"] = current_city
    return jsonify(data)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", _find_available_port()))
    url = f"http://127.0.0.1:{port}"
    print("\n" + "=" * 50)
    print("  Smart City Traffic Navigation System")
    print(f"  Open this in your browser: {url}")
    print("  Press Ctrl+C to stop the server")
    print("=" * 50 + "\n")
    app.run(debug=True, host="127.0.0.1", port=port, use_reloader=False)
