import { MapContainer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import style from './Map.module.scss';

import MapElements from './MapElements';

export default async function Map() {
  const center: [number, number] = [42.7539, -75.4679]; // central coords for ny
  const zoom = 6;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
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
