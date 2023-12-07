import mongoose from 'mongoose';
import MapModel from '../../models/map-model';

type MapDocument = typeof MapModel.prototype;

export interface DeltaPayload {
  // this is what a diff payload could contain
  // note that at no point should all fields be active

  // ex: if i want to add a dot of type "woman" to the map, i would have the payload
  // { dot: "woman", x:100, y:-200 }
  // the payload should provide exactly enough data to create, delete, or modify an item (if modifying, only fields being modified are included)

  minIntensity?: number;
  maxIntensity?: number;
  minColor?: string;
  maxColor?: string;
  indexingKey?: string;
  x?: number;
  y?: number;
  scale?: number;
  symbol?: string;
  color?: string;
  svg?: string;
  name?: string;
  opacity?: number;
  size?: number;
  intensity?: number;
  category?: number;
  dot?: string;
  label?: string;
  capacity?: number;
  interpolationPoints?: [
    {
      x: number;
      y: number;
    },
  ];
  propertyValue?: string;
}

//FOR MAP UPDAING LIKE TITLE AND SHIT
export interface MapPayload {
  mapId: string;
  title?: string;
}


export enum DeltaType {
  UPDATE,
  CREATE,
  DELETE,
}

export enum TargetType {
  LABELS,
  GLOBAL_CHOROPLETH,
  GLOBAL_CATEGORY,
  GLOBAL_SYMBOL,
  GLOBAL_DOT,
  REGION,
  SYMBOL,
  DOT,
  ARROW,
  GEOJSONDATA,
}

export interface Delta {
  type: DeltaType;
  targetType: TargetType;
  target: [mapId: string, objectId: number, subobjectId: string];
  payload: DeltaPayload;
}

class LabelsHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    // Implement the logic to add a label to the map
    // Example: map.labels.push({/* label details from payload */});
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    // Implement the logic to update a label on the map
    // Example: find the label in map.labels and update it
    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Implement the logic to delete a label from the map
    // Example: remove the label from map.labels
    return map;
  }
}

class GlobalChoroplethHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    // Logic for adding a global choropleth to the map
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    // Logic for updating a global choropleth on the map
    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Logic for removing a global choropleth from the map
    return map;
  }
}

class GlobalCategoryHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    // Logic for adding a global category to the map
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    // Logic for updating a global category on the map
    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Logic for removing a global category from the map
    return map;
  }
}
class GlobalSymbolHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    // Logic for adding a global symbol to the map
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    // Logic for updating a global symbol on the map
    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Logic for removing a global symbol from the map
    return map;
  }
}
class GlobalDotHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    // Logic for adding a global dot to the map
    const payload = delta.payload;
    if (!payload.name) throw new Error('Name is required');
    if (!payload.opacity) throw new Error('Opacity is required');
    if (!payload.size) throw new Error('Size is required');
    if (!payload.color) throw new Error('Color is required');

    map.globalDotDensityData.push({
      name: payload.name,
      opacity: payload.opacity,
      size: payload.size,
      color: payload.color,
    });
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    const payload = delta.payload;

    if (payload.name !== undefined) {
      const originalName = map.globalDotDensityData[delta.target[1]].name;

      map.dotsData.forEach((dot: any) => {
        if (dot.dot === originalName) {
          dot.name = payload.name;
        }
      });

      map.globalDotDensityData[delta.target[1]].name = payload.name;
    }
    if (payload.opacity !== undefined) {
      map.globalDotDensityData[delta.target[1]].opacity = payload.opacity;
    }
    if (payload.size !== undefined) {
      map.globalDotDensityData[delta.target[1]].size = payload.size;
    }
    if (payload.color !== undefined) {
      map.globalDotDensityData[delta.target[1]].color = payload.color;
    }
    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Logic for removing a global dot from the map

    map.globalDotDensityData.splice(delta.target[1], 1);
    return map;
  }
}
class RegionHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    // Logic for adding a region to the map
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    // Logic for updating a region on the map
    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Logic for removing a region from the map
    return map;
  }
}
class SymbolHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    // Logic for adding a symbol to the map
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    // Logic for updating a symbol on the map
    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Logic for removing a symbol from the map
    return map;
  }
}
class DotHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    const payload = delta.payload;
    if (!payload.dot) throw new Error('Dot name is required');
    if (!payload.x) throw new Error('X coordinate is required');
    if (!payload.y) throw new Error('Y coordinate is required');
    if (!payload.scale) throw new Error('Scale is required');

    // Add a new dot to the map
    map.dotsData.push({
      x: payload.x,
      y: payload.y,
      scale: payload.scale,
      dot: payload.dot,
    });
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    // Check if at least one required property is present
    const payload = delta.payload;

    // Update map with the provided payload properties
    if (payload.x !== undefined) {
      map.dotsData[delta.target[1]].x = payload.x;
    }
    if (payload.y !== undefined) {
      map.dotsData[delta.target[1]].y = payload.y;
    }
    if (payload.scale !== undefined) {
      map.dotsData[delta.target[1]].scale = payload.scale;
    }
    if (payload.dot !== undefined) {
      map.dotsData[delta.target[1]].dot = payload.dot;
    }

    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Logic for removing a dot from the map
    const targetIndex = delta.target[1];

    map.dotsData.splice(targetIndex, 1);
    return map;
  }
}
class ArrowHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    // Logic for adding an arrow to the map
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    // Logic for updating an arrow on the map
    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Logic for removing an arrow from the map
    return map;
  }
}

class GeojsonDataHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    // Logic for adding geoJSON data to the map
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    // Logic for updating geoJSON data on the map
    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Logic for removing geoJSON data from the map
    return map;
  }
}

function getHandlerForTargetType(targetType: TargetType) {
  switch (targetType) {
    case TargetType.LABELS:
      return new LabelsHandler();
    case TargetType.GLOBAL_CHOROPLETH:
      return new GlobalChoroplethHandler();
    case TargetType.GLOBAL_CATEGORY:
      return new GlobalCategoryHandler();
    case TargetType.GLOBAL_SYMBOL:
      return new GlobalSymbolHandler();
    case TargetType.GLOBAL_DOT:
      return new GlobalDotHandler();
    case TargetType.REGION:
      return new RegionHandler();
    case TargetType.SYMBOL:
      return new SymbolHandler();
    case TargetType.DOT:
      return new DotHandler();
    case TargetType.ARROW:
      return new ArrowHandler();
    case TargetType.GEOJSONDATA:
      return new GeojsonDataHandler();
    default:
      throw new Error('Unsupported Target Type');
  }
}

const mapHelper = {
  handleCreate: (delta: any, map: MapDocument): MapDocument => {
    const handler = getHandlerForTargetType(delta.targetType);
    return handler.create(map, delta);
  },

  handleUpdate: (delta: any, map: MapDocument): MapDocument => {
    const handler = getHandlerForTargetType(delta.targetType);
    return handler.update(map, delta);
  },

  handleDelete: (delta: any, map: MapDocument): MapDocument => {
    const handler = getHandlerForTargetType(delta.targetType);
    return handler.delete(map, delta);
  },
};

export default mapHelper;
