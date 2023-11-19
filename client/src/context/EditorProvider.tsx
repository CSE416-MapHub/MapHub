import { IPropertyPanelSectionProps } from 'app/create/ui/components/PropertyPanel';
import { Dispatch, createContext, useReducer } from 'react';

// the global state interface
export interface IEditorState {
  propertiesPanel: Array<IPropertyPanelSectionProps>;
}

// initial global state
let initialState: IEditorState = {
  propertiesPanel: [],
};

// actions the reducer can take
export enum EditorActions {
  SET_PANEL,
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
