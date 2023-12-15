import L from 'leaflet';
import { Polyline, SVGOverlay, useMap } from 'react-leaflet';
import { IArrowInstance } from 'types/MHJSON';
import {
  IPoint,
  addPoints,
  pointDistance,
  projectOnto,
  scalePoint,
  zero,
} from '../helpers/ArrowFixer';
import '@elfalem/leaflet-curve';
import { useEffect, useState } from 'react';
import { CurvePathData } from '@elfalem/leaflet-curve';

const SMOOTH = 0.7;

export function findControls(
  p0: IPoint,
  p1: IPoint,
  p2: IPoint,
  p3: IPoint,
): [IPoint, IPoint, IPoint, IPoint, IPoint, IPoint] {
  let c1 = scalePoint(addPoints(p0, p1), 0.5);
  let c2 = scalePoint(addPoints(p1, p2), 0.5);
  let c3 = scalePoint(addPoints(p2, p3), 0.5);

  let len1 = pointDistance(p0, p1);
  let len2 = pointDistance(p1, p2);
  let len3 = pointDistance(p2, p3);

  let k1 = len1 / (len1 + len2);
  let k2 = len2 / (len2 + len3);

  let m1 = addPoints(c1, scalePoint(addPoints(c2, scalePoint(c1, -1)), k1));
  let m2 = addPoints(c2, scalePoint(addPoints(c3, scalePoint(c2, -1)), k2));

  let ctrl1 = addPoints(
    m1,
    p1,
    scalePoint(m1, -1),
    scalePoint(addPoints(c2, scalePoint(m1, -1)), SMOOTH),
  );
  let ctrl2 = addPoints(
    m2,
    p2,
    scalePoint(m2, -1),
    scalePoint(addPoints(c2, scalePoint(m2, -1)), SMOOTH),
  );

  let ctrl0 = addPoints(scalePoint(ctrl1, -1), scalePoint(p1, 2));
  let ctrl3 = addPoints(scalePoint(ctrl2, -1), scalePoint(p2, 2));

  let line1 = addPoints(p1, scalePoint(p0, -1));
  let proj0 = projectOnto(line1, addPoints(ctrl0, scalePoint(p1, -1)));
  let perp0 = addPoints(ctrl0, scalePoint(addPoints(proj0, p1), -1));
  let firstCtrl = addPoints(p0, perp0, proj0);

  let line3 = addPoints(p2, scalePoint(p3, -1));
  let proj3 = projectOnto(line3, addPoints(ctrl3, scalePoint(p2, -1)));
  let perp3 = addPoints(ctrl3, scalePoint(addPoints(proj3, p3), -1));
  let lastCtrl = addPoints(p3, perp3, proj3);

  return [firstCtrl, ctrl0, ctrl1, ctrl2, ctrl3, lastCtrl];
}

function strOf(p: IPoint): string {
  return p.x + ' ' + p.y;
}

function producePath(
  p0: IPoint,
  p1: IPoint,
  p2: IPoint,
  p3: IPoint,
): [CurvePathData, [IPoint, IPoint]] {
  let controls = findControls(p0, p1, p2, p3);
  let ans = [
    p0,
    controls[0],
    controls[1],
    p1,
    controls[2],
    controls[3],
    p2,
    controls[4],
    controls[5],
    p3,
  ].map(p => [p.x, p.y]);
  // let path = `M ${strOf(ans[0])} C ${strOf(ans[1])}, ${strOf(ans[2])}, ${strOf(
  //   ans[3],
  // )} S ${strOf(ans[5])}, ${strOf(ans[6])} S ${strOf(ans[8])}, ${strOf(
  //   ans[9],
  // )} `;
  let path = [
    'M',
    ans[0],
    'C',
    ans[1],
    ans[2],
    ans[3],
    'S',
    ans[5],
    ans[6],
    'S',
    ans[8],
    ans[9],
  ] as CurvePathData;

  return [path, [controls[5], p3]];
}

function getArrowhead(
  p0: IPoint,
  p1: IPoint,
  sz: number,
): [IPoint, IPoint, IPoint] {
  let ans: [IPoint, IPoint, IPoint] = [zero, zero, zero];
  let dist = pointDistance(p0, p1);
  let dx = (p1.x - p0.x) / dist;
  let dy = (p1.y - p0.y) / dist;
  ans[0] = {
    x: p1.x + sz * dx,
    y: p1.y + sz * dy,
  };
  ans[1] = {
    x: p1.x - sz * dy,
    y: p1.y + sz * dx,
  };
  ans[2] = {
    x: p1.x + sz * dy,
    y: p1.y - sz * dx,
  };

  return ans;
}

interface ArrowProps {
  arrows: Array<IArrowInstance>;
}

export default function (props: ArrowProps) {
  const map = useMap();
  const [arrows, setArrows] = useState<Array<IArrowInstance>>([]);
  const [layers, setLayers] = useState<Array<L.Layer>>([]);

  useEffect(() => {
    if (props.arrows !== arrows) {
      setArrows(props.arrows);
      layers.forEach(c => {
        map.removeLayer(c);
      });
      let l: Array<L.Layer> = [];
      for (let arrow of props.arrows) {
        let p = arrow.interpolationPoints;
        let pdata = producePath(p[0], p[1], p[2], p[3]);
        let path = L.curve(pdata[0], {
          color: arrow.color,
          fill: false,
        });
        let headPoints = getArrowhead(
          pdata[1][0],
          pdata[1][1],
          arrow.capacity * 3,
        );
        let head = L.polygon(
          headPoints.map(x => [x.x, x.y]),
          {
            color: arrow.color,
            fill: true,
          },
        );
        l.push(path);
        l.push(head);
        map.addLayer(path);
        map.addLayer(head);
      }
      setLayers(l);
    }
  });

  return null;
  // <Polyline positions={points.map(x => [x.x, x.y])}></Polyline>
  // <SVGOverlay bounds={L.latLngBounds(L.latLng(90, -180), L.latLng(-90, 180))}>
  //   {props.arrows
  //     .map(arrow => {
  //       arrow.interpolationPoints = arrow.interpolationPoints.map(p => {
  //         return {
  //           x: -1 * p.x + 90,
  //           y: p.y + 180,
  //         };
  //       });
  //       return arrow;
  //     })
  //     .map((arrow, id) => {
  //       let points = arrow.interpolationPoints;
  //       let center = scalePoint(addPoints(points[1], points[2]), 0.5);
  //       return (
  //         <>
  //           {/* <Curve
  //             positions={producePath(
  //               points[0],
  //               points[1],
  //               points[2],
  //               points[3],
  //             )}
  //             option={{ color: 'red', fill: true }}
  //           /> */}
  //           {/* <path
  //             d={producePath(points[0], points[1], points[2], points[3])}
  //             stroke={arrow.color}
  //             opacity={arrow.opacity}
  //             strokeWidth={arrow.capacity}
  //           ></path> */}
  //           <text x={center.x} y={center.y} textAnchor="middle">
  //             <tspan
  //               dy={'1em'}
  //               x={'50%'}
  //               key={`arrow${id}@${center.x},${center.y}tspanitem${arrow.label}`}
  //             >
  //               {arrow.label}
  //             </tspan>
  //           </text>
  //         </>
  //       );
  //     })}
  // </SVGOverlay>
}
