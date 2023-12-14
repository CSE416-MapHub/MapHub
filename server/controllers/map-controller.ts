import { Request, Response } from 'express';
import auth from '../auth/index';
import mongoose from 'mongoose';
import Map from '../models/map-model';
import User from '../models/user-model';
import express from 'express';
import fs from 'fs';
import path, { parse } from 'path';
import util from 'util';
import * as gjv from 'geojson-validation';
import mapHelper from './helperFunctions/mapHelper';
import { SVGBuilder } from './helperFunctions/MapVistors';

import svg2img from 'svg2img';

type MapDocument = typeof Map.prototype;

enum DeltaType {
  UPDATE,
  CREATE,
  DELETE,
}

enum MapType {
  CHOROPLETH = 'choropleth',
  CATEGORICAL = 'categorical',
  SYMBOL = 'symbol',
  DOT = 'dot',
  FLOW = 'flow',
}
export enum SVGDetail {
  DETAILED = 'detailed',
  THUMBNAIL = 'thumbnail',
}

async function convertSvgToPngBase64(svgString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    svg2img(svgString, function (error, buffer) {
      if (error) {
        console.error('Error converting SVG to PNG:', error);
        reject(error);
      } else {
        // Convert buffer to a base64 encoded string
        const base64Png = buffer.toString('base64');
        resolve(base64Png);
      }
    });
  });
}

function minifySVG(svgString: string): string {
  // Replace newlines and carriage returns with nothing
  let minified = svgString.replace(/(\r\n|\n|\r)/gm, '');

  // Replace multiple spaces with a single space
  minified = minified.replace(/\s+/g, ' ');

  // Trim leading and trailing whitespace
  return minified.trim();
}

export async function convertJsonToSVG(
  map: MapDocument,
  SVGDetailStr: SVGDetail,
) {
  console.log('JSON TO SVG', JSON.stringify(map));

  const geoJSONData = await fs.promises.readFile(map.geoJSON, 'utf8');

  // console.log('GEOJSON DATA IN DO THE ', geoJSONData);
  map.geoJSON = geoJSONData; //JSON.parse(geoJSONData);

  let builder = new SVGBuilder(map);
  let svg = builder.createSVG();
  console.log('svg created');
  let box = builder.getBBox();
  console.log('bbox gotten');
  let svgRepr = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="${box.join(
    ' ',
  )}">
  <rect x="${box[0]}" y="${box[1]}" width="100%" height="100%" fill="#CCEFF1" />
  ${svg}
