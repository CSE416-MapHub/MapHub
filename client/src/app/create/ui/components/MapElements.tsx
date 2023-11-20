'use client';
import { EditorActions, EditorContext } from 'context/EditorProvider';
import * as G from 'geojson';
import { Path } from 'leaflet';
import { useContext, useState, useEffect } from 'react';
import { GeoJSON, TileLayer, useMap } from 'react-leaflet';
import { IInputProps } from './PropertyInput';

export default function () {
  const editorContext = useContext(EditorContext);
  const map = useMap();
  const [eBBox, setEBBox] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    let b = editorContext.state.mapDetails.bbox;
    if (b[1] !== eBBox[0] || b[0] !== eBBox[1]) {
      let c: [number, number] = [b[1], b[0]];
      console.log('center');
      console.log(editorContext.state.mapDetails.bbox);
      setEBBox(c);
      map.setView([c[0] + b[3] / 2, c[1] + b[2] / 2], 10 - Math.log2(b[2]));
    }
  });

  if (editorContext.state.map === null) {
    return <div></div>;
  }

  return (
    <GeoJSON
      //   key={rerender}
      data={editorContext.state.map?.geoJSON}
      onEachFeature={(feature, layer) => {
        console.log(editorContext.state.mapDetails.originalRegions);
        layer.addEventListener('click', () => {
          alert('dispatching');
          let action = {
            type: EditorActions.SET_PANEL,
            payload: {
              propertiesPanel: [
                {
                  name: 'Labels',
                  // TODO: force unundefined
                  items: editorContext.state.map!.labels.map(
                    (
                      lbl,
                    ): {
                      name: string;
                      input: IInputProps;
                    } => {
                      return {
                        name: lbl,
                        input: {
                          type: 'text',
                          short: false,
                          disabled: false,
                          value:
                            // TODO: force unundefined
                            feature.properties[lbl],
                        },
                      };
                    },
                  ),
                },
              ],
            },
          };
          editorContext.dispatch(action);
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
