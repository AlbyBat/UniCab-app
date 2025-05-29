import L from 'leaflet';

export function useMapTools() {
  async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'carpooling-app/1.0' }
    });
    const data = await response.json();
    if (!data || data.length === 0) throw new Error(`Impossibile trovare coordinate per: ${address}`);
    return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
  }

  function initializeMap(containerId, centerCoords) {
    const map = L.map(containerId).setView(centerCoords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    return map;
  }

  async function drawRoute(map, startCoords, endCoords) {
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.routes && data.routes.length) {
      const route = data.routes[0].geometry;
      const routeLayer = L.geoJSON(route, {
        style: { color: 'blue', weight: 4 }
      }).addTo(map);
      const coords = route.coordinates.map(c => [c[1], c[0]]);
      map.fitBounds(coords);
      return routeLayer;
    } else {
      throw new Error('Nessun percorso trovato');
    }
  }

  return {
    geocodeAddress,
    initializeMap,
    drawRoute
  };
}
