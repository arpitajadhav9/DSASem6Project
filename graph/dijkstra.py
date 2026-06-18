"""Dijkstra's shortest path algorithm for traffic-aware navigation."""

from __future__ import annotations

import heapq
from dataclasses import dataclass, field
from typing import Dict, List, Literal, Optional, Tuple

from .city_graph import CityGraph, Road

WeightMode = Literal["time", "distance"]


@dataclass
class PathResult:
    """Result of a shortest-path computation."""

    path: List[str]
    total_weight: float
    total_distance_km: float
    total_time_min: float
    segments: List[dict] = field(default_factory=list)
    reachable: bool = True

    def to_dict(self) -> dict:
        return {
            "path": self.path,
            "path_names": [s["to_name"] for s in self.segments] if self.segments else [],
            "total_weight": round(self.total_weight, 2),
            "total_distance_km": round(self.total_distance_km, 2),
            "total_time_min": round(self.total_time_min, 2),
            "segments": self.segments,
            "reachable": self.reachable,
        }


def _edge_weight(road: Road, mode: WeightMode) -> float:
    if mode == "time":
        return road.travel_time_min
    return road.distance_km


def dijkstra(
    graph: CityGraph,
    source: str,
    target: str,
    weight_mode: WeightMode = "time",
) -> PathResult:
    """
    Find shortest path using Dijkstra's algorithm.

  Uses a min-heap priority queue. Edge weights can be travel time
  (traffic-aware) or raw distance.
    """
    if source not in graph.junctions or target not in graph.junctions:
        return PathResult([], 0, 0, 0, reachable=False)

    if source == target:
        j = graph.junctions[source]
        return PathResult(
            [source],
            0,
            0,
            0,
            segments=[
                {
                    "from": source,
                    "to": source,
                    "from_name": j.name,
                    "to_name": j.name,
                    "distance_km": 0,
                    "time_min": 0,
                    "traffic_factor": 1.0,
                }
            ],
        )

    dist: Dict[str, float] = {source: 0.0}
    prev: Dict[str, Optional[str]] = {source: None}
    heap: List[Tuple[float, str]] = [(0.0, source)]
    visited: set[str] = set()

    while heap:
        current_dist, u = heapq.heappop(heap)
        if u in visited:
            continue
        visited.add(u)

        if u == target:
            break

        for road in graph.neighbors(u):
            v = road.to_id
            weight = _edge_weight(road, weight_mode)
            new_dist = current_dist + weight
            if v not in dist or new_dist < dist[v]:
                dist[v] = new_dist
                prev[v] = u
                heapq.heappush(heap, (new_dist, v))

    if target not in dist:
        return PathResult([], 0, 0, 0, reachable=False)

    path: List[str] = []
    node: Optional[str] = target
    while node is not None:
        path.append(node)
        node = prev.get(node)
    path.reverse()

    total_distance = 0.0
    total_time = 0.0
    segments: List[dict] = []

    for i in range(len(path) - 1):
        road = graph.get_road(path[i], path[i + 1])
        if road is None:
            continue
        total_distance += road.distance_km
        total_time += road.travel_time_min
        segments.append(
            {
                "from": road.from_id,
                "to": road.to_id,
                "from_name": graph.junctions[road.from_id].name,
                "to_name": graph.junctions[road.to_id].name,
                "distance_km": round(road.distance_km, 2),
                "time_min": round(road.travel_time_min, 2),
                "traffic_factor": road.traffic_factor,
            }
        )

    return PathResult(
        path=path,
        total_weight=dist[target],
        total_distance_km=total_distance,
        total_time_min=total_time,
        segments=segments,
    )


def compare_routes(graph: CityGraph, source: str, target: str) -> dict:
    """Compare fastest (time-based) vs shortest (distance-based) routes."""
    fastest = dijkstra(graph, source, target, weight_mode="time")
    shortest = dijkstra(graph, source, target, weight_mode="distance")

    time_saved = 0.0
    distance_diff = 0.0
    recommendation = "Both routes are identical."

    if fastest.reachable and shortest.reachable:
        time_saved = shortest.total_time_min - fastest.total_time_min
        distance_diff = fastest.total_distance_km - shortest.total_distance_km
        if fastest.path == shortest.path:
            recommendation = (
                "Fastest and shortest routes coincide — "
                "no trade-off on this trip."
            )
        elif time_saved > 0:
            recommendation = (
                f"Take the fastest route to save {time_saved:.1f} min "
                f"({abs(distance_diff):.2f} km {'longer' if distance_diff > 0 else 'shorter'})."
            )
        else:
            recommendation = (
                f"Take the shortest route — it is also the fastest "
                f"({shortest.total_distance_km:.2f} km)."
            )

    return {
        "fastest": fastest.to_dict(),
        "shortest": shortest.to_dict(),
        "comparison": {
            "time_saved_min": round(max(time_saved, 0), 2),
            "distance_difference_km": round(distance_diff, 2),
            "same_route": fastest.path == shortest.path,
            "recommendation": recommendation,
        },
    }
