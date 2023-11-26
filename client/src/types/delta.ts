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
  target: [mapId: number, objectId: number, subobjectId: number];
  payload: DeltaPayload;
}
