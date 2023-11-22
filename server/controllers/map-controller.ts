import { Request, Response } from 'express';
import auth from '../auth/index';
import mongoose from 'mongoose';
import Map from '../models/map-model';
import express from 'express';
import fs from 'fs';
import path from 'path';

enum MapType {
  CHOROPLETH = 'choropleth',
  CATEGORICAL = 'categorical',
  SYMBOL = 'symbol',
  DOT = 'dot',
  FLOW = 'flow',
}

async function convertJsonToPng(map: mongoose.Document) {
  return Buffer.alloc(0);
}

const MapController = {
  createMap: async (req: Request, res: Response) => {
    // Implementation of creating a map
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
    } = req.body;
    let newMap;
    let savedMap;
    try {
      const placeholderID = new mongoose.Types.ObjectId();

      newMap = new Map({
        title,
        placeholderID,
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
        geoJSON: 'placeholder',
      });
      savedMap = await newMap.save();
    } catch (err: any) {
      console.error(err.message);
      return res
        .status(500)
        .json({ error: `map saving error: ${err.message}` });
    }

    const mapID = savedMap._id.toString();
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

  updateMap: async (req: Request, res: Response) => {
    // Implementation of updating a map
  },

  deleteMapById: async (req: Request, res: Response) => {
    // Implementation of deleting a map by ID
  },

  getMapById: async (req: Request, res: Response) => {
    // Implementation of getting a map by ID
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
      let maps = await Map.find({ owner: userId })
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
