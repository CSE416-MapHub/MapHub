import mongoose from 'mongoose';
import MapModel from '../../models/map-model';

type MapDocument = typeof MapModel.prototype;
const DELETED_NAME = '_#DEL';
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
    throw new Error('Cant create global choropleth');

    return map;
  }

  update(map: MapDocument, d: Delta): MapDocument {
    // Logic for updating a global choropleth on the map

    let cData = map.globalChoroplethData;
    cData.indexingKey = d.payload.indexingKey ?? cData.indexingKey;
    cData.minColor = d.payload.minColor ?? cData.minColor;
    cData.maxColor = d.payload.maxColor ?? cData.maxColor;
    cData.minIntensity = d.payload.minIntensity ?? cData.minIntensity;
    cData.maxIntensity = d.payload.maxIntensity ?? cData.maxIntensity;
    map.regionsData = [...map.regionsData];

    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Logic for removing a global choropleth from the map
    throw new Error('Cant delete global choropleth');

    return map;
  }
}

class GlobalCategoryHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    // Logic for adding a global category to the map
    const payload = delta.payload;
    if (!payload.name) throw new Error('GlobalCategory Name is required');
    if (!payload.color) throw new Error(' GlobalCategoryColor is required');

    map.globalCategoryData.splice(delta.target[1], 0, {
      name: payload.name,
      color: payload.color,
    });
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    // Logic for updating a global category on the map
    if (
      map.globalCategoryData.length <= delta.target[1] ||
      delta.target[1] < 0
    ) {
      throw new Error('Target index out of bounds');
    }
    // check if the category name is taken
    let taken = map.globalCategoryData.filter(
      (c: any) => c.name === delta.payload.name,
    );
    if (taken.length >= 1 && delta.payload.name !== DELETED_NAME) {
      throw new Error(
        'Category name ' + delta.payload.name + ' is already used',
      );
    }
    let targ = map.globalCategoryData[delta.target[1]];

    // if the name changed, we have to change the name of each dot
    if (delta.payload.name && delta.payload.name !== targ.name) {
      let oldName = targ.name;
      map.regionsData = map.regionsData.map((r: any) => {
        if (r.category === oldName) {
          r.category = delta.payload.name!;
        }
        return r;
      });
    }
    targ.name = delta.payload.name ?? targ.name;
    targ.color = delta.payload.color ?? targ.color;
    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Logic for removing a global category from the map
    if (
      map.globalCategoryData.length <= delta.target[1] ||
      delta.target[1] < 0
    ) {
      throw new Error('Target DELETE Global Category index out of bounds');
    }
    let targName = map.globalCategoryData[delta.target[1]].name;
    map.globalCategoryData[delta.target[1]].name = DELETED_NAME;
    map.regionsData = map.regionsData.map((r: any) => {
      if (r.category === targName) {
        r.category = undefined;
      }
      return r;
    });
    return map;
  }
}
class GlobalSymbolHandler {
  create(map: MapDocument, d: Delta): MapDocument {
    // Logic for adding a global symbol to the map
    let p = d.payload;
    if (p.name === undefined || p.svg === undefined) {
      console.log(p);
      throw new Error('Malformed global symbol in CREATE');
    }

    let taken = false;
    for (let symMeta of map.globalSymbolData) {
      if (symMeta.name === p.name) {
        taken = true;
        break;
      }
    }
    if (taken) {
      console.log(p);
      throw new Error(
        'Tried to create a symbol with a name that already exists',
      );
    }
    map.globalSymbolData.splice(d.target[1], 0, {
      name: p.name,
      svg: p.svg,
    });
    return map;
  }

  update(map: MapDocument, d: Delta): MapDocument {
    // Logic for updating a global symbol on the map
    if (map.globalSymbolData.length <= d.target[1] || d.target[1] < 0) {
      throw new Error('Target index out of bounds');
    }
    let targ = map.globalSymbolData[d.target[1]];

    // if the name changed, we have to change the name of each symbol
    if (d.payload.name) {
      let oldName = targ.name;
      map.symbolsData = map.symbolsData.map((si: any) => {
        if (si.symbol === oldName) {
          console.log(
            'CHANGING SYMBOL NAME as well',
            si.symbol,
            d.payload.name,
          );
          si.symbol = d.payload.name;
        }
        return si;
      });
    }
    targ.name = d.payload.name ?? targ.name;

    targ.svg = d.payload.svg ?? targ.svg;
    return map;
  }

