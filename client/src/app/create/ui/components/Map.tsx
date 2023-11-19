import { MapContainer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import style from './Map.module.scss';

import MapElements from './MapElements';

export default function Map() {
  return (
    <MapContainer
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