</svg>`;
  if (SVGDetailStr === SVGDetail.THUMBNAIL) {
    const pngString = await convertSvgToPngBase64(svgRepr);
    console.log('THE PNG STRINGer', pngString);
    return pngString;
  }
  return minifySVG(svgRepr);
}

const MapController = {
  createMap: async (req: Request, res: Response) => {
    // Implementation of creating a map
    const verifiedUser = (req as any).userId;

    //TODO: NEED TO VALIDATE THE GEOJSON data to make sure its good.
    const {
      title,
      owner,
      mapType,
      labels,
      globalChoroplethData,
      globalCategoryData,
      globalSymbolData,
      globalDotDensityData,
      regionsData,
      symbolsData,
      dotsData,
      arrowsData,
      geoJSON,
    } = req.body.map;
    console.log('REQ BODY IS');
    console.log(req.body);

    // if (verifiedUser !== owner) {
    //   return res
    //     .status(400)
    //     .json({ error: 'Verified Cookie user not the same as the map owner' });
    // }

    if (!title || !mapType || !geoJSON) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (gjv.valid(geoJSON)) {
      console.log('This is a valid GeoJSON object.');
    } else {
      return res.status(400).json({
        error: 'Invalid GeoJSON data',
      });
    }

    let newMap;
    let savedMap;

    try {
      const placeholderID = new mongoose.Types.ObjectId();

      newMap = new Map({
        title,
        placeholderID,
        mapType,
        published: false,
        labels,
        globalChoroplethData,
        globalCategoryData,
        globalSymbolData,
        globalDotDensityData,
        regionsData,
        symbolsData,
        dotsData,
        arrowsData,
        geoJSON: 'placeholder',
        owner: verifiedUser,
      });
      console.log(newMap);
    } catch (err: any) {
      console.error(err.message);
      return res
        .status(500)
        .json({ error: `map saving error: ${err.message}` });
    }

    const mapID = newMap._id.toString();
    console.log('MAP ID HERE:', mapID);

    const saveFilePath = path.join(
      __dirname,
      '..',
      'jsonStore',
      `${mapID}.geojson`,
    );

    const dir = path.dirname(saveFilePath);
    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    try {
      await fs.promises.writeFile(saveFilePath, JSON.stringify(geoJSON));
    } catch (err: any) {
      console.error(err.message);

      return res
        .status(500)
        .json({ error: `File system error: ${err.messge}` });
    }

    try {
      newMap.geoJSON = saveFilePath;
      savedMap = await newMap.save();
      console.log('FINAL MAP CREATE id', savedMap._id);

      let userOwner = await User.findById(verifiedUser);
      if (!userOwner) {
        return res.status(400).json({
          error: 'User Map Owner not found',
        });
      }
      userOwner.maps.push(savedMap._id);
      await userOwner.save();

      res.status(200).json({
        success: true,
        map: { mapID: savedMap._id },
      });
    } catch (err: any) {
      console.error(err.message);

      return res
        .status(500)
        .json({ error: `DB geoJSON path update error: ${err.message}` });
    }
  },

  updateMapPayload: async (req: Request, res: Response) => {
    // Implementation of updating a map
    const delta = req.body.delta;
    let map: MapDocument | null;
    console.log(map);
    //validating the requests
    if (delta.type === null || delta.type === undefined) {
      return res
        .status(400)
        .json({ success: false, message: 'Delta Type not found' });
    }

    if (delta.targetType === null || delta.targetType === undefined) {
      return res
        .status(400)
        .json({ success: false, message: 'Target Type not found' });
    }

    if (!delta.target || delta.target.length != 3) {
      return res
        .status(400)
        .json({ success: false, message: 'Target not found/not equal to 3' });
    }

    if (!delta.payload) {
      return res
        .status(400)
        .json({ success: false, message: 'Payload not found' });
    }

    try {
      const mapId = delta.target[0];
      console.log('THIS IS THE MAPID', JSON.stringify(mapId));

      if (!mapId) {
        return res
          .status(400)
          .json({ success: false, message: 'Map ID is required' });
      }

      //user
      const userId = (req as any).userId;
      map = await Map.findById(mapId);

      if (!map) {
        return res
          .status(404)
          .json({ success: false, message: 'Map not found' });
      }

      if (map.owner.toString() !== userId.toString()) {
        return res
          .status(401)
          .json({ success: false, message: 'Unauthorized, not users map' });
      }
    } catch (err: any) {
      console.error('Error in updateMap:', err);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }

    try {
      switch (delta.type) {
        case DeltaType.CREATE:
          map = mapHelper.handleCreate(delta, map);
          break;
        case DeltaType.UPDATE:
          map = mapHelper.handleUpdate(delta, map);
          break;
        case DeltaType.DELETE:
          map = mapHelper.handleDelete(delta, map);
          break;
        default:
          return res
            .status(400)
            .json({ success: false, message: 'Map Delta Type Incorrect' });
      }
      // console.log('MAP bEFORE CAST', JSON.stringify(map));
      map = new Map(map);

      const updatedMap = await map.save();
      return res.status(200).json({ success: true, map: updatedMap });
    } catch (err: any) {
      console.error(err.message);
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  updateMapById: async (req: Request, res: Response) => {
    // Implementation of deleting a map by ID
    const userId = (req as any).userId;
    const { mapId, title } = req.body.mapPayload;

    console.log('UPDATE MPA BY ID REQ BODY', JSON.stringify(req.body));
    if (!mapId) {
      return res
        .status(400)
        .json({ success: false, message: 'Map ID is required' });
    }

    try {
      let map = await Map.findById(mapId);

      if (!map) {
        return res
          .status(404)
          .json({ success: false, message: 'Map not found' });
      }
      if (map.owner.toString() !== userId.toString()) {
        return res
          .status(401)
          .json({ success: false, message: 'Unauthorized, not users map' });
      }
      if (title !== null && title !== undefined) {
        console.log('updating title now from', map.title, 'to', title);
        map.title = title;
      }

      const savedMap = await new Map(map).save();

      res.status(200).json({ success: true, map: savedMap });
    } catch (err: any) {
      console.log('error in update mapbyid', err);
      res.status(400).json({ success: false, message: err });
    }
  },

  deleteMapById: async (req: Request, res: Response) => {
    // Implementation of deleting a map by ID
  },

  getMapById: async (req: Request, res: Response) => {
    try {
      const mapId = req.params.mapId;
      console.log('THIS IS THE MAPID', JSON.stringify(req.params));

      if (!mapId) {
        return res
          .status(400)
          .json({ success: false, message: 'Map ID is required' });
      }

      const userId = (req as any).userId;
      let map = await Map.findById(mapId);

      if (!map) {
        return res
          .status(404)
          .json({ success: false, message: 'Map not found' });
      }
      if (map.owner.toString() !== userId.toString()) {
        return res
          .status(401)
          .json({ success: false, message: 'Unauthorized, not users map' });
      }
      // Check if the GeoJSON path is valid
      if (map.geoJSON && typeof map.geoJSON === 'string') {
        try {
          // console.log(map.geoJSON)
          const geoJSONData = await fs.promises.readFile(map.geoJSON, 'utf8');
          map.geoJSON = geoJSONData;
        } catch (fileReadError) {
          console.error('Error reading GeoJSON file:', fileReadError);
        }
      }
      res.status(200).json({ success: true, map: map });
    } catch (error) {
      console.error('Error in getMapById:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  },

  publishMapById: async (req: Request, res: Response) => {
    // Implementation of publishing a map by ID
  },

  getRecentMaps: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId; // or use a proper type if available
      const numOfMaps = parseInt(req.query.numOfMaps as string) || 6; // Default to 6 maps if not specified
      console.log('NUM OF Maps requested', numOfMaps);
      // Ensure numOfMaps is not negative
      if (numOfMaps < 0) {
        return res.status(400).json({
          success: false,
          errorMessage: 'Number of maps must be a positive number',
        });
      }

      // Retrieve the most recent maps for the user
      let maps = await Map.find({ owner: userId, published: false })
        .sort({ updatedAt: -1 })
        .exec();

      maps = maps.slice(0, numOfMaps);

      // console.log('THIS IS WHAT INSIDE MAPS', maps);
      const condensedMaps = await Promise.all(
        maps.map(async map => {
          const svg = await convertJsonToSVG(map, SVGDetail.THUMBNAIL); //#TODO placeholder function
          return {
            _id: map._id,
            title: map.title,
            svg: svg,
            owner: map.owner.toString(),
            published: map.published,
          };
        }),
      );

      // Success response
      res.status(200).json({
        success: true,
        maps: condensedMaps,
      });
    } catch (error: any) {
      console.error('Error while retrieving maps:', error.message);
      res.status(500).json({
        success: false,
        errorMessage: 'An internal server error occurred.',
      });
    }
  },
};

export default MapController;