  delete(map: MapDocument, d: Delta): MapDocument {
    // Logic for removing a global symbol from the map
    if (map.globalSymbolData.length <= d.target[1] || d.target[1] < 0) {
      throw new Error('Target index out of bounds');
    }

    let targName = map.globalSymbolData[d.target[1]].name;
    map.globalSymbolData[d.target[1]].name = DELETED_NAME;
    map.symbolsData = map.symbolsData.map((s: any) => {
      if (s.symbol === targName) {
        s.symbol = DELETED_NAME;
      }
      return s;
    });
    return map;
  }
}
class GlobalDotHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    // Logic for adding a global dot to the map

    if (
      delta.target[1] > map.globalDotDensityData.length ||
      delta.target[1] < 0
    ) {
      throw new Error('Global Dot UPDATE target index out of bounds');
    }

    const payload = delta.payload;

    if (!payload.name) throw new Error('GlobalDot Name is required');
    if (!payload.opacity) throw new Error('GlobalDot Opacity is required');
    if (!payload.size) throw new Error('GlobalDot Size is required');
    if (!payload.color) throw new Error('GlobalDot Color is required');

    map.globalDotDensityData.splice(delta.target[1], 0, {
      name: payload.name,
      opacity: payload.opacity,
      size: payload.size,
      color: payload.color,
    });
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    const payload = delta.payload;

    if (
      delta.target[1] >= map.globalDotDensityData.length ||
      delta.target[1] < 0
    ) {
      throw new Error('Global Dot UPDATE target index out of bounds');
    }

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
    const targetIndex = delta.target[1];
    //if target index within range then we can set the name to deleted
    if (targetIndex > map.globalDotDensityData.length || targetIndex < 0) {
      throw new Error('Global Dot Delete target index out of bounds');
    }
    map.globalDotDensityData[targetIndex].name = DELETED_NAME;

    return map;
  }
}
class RegionHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    // Logic for adding a region to the map
    map.regionsData = [...map.regionsData];

    const payload = delta.payload;
    if (!payload.color) throw new Error('Region Color is required');
    if (!payload.intensity) throw new Error('INtensity coordinate is required');
    if (!payload.category) throw new Error('Region category is required');

    if (map.regionsData > delta.target[1] || delta.target[1] < 0) {
      throw new Error('CREATE Region target id out of bounds');
    }
    if (
      !map.globalCategoryData.find(
        (globalCategory: any) => globalCategory.name === payload.category,
      )
    ) {
      throw new Error(
        `THere is no global Category for this region ${payload.category}`,
      );
    }

    map.regionsData.splice(delta.target[1], 0, {
      color: payload.color,
      intensity: payload.intensity,
      category: payload.category,
    });
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    // Logic for updating a region on the map

    if (map.regionsData >= delta.target[1] || delta.target[1] < 0) {
      throw new Error('Update Region target id out of bounds');
    }
    if (delta.payload.color) {
      map.regionsData[delta.target[1]].color = delta.payload.color;
    }
    if (delta.payload.intensity) {
      map.regionsData[delta.target[1]].intensity = delta.payload.intensity;
    }
    if (delta.payload.category) {
      map.regionsData[delta.target[1]].category = delta.payload.category;
    }
    return map;
  }

  delete(map: MapDocument, delta: Delta): MapDocument {
    // Logic for removing a region from the map
    if (map.regionsData >= delta.target[1] || delta.target[1] < 0) {
      throw new Error('DELETE Region target id out of bounds');
    }
    if (delta.payload.color) {
      delete map.regionsData[delta.target[1]].color;
    }
    if (delta.payload.intensity) {
      delete map.regionsData[delta.target[1]].intensity;
    }
    if (delta.payload.category) {
      delete map.regionsData[delta.target[1]].category;
    }
    return map;
  }
}
class SymbolHandler {
  create(map: MapDocument, d: Delta): MapDocument {
    // Logic for adding a symbol to the map
    let p = d.payload;
    if (
      p.x === undefined ||
      p.y === undefined ||
      p.scale === undefined ||
      p.symbol === undefined
    ) {
      console.log(p);
      throw new Error('Malformed symbol in CREATE');
    }

    if (map.symbolsData.length < d.target[1] || d.target[1] < 0) {
      throw new Error('global symbol index out of bounds');
    }

    // verify that the dot we are trying to create actually exists
    let exists = false;
    for (let symMeta of map.globalSymbolData) {
      if (symMeta.name === p.symbol) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      console.log(p);
      throw new Error('Tried to create nonexistent symbol type');
    }
    map.symbolsData.splice(d.target[1], 0, {
      x: p.x,
      y: p.y,
      scale: p.scale,
      symbol: p.symbol,
    });
    return map;
  }

