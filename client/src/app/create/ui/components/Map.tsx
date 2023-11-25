import { MapContainer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import style from './Map.module.scss';

import MapElements from './MapElements';
import L from 'leaflet';

export default function Map() {
  return (
    <MapContainer
      maxBoundsViscosity={100}
      center={L.latLng(0, 0)}
      zoom={0}
      className={style['mapContainer']}
      style={{
        // secondary container
        backgroundColor: '#CCEFF1',
      }}
    >
      <MapElements />
    </MapContainer>
  );
}
