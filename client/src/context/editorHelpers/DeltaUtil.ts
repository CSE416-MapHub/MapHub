import { IPropertyPanelSectionProps } from 'app/create/ui/components/property/PropertyPanel';
import { IArrowInstance, IDotDensityProps, MHJSON } from 'types/MHJSON';
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
    case TargetType.GLOBAL_CATEGORY:
      deltaGlobalCategory(map, d);
      break;
    case TargetType.GLOBAL_SYMBOL:
      deltaGlobalSymbol(map, d);
      break;
    case TargetType.SYMBOL:
      deltaSymbol(map, d);
      break;
    case TargetType.GLOBAL_CHOROPLETH:
      deltaGlobalChoropleth(map, d);
      break;
    case TargetType.ARROW:
      deltaArrow(map, d);
      break;
    case TargetType.LABELS:
      deltaLabels(map, d);
      break;
    default:
      throw new Error('uninmplemented');
  }
}

// HACK
function m(a: any): a is string | Array<string | [string, () => void]> {
  return true;
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
      map.dotsData[d.target[1]].dot += DELETED_NAME;
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
      map.dotsData.splice(d.target[1], 0, {
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
  map.globalDotDensityData = [...map.globalDotDensityData];
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
      map.globalDotDensityData[d.target[1]].name += DELETED_NAME;

      map.dotsData = map.dotsData.map(d => {
        if (d.dot === targName) {
          d.dot += DELETED_NAME;
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
      let taken = p.name === '+ New Dot Type';
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
      map.globalDotDensityData[d.target[1]] = {
        name: p.name,
        opacity: p.opacity,
        size: p.size,
        color: p.color,
      };

      // look for dots that have this name, but are deleted
      for (let dot of map.dotsData) {
        if (dot.dot === p.name + DELETED_NAME) {
          dot.dot = p.name;
        }
      }
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

  switch (d.type) {
    case DeltaType.CREATE: {
      if (d.target[1] !== -1) {
        throw new Error(
          'You are unsure if you are trying to create a geojason property or update; got target if not equal to -1: ' +
            d.target[1],
        );
      }
      for (let featureVisitResult of v.getFeatureResults().perFeature) {
        let feature = featureVisitResult.originalFeature;
        if (feature.properties === null) {
          feature.properties = {};
        }
        feature.properties[d.target[2]] = d.payload.propertyValue;
      }
      break;
    }
    case DeltaType.UPDATE: {
      let targFeature = v.getFeatureResults().perFeature[d.target[1]];
      if (targFeature === undefined) {
        throw new Error('Region out of bounds');
      }
      let propName = d.target[2];
      let orig = targFeature.originalFeature;
      if (!orig.properties) {
        orig.properties = {};
      }
      orig.properties[propName] = d.payload.propertyValue;
      break;
    }
    case DeltaType.DELETE: {
      if (d.target[1] !== -1) {
        throw new Error(
          'You are unsure if you are trying to delete a geojason property or update; got target if not equal to -1: ' +
            d.target[1],
        );
      }
      for (let featureVisitResult of v.getFeatureResults().perFeature) {
        let feature = featureVisitResult.originalFeature;
        if (feature.properties === null) {
          feature.properties = {};
        }
        delete feature.properties[d.target[2]];
      }
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

function deltaGlobalCategory(map: MHJSON, d: Delta) {
  switch (d.type) {
    case DeltaType.UPDATE: {
      map.regionsData = [...map.regionsData];
      if (map.globalCategoryData.length <= d.target[1] || d.target[1] < 0) {
        throw new Error('Target index out of bounds');
      }
      // check if the category name is taken
      let taken = map.globalCategoryData.filter(c => c.name === d.payload.name);
      if (taken.length >= 1 && d.payload.name?.endsWith(DELETED_NAME)) {
        throw new Error('Category name ' + d.payload.name + ' is already used');
      }
      let targ = map.globalCategoryData[d.target[1]];

      // if the name changed, we have to change the name of each dot
      if (d.payload.name && d.payload.name !== targ.name) {
        let oldName = targ.name;
        map.regionsData = map.regionsData.map(r => {
          if (r.category === oldName) {
            r.category = d.payload.name!;
          }
          return r;
        });
      }
      targ.name = d.payload.name ?? targ.name;
      targ.color = d.payload.color ?? targ.color;
      break;
    }
    case DeltaType.CREATE: {
      // must have an name, opacity, size, color
      map.regionsData = [...map.regionsData];
      map.globalCategoryData = [...map.globalCategoryData];
      let p = d.payload;
      if (p.name === undefined || p.color === undefined) {
        console.log(p);
        throw new Error('Malformed category in CREATE');
      }

      let taken = p.name === '+ New Category';
      for (let categoryMeta of map.globalCategoryData) {
        if (categoryMeta.name === p.name) {
          taken = true;
          break;
        }
      }
      if (taken) {
        console.log(p);
        throw new Error(
          'Tried to create a category with a name that already exists',
        );
      }
      map.globalCategoryData[d.target[1]] = {
        name: p.name,
        color: p.color,
      };
      for (let r of map.regionsData) {
        if (r.category && r.category === p.name + DELETED_NAME) {
          r.category = p.name;
        }
      }

      break;
    }
    case DeltaType.DELETE: {
      map.regionsData = [...map.regionsData];
      if (map.globalCategoryData.length <= d.target[1] || d.target[1] < 0) {
        throw new Error('Target index out of bounds');
      }
      let targName = map.globalCategoryData[d.target[1]].name;
      map.globalCategoryData[d.target[1]].name += DELETED_NAME;

      map.regionsData = map.regionsData.map(r => {
        if (r.category === targName) {
          r.category = targName + DELETED_NAME;
        }
        return r;
      });
      break;
    }
  }
}

function deltaSymbol(map: MHJSON, d: Delta) {
  switch (d.type) {
    case DeltaType.UPDATE: {
      if (map.symbolsData.length <= d.target[1] || d.target[1] < 0) {
        throw new Error('Target index out of bounds');
      }
      let targ = map.symbolsData[d.target[1]];
      targ.x = d.payload.x ?? targ.x;
      targ.y = d.payload.y ?? targ.y;
      targ.symbol = d.payload.symbol ?? targ.symbol;
      targ.scale = d.payload.scale ?? targ.scale;
      break;
    }

    case DeltaType.DELETE: {
      if (map.symbolsData.length <= d.target[1] || d.target[1] < 0) {
        throw new Error('Target index out of bounds');
      }
      // TODO: is this the smartest thing to do?
      // map.dotsData.splice(d.target[1], 1);
      map.symbolsData[d.target[1]].symbol += DELETED_NAME;
      break;
    }

    case DeltaType.CREATE: {
      // must have an x, y, scale, and dot
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
      break;
    }
  }
}

function deltaGlobalSymbol(map: MHJSON, d: Delta) {
  switch (d.type) {
    case DeltaType.UPDATE: {
      if (map.globalSymbolData.length <= d.target[1] || d.target[1] < 0) {
        throw new Error('Target index out of bounds');
      }
      let targ = map.globalSymbolData[d.target[1]];

      // if the name changed, we have to change the name of each dot
      if (d.payload.name) {
        let oldName = targ.name;
        map.symbolsData = map.symbolsData.map(si => {
          if (si.symbol === oldName) {
            si.symbol = d.payload.name!;
          }
          return si;
        });
      }
      targ.name = d.payload.name ?? targ.name;

      targ.svg = d.payload.svg ?? targ.svg;
      break;
    }

    case DeltaType.DELETE: {
      if (map.globalSymbolData.length <= d.target[1] || d.target[1] < 0) {
        throw new Error('Target index out of bounds');
      }

      let targName = map.globalSymbolData[d.target[1]].name;
      map.globalSymbolData[d.target[1]].name += DELETED_NAME;
      map.symbolsData = map.symbolsData.map(s => {
        if (s.symbol === targName) {
          s.symbol += DELETED_NAME;
        }
        return s;
      });
      break;
    }

    case DeltaType.CREATE: {
      // must have an name, opacity, size, color
      let p = d.payload;
      if (p.name === undefined || p.svg === undefined) {
        console.log(p);
        throw new Error('Malformed symbol in CREATE');
      }
      // verify that the dot we are trying to create has a unique name
      // TODO: unique color?
      let taken = p.name === '+ New Dot Type';
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
      break;
    }
  }
}

function deltaGlobalChoropleth(map: MHJSON, d: Delta) {
  switch (d.type) {
    case DeltaType.UPDATE: {
      let cData = map.globalChoroplethData;
      cData.indexingKey = d.payload.indexingKey ?? cData.indexingKey;
      cData.minColor = d.payload.minColor ?? cData.minColor;
      cData.maxColor = d.payload.maxColor ?? cData.maxColor;
      cData.minIntensity = d.payload.minIntensity ?? cData.minIntensity;
      cData.maxIntensity = d.payload.maxIntensity ?? cData.maxIntensity;
      map.regionsData = [...map.regionsData];

      break;
    }
    default: {
      console.log(d);
      console.error('Tried to delete or create a global choropleth object');
    }
  }
}

function deltaArrow(map: MHJSON, d: Delta) {
  map.arrowsData = [...map.arrowsData];
  switch (d.type) {
    case DeltaType.UPDATE: {
      let arrow = map.arrowsData[d.target[1]];
      arrow.color = d.payload.color ?? arrow.color;
      arrow.label = d.payload.label ?? arrow.label;
      arrow.opacity = d.payload.opacity ?? arrow.opacity;
      arrow.capacity = d.payload.capacity ?? arrow.capacity;
      arrow.interpolationPoints =
        d.payload.interpolationPoints ?? arrow.interpolationPoints;
      break;
    }
    case DeltaType.CREATE: {
      let p = d.payload;
      if (
        p.color === undefined ||
        p.label == undefined ||
        p.opacity === undefined ||
        p.capacity === undefined ||
        p.interpolationPoints === undefined ||
        p.interpolationPoints.length !== 4
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
      break;
    }
    case DeltaType.DELETE: {
      if (d.target[1] > map.arrowsData.length || d.target[1] < 0) {
        throw new Error('Target out of bounds in delete arrow: ' + d.target[1]);
      }
      map.arrowsData[d.target[1]].label += DELETED_NAME;
      map.arrowsData[d.target[1]].opacity = 0;
      map.arrowsData[d.target[1]].capacity = 0;
      break;
    }
  }
}

function deltaLabels(map: MHJSON, d: Delta) {
  switch (d.type) {
    case DeltaType.UPDATE: {
      if (d.payload.labels === undefined) {
        throw new Error('Labels is not set in updating labels');
      }
      map.labels = d.payload.labels;
      break;
    }
    default: {
      throw new Error('Trying to create or delete labels??');
    }
  }
}

export const DELETED_NAME = '_#DEL';
