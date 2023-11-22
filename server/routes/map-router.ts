import express from 'express';
import auth from '../auth/index';
import MapController from '../controllers/map-controller';
const router = express.Router();

// Handles creating a new map in the database request
router.post('/map', auth.verify, MapController.createMap);

// Handles updating an existing map request
router.put('/map/:id', auth.verify, MapController.updateMap);

// Handles a delete a map request
router.delete('/map/:id', auth.verify, MapController.deleteMapById);

// Handles a get a map request
router.get('/map/:id', auth.verify, MapController.getMapById);

// Handles a get a map request
router.get('/recents/', auth.verify, MapController.getRecentMaps);

export default router;
