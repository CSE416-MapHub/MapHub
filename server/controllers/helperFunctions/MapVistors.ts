import { GeoJSON } from 'geojson';
import { BBox, addPointToLocalBBox, mergeBBox } from './GeoJSONVisitor';
import { isGeometry, isGeometryCollection } from './utility';
import {
  IArrowInstance,
  IDotDensityProps,
  ISymbolProps,
  MHJSON,
} from './types/MHJSON';
import { getArrowhead, producePath } from './ArrowFixer';
import MapModel from '../../models/map-model';
import xmldom from 'xmldom';
// import { useRef } from "react";
type MapDocument = typeof MapModel.prototype;

export const DELETED_NAME = '_#DEL';

const STROKE_WIDTH = 0.1;
const STROKE_COLOR = 'black';
const MAX_VAL = Number.MAX_SAFE_INTEGER;
const lat2m = 10;

export const mixColors = (c1: string, c2: string, ratio: number): string => {
  return (
    '#' +
    (() => {
      const [p1, p2] = [c1, c2].map(color => parseInt(color.slice(1), 16)),
        a = [];

      for (let i = 0; i <= 2; i += 1) {
        a.push(
          Math.floor(
            ((p1 >> (i * 8)) & 0xff) * (1 - ratio) +
              ((p2 >> (i * 8)) & 0xff) * ratio,
          ),
        );
      }
      let res = a
        .reverse()
        .map(num => num.toString(16).padStart(2, '0'))
        .join('');
      // console.log(`mixing ${c1} and ${c2} at ${ratio}; got ${res}`);
      return res;
    })()
  );
};

class SVGBuilder {
  private featureNumber = 0;
  private bboxInitialized: boolean;
  private bbox: BBox = [0, 0, 0, 0];
  private mhjson: MapDocument;

  constructor(map: MapDocument) {
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
    this.featureNumber = 0;

    let map: GeoJSON = JSON.parse(this.mhjson.geoJSON);
    let els = '';
    console.log('GET MAP TYPE', map.type);
    switch (map.type) {
      case 'Feature': {
        els = this.svgOfFeature(map);
        break;
      }

      case 'FeatureCollection': {
        els = this.svgOfFeatureCollection(map as GeoJSON.FeatureCollection);
        break;
      }
      default: {
        if (isGeometry(map)) {
          els = this.svgOfGeometry(map);
        } else {
          throw new Error('Programmer did not catch a type: ' + map);
        }
      }
    }
    if (this.mhjson.mapType === 'categorical') {
      els += this.svgOfCategoryLegend();
    }
    if (this.mhjson.mapType === 'choropleth') {
      els += this.svgOfChoroplethLegend();
    }
    if (this.mhjson.mapType === 'dot') {
      els += this.svgOfDots();
      els += this.svgOfDotLegend();
    }
    if (this.mhjson.mapType === 'flow') {
      els += this.svgOfArrows();
    }
    if (this.mhjson.mapType === 'symbol') {
      els += this.svgOfSymbols();
      els += this.svgOfSymbolLegend();
    }
    return els;
  }

  private svgOfCategoryLegend(): string {
    let items = this.mhjson.globalCategoryData
      .filter((x: any) => !x.name.endsWith(DELETED_NAME))
      .map((x: any) => [x.color, x.name] as [string, string]);

    let children = '';
    let y = 10;
    const ITEM_HEIGHT = 32;
    for (let i of items) {
      children += `<rect width="32" height="32" x="10" y="${y}" fill="${i[0]}"/>
      <text x="20%" y="${
        y + ITEM_HEIGHT / 2
      }" dominant-baseline="middle"  font-family="Arial" font-size="${
        ITEM_HEIGHT / 2
      }" fill="#000000" >
      ${i[1]}</text>`;
      y += 42;
    }
    return `<svg x="${this.bbox[0]}" y="${this.bbox[1]}" width="20%" height="20%" viewBox="0 0 300 ${y}">
    <rect width="100%" height="100%" fill="#000000" />
    <rect x="3%" y="3%" width="94%" height="94%" fill="#ffffff" />
    ${children}
    </svg>`;
  }

  private svgOfDotLegend(): string {
    let items = this.mhjson.globalDotDensityData.map(
      (x: any) => [x.color, x.name, x.opacity] as [string, string, number],
    );

    let children = '';
    let y = 10;
    const ITEM_HEIGHT = 32;
    for (let i of items) {
      children += `<rect width="32" height="32" x="10" y="${y}" fill="${
        i[0]
      }" opacity="${i[2]}"/>
      <text x="20%" y="${
        y + ITEM_HEIGHT / 2
      }" dominant-baseline="middle"  font-family="Arial" font-size="${
        ITEM_HEIGHT / 2
      }" fill="#000000">
      ${i[1]}</text>`;
      y += 42;
    }
    return `<svg x="${this.bbox[0]}" y="${this.bbox[1]}" width="20%" height="20%" viewBox="0 0 300 ${y}">
    <rect width="100%" height="100%" fill="#000000" />
    <rect x="3%" y="3%" width="94%" height="94%" fill="#ffffff" />
    ${children}
    </svg>`;
  }