  update(map: MapDocument, d: Delta): MapDocument {
    // Logic for updating a symbol on the map

    if (map.symbolsData.length <= d.target[1] || d.target[1] < 0) {
      throw new Error('global symbol index out of bounds');
    }

    let targ = map.symbolsData[d.target[1]];
    targ.x = d.payload.x ?? targ.x;
    targ.y = d.payload.y ?? targ.y;
    targ.symbol = d.payload.symbol ?? targ.symbol;
    targ.scale = d.payload.scale ?? targ.scale;

    return map;
  }

  delete(map: MapDocument, d: Delta): MapDocument {
    // Logic for removing a symbol from the map
    if (map.symbolsData.length <= d.target[1] || d.target[1] < 0) {
      throw new Error('Delete symbol Target index out of bounds');
    }

    map.symbolsData[d.target[1]].symbol = DELETED_NAME;
    return map;
  }
}
class DotHandler {
  create(map: MapDocument, delta: Delta): MapDocument {
    const payload = delta.payload;
    if (!payload.dot) throw new Error('Dot name is required');
    if (!payload.x) throw new Error('Dot X coordinate is required');
    if (!payload.y) throw new Error('Dot Y coordinate is required');
    if (!payload.scale) throw new Error('Dot Scale is required');

    if (
      !map.globalDotDensityData.find(
        (globalDot: any) => globalDot.name === payload.dot,
      )
    ) {
      throw new Error(
        `GLOBAL Dot doesnt exist for this dot name ${payload.dot}`,
      );
    }

    // Add a new dot to the map
    map.dotsData.splice(delta.target[1], 0, {
      x: payload.x,
      y: payload.y,
      scale: payload.scale,
      dot: payload.dot,
    });
    return map;
  }

  update(map: MapDocument, delta: Delta): MapDocument {
    // Check if at least one required property is present

    if (delta.target[1] >= map.dotsData.length || delta.target[1] < 0) {
      throw new Error('UPDATE DOT Target index out of bounds');
    }
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
    //if target index within range then we can set the name to deleted
    if (targetIndex >= map.dotsData.length || targetIndex < 0) {
      throw new Error('DELETE DOT Target index out of bounds');
    }

    map.dotsData[targetIndex].name = DELETED_NAME;

    return map;
  }
}
interface IArrowInstance {
  label: string;
  color: string;
  opacity: number;
  capacity: number;
  interpolationPoints: Array<{
    x: number;
    y: number;
  }>;
}

class ArrowHandler {
  create(map: MapDocument, d: Delta): MapDocument {
    // Logic for adding an arrow to the map
    let p = d.payload;
    if (
      p.color === undefined ||
      p.label == undefined ||
      p.opacity === undefined ||
      p.capacity === undefined ||
      p.interpolationPoints === undefined ||
      (p.interpolationPoints.length as number) !== 4
    ) {
      console.log(p);
      throw new Error('Found malformed arrow in create arrow');
    }
    let arrow: IArrowInstance = {
      color: p.color,
      label: p.label,
      opacity: p.opacity,
      capacity: p.capacity,
      interpolationPoints: p.interpolationPoints,
    };
    map.arrowsData[d.target[1]] = arrow;

    return map;
  }

  update(map: MapDocument, d: Delta): MapDocument {
    // Logic for updating an arrow on the map
    let arrow = map.arrowsData[d.target[1]];
    arrow.color = d.payload.color ?? arrow.color;
    arrow.label = d.payload.label ?? arrow.label;
    arrow.opacity = d.payload.opacity ?? arrow.opacity;
    arrow.capacity = d.payload.capacity ?? arrow.capacity;
    arrow.interpolationPoints =
      d.payload.interpolationPoints ?? arrow.interpolationPoints;
    return map;
  }

  delete(map: MapDocument, d: Delta): MapDocument {
    // Logic for removing an arrow from the map
    if (d.target[1] > map.arrowsData.length || d.target[1] < 0) {
      throw new Error('Target out of bounds in delete arrow: ' + d.target[1]);
    }
    map.arrowsData[d.target[1]].label = DELETED_NAME;
    map.arrowsData[d.target[1]].opacity = 0;
    map.arrowsData[d.target[1]].capacity = 0;
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
    console.log('CREATED NEW ', delta.targetType);
    return handler.create(map, delta);
  },

  handleUpdate: (delta: any, map: MapDocument): MapDocument => {
    const handler = getHandlerForTargetType(delta.targetType);
    console.log('UPDATED ', delta.targetType);

    return handler.update(map, delta);
  },

  handleDelete: (delta: any, map: MapDocument): MapDocument => {
    const handler = getHandlerForTargetType(delta.targetType);
    console.log('DELETED', delta.targetType);

    return handler.delete(map, delta);
  },
};

export default mapHelper;
