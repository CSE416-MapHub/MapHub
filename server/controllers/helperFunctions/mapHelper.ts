import mongoose from 'mongoose';
import MapModel from '../../models/map-model';

type MapDocument = typeof MapModel.prototype;

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
interface DeltaPayload {
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
class LabelsHandler {
  create(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Implement the logic to add a label to the map
    // Example: map.labels.push({/* label details from payload */});
    return map;
  }

  update(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Implement the logic to update a label on the map
    // Example: find the label in map.labels and update it
    return map;
  }

  delete(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Implement the logic to delete a label from the map
    // Example: remove the label from map.labels
    return map;
  }
}

class GlobalChoroplethHandler {
  create(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for adding a global choropleth to the map
    return map;
  }

  update(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for updating a global choropleth on the map
    return map;
  }

  delete(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for removing a global choropleth from the map
    return map;
  }
}

class GlobalCategoryHandler {
  create(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for adding a global category to the map
    return map;
  }

  update(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for updating a global category on the map
    return map;
  }

  delete(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for removing a global category from the map
    return map;
  }
}
class GlobalSymbolHandler {
  create(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for adding a global symbol to the map
    return map;
  }

  update(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for updating a global symbol on the map
    return map;
  }

  delete(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for removing a global symbol from the map
    return map;
  }
}
class GlobalDotHandler {
  create(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for adding a global dot to the map
    return map;
  }

  update(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for updating a global dot on the map
    return map;
  }

  delete(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for removing a global dot from the map
    return map;
  }
}
class RegionHandler {
  create(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for adding a region to the map
    return map;
  }

  update(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for updating a region on the map
    return map;
  }

  delete(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for removing a region from the map
    return map;
  }
}
class SymbolHandler {
  create(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for adding a symbol to the map
    return map;
  }

  update(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for updating a symbol on the map
    return map;
  }

  delete(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for removing a symbol from the map
    return map;
  }
}
class DotHandler {
  create(map: MapDocument, payload: DeltaPayload): MapDocument {
    if (!payload.dot) throw new Error('Dot type is required');
    if (!payload.x) throw new Error('X coordinate is required');
    if (!payload.y) throw new Error('Y coordinate is required');
    if (!payload.scale) throw new Error('Scale is required');

    // Add a new dot to the map
    map.dotsData.push({
      type: payload.dot,
      x: payload.x,
      y: payload.y,
      scale: payload.scale,
    });
    return map;
  }

  update(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for updating a dot on the map
    return map;
  }

  delete(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for removing a dot from the map
    return map;
  }
}
class ArrowHandler {
  create(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for adding an arrow to the map
    return map;
  }

  update(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for updating an arrow on the map
    return map;
  }

  delete(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for removing an arrow from the map
    return map;
  }
}

class GeojsonDataHandler {
  create(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for adding geoJSON data to the map
    return map;
  }

  update(map: MapDocument, payload: DeltaPayload): MapDocument {
    // Logic for updating geoJSON data on the map
    return map;
  }

  delete(map: MapDocument, payload: DeltaPayload): MapDocument {
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
    return handler.create(map, delta.payload);
  },

  handleUpdate: (delta: any, map: MapDocument): MapDocument => {
    const handler = getHandlerForTargetType(delta.targetType);
    return handler.update(map, delta.payload);
  },

  handleDelete: (delta: any, map: MapDocument): MapDocument => {
    const handler = getHandlerForTargetType(delta.targetType);
    return handler.delete(map, delta.payload);
  },
};

export default mapHelper;
