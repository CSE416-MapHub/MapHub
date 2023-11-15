'use client';

import * as G from 'geojson';
import {
  MapContainer,
  GeoJSON,
  TileLayer,
  Marker,
  Popup,
  SVGOverlay,
} from 'react-leaflet';
import style from './Map.module.scss';
// import 'leaflet/dist/leaflet.css';
// TODO: delete this
const geojsonData: G.GeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'USA-NY',
      properties: { fips: '36', name: 'New York' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-73.343806, 45.013027],
            [-73.332852, 44.804903],
            [-73.387622, 44.618687],
            [-73.294514, 44.437948],
            [-73.321898, 44.246255],
            [-73.436914, 44.043608],
            [-73.349283, 43.769761],
            [-73.404052, 43.687607],
            [-73.245221, 43.523299],
            [-73.278083, 42.833204],
            [-73.267129, 42.745573],
            [-73.508114, 42.08834],
            [-73.486206, 42.050002],
            [-73.55193, 41.294184],
            [-73.48073, 41.21203],
            [-73.727192, 41.102491],
            [-73.655992, 40.987475],
            [-73.22879, 40.905321],
            [-73.141159, 40.965568],
            [-72.774204, 40.965568],
            [-72.587988, 40.998429],
            [-72.28128, 41.157261],
            [-72.259372, 41.042245],
            [-72.100541, 40.992952],
            [-72.467496, 40.845075],
            [-73.239744, 40.625997],
            [-73.562884, 40.582182],
            [-73.776484, 40.593136],
            [-73.935316, 40.543843],
            [-74.022947, 40.708151],
            [-73.902454, 40.998429],
            [-74.236547, 41.14083],
            [-74.69661, 41.359907],
            [-74.740426, 41.431108],
            [-74.89378, 41.436584],
            [-75.074519, 41.60637],
            [-75.052611, 41.754247],
            [-75.173104, 41.869263],
            [-75.249781, 41.863786],
            [-75.35932, 42.000709],
            [-79.76278, 42.000709],
            [-79.76278, 42.252649],
            [-79.76278, 42.269079],
            [-79.149363, 42.55388],
            [-79.050778, 42.690804],
            [-78.853608, 42.783912],
            [-78.930285, 42.953697],
            [-79.012439, 42.986559],
            [-79.072686, 43.260406],
            [-78.486653, 43.375421],
            [-77.966344, 43.369944],
            [-77.75822, 43.34256],
            [-77.533665, 43.233021],
            [-77.391265, 43.276836],
            [-76.958587, 43.271359],
            [-76.695693, 43.34256],
            [-76.41637, 43.523299],
            [-76.235631, 43.528776],
            [-76.230154, 43.802623],
            [-76.137046, 43.961454],
            [-76.3616, 44.070993],
            [-76.312308, 44.196962],
            [-75.912491, 44.366748],
            [-75.764614, 44.514625],
            [-75.282643, 44.848718],
            [-74.828057, 45.018503],
            [-74.148916, 44.991119],
            [-73.343806, 45.013027],
          ],
        ],
      },
    },
  ],
};

export default function Map() {
  const position: [number, number] = [51.505, -0.09];
  const bounds: [[number, number], [number, number]] = [
    [51.49, -0.08],
    [51.5, -0.06],
  ];

  return (
    <div className={style['map-container']}>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ flex: 1, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SVGOverlay attributes={{ stroke: 'red' }} bounds={bounds}>
          <rect x="0" y="0" width="100%" height="100%" fill="blue" />
          <circle r="5" cx="10" cy="10" fill="red" />
          <text x="50%" y="50%" stroke="white">
            text
          </text>
        </SVGOverlay>
      </MapContainer>
    </div>
  );
  //   return (
  //     <MapContainer
  //       center={[-73, 45]}
  //       zoom={1}
  //       scrollWheelZoom={false}
  //       className={style['map-container']}
  //     >
  //       <GeoJSON data={geojsonData} />
  //     </MapContainer>
  //   );
}
