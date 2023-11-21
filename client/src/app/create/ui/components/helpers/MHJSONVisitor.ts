import { GeoJSON } from 'geojson';
import {
  BBox,
  addPointToLocalBBox,
  mergeBBox,
} from 'context/editorHelpers/GeoJSONVisitor';
import {
  isGeometry,
  isGeometryCollection,
} from 'context/editorHelpers/utility';
import L from 'leaflet';
import { MHJSON } from 'types/MHJSON';
// import { useRef } from "react";

const STROKE_WIDTH = 0.1;
const STROKE_COLOR = 'black';
const MAX_VAL = Number.MAX_SAFE_INTEGER;

class SVGBuilder {
  private featureNumber = 0;
  private bboxInitialized: boolean;
  private bbox: BBox = [0, 0, 0, 0];
  private mhjson: MHJSON;

  constructor(map: MHJSON) {
    this.mhjson = map;
    this.bboxInitialized = false;
  }

  /**
   * Create an SVG using the GeoJSON inputted in the constructor. Note that calls to this
   * will recompute both the SVG and the bounding box.
   *
   * @returns A <svg></svg> populated with svg elements.
   */
  public createSVG(): string {
    let map: GeoJSON = this.mhjson.geoJSON;
    switch (map.type) {
      case 'Feature': {
        let els = this.svgOfFeature(map);
        return els;
      }

      case 'FeatureCollection': {
        let els = this.svgOfFeatureCollection(map);
        return els;
      }
      default: {
        if (isGeometry(map)) {
          let els = this.svgOfGeometry(map);
          return els;
        } else {
          throw new Error('Programmer did not catch a type: ' + map);
        }
      }
    }
  }

  /**
   * Create the SVG elements that define a GeoJSON FeatureCollection.
   * It is assumed that calls to this contribute to building the SVG map
   * corresponding to this GeoJSON.
   *
   * @param features A GeoJSON FeatureCollection
   * @returns An array of SVG elements that correspond to the FeatureCollection
   */
  private svgOfFeatureCollection(features: GeoJSON.FeatureCollection): string {
    let elements: string = '';
    for (let feature of features.features) {
      elements += this.svgOfFeature(feature);
    }

    return elements;
  }

  /**
   * Create the SVG elements that define a GeoJSON Feature.
   *
   * @param feature
   * @returns
   */
  private svgOfFeature(feature: GeoJSON.Feature): string {
    let els = this.svgOfGeometry(feature.geometry);
    return els;
  }

  /**
   * Verify that a position is valid. A position is valid iff it has at least 2
   * coordinates and optionally has a third. This function will also negate the
   * second coordinate so that screen coordinates and Earth coordinates are
   * oriented in the correct way.
   *
   * @param p A position to evaluate
   * @returns a triplet of points [p[0], p[1], p[2]]. If p[2] was undefined, it is -1
   * @throws An error of the position is malformed
   */
  private isPosition(p: GeoJSON.Position): [number, number, number] {
    let ans: [number, number, number] = [-1, -1, -1];
    if (p.length === 2 || p.length === 3) {
      ans[0] = p[0];
      ans[1] = p[1] * -1;

      if (p[2] !== undefined) {
        ans[2] = p[2];
      }
      if (this.bboxInitialized) {
        addPointToLocalBBox(ans[0], ans[1], this.bbox);
      } else {
        this.bboxInitialized = true;
        this.bbox = [ans[0], ans[1], 0, 0];
      }
      return ans;
    }
    throw new Error('Found malformed position ' + p);
  }

  /**
   * Build a point. A point is described by a position. Its corresponding
   * SVG representation is a small circle. It is assumed that calls to this
   * contribute to building the SVG map corresponding to this GeoJSON.
   *
   * @param p The position to draw the circle at
   * @returns An SVG circle
   */
  private buildPoint(p: GeoJSON.Position): string {
    p = this.isPosition(p);
    return `<circle
        cx="${p[0]}"
        cy="${p[1]}"
        r="${STROKE_WIDTH}%"
        fill="${STROKE_COLOR}"
      />`;
  }

