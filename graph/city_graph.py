"""Weighted graph representation for smart city roads and junctions."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple


@dataclass
class Junction:
    """A node in the city graph representing a road intersection."""

    id: str
    name: str
    lat: float = 0.0
    lng: float = 0.0
    x: float = 0.0
    y: float = 0.0


@dataclass
class Road:
    """A directed edge between two junctions with distance and traffic data."""

    from_id: str
    to_id: str
    distance_km: float
    base_speed_kmh: float
    traffic_factor: float = 1.0

    @property
    def travel_time_min(self) -> float:
        """Travel time in minutes, adjusted for traffic congestion."""
        effective_speed = max(self.base_speed_kmh / self.traffic_factor, 5.0)
        return (self.distance_km / effective_speed) * 60

    def with_traffic(self, factor: float) -> "Road":
        return Road(
            self.from_id,
            self.to_id,
            self.distance_km,
            self.base_speed_kmh,
            factor,
        )


@dataclass
class CityGraph:
    """Adjacency-list weighted graph for city navigation."""

    junctions: Dict[str, Junction] = field(default_factory=dict)
    roads: List[Road] = field(default_factory=list)
    _adjacency: Dict[str, List[Road]] = field(default_factory=dict, repr=False)

    def add_junction(self, junction: Junction) -> None:
        self.junctions[junction.id] = junction
        self._adjacency.setdefault(junction.id, [])

    def add_road(self, road: Road) -> None:
        self.roads.append(road)
        self._adjacency.setdefault(road.from_id, []).append(road)
        self._adjacency.setdefault(road.to_id, [])

    def neighbors(self, junction_id: str) -> List[Road]:
        return self._adjacency.get(junction_id, [])

    def get_road(self, from_id: str, to_id: str) -> Optional[Road]:
        for road in self.neighbors(from_id):
            if road.to_id == to_id:
                return road
        return None

    def update_traffic(self, from_id: str, to_id: str, factor: float) -> bool:
        road = self.get_road(from_id, to_id)
        if road is None:
            return False
        road.traffic_factor = max(1.0, min(factor, 5.0))
        return True

    def reset_traffic(self) -> None:
        for road in self.roads:
            road.traffic_factor = 1.0

    def to_dict(self) -> dict:
        return {
            "junctions": [
                {
                    "id": j.id,
                    "name": j.name,
                    "lat": j.lat,
                    "lng": j.lng,
                    "x": j.x,
                    "y": j.y,
                }
                for j in self.junctions.values()
            ],
            "roads": [
                {
                    "from": r.from_id,
                    "to": r.to_id,
                    "distance_km": r.distance_km,
                    "base_speed_kmh": r.base_speed_kmh,
                    "traffic_factor": r.traffic_factor,
                    "travel_time_min": round(r.travel_time_min, 2),
                }
                for r in self.roads
            ],
        }

    @classmethod
    def from_dict(cls, data: dict) -> "CityGraph":
        graph = cls()
        for item in data["junctions"]:
            graph.add_junction(
                Junction(
                    id=item["id"],
                    name=item["name"],
                    lat=item.get("lat", 0.0),
                    lng=item.get("lng", 0.0),
                    x=item.get("x", 0.0),
                    y=item.get("y", 0.0),
                )
            )
        for item in data["roads"]:
            graph.add_road(
                Road(
                    from_id=item["from"],
                    to_id=item["to"],
                    distance_km=item["distance_km"],
                    base_speed_kmh=item["base_speed_kmh"],
                    traffic_factor=item.get("traffic_factor", 1.0),
                )
            )
        return graph

    @classmethod
    def load(cls, path: Path) -> "CityGraph":
        with open(path, encoding="utf-8") as f:
            return cls.from_dict(json.load(f))
