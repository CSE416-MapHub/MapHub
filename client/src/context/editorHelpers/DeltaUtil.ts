import { IPropertyPanelSectionProps } from 'app/create/ui/components/property/PropertyPanel';
import { IDotDensityProps, MHJSON } from 'types/MHJSON';
import { Delta, DeltaPayload, DeltaType, TargetType } from 'types/delta';
import { GeoJSONVisitor } from './GeoJSONVisitor';
import { IEditorContext } from 'context/EditorProvider';

/**
 * Applies a Delta to a map in place
 * @param map
 * @param d
 */
export function applyDelta(map: MHJSON, d: Delta) {
  switch (d.targetType) {
    case TargetType.DOT:
      deltaDot(map, d);
      break;
    case TargetType.GLOBAL_DOT:
      deltaGlobalDot(map, d);
      break;
    case TargetType.GEOJSONDATA:
      deltaGeoJson(map, d);
      break;
    case TargetType.REGION:
      deltaRegion(map, d);
      break;
    default:
      throw new Error('uninmplemented');
  }
}

// HACK
function m(a: any): a is string | Array<string | [string, () => void]> {
  return true;
}

// TODO:
const labelToDPKey = (name: string): keyof DeltaPayload => {
  switch (name) {
    case 'X':
      return 'x';
    case 'Y':
      return 'y';
    case 'Dot':
      return 'dot';
    case 'Scale':
      return 'scale';
    case 'Dot Color':
      return 'color';
    case 'Dot Opacity':
      return 'opacity';
    case 'Dot Size':
      return 'size';
    case 'Dot Name':
      return 'name';
    case 'Feature Color':
      return 'color';
  }
  return name as keyof DeltaPayload;
};

/**
 * Applies a Delta to the map in place
 * @param map
 * @param d
 */
function deltaDot(map: MHJSON, d: Delta) {
  switch (d.type) {
    case DeltaType.UPDATE: {
      if (map.dotsData.length <= d.target[1] || d.target[1] < 0) {
        throw new Error('Target index out of bounds');
      }
      let targ = map.dotsData[d.target[1]];
      targ.x = d.payload.x ?? targ.x;
      targ.y = d.payload.y ?? targ.y;
      targ.dot = d.payload.dot ?? targ.dot;
      targ.scale = d.payload.scale ?? targ.scale;
      break;
    }

    case DeltaType.DELETE: {
      if (map.dotsData.length <= d.target[1] || d.target[1] < 0) {
        throw new Error('Target index out of bounds');
      }
      // TODO: is this the smartest thing to do?
      // map.dotsData.splice(d.target[1], 1);
      map.dotsData[d.target[1]].dot = DELETED_NAME;
      break;
    }

    case DeltaType.CREATE: {
      // must have an x, y, scale, and dot
      let p = d.payload;
      if (
        p.x === undefined ||
        p.y === undefined ||
        p.scale === undefined ||
        p.dot === undefined
      ) {
        console.log(p);
        throw new Error('Malformed dot in CREATE');
      }
      // verify that the dot we are trying to create actually exists
      let exists = false;
      for (let dotMeta of map.globalDotDensityData) {
        if (dotMeta.name === p.dot) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        console.log(p);
        throw new Error('Tried to create nonexistent dot type');
      }
      map.dotsData.push({
        x: p.x,
        y: p.y,
        scale: p.scale,
        dot: p.dot,
      });
      break;
    }
  }
}

/**
 * Applies a Delta to the map in place
 * @param map
 * @param d
 */
function deltaGlobalDot(map: MHJSON, d: Delta) {
  switch (d.type) {
    case DeltaType.UPDATE: {
      if (map.globalDotDensityData.length <= d.target[1] || d.target[1] < 0) {
        throw new Error('Target index out of bounds');
      }
      let targ = map.globalDotDensityData[d.target[1]];

      targ.name = d.payload.name ?? targ.name;
      // if the name changed, we have to change the name of each dot
      if (d.payload.name) {
        let oldName = targ.name;
        map.dotsData = map.dotsData.map(di => {
          if (di.dot === oldName) {
            di.dot = d.payload.name!;
          }
          return di;
        });
      }

      targ.size = d.payload.size ?? targ.size;
      targ.color = d.payload.color ?? targ.color;
      targ.opacity = d.payload.opacity ?? targ.opacity;
      break;
    }

    case DeltaType.DELETE: {
      if (map.globalDotDensityData.length <= d.target[1] || d.target[1] < 0) {
        throw new Error('Target index out of bounds');
      }
      // TODO: is this the smartest thing to do?
      // map.globalDotDensityData.splice(d.target[1], 1);
      let targName = map.globalDotDensityData[d.target[1]].name;
      map.globalDotDensityData[d.target[1]].name = DELETED_NAME;
      map.dotsData = map.dotsData.map(d => {
        if (d.dot === targName) {
          d.dot = DELETED_NAME;
        }
        return d;
      });
      break;
    }

    case DeltaType.CREATE: {
      // must have an name, opacity, size, color
      let p = d.payload;
      if (
        p.name === undefined ||
        p.opacity === undefined ||
        p.size === undefined ||
        p.color === undefined
      ) {
        console.log(p);
        throw new Error('Malformed dot in CREATE');
      }
      // verify that the dot we are trying to create has a unique name
      // TODO: unique color?
      let taken = false;
      for (let dotMeta of map.globalDotDensityData) {
        if (dotMeta.name === p.name) {
          taken = true;
          break;
        }
      }
      if (taken) {
        console.log(p);
        throw new Error(
          'Tried to create a dot with a name that already exists',
        );
      }
      map.globalDotDensityData.push({
        name: p.name,
        opacity: p.opacity,
        size: p.size,
        color: p.color,
      });
      break;
    }
  }
}

/**
 * Applies a Delta to the map in place
 * @param map
 * @param d
 */
function deltaGeoJson(map: MHJSON, d: Delta) {
  let v = new GeoJSONVisitor(map.geoJSON, true);
  v.visitRoot();
  let targFeature = v.getFeatureResults().perFeature[d.target[1]];
  if (targFeature === undefined) {
    throw new Error('Region out of bounds');
  }

  switch (d.type) {
    case DeltaType.CREATE:
    case DeltaType.UPDATE: {
      let propName = d.target[2];
      let orig = targFeature.originalFeature;
      if (!orig.properties) {
        orig.properties = {};
      }
      orig.properties[propName] = d.payload.propertyValue;
      break;
    }
    case DeltaType.DELETE: {
      let propName = d.target[2];
      let orig = targFeature.originalFeature;
      if (!orig.properties) {
        orig.properties = {};
      }
      delete orig.properties[propName];
    }
  }
}

function deltaRegion(map: MHJSON, d: Delta) {
  switch (d.type) {
    case DeltaType.UPDATE:
    case DeltaType.CREATE: {
      map.regionsData = [...map.regionsData];
      if (d.payload.color) {
        map.regionsData[d.target[1]].color = d.payload.color;
      }
      if (d.payload.intensity) {
        map.regionsData[d.target[1]].intensity = d.payload.intensity;
      }
      if (d.payload.category) {
        map.regionsData[d.target[1]].category = d.payload.category;
      }
      break;
    }
    case DeltaType.DELETE: {
      if (d.payload.color) {
        delete map.regionsData[d.target[1]].color;
      }
      if (d.payload.intensity) {
        delete map.regionsData[d.target[1]].intensity;
      }
      if (d.payload.category) {
        delete map.regionsData[d.target[1]].category;
      }
      break;
    }
  }
}
export const DELETED_NAME = '_#DEL';
