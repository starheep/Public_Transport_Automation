let map;
let busMarkers = {};
let routes = [];
let buses = [];

window.onload = () => {
    initializeMap();
    loadRoutes();
    document.getElementById('routeSelect').addEventListener('change', onRouteChange);
};

function initializeMap() {
    map = L.map('map').setView([28.6139, 77.2090], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);
}

async function loadRoutes() {
    const res = await fetch('data/routes.json');
    routes = await res.json();

    const select = document.getElementById('routeSelect');
    routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route.routeId;
        option.textContent = route.name;
        select.appendChild(option);
    });
}

async function onRouteChange() {
    const routeId = document.getElementById('routeSelect').value;
    if (!routeId) return;

    await loadBuses(routeId);
    updateMap();
    // Refresh every 10 seconds
    setInterval(async () => {
        await loadBuses(routeId);
        updateMap();
    }, 10000);
}

async function loadBuses(routeId) {
    const res = await fetch('data/buses.json');
    const allBuses = await res.json();
    buses = allBuses.filter(bus => bus.routeId === routeId);
}

function updateMap() {
    // Clear old markers
    for (let id in busMarkers) {
        map.removeLayer(busMarkers[id]);
    }
    busMarkers = {};

    buses.forEach(bus => {
        const marker = L.marker([bus.latitude, bus.longitude]).addTo(map)
            .bindPopup(`Bus ${bus.busId}<br>ETA: ${bus.eta}`);
        busMarkers[bus.busId] = marker;
    });

    if (buses.length > 0) {
        const { latitude, longitude } = buses[0];
        map.setView([latitude, longitude], 13);
    }
}

