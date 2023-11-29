import {
  EditorActions,
  IEditorContext,
  IEditorState,
} from 'context/EditorProvider';
import { IDotDensityProps, IDotInstance } from 'types/MHJSON';
import { DeltaPayload, DeltaType, TargetType } from 'types/delta';
import { IInputProps, PropertyPanelInputType } from './PropertyInput';
import { MutableRefObject } from 'react';
import { GeoJSONVisitor } from 'context/editorHelpers/GeoJSONVisitor';

let numType: PropertyPanelInputType = 'number';
let dotType: PropertyPanelInputType = 'dot';
let textType: PropertyPanelInputType = 'text';
let colorType: PropertyPanelInputType = 'color';

export type DotPanelData = IDotDensityProps | IDotInstance;

function updateField(
  ctx: MutableRefObject<IEditorContext>,
  id: number,
  typ: TargetType,
  fieldName: keyof DeltaPayload,
  v0: any,
  vf: any,
  subobjid?: string,
) {
  let pf: DeltaPayload = {};
  pf[fieldName] = vf;
  let p0: DeltaPayload = {};
  p0[fieldName] = v0;
  let subid = subobjid ?? '-1';
  ctx.current.helpers.addDelta(
    ctx.current,
    {
      type: DeltaType.UPDATE,
      targetType: typ,
      target: [ctx.current.state.map_id, id, subid],
      payload: pf,
    },
    {
      type: DeltaType.UPDATE,
      targetType: typ,
      target: [ctx.current.state.map_id, id, subid],
      payload: p0,
    },
  );
}

/**
 * Makes the dotpanel action
 * @param ctx
 * @param dotDensityProps
 * @param dotInstance
 * @param id
 * @returns
 */
export function makeDotPanel(
  ctx: MutableRefObject<IEditorContext>,
  dotClass: IDotDensityProps,
  dotInstance: IDotInstance,
  id: number,
): {
  type: EditorActions;
  payload: Partial<IEditorState>;
} {
  let loadedMap = ctx.current.state.map!;
  // find the classid
  let classId = 0;
  let globalDotsData = ctx.current.state.map!.globalDotDensityData;
  for (let dc = 0; dc < globalDotsData.length; dc++) {
    if (
      ctx.current.state.map!.globalDotDensityData[dc].name === dotInstance.dot
    ) {
      classId = dc;
      break;
    }
  }
  let action = {
    type: EditorActions.SET_PANEL,
    payload: {
      propertiesPanel: [
        {
          name: 'Local Dot',
          items: [
            {
              name: 'X',
              input: {
                type: numType,
                short: true,
                disabled: false,
                value: dotInstance.x.toString(),
                onChange(val: string) {
                  updateField(
                    ctx,
                    id,
                    TargetType.DOT,
                    'x',
                    dotInstance.x.toString(),
                    val,
                  );
                },
              },
            },
            {
              name: 'Y',
              input: {
                type: numType,
                short: true,
                disabled: false,
                value: dotInstance.y.toString(),
                onChange(val: string) {
                  updateField(
                    ctx,
                    id,
                    TargetType.DOT,
                    'y',
                    dotInstance.y.toString(),
                    val,
                  );
                },
              },
            },
            {
              name: 'Dot',
              input: {
                type: dotType,
                short: true,
                disabled: false,
                value: loadedMap.globalDotDensityData.map(el => el.name),
                onChange(val: string) {
                  updateField(
                    ctx,
                    id,
                    TargetType.DOT,
                    'dot',
                    loadedMap.globalDotDensityData.map(el => el.name),
                    val,
                  );
                },
              },
            },
            {
              name: 'Scale',
              input: {
                type: numType,
                short: true,
                disabled: false,
                value: dotInstance.scale.toString(),
                onChange(val: string) {
                  updateField(
                    ctx,
                    id,
                    TargetType.DOT,
                    'scale',
                    dotInstance.scale.toString(),
                    val,
                  );
                },
              },
            },
          ],
        },
        {
          name: 'Global Dot',
          items: [
            {
              name: 'Dot Name',
              input: {
                type: textType,
                short: false,
                disabled: false,
                value: dotClass.name,
                onChange(val: string) {
                  updateField(
                    ctx,
                    classId,
                    TargetType.GLOBAL_DOT,
                    'name',
                    dotClass.name,
                    val,
                  );
                },
              },
            },
            {
              name: 'Dot Color',
              input: {
                type: colorType,
                short: false,
                disabled: false,
                value: dotClass.color,
                onChange(val: string) {
                  updateField(
                    ctx,
                    classId,
                    TargetType.GLOBAL_DOT,
                    'color',
                    dotClass.color,
                    val,
                  );
                },
              },
            },
            {
              name: 'Dot Opacity',
              input: {
                type: numType,
                short: false,
                disabled: false,
                value: dotClass.opacity.toString(),
                onChange(val: string) {
                  updateField(
                    ctx,
                    classId,
                    TargetType.GLOBAL_DOT,
                    'opacity',
                    dotClass.opacity.toString(),
                    val,
                  );
                },
              },
            },
            {
              name: 'Dot Size',
              input: {
                type: numType,
                short: false,
                disabled: false,
                value: dotClass.size.toString(),
                onChange(val: string) {
                  updateField(
                    ctx,
                    classId,
                    TargetType.GLOBAL_DOT,
                    'size',
                    dotClass.size.toString(),
                    val,
                  );
                },
              },
            },
          ],
        },
      ],
    },
  };

  return action;
}

export function makeRegionPanel(
  ctx: MutableRefObject<IEditorContext>,
  id: number,
): {
  type: EditorActions;
  payload: Partial<IEditorState>;
} {
  let m = ctx.current.state.map!;
  let v = new GeoJSONVisitor(m.geoJSON, true);
  v.visitRoot();
  let feature = v.getFeatureResults().perFeature[id].originalFeature;
  let action = {
    type: EditorActions.SET_PANEL,
    payload: {
      propertiesPanel: [
        {
          name: 'Labels',
          // TODO: force unundefined
          items: ctx.current.state.map!.labels.map(
            (
              lbl,
            ): {
              name: string;
              input: IInputProps;
            } => {
              let cv = 'undefined';
              let t = feature.properties;
              console.log(t);
              console.log('label is ' + lbl);
              if (t && t[lbl]) {
                cv = t[lbl].toString();
              }
              return {
                name: lbl,
                input: {
                  type: 'text',
                  short: false,
                  disabled: false,
                  value: cv,
                  onChange(val) {
                    updateField(
                      ctx,
                      id,
                      TargetType.GEOJSONDATA,
                      'propertyValue',
                      cv,
                      val,
                      lbl,
                    );
                  },
                },
              };
            },
          ),
        },
        {
          name: 'Colors',
          items: [
            {
              name: 'Feature Color',
              input: {
                type: colorType,
                short: true,
                disabled: false,
                value: m.regionsData[id]?.color ?? '#FFFFFF',
                onChange(val: string) {
                  updateField(
                    ctx,
                    id,
                    TargetType.REGION,
                    'color',
                    m.regionsData[id]?.color ?? '#FFFFFF',
                    val,
                  );
                },
              },
            },
          ],
        },
      ],
    },
  };
  return action;
}
