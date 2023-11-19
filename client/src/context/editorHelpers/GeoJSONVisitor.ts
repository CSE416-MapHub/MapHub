/**
 * This class exists to visit all nodes of a GeoJSON object.
 * The objective is to traverse and visit all items exactly
 * once.
 */
import { fill } from 'cypress/types/lodash';
import GeoJSON, * as G from 'geojson';
import { isGeometry, isGeometryCollection } from './utility';

type BBox = [x: number, y: number, w: number, h: number];

export interface IFeatureVisitResults {
  box: BBox;
}

export interface IFeatureAggregateResults {
  globallyAvailableKeys: Set<string>;
}

function addPointToLocalBBox(x: number, y: number, b: BBox) {
  b[0] = Math.min(b[0], x);
  b[1] = Math.min(b[1], y);
  b[2] = Math.max(b[2], x - b[0]);
  b[3] = Math.max(b[3], y - b[1]);
}

function mergeBBox(...boxes: [BBox, ...[BBox]]): BBox {
  let box: BBox = boxes[0];
  for (let b of boxes) {
    let l = Math.min(box[0], b[0]);
    let t = Math.min(box[1], b[1]);
    let r = Math.max(box[0] + box[2], b[0] + b[2]);
    let bot = Math.max(box[1] + box[3], b[1] + b[3]);
    box = [l, t, r - l, bot - t];
  }
  return box;
}

export class GeoJSONVisitor {
  private mapData: G.GeoJSON;
  private featureResults: Array<IFeatureVisitResults>;
  private featureAgg: IFeatureAggregateResults;
  constructor(geojson: G.GeoJSON) {
    this.mapData = geojson;
    this.featureResults = [];
    this.featureAgg = {
      globallyAvailableKeys: new Set<string>(),
    };
  }

  public visitRoot() {
    switch (this.mapData.type) {
      case 'Feature': {
        this.visitFeature(this.mapData);
        break;
      }

      case 'FeatureCollection': {
        this.visitFeatureCollection(this.mapData);
        break;
      }
      default: {
        if (isGeometry(this.mapData)) {
          this.visitGeometry(this.mapData);
          break;
        } else {
          throw new Error('Programmer did not catch a type: ' + this.mapData);
        }
      }
    }
  }

  private visitFeatureCollection(features: GeoJSON.FeatureCollection) {
    for (let feature of features.features) {
      this.visitFeature(feature);
    }
  }

  private visitFeature(feature: GeoJSON.Feature) {
    this.featureResults.push(this.visitGeometry(feature.geometry));
    let props = feature.properties;
    if (props) {
      for (let p of Object.keys(props)) {
        this.featureAgg.globallyAvailableKeys.add(p);
      }
    }
  }

  private isPosition(p: GeoJSON.Position): [number, number, number] {
    let ans: [number, number, number] = [0, 0, 0];
    if (p.length === 2 || p.length === 3) {
      ans[0] = p[0];
      ans[1] = p[1];
      if (p[2] !== undefined) {
        ans[2] = p[2];
      }
      return ans;
    }
    throw new Error('Found malformed position ' + p);
  }

  private visitPoint(p: GeoJSON.Position): IFeatureVisitResults {
    return {
      box: [p[0], p[1], 0, 0],
    };
  }

  private visitLine(coordinates: GeoJSON.Position[]): IFeatureVisitResults {
    let bbox: BBox = [coordinates[0][0], coordinates[0][1], 0, 0];
    for (let p of coordinates) {
      addPointToLocalBBox(p[0], p[1], bbox);
    }
    return {
      box: bbox,
    };
  }

  /**
   * Given a double array of coordinates, construct a polygon. Note that this returns a <path> element.
   * According to https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6, the first element is the
   * bounding shape. Subsequent elements are holes within that shape. It is assumed that calls to this
   * contribute to building the SVG map corresponding to this GeoJSON.
   */
  private visitPolygon(
    coordinates: GeoJSON.Position[][],
  ): IFeatureVisitResults {
    if (coordinates.length < 1 || coordinates[0].length < 1) {
      throw new Error('No bounding polygon specified');
    }

    let boundingShape = coordinates[0];
    if (boundingShape === undefined || boundingShape[0] === undefined) {
      return {
        box: [0, 0, 0, 0],
      };
    }
    // note that the zeroth path is counter clockwise
    // and all other paths are counter
    let b: BBox = [boundingShape[0][0], boundingShape[0][1], 0, 0];

    for (let i = 1; i < boundingShape.length; i++) {
      let npoint = boundingShape[i];
      addPointToLocalBBox(npoint[0], npoint[1], b);
    }
    return {
      box: b,
    };
  }

  /**
   * Construct the SVG element(s) corresponding to some GeoJSON.Geometry.
   * @param geometry Some GeoJSON.Geometry
   * @returns An array of SVG elements and a bounding box containing all elements
   */
  private visitGeometry(geometry: GeoJSON.Geometry): IFeatureVisitResults {
    if (isGeometryCollection(geometry)) {
      let res: IFeatureVisitResults = this.visitGeometry(
        geometry.geometries[0],
      );
      geometry.geometries.forEach((g, i) => {
        let t = this.visitGeometry(g);
        res.box = mergeBBox(t.box, res.box);
      });
      return res;
    }
    switch (geometry.type) {
      case 'Point': {
        return this.visitPoint(geometry.coordinates);
      }
      case 'MultiPoint': {
        let res: IFeatureVisitResults = this.visitPoint(
          geometry.coordinates[0],
        );
        geometry.coordinates.forEach((c, i) => {
          let t = this.visitPoint(c);
          res.box = mergeBBox(res.box, t.box);
        });
        return res;
      }
      case 'LineString': {
        return this.visitLine(geometry.coordinates);
      }
      case 'MultiLineString': {
        let res: IFeatureVisitResults = this.visitLine(geometry.coordinates[0]);
        geometry.coordinates.forEach((pline, i) => {
          let t = this.visitLine(pline);
          res.box = mergeBBox(res.box, t.box);
        });
        return res;
      }
      case 'Polygon': {
        return this.visitPolygon(geometry.coordinates);
      }
      case 'MultiPolygon': {
        let res: IFeatureVisitResults = this.visitPolygon(
          geometry.coordinates[0],
        );
        geometry.coordinates.forEach((poly, i) => {
          let t = this.visitPolygon(poly);

          res.box = mergeBBox(res.box, t.box);
        });

        return res;
      }
    }
  }

  public getFeatureResults(): {
    perFeature: Array<IFeatureVisitResults>;
    aggregate: IFeatureAggregateResults;
  } {
    return {
      perFeature: this.featureResults,
      aggregate: this.featureAgg,
    };
  }
}
