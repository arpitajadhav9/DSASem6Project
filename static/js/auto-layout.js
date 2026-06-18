/**
 * Force-directed graph layout for auto-positioning junctions on the map.
 */
function forceDirectedLayout(junctions, roads, centerLat, centerLng, spread = 0.035) {
  const edgeSet = new Set();
  const edges = [];
  roads.forEach((road) => {
    const key = [road.from, road.to].sort().join("|");
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push([road.from, road.to]);
    }
  });

  const pos = {};
  junctions.forEach((j, i) => {
    const angle = (2 * Math.PI * i) / junctions.length;
    pos[j.id] = {
      x: Math.cos(angle) * spread * 0.4,
      y: Math.sin(angle) * spread * 0.4,
    };
  });

  const iterations = 180;
  for (let iter = 0; iter < iterations; iter++) {
    const cooling = 1 - iter / iterations;

    for (let i = 0; i < junctions.length; i++) {
      for (let j = i + 1; j < junctions.length; j++) {
        const a = junctions[i].id;
        const b = junctions[j].id;
        let dx = pos[a].x - pos[b].x;
        let dy = pos[a].y - pos[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const force = (0.0006 * cooling) / (dist * dist);
        pos[a].x += (dx / dist) * force;
        pos[a].y += (dy / dist) * force;
        pos[b].x -= (dx / dist) * force;
        pos[b].y -= (dy / dist) * force;
      }
    }

    edges.forEach(([a, b]) => {
      let dx = pos[b].x - pos[a].x;
      let dy = pos[b].y - pos[a].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      const force = dist * 0.06 * cooling;
      pos[a].x += (dx / dist) * force;
      pos[a].y += (dy / dist) * force;
      pos[b].x -= (dx / dist) * force;
      pos[b].y -= (dy / dist) * force;
    });
  }

  return junctions.map((j) => ({
    ...j,
    lat: centerLat + pos[j.id].y,
    lng: centerLng + pos[j.id].x,
  }));
}

window.forceDirectedLayout = forceDirectedLayout;
