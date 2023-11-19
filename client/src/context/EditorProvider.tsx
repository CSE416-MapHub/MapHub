import { IPropertyPanelSectionProps } from 'app/create/ui/components/PropertyPanel';
import { Dispatch, createContext, useReducer } from 'react';
import { MHJSON } from 'types/MHJSON';
import { GeoJSONVisitor, mergeBBox } from './editorHelpers/GeoJSONVisitor';

// the global state interface
export interface IEditorState {
  propertiesPanel: Array<IPropertyPanelSectionProps>;
  map: MHJSON | null;
  mapDetails: {
    availableProps: Array<string>;
    bbox: [x: number, y: number, w: number, h: number];
  };
}

// initial global state
let initialState: IEditorState = {
  propertiesPanel: [],
  map: null,
  mapDetails: {
    availableProps: [],
    bbox: [0, 0, 0, 0],
  },
};

// actions the reducer can take
export enum EditorActions {
  SET_PANEL,
  SET_MAP,
}

// the reducer
function reducer(
  prev: IEditorState,
  action: {
    type: EditorActions;
    payload: Partial<IEditorState>;
  },
): IEditorState {
  let newState: IEditorState = structuredClone(prev);
  switch (action.type) {
    case EditorActions.SET_PANEL: {
      if (action.payload.propertiesPanel) {
        newState.propertiesPanel = action.payload.propertiesPanel;
      } else {
        throw new Error('SET_PANEL must have a propertiesPanel in its payload');
      }
      break;
    }
    case EditorActions.SET_MAP: {
      if (action.payload.map) {
        newState.map = action.payload.map;
        let v = new GeoJSONVisitor(action.payload.map.geoJSON);
        v.visitRoot();
        newState.mapDetails.availableProps = Array.from(
          v.getFeatureResults().aggregate.globallyAvailableKeys,
        );
        newState.mapDetails.bbox = v
          .getFeatureResults()
          .perFeature.reduce(
            (prev, curr) => mergeBBox(prev, curr.box),
            v.getFeatureResults().perFeature[0].box,
          );
      } else {
        throw new Error('SET_MAP must have a map in its payload');
      }
      break;
    }
    default:
      throw new Error('UNHANDLED ACTION');
  }
  return newState;
}

export const EditorContext = createContext<{
  state: IEditorState;
  dispatch: Dispatch<{
    type: EditorActions;
    payload: Partial<IEditorState>;
  }>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const EditorProvider = ({ children }: React.PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
};
