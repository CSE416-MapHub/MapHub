import { Request, Response } from 'express';
import auth from '../auth/index';
import mongoose from 'mongoose';
import Map from '../models/map-model';
import express from 'express';
import fs from 'fs';
import path from 'path';
import util from 'util';
import * as gjv from 'geojson-validation';
import mapHelper from './helperFunctions/mapHelper';
import { type } from 'os';

const readFile = util.promisify(fs.readFile); // Promisify readFile for use with async/await

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

export async function convertJsonToPng(map: mongoose.Document) {
  return Buffer.alloc(0);
}

//idk if we should actually validate the user to see if the user matchees
async function validUserForMap(req: Request, res: Response) {}

const MapController = {
  createMap: async (req: Request, res: Response) => {
    // Implementation of creating a map

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
        owner: (req as any).userId,
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
      console.log('MAP bEFORE CAST', JSON.stringify(map));
      map = new Map(map);
      console.log('afndisofdj', map);
      const updatedMap = await map.save();
      console.log(updatedMap);
      return res.status(200).json({ success: true, map: updatedMap });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  updateMapById: async (req: Request, res: Response) => {
    // Implementation of deleting a map by ID
    const userId = (req as any).userId;
    const { mapId, title } = req.body;

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

      console.log('finished updating ', savedMap);
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
      const map = await Map.findById(mapId);

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

      if (map.geoJSON && typeof map.geoJSON === 'string') {
        try {
          const geoJSONData = await readFile(map.geoJSON, 'utf8');
          map.geoJSON = JSON.parse(geoJSONData);
        } catch (fileReadError) {
          console.error('Error reading GeoJSON file:', fileReadError);
        }
      }
      console.log(JSON.stringify(map.geoJSON));
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
          const png = await convertJsonToPng(map); //#TODO placeholder function
          return {
            _id: map._id,
            title: map.title,
            png: png,
          };
        }),
      );

      console.log('Map Controller MAPS', JSON.stringify(condensedMaps));
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
