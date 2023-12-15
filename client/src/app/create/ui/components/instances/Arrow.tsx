import { CurvePathData } from '@elfalem/leaflet-curve';
import {
  EditorActions,
  EditorContext,
  ToolbarButtons,
} from 'context/EditorProvider';
import { CircleMarker } from 'react-leaflet';
import L, { map } from 'leaflet';
import '@elfalem/leaflet-curve';
import { useContext, useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import { IArrowInstance } from 'types/MHJSON';
import {
  IPoint,
  scalePoint,
  addPoints,
  pointDistance,
  projectOnto,
  zero,
} from '../helpers/ArrowFixer';
import Text from './Text';
import { DeltaType, TargetType } from 'types/delta';

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
  ].map(p => [p.y, p.x]);
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
  arrow: IArrowInstance;
  id: number;
}

export default function (props: ArrowProps) {
  const map = useMap();
  const [arrow, setArrow] = useState<IArrowInstance>(props.arrow);
  const layers = useRef<Array<L.Layer>>([]);
  const [draggingCtrl, setDraggingCtrl] = useState(-1);
  const [ctrlLatlng, setCtrlLaglng] = useState<[number, number]>([0, 0]);
  const controlLayers = useRef<Array<L.CircleMarker>>([]);
  const tool = useRef<ToolbarButtons | null>(null);
  const isErasing = useRef(false);
  const editorContext = useContext(EditorContext);

  useEffect(() => {
    tool.current = editorContext.state.selectedTool;
    isErasing.current = editorContext.state.isDeleting;
  }, [editorContext.state.selectedTool, editorContext.state.isDeleting]);

  function handleClick(ev: L.LeafletEvent, id: number) {
    console.log('tool is ' + tool);
    if (tool.current === ToolbarButtons.select) {
      editorContext.dispatch({
        type: EditorActions.SET_SELECTED,
        payload: {
          selectedItem: {
            type: TargetType.ARROW,
            id: id,
            subid: '-1',
          },
        },
      });
    }
  }

  function forceDrawArrow() {
    layers.current.forEach(c => {
      map.removeLayer(c);
    });
    while (layers.current.length !== 0) {
      layers.current.pop();
    }
    // let l: Array<L.Layer> = [];

    let p = arrow.interpolationPoints;
    let pdata = producePath(p[0], p[1], p[2], p[3]);
    let path = L.curve(pdata[0], {
      color: arrow.color,
      stroke: true,
      opacity: arrow.opacity,
      weight: arrow.capacity,
      lineCap: 'butt',
    });
    let headPoints = getArrowhead(pdata[1][0], pdata[1][1], arrow.capacity / 5);
    let head = L.polygon(
      headPoints.map(x => [x.y, x.x]),
      {
        color: arrow.color,
        fill: true,
        opacity: arrow.opacity,
        fillOpacity: arrow.opacity,
        weight: 1,
        lineCap: 'butt',
      },
    );
    [head, path].forEach(layer => {
      layer.addEventListener('click', ev => {
        handleClick(ev, props.id);
        L.DomEvent.stopPropagation(ev);
      });
      layer.addEventListener('mousedown', ev => {
        if (tool.current === ToolbarButtons.erase) {
          deleteSelf();
        }
      });
      layer.addEventListener('mousemove', ev => {
        if (isErasing.current) {
          deleteSelf();
        }
      });
    });
    layers.current.push(path);
    layers.current.push(head);
    map.addLayer(path);
    map.addLayer(head);
    controlLayers.current.forEach(x => {
      if (x) {
        x.bringToFront();
      }
    });
    // setLayers(l);
  }

  useEffect(() => {
    forceDrawArrow();
    return () => {
      layers.current.forEach(c => {
        map.removeLayer(c);
      });
    };
  }, []);

  //   useEffect(() => {
  //     if (lastArrow !== arrow) {
  //       forceDrawArrow();
  //       lastArrow = arrow;
  //     }
  //   });

  function handleIPointMouseDown(ev: L.LeafletMouseEvent, subid: number) {
    L.DomEvent.stopPropagation(ev);
    if (tool.current === ToolbarButtons.select) {
      setDraggingCtrl(subid);
      setCtrlLaglng([ev.latlng.lat, ev.latlng.lng]);
    }

    if (tool.current === ToolbarButtons.erase) {
      deleteSelf();
    }
  }

  function handleIPointMouseMove(
    ev: L.LeafletMouseEvent,
    id: number,
    subid: number,
  ) {
    let thisIsSelected =
      editorContext.state.selectedItem &&
      editorContext.state.selectedItem.id === id &&
      editorContext.state.selectedItem.type == TargetType.ARROW &&
      tool.current === ToolbarButtons.select &&
      draggingCtrl >= 0 &&
      draggingCtrl <= 3;
    if (thisIsSelected) {
      L.DomEvent.stopPropagation(ev);

      setCtrlLaglng([ev.latlng.lat, ev.latlng.lng]);
      let newArrow = { ...arrow };
      newArrow.interpolationPoints[draggingCtrl].y = ev.latlng.lat;
      newArrow.interpolationPoints[draggingCtrl].x = ev.latlng.lng;
      setArrow(newArrow);
      forceDrawArrow();
    }
  }

  function handleIPointMouseUp(ev: L.LeafletEvent, subid: number) {
    if (draggingCtrl !== -1) {
      L.DomEvent.stopPropagation(ev);
      setDraggingCtrl(-1);
      setCtrlLaglng([0, 0]);
      editorContext.helpers.addDelta(
        editorContext,
        {
          type: DeltaType.UPDATE,
          targetType: TargetType.ARROW,
          target: [editorContext.state.map_id, props.id, '-1'],
          payload: arrow,
        },
        {
          type: DeltaType.UPDATE,
          targetType: TargetType.ARROW,
          target: [editorContext.state.map_id, props.id, '-1'],
          payload: props.arrow,
        },
      );
    }
  }

  function produceInterpolation(): Array<JSX.Element> {
    let sel = editorContext.state.selectedItem;
    if (sel?.type === TargetType.ARROW && sel.id === props.id) {
      let ipoints =
        editorContext.state.map?.arrowsData[sel.id].interpolationPoints;
      if (ipoints === undefined) {
        return [];
      }
      return ipoints.map((p, i) => {
        let coord = i === draggingCtrl ? ctrlLatlng : L.latLng(p.y, p.x);
        let mark = (
          <CircleMarker
            ref={x => {
              if (x) {
                controlLayers.current[i] = x;
              }
            }}
            key={`ctrl-${i}@${JSON.stringify(coord)}`}
            center={coord}
            radius={20}
            eventHandlers={{
              mousedown(ev) {
                handleIPointMouseDown(ev, i);
                L.DomEvent.stopPropagation(ev);
              },
              mousemove(ev) {
                handleIPointMouseMove(ev, sel!.id, i);
                L.DomEvent.stopPropagation(ev);
              },
              mouseup(ev) {
                handleIPointMouseUp(ev, i);
                L.DomEvent.stopPropagation(ev);
              },
            }}
          ></CircleMarker>
        );
        return mark;
      });
    }
    return [];
  }

  function deleteSelf() {
    console.log('deleting self');
    editorContext.helpers.addDelta(
      editorContext,
      {
        type: DeltaType.DELETE,
        targetType: TargetType.ARROW,
        target: [editorContext.state.map_id, props.id, '-1'],
        payload: {},
      },
      {
        type: DeltaType.CREATE,
        targetType: TargetType.ARROW,
        target: [editorContext.state.map_id, props.id, '-1'],
        payload: structuredClone(props.arrow),
      },
    );
  }

  function produceLabel() {
    let xs = arrow.interpolationPoints.map(p => p.x);
    let ys = arrow.interpolationPoints.map(p => p.y);
    let minx = Math.min(...xs);
    let miny = Math.min(...ys);
    let box = [minx, miny, Math.max(...xs) - minx, Math.max(...ys) - miny] as [
      number,
      number,
      number,
      number,
    ];
    return (
      <Text
        value={[props.arrow.label]}
        box={box}
        // mapClickHandler={handleMapClick}
        key={`arrow_lbl${props.id}${box}${props.arrow.label}`}
      ></Text>
    );
  }

  return (
    <>
      {produceInterpolation()}
      {produceLabel()}
    </>
  );
}