  private svgOfSymbolLegend(): string {
    const DOMParser = xmldom.DOMParser;
    const XMLSerializer = xmldom.XMLSerializer;

    let items = this.mhjson.globalSymbolData.map(
      (x: any) => [x.svg, x.name] as [string, string],
    );

    let children = '';
    let y = 10;
    const ITEM_HEIGHT = 32;
    for (let i of items) {
      const parser = new DOMParser();
      let doc = parser.parseFromString(i[0], 'image/svg+xml');

      let svgEl = doc.getElementsByTagName('svg')[0];
      svgEl.setAttribute('width', '100%');
      svgEl.setAttribute('height', '100%');

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      children += `<svg width="32" height="32" x="10" y="${y}">${svgString}</svg>
      <text x="20%" y="${
        y + ITEM_HEIGHT / 2
      }" dominant-baseline="middle"  font-family="Arial" font-size="${
        ITEM_HEIGHT / 2
      }" fill="#000000" >
      ${i[1]}</text>`;
      y += 42;
    }
    return `<svg x="${this.bbox[0]}" y="${this.bbox[1]}" width="20%" height="20%" viewBox="0 0 300 ${y}">
    <rect width="100%" height="100%" fill="#000000" />
    <rect x="3%" y="3%" width="94%" height="94%" fill="#ffffff" />
    ${children}
    </svg>`;
  }

  private svgOfChoroplethLegend(): string {
    let cData = this.mhjson.globalChoroplethData;
    let children = `<rect width="100%" height="100%" fill="#ffffff" />
    <defs>
        <linearGradient id="Gradient1">
        <stop stop-color="${cData.minColor}" offset="0%" />
        <stop stop-color="${cData.maxColor}" offset="100%" />
      </linearGradient>
      </defs>
      <style>
     #legend-gradient-bar {
        fill: url(#Gradient1);
      }
      </style>
    <rect id="legend-gradient-bar" width="280" height="32" x="10" y="10"/>
    <text y="52" x="10" dominant-baseline="hanging" text-anchor="start" font-family="Arial" font-size="16" fill="#000000">
     ${cData.minIntensity}
    </text>
    <text y="52" x="290" dominant-baseline="hanging" text-anchor="end" font-family="Arial" font-size="16" fill="#000000">
    ${cData.maxIntensity}
    </text>`;
    return `<svg x="${this.bbox[0]}" y="${this.bbox[1]}" width="20%" height="20%" viewBox="0 0 300 78">

    ${children}
    </svg>`;
  }

  private svgOfDots(): string {
    // construct a map of names to objects
    let dotMap = new Map<string, IDotDensityProps>(
      this.mhjson.globalDotDensityData.map((x: any) => [x.name, x]),
    );

    let dots = '';
    for (let d of this.mhjson.dotsData) {
      if (d.dot.endsWith(DELETED_NAME)) {
        continue;
      }
      let dclass = dotMap.get(d.dot)!;
      dots += this.svgOfDot(
        d.x,
        d.y,
        d.scale * dclass.size,
        dclass.color,
        dclass.opacity,
      );
    }
    return dots;
  }

  private svgOfDot(
    x: number,
    y: number,
    radius: number,
    color: string,
    opacity: number,
  ): string {
    let p = this.isPosition([x, y]);

    return `<circle
    cx="${p[0]}"
    cy="${p[1]}"
    r="${radius / lat2m}"
    fill="${color}"
    opacity="${opacity}"
    />`;
  }

  private svgOfSymbols(): string {
    // construct a map of names to objects
    const DOMParser = xmldom.DOMParser;
    const XMLSerializer = xmldom.XMLSerializer;
    let symbolMap: Map<string, [ISymbolProps, HTMLElement]> = new Map<
      string,
      [ISymbolProps, HTMLElement]
    >(
      this.mhjson.globalSymbolData.map((x: any) => {
        // Use querySelector to directly select the SVG element
        const parser = new DOMParser();
        let doc = parser.parseFromString(x.svg, 'image/svg+xml');

        let svgEl = doc.getElementsByTagName('svg')[0];
        svgEl.setAttribute('width', '100%');
        svgEl.setAttribute('height', '100%');

        // let svgEl: HTMLElement = new DOMParser().parseFromString(
        //   x.svg,
        //   'image/svg+xml',
        // ).documentElement;
        return [x.name, [x, svgEl]];
      }),
    );

    let symbols = '';
    for (let s of this.mhjson.symbolsData) {
      if (s.symbol.endsWith(DELETED_NAME)) {
        continue;
      }

      let symbolData = symbolMap.get(s.symbol)!;

      // console.log('inner', innerHTML);
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(symbolData[1]);
      symbols += this.svgOfSymbol(svgString, [s.x, s.y], s.scale);
    }
    return symbols;
  }

