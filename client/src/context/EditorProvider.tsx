import { IPropertyPanelSectionProps } from 'app/create/ui/components/property/PropertyPanel';
import { Dispatch, createContext, useReducer, useContext } from 'react';
import { IDotDensityProps, ISymbolProps, MHJSON } from 'types/MHJSON';
import {
  GeoJSONVisitor,
  IFeatureVisitResults,
  mergeBBox,
} from './editorHelpers/GeoJSONVisitor';
import * as G from 'geojson';
import {
  NotificationsActionType,
  NotificationsContext,
  NotificationsContextValue,
} from 'context/notificationsProvider';

import { ActionStack } from './editorHelpers/Actions';
import { Delta, DeltaType, TargetType } from 'types/delta';
import { DELETED_NAME, applyDelta } from './editorHelpers/DeltaUtil';
import MapAPI from 'api/MapAPI';

export enum ToolbarButtons {
  select = 'select',
  pan = 'pan',
  erase = 'erase',
  dot = 'dot',
  symbol = 'symbol',
  arrow = 'arrow',
}

// the global state interface
export interface IEditorState {
  // propertiesPanel: Array<IPropertyPanelSectionProps>;
  map: MHJSON | null;
  map_id: string;
  selectedTool: ToolbarButtons | null;
  selectedItem: null | {
    type: TargetType;
    id: number;
    subid: string;
  };
  mapDetails: {
    availableProps: Array<string>;
    bbox: [x: number, y: number, w: number, h: number];
    regionData: Array<IFeatureVisitResults>;
  };
  actionStack: ActionStack;
  lastInstantiated: string; // name of the last instantiated item
  isDeleting: boolean;
}

// initial global state
let initialState: IEditorState = {
  // propertiesPanel: [],
  map: null,
  map_id: '',
  selectedTool: null,
  mapDetails: {
    availableProps: [],
    bbox: [0, 0, 0, 0],
    regionData: [],
  },
  actionStack: new ActionStack(),
  lastInstantiated: DELETED_NAME,
  selectedItem: null,
  isDeleting: false,
};

// actions the reducer can take
export enum EditorActions {
  SET_SELECTED,
  SET_MAP,
  SET_TOOL,
  SET_TITLE,
  SET_ACTION,
  SET_DELETING,
  SET_LAST_INSTANTIATED,
}

// the reducer
function getReducer(notifications: NotificationsContextValue) {
  function reducer(
    prev: IEditorState,
    action: {
      type: EditorActions;
      payload: Partial<IEditorState>;
    },
  ): IEditorState {
    let newState: IEditorState = { ...prev };
    console.log(action);
    switch (action.type) {
      case EditorActions.SET_SELECTED: {
        if (
          action.payload.selectedItem ||
          action.payload.selectedItem === null
        ) {
          newState.selectedItem = action.payload.selectedItem;
        } else {
          throw new Error(
            'SET_SELECTED must have a selectedItem in its payload',
          );
        }
        break;
      }
      case EditorActions.SET_MAP: {
        if (action.payload.map && action.payload.map_id) {
          newState.map = action.payload.map;
          newState.map_id = action.payload.map_id;
          let geoJSON = action.payload.map.geoJSON;
          let v = new GeoJSONVisitor(geoJSON);
          v.visitRoot();
          console.log('AHHH HELOOO', v);
          if (v.getFeatureResults().perFeature.length === 0) {
            notifications.dispatch({
              type: NotificationsActionType.enqueue,
              value: {
                message: 'FEATURES LIST IS EMPTY. PLEASE PICK A DIFFERENT FILE',
                actions: {
                  close: true,
                },
              },
            });
            break;
          }
          newState.mapDetails = {
            availableProps: Array.from(
              v.getFeatureResults().aggregate.globallyAvailableKeys,
            ),
            bbox: v
              .getFeatureResults()
              .perFeature.reduce(
                (prev, curr) => mergeBBox(prev, curr.box),
                v.getFeatureResults().perFeature[0].box,
              ),
            regionData: v.getFeatureResults().perFeature,
          };
        } else {
          notifications.dispatch({
            type: NotificationsActionType.enqueue,
            value: {
              message: 'SET_MAP must have a map and a map_id in its payload',
              actions: {
                close: true,
              },
            },
          });
        }
        break;
      }
      case EditorActions.SET_TOOL: {
        if (action.payload.selectedTool !== undefined) {
          newState.selectedTool = action.payload.selectedTool;
        } else {
          notifications.dispatch({
            type: NotificationsActionType.enqueue,
            value: {
              message: 'SET_TOOL must have a tool in its payload',
              actions: {
                close: true,
              },
            },
          });
        }
        break;
      }
      case EditorActions.SET_TITLE: {
        if (action.payload.map !== undefined) {
          newState.map = action.payload.map;
        } else {
          notifications.dispatch({
            type: NotificationsActionType.enqueue,
            value: {
              message: 'SET_NAME must have a map in its payload',
              actions: {
                close: true,
              },
            },
          });
        }
        break;
      }
      case EditorActions.SET_ACTION: {
        if (
          action.payload.map !== undefined &&
          action.payload.actionStack !== undefined &&
          action.payload.lastInstantiated !== undefined
        ) {
          newState.map = action.payload.map;
          newState.actionStack = action.payload.actionStack;
          newState.lastInstantiated = action.payload.lastInstantiated;
        } else {
          notifications.dispatch({
            type: NotificationsActionType.enqueue,
            value: {
              message:
                'SET_ACTION must have a map, an actionstack, and lastInstantiated in its payload',
              actions: {
                close: true,
              },
            },
          });
        }
        break;
      }
      case EditorActions.SET_DELETING: {
        if (action.payload.isDeleting !== undefined) {
          newState.isDeleting = action.payload.isDeleting;
        } else {
          notifications.dispatch({
            type: NotificationsActionType.enqueue,
            value: {
              message: 'SET_DELETING must have a isDeleting',
              actions: {
                close: true,
              },
            },
          });
        }
        break;
      }
      case EditorActions.SET_LAST_INSTANTIATED: {
        if (action.payload.lastInstantiated !== undefined) {
          newState.lastInstantiated = action.payload.lastInstantiated;
        } else {
          notifications.dispatch({
            type: NotificationsActionType.enqueue,
            value: {
              message:
                'SET_LAST_INSTANTIATED must have a lastInstantiated in its payload',
              actions: {
                close: true,
              },
            },
          });
        }
        break;
      }
      default:
        notifications.dispatch({
          type: NotificationsActionType.enqueue,
          value: {
            message: 'UNHANDLED ACTION',
            actions: {
              close: true,
            },
          },
        });
    }
    return newState;
  }
  return reducer;
}

class helpers {
  private notificationContext: NotificationsContextValue;
  constructor(notificationContext?: NotificationsContextValue) {
    this.notificationContext = notificationContext!;
  }

  public changeTitle(ctx: IEditorContext, newTitle: string) {
    let newMap = structuredClone(ctx.state.map);
    if (newMap === null) {
      throw new Error('Cannot change title if there is no map');
    }
    newMap.title = newTitle;
    ctx.dispatch({
      type: EditorActions.SET_TITLE,
      payload: {
        map: newMap,
      },
    });
  }

  public setLoadedMap(ctx: IEditorContext, id: string, map: MHJSON) {
    ctx.dispatch({
      type: EditorActions.SET_MAP,
      payload: {
        map_id: id,
        map: map,
      },
    });
  }

  private getLastInitialized(map: MHJSON, d: Delta, li: string): string {
    // if we transformed into a new type, make it the li
    if (d.targetType === TargetType.DOT) {
      if (d.type === DeltaType.UPDATE && d.payload.dot) {
        li = d.payload.dot;
      }
    }
    if (d.targetType === TargetType.SYMBOL) {
      if (d.type === DeltaType.UPDATE && d.payload.symbol) {
        li = d.payload.symbol;
      }
    }
    if (d.targetType === TargetType.GLOBAL_DOT) {
      if (d.type === DeltaType.CREATE && d.payload.name) {
        li = d.payload.name;
      }
      if (
        d.type === DeltaType.DELETE &&
        map.globalDotDensityData[d.target[1]].name.endsWith(DELETED_NAME)
      ) {
        li =
          map.globalDotDensityData.filter(
            x => !x.name.endsWith(DELETED_NAME),
          )[0]?.name ?? DELETED_NAME;
      }
    }
    if (d.targetType === TargetType.GLOBAL_SYMBOL) {
      if (d.type === DeltaType.CREATE && d.payload.name) {
        li = d.payload.name;
      }
      if (
        d.type === DeltaType.DELETE &&
        map.globalSymbolData[d.target[1]].name.endsWith(DELETED_NAME)
      ) {
        li =
          map.globalDotDensityData.filter(
            x => !x.name.endsWith(DELETED_NAME),
          )[0]?.name ?? DELETED_NAME;
      }
    }
    return li;
  }

