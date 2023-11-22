import express from 'express';
import auth from '../auth/index';
import MapController from '../controllers/map-controller';
const router = express.Router();

// Handles creating a new map in the database request
router.post('/create', auth.verify, MapController.createMap);

// Handles updating an existing map request
router.put('/map/:mapId', auth.verify, MapController.updateMap);

// Handles a delete a map request
router.delete('/map/:mapId', auth.verify, MapController.deleteMapById);

// Handles a get a map request
router.get('/map/:mapId', auth.verify, MapController.getMapById);

// Handles a get a map request
router.get('/recents/', auth.verify, MapController.getRecentMaps);

export default router;
