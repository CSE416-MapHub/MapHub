import { GeoJSON } from 'geojson';

function isPoint(g: GeoJSON.GeoJSON): g is GeoJSON.Point {
  return g.type === 'Point';
}

function isLineString(g: GeoJSON.GeoJSON): g is GeoJSON.LineString {
  return g.type === 'LineString';
}

function isPolygon(g: GeoJSON.GeoJSON): g is GeoJSON.Polygon {
  return g.type === 'Polygon';
}

function isMultiPoint(g: GeoJSON.GeoJSON): g is GeoJSON.MultiPoint {
  return g.type === 'MultiPoint';
}

function isMultiLineString(g: GeoJSON.GeoJSON): g is GeoJSON.MultiLineString {
  return g.type === 'MultiLineString';
}

function isMultiPolygon(g: GeoJSON.GeoJSON): g is GeoJSON.MultiPolygon {
  return g.type === 'MultiPolygon';
}

function isGeometryCollection(
  g: GeoJSON.GeoJSON,
): g is GeoJSON.GeometryCollection {
  return g.type === 'GeometryCollection';
}

function isFeature(g: GeoJSON.GeoJSON): g is GeoJSON.Feature {
  return g.type === 'Feature';
}

function isFeatureCollection(
  g: GeoJSON.GeoJSON,
): g is GeoJSON.FeatureCollection {
  return g.type === 'FeatureCollection';
}

function isGeometry(g: GeoJSON.GeoJSON): g is GeoJSON.Geometry {
  return (
    isGeometryCollection(g) ||
    isLineString(g) ||
    isMultiLineString(g) ||
    isMultiPoint(g) ||
    isMultiPolygon(g) ||
    isPoint(g) ||
    isPolygon(g)
  );
}

export {
  isFeature,
  isFeatureCollection,
  isGeometryCollection,
  isLineString,
  isMultiLineString,
  isMultiPoint,
  isMultiPolygon,
  isPoint,
  isPolygon,
  isGeometry,
};
