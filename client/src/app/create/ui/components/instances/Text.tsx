import {
  EditorActions,
  EditorContext,
  ToolbarButtons,
} from 'context/EditorProvider';
import { CircleMarker, Marker, SVGOverlay, Tooltip } from 'react-leaflet';
import { useContext, useRef, useState } from 'react';
import { IDotDensityProps, IDotInstance, MHJSON } from 'types/MHJSON';
import { DeltaType, TargetType } from 'types/delta';
import L, { DivIcon } from 'leaflet';

interface DotProps {
  value: Array<string>;
  box: [x: number, y: number, w: number, h: number];
  mapClickHandler: (ev: L.LeafletMouseEvent) => void;
}

export default function ({ value, box, mapClickHandler }: DotProps) {
  const center = L.latLng(box[1] + box[3] / 2, box[0] + box[2] / 2);
  const c1: [number, number] = [box[1], box[0]];
  const c2: [number, number] = [box[1] + box[3], box[0] + box[2]];
  let htmlContent = `<div>${value.map(x => `<p>${x}</p>`)}</div>`;
  const text = (
    <SVGOverlay bounds={[c1, c2]}>
      {/* // <g x={box[1]} y={box[0]} width={box[3]} height={box[2]}> */}
      <text
        x="50%"
        y="50%"
        // width={'100%'}
        // height="100%"
        textAnchor="middle"
        transform={`translate(0 -${box[3]})`}
      >
        {value.map(x => (
          <tspan dy={'1em'} x={'50%'}>
            {x}
          </tspan>
        ))}
      </text>
      {/* </g> */}
    </SVGOverlay>
  );
  return text;
  //   return <Marker position={center} icon={text} />;
}
