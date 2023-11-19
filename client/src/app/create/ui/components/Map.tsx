'use client';

import * as G from 'geojson';
import React from 'react';
import { MapContainer, GeoJSON, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import style from './Map.module.scss';
import { Path } from 'leaflet';

export default async function Map() {
  const center: [number, number] = [42.7539, -75.4679]; // central coords for ny
  const zoom = 6;

  let geojsonData: G.GeoJSON = (await (
    await fetch(
      'https://raw.githubusercontent.com/loganpowell/census-geojson/master/GeoJSON/20m/2022/state.json',
    )
  ).json()) as any as G.GeoJSON;

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
      <GeoJSON
        data={geojsonData}
        onEachFeature={(feature, layer) => {
          layer.addEventListener('click', () => {
            alert(feature.properties.NAME);
          });
          let p = layer as Path;
          p.setStyle({
            color: '#000000',
            fillColor: 'white',
            fillOpacity: 1,
            opacity: 1,
            stroke: true,
            weight: 1,
          });
        }}
      />
    </MapContainer>
  );
}