  /**
   * Build a line. A line is described by an array of position. Its
   * corresponding SVG representation is a polyline. It is assumed
   * that calls to this contribute to building the SVG map corresponding
   * to this GeoJSON.
   *
   * @param coordinates
   * @returns A SVG polyline
   */
  private buildLine(coordinates: GeoJSON.Position[]): string {
    if (coordinates.length < 2) {
      throw new Error(
        'Found LineString with less than 2 points: ' + coordinates,
      );
    }
    let b: BBox = [MAX_VAL, MAX_VAL, 0, 0];
    return `<polyline
        points=${coordinates
          .map(c => {
            return this.isPosition(c);
          })
          .map(c => {
            addPointToLocalBBox(c[0], c[1], b);
            return `${c[0]},${c[1]}`;
          })
          .join(' ')}
        strokeWidth="${STROKE_WIDTH}%"
        stroke="${STROKE_COLOR}"
      />`;
  }

  /**
   * Given a double array of coordinates, construct a polygon. Note that this returns a <path> element.
   * According to https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6, the first element is the
   * bounding shape. Subsequent elements are holes within that shape. It is assumed that calls to this
   * contribute to building the SVG map corresponding to this GeoJSON.
   *
   * @param coordinates The coordinates specifying the shape
   * @returns A path element drawing the shape
   */
  private buildPolygon(coordinates: GeoJSON.Position[][]): string {
    if (coordinates.length < 1 || coordinates[0].length < 1) {
      throw new Error('No bounding polygon specified');
    }
    coordinates = coordinates.map(shp => {
      shp = shp
        .map(p => this.isPosition(p))
        .filter(([x, y, z], i, a) => {
          if (i !== 0) {
            if (x === a[i - 1][0] && y === a[i - 1][1] && z === a[i - 1][2]) {
              return false;
            }
          }
          return true;
        });
      return shp;
    });
    let boundingShape = coordinates[0];
    if (boundingShape === undefined || boundingShape[0] === undefined) {
      return '';
    }
    // note that the zeroth path is counter clockwise
    // and all other paths are counter
    let d = `M${boundingShape[0][0]} ${boundingShape[0][1]} `;
    for (let i = 1; i < boundingShape.length; i++) {
      let npoint = boundingShape[i];
      d += `L${npoint[0]} ${npoint[1]} `;
    }
    d += 'z ';

    // TODO: verify that items after the zeroth are indeed counter
    // if items are not counter, we MUST preprocess tehm to make them counter clockwise

    for (let polyno = 1; polyno < coordinates.length; polyno++) {
      let hole = coordinates[polyno];
      d += `M${hole[0][0]} ${hole[0][1]} `;
      for (let i = 1; i < hole.length; i++) {
        d += `L${hole[i][0]} ${hole[i][1]} `;
      }
      d += 'z ';
    }
    return `<path
        d="${d}"
        fill-rule="evenodd"
        stroke="black"
        stroke-width="${STROKE_WIDTH}%"
        fill="white"
      />`;
  }

  /**
   * Construct the SVG element(s) corresponding to some GeoJSON.Geometry.
   * @param geometry Some GeoJSON.Geometry
   * @returns An array of SVG elements and a bounding box containing all elements
   */
  private svgOfGeometry(geometry: GeoJSON.Geometry): string {
    let elements: string = '';

    if (isGeometryCollection(geometry)) {
      geometry.geometries.forEach(g => {
        elements += this.svgOfGeometry(g);
      });
      return elements;
    }
    switch (geometry.type) {
      case 'Point': {
        return this.buildPoint(geometry.coordinates);
      }
      case 'MultiPoint': {
        return geometry.coordinates.map(c => this.buildPoint(c)).join('');
      }
      case 'LineString': {
        return this.buildLine(geometry.coordinates);
      }
      case 'MultiLineString': {
        return geometry.coordinates
          .map(pline => this.buildLine(pline))
          .join('');
      }
      case 'Polygon': {
        return this.buildPolygon(geometry.coordinates);
      }
      case 'MultiPolygon': {
        return geometry.coordinates
          .map(poly => this.buildPolygon(poly))
          .join('');
      }
    }
  }

  /**
   * Get the bounding box of the last computed SVG. Calls to
   * `createSVG()` may change the output of this function.
   * @returns
   */
  public getBBox(): [number, number, number, number] {
    return this.bbox;
  }
}

export { SVGBuilder };