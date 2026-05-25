import { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../api/axios'


const CATEGORY_COLORS = {
  'GRID_ONLY':  '#5EA8FF',
  'GRID_GEN':   '#22C55E',
  'SOLAR_ONLY': '#FFCC00',
  'GEN_ONLY':   '#F97316',
}

export default function MapSites() {
  const [sites, setSites] = useState([])

  useEffect(() => {
    api.get('/sites?limit=1000').then((r) => setSites(r.data.items || []))
  }, [])

  return (
    <div style={{ height: 'calc(100vh - 56px)', width: '100%' }}>
      <MapContainer
        center={[7.54, -5.55]}
        zoom={7}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="CartoDB"
        />
        {sites
          .filter((s) => s.latitude && s.longitude)
          .map((site) => (
            <CircleMarker
              key={site.code_site}
              center={[site.latitude, site.longitude]}
              radius={6}
              fillColor={CATEGORY_COLORS[site.categorie] || '#fff'}
              color="#fff"
              weight={1}
              fillOpacity={0.8}
            >
              <Popup>
                <b>{site.nom}</b><br />
                {site.code_site}<br />
                {site.categorie} · {site.sbc}<br />
                {site.sto}
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>
    </div>
  )
}
