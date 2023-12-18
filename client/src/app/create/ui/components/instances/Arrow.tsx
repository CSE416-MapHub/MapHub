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
  getArrowhead,
  producePath,
} from '../helpers/ArrowFixer';
import Text from './Text';
import { DeltaType, TargetType } from 'types/delta';

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