  public addDelta(ctx: IEditorContext, d: Delta, dInv: Delta) {
    let x = ctx.state.map;
    if (x !== null) {
      let map = x;
      let nStack = ctx.state.actionStack.clone();
      nStack.counterStack = [];
      nStack.stack.push({
        do: d,
        undo: dInv,
      });
      let nMap = { ...map };

      try {
        applyDelta(nMap, d);
        if (ctx.state.map_id !== GUEST_MAP_ID) {
          MapAPI.updateMapPayload(d);
        }
      } catch (error: any) {
        this.notificationContext.dispatch({
          type: NotificationsActionType.enqueue,
          value: {
            message: error.message,
            actions: {
              close: true,
            },
          },
        });
      }

      let li: string = this.getLastInitialized(
        nMap,
        d,
        ctx.state.lastInstantiated,
      );

      ctx.dispatch({
        type: EditorActions.SET_ACTION,
        payload: {
          actionStack: nStack,
          map: nMap,
          lastInstantiated: li,
          // propertiesPanel: newPropertiesPanel,
        },
      });
    } else {
      throw new Error('Cannot add diff when there is no map');
    }
  }

  public undo(ctx: IEditorContext) {
    let map = ctx.state.map;
    if (ctx.state.actionStack.canUndo() && map !== null) {
      // get most recent action
      let a = ctx.state.actionStack.peekStack();
      // if it doesnt exist, return silently
      if (a === null) return;
      // apply it to a copy of the map
      let nMap = { ...map };
      try {
        applyDelta(nMap, a.undo);
        if (ctx.state.map_id !== GUEST_MAP_ID) {
          MapAPI.updateMapPayload(a.undo);
        }
      } catch (error: any) {
        this.notificationContext.dispatch({
          type: NotificationsActionType.enqueue,
          value: {
            message: error.message,
            actions: {
              close: true,
            },
          },
        });
      }

      // create a copy of the stack with the change
      let nStack = ctx.state.actionStack.clone();
      nStack.counterStack.push(nStack.stack.pop()!);

      let li: string = this.getLastInitialized(
        nMap,
        a.do,
        ctx.state.lastInstantiated,
      );
      //dispatch it
      ctx.dispatch({
        type: EditorActions.SET_ACTION,
        payload: {
          map: nMap,
          actionStack: nStack,
          lastInstantiated: li,
        },
      });
    } else {
      throw new Error('Cannot undo if there is nothing left');
    }
  }

  public redo(ctx: IEditorContext) {
    let map = ctx.state.map;
    if (ctx.state.actionStack.canRedo() && map !== null) {
      // get most recent action
      let a = ctx.state.actionStack.peekCounterstack();
      // if it doesnt exist, return silently
      if (a === null) return;
      // apply it to a copy of the map
      let nMap = { ...map };

      try {
        applyDelta(nMap, a.do);
        if (ctx.state.map_id !== GUEST_MAP_ID) {
          MapAPI.updateMapPayload(a.do);
        }
      } catch (error: any) {
        this.notificationContext.dispatch({
          type: NotificationsActionType.enqueue,
          value: {
            message: error.message,
            actions: {
              close: true,
            },
          },
        });
      }

      // create a copy of the stack with the change
      let nStack = ctx.state.actionStack.clone();
      nStack.stack.push(nStack.counterStack.pop()!);

      let li: string = this.getLastInitialized(
        nMap,
        a.undo,
        ctx.state.lastInstantiated,
      );
      //dispatch it
      ctx.dispatch({
        type: EditorActions.SET_ACTION,
        payload: {
          map: nMap,
          actionStack: nStack,
          lastInstantiated: li,
        },
      });
    } else {
      throw new Error('Cannot redo if there is nothing left');
    }
  }

  public getLastInstantiatedDot(ctx: IEditorContext): IDotDensityProps | null {
    let name = ctx.state.lastInstantiated;
    if (name.endsWith(DELETED_NAME) || !ctx.state.map) return null;
    for (let d of ctx.state.map.globalDotDensityData) {
      if (d.name === name) {
        return d;
      }
    }
    return null;
  }

  public getLastInstantiatedSymbol(ctx: IEditorContext): ISymbolProps | null {
    let name = ctx.state.lastInstantiated;
    if (name.endsWith(DELETED_NAME) || !ctx.state.map) return null;
    for (let d of ctx.state.map.globalSymbolData) {
      if (d.name === name) {
        return d;
      }
    }
    return null;
  }
}

export interface IEditorContext {
  state: IEditorState;
  dispatch: Dispatch<{
    type: EditorActions;
    payload: Partial<IEditorState>;
  }>;
  helpers: helpers;
}

export const EditorContext = createContext<IEditorContext>({
  state: initialState,
  dispatch: () => null,
  helpers: new helpers(),
});

export const EditorProvider = ({ children }: React.PropsWithChildren) => {
  const reducer = getReducer(useContext(NotificationsContext));
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
        helpers: new helpers(useContext(NotificationsContext)),
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const GUEST_MAP_ID =
  'THISyMAPyWASyMADEyBYyAyGUESTyANDySHOULDyNOTyBEyUSEDyINyDB';