  private svgOfSymbol(
    svg: string,
    location: [x: number, y: number],
    scale: number,
  ): string {
    let DEFAULT_SZ = Math.min(this.bbox[2], this.bbox[3]) / 10;
    let [x, y, w, h] = [
      location[0] - (DEFAULT_SZ * scale) / 2,
      -1 * (location[1] + (DEFAULT_SZ * scale) / 2),
      DEFAULT_SZ * scale,
      DEFAULT_SZ * scale,
    ];

    return `<svg x="${x}" y="${y}" width="${w}" height="${h}">${svg}</svg>`;
  }

  private svgOfArrows(): string {
    let arrows = '';
    for (let arrow of this.mhjson.arrowsData) {
      if (arrow.label.endsWith(DELETED_NAME)) {
        continue;
      }
      arrows += this.svgOfArrow(arrow) + '\n';
    }

    return arrows;
  }

  private svgOfArrow(arrow: IArrowInstance): string {
    let p = arrow.interpolationPoints;
    let pdata = producePath(p[0], p[1], p[2], p[3]);
    let d = pdata[0]
      .map(x => {
        if (typeof x === 'string') {
          return x;
        } else {
          return `${x[1]} ${-1 * x[0]}`;
        }
      })
      .reduce((prev, curr, i, arr) => {
        if (
          i > 0 &&
          !Number.isNaN(parseFloat(arr[i - 1])) &&
          !Number.isNaN(parseFloat(arr[i]))
        ) {
          return prev + ', ' + curr;
        }
        return prev + ' ' + curr;
      }, '');
    let [p0, p1] = pdata[1].map(p => {
      // let t = p.x * -1;
      // p.x = p.y;
      // p.y = t;
      return p;
    });

    let headPoints = getArrowhead(p0, p1, arrow.capacity / 5);
    let head = `<polygon points="${headPoints
      .map(x => `${x.x},${-1 * x.y}`)
      .join(' ')}" fill="${arrow.color}" fill-opacity="${
      arrow.opacity
    }" line-cap="butt" />`;
    let path = `<path d="${d}" fill="none" stroke="${
      arrow.color
    }" stroke-opacity="${arrow.opacity}" line-cap="butt" stroke-width="${
      arrow.capacity / lat2m
    }"/>`;
    return path + head;
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
    // determine the color of this feature
    let fill = 'white';
    // console.log('WHAT IS THE MJSON', this.mhjson);
    if (this.mhjson.regionsData.length === 0) {
      return '';
    }

    let rColor = this.mhjson.regionsData[this.featureNumber].color;
    if (rColor !== undefined) {
      fill = rColor;
    }
    // however, if it is choropleth
    // use the written intensity
    // but if global choropleth key is set, find the intensity in the properties
    if (this.mhjson.mapType === 'choropleth') {
      let intensity =
        this.mhjson.regionsData[this.featureNumber].intensity ?? NaN;
      let cData = this.mhjson.globalChoroplethData;

      if (!cData.indexingKey.endsWith(DELETED_NAME) && feature.properties) {
        intensity = parseFloat(feature.properties[cData.indexingKey]);
      }

      if (intensity !== undefined) {
        let ratio =
          (intensity - cData.minIntensity) /
          (cData.maxIntensity - cData.minIntensity);
        if (ratio < 0 || ratio > 1 || Number.isNaN(ratio)) {
          fill = 'white';
        } else {
          fill = mixColors(cData.minColor, cData.maxColor, ratio);
        }
      }
    }

    if (this.mhjson.mapType === 'categorical') {
      let category = this.mhjson.regionsData[this.featureNumber].category;
      if (category !== undefined && !category.endsWith(DELETED_NAME)) {
        let categoryObject = this.mhjson.globalCategoryData.filter(
          (x: any) => x.name === category,
        )[0];
        if (categoryObject !== undefined) {
          fill = categoryObject.color;
        }
      }
    }

    this.featureNumber++;
    return `<g fill="${fill}">${els}</g>`;
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
