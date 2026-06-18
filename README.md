# Smart City Traffic Navigation System

A **Graph + Dijkstra Algorithm** based navigation system for smart cities. It finds the shortest and fastest routes between locations while accounting for live traffic congestion.

**Industry:** Smart Transportation  
**DSA Concepts:** Weighted Graph, Adjacency List, Priority Queue (Min-Heap), Dijkstra's Algorithm

---

## Core Features & Functionalities

| Feature | Description |
|---------|-------------|
| **Weighted Graph Model** | Roads are edges; junctions are nodes. Each edge stores distance, base speed, and a traffic congestion factor. |
| **Dijkstra Shortest Path** | Computes optimal routes using a min-heap priority queue in `O((V + E) log V)` time. |
| **Traffic-Aware Routing** | Edge weights adapt to congestion — travel time increases when traffic factor rises, steering routes away from jams. |
| **Distance-Based Routing** | Alternative mode finds the physically shortest path regardless of traffic. |
| **Graph Visualization** | Interactive canvas map showing junctions, roads, congestion levels, and highlighted routes. |
| **Route Comparison Report** | Side-by-side analysis of fastest vs shortest routes with a recommendation. |
| **Traffic Simulation** | Simulates live congestion on major roads to demonstrate dynamic re-routing. |

---

## Target Users & Usage Scenarios

| User | Scenario |
|------|----------|
| **Daily commuters** | Plan the fastest route from home to office during rush hour. |
| **City transport authorities** | Analyze how congestion on specific roads affects overall traffic flow. |
| **Emergency services** | Find the quickest path to hospitals while avoiding blocked roads. |
| **Delivery/logistics fleets** | Optimize multi-stop routes based on real-time traffic data. |
| **Students/researchers** | Study graph algorithms and smart city transportation models. |

---

## Expected Inputs & Outputs

### Inputs
- **Source junction** — starting location (e.g., `J1 — Central Station`)
- **Destination junction** — target location (e.g., `J6 — Airport Road`)
- **Routing mode** — `time` (fastest) or `distance` (shortest)
- **Traffic data** — congestion factors on roads (1.0 = clear, up to 5.0 = severe)

### Outputs
- **Route path** — ordered list of junctions from source to destination
- **Step-by-step directions** — each segment with distance, time, and traffic level
- **Total distance** — in kilometers
- **Total travel time** — in minutes (traffic-adjusted)
- **Comparison report** — fastest vs shortest route metrics and recommendation
- **Visual map** — highlighted route on the city graph

---

## Scalability, Usability & Performance

### Scalability
- **Adjacency list** representation scales efficiently for sparse road networks (typical of cities).
- Dijkstra runs in `O((V + E) log V)` — suitable for city-scale graphs with thousands of junctions.
- Graph data is loaded from JSON and can be swapped for a database or GIS import at scale.
- Traffic updates modify edge weights in-place without rebuilding the graph.

### Usability
- Clean web UI with dropdown selectors for junctions.
- Color-coded map: gray (normal), orange/red (congested), cyan (fastest route), purple (shortest route).
- One-click traffic simulation and reset.
- Plain-language route comparison recommendations.

### Performance
- Min-heap (`heapq`) ensures Dijkstra visits each node once with efficient edge relaxation.
- In-memory graph enables sub-millisecond routing for the demo city (10 junctions, 36 roads).
- Canvas rendering avoids heavy third-party visualization libraries.

---

## How DSA Improves Product Efficiency

1. **Graph abstraction** models the city naturally — junctions and roads map directly to nodes and weighted edges.
2. **Dijkstra's algorithm** guarantees the optimal shortest path for non-negative weights, which is essential when edge weights represent travel time.
3. **Priority queue** avoids brute-force path enumeration (`O(n!)` for all simple paths) and delivers results in polynomial time.
4. **Dual weight modes** (time vs distance) reuse the same algorithm with different edge weight functions — demonstrating polymorphism in DSA design.
5. **Dynamic traffic weights** let the same graph structure support real-time re-routing without structural changes.

---

## Project Structure

```
DSASem6Project/
├── app.py                  # Flask web server & REST API
├── requirements.txt
├── graph/
│   ├── city_graph.py       # Graph data structures (Junction, Road, CityGraph)
│   └── dijkstra.py         # Dijkstra algorithm & route comparison
├── data/
│   └── city_map.json       # Sample smart city map (10 junctions)
├── templates/
│   └── index.html          # Web UI
└── static/
    ├── css/style.css
    └── js/
        ├── app.js           # Frontend logic
        └── graph-viz.js     # Canvas graph visualization
```

---

## Setup & Run

### Prerequisites
- Python 3.10+

### Installation

```bash
cd DSASem6Project
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Start the Application

```bash
python app.py
```

Open **http://127.0.0.1:5000** in your browser.

---

## How to Use

1. Select a **source** and **destination** junction.
2. Click **Find Route** to see the path on the map with distance and time.
3. Click **Compare Routes** to get a fastest vs shortest route report.
4. Click **Simulate Traffic** to add congestion — then re-route to see Dijkstra avoid jammed roads.
5. Click **Reset Traffic** to clear congestion.

### Example API Calls

```bash
# Get city graph
curl http://127.0.0.1:5000/api/graph

# Find fastest route
curl -X POST http://127.0.0.1:5000/api/route \
  -H "Content-Type: application/json" \
  -d '{"source": "J1", "target": "J6", "mode": "time"}'

# Compare routes
curl -X POST http://127.0.0.1:5000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"source": "J1", "target": "J10"}'
```

---

## Deliverables Checklist

- [x] **Graph visualization** — Canvas-based city map with color-coded roads and routes
- [x] **Shortest path calculation module** — `graph/dijkstra.py` with heap-based Dijkstra
- [x] **Traffic-aware routing output** — Travel time adjusts with congestion factor
- [x] **Route comparison report** — Fastest vs shortest side-by-side with recommendation

---

## Demo City Map

The sample city includes 10 junctions:

| ID | Location |
|----|----------|
| J1 | Central Station |
| J2 | City Mall |
| J3 | Tech Park |
| J4 | Hospital |
| J5 | University |
| J6 | Airport Road |
| J7 | Industrial Zone |
| J8 | Residential Block A |
| J9 | Stadium |
| J10 | Business District |

---

## Future Enhancements

- A* heuristic for faster search on large maps
- Real-time traffic API integration (Google Maps, HERE)
- Multi-stop route optimization (Traveling Salesman variant)
- Historical traffic pattern analysis
- Mobile-responsive PWA version
