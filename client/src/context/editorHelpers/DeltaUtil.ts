import { IPropertyPanelSectionProps } from 'app/create/ui/components/property/PropertyPanel';
import { MHJSON } from 'types/MHJSON';
import { Delta, DeltaPayload, DeltaType, TargetType } from 'types/delta';

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
    // case 'Dot':
    //   return 'dot';
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
  }
  return 'propertyValue';
};

export function updatePropertiesPanel(
  p: Array<IPropertyPanelSectionProps>,
  d: Delta,
): Array<IPropertyPanelSectionProps> {
  let pp = [...p];
  for (let panel in pp) {
    for (let inp in pp[panel].items) {
      let valAtName = d.payload[labelToDPKey(pp[panel].items[inp].name)];
      if (valAtName !== undefined) {
        let k;
        if (typeof valAtName === 'number') {
          k = valAtName.toString();
        } else {
          k = valAtName;
        }
        if (m(k)) {
          pp[panel].items[inp].input.value = k;
        }
      }
    }
  }
  return pp;
}

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

export const DELETED_NAME = '_#DEL';
