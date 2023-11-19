'use client';
import { EditorActions, EditorContext } from 'context/EditorProvider';
import * as G from 'geojson';
import { Path } from 'leaflet';
import { useContext, useState, useEffect } from 'react';
import { GeoJSON, TileLayer } from 'react-leaflet';

export default function () {
  const editorContext = useContext(EditorContext);

  const [geoJSON, setGeoJSON] = useState<G.GeoJSON>({
    type: 'Point',
    coordinates: [0, 0],
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [rerender, setRerender] = useState(0);

  useEffect(() => {
    if (!isLoaded) {
      fetch(
        'https://raw.githubusercontent.com/loganpowell/census-geojson/master/GeoJSON/20m/2022/state.json',
      )
        .then(res => res.json())
        .then((g: G.GeoJSON) => {
          console.log(g);
          setGeoJSON(g);
          setRerender(rerender + 1);
          setIsLoaded(true);
        });
    } else {
      console.log('new gjeson');
      console.log(geoJSON);
    }
  });

  if (!isLoaded) {
    return <div>Loading</div>;
  }

  return (
    <GeoJSON
      key={rerender}
      data={geoJSON}
      onEachFeature={(feature, layer) => {
        layer.addEventListener('click', () => {
          editorContext.dispatch({
            type: EditorActions.SET_PANEL,
            payload: {
              propertiesPanel: [
                {
                  name: 'Labels',
                  items: [
                    {
                      name: 'ISO_NAME',
                      input: {
                        type: 'text',
                        short: false,
                        disabled: false,
                        value: 'CHAD',
                      },
                    },
                  ],
                },
              ],
            },
          });
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
  );
}
