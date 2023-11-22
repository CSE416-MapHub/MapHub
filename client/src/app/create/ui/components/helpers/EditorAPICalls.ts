/**
 * This function will act as a gateway for all API calls the editor makes
 * This is here because I dont like the idea of mixing status codes
 * with modals.
 */

import MapAPI from 'api/MapAPI';
import PostAPI from 'api/PostAPI';
import { MHJSON } from 'types/MHJSON';

/**
 * Send a request to publish a map
 * @param mapID the id of the map to publish
 * @param title the title to publish it under
 * @param description a description for the map
 * @returns the post id it was successfully published under
 */
export function publishMap(
  mapID: string,
  title: string,
  description: string,
): Promise<string> {
  return PostAPI.publishMap(mapID, title, description).then(res => {
    if (res.status === 200) {
      return res.data.post.postId;
    } else {
      // TODO: raise an error
      throw new Error(res.status.toString() + JSON.stringify(res.data));
    }
  });
}

/**
 * Validate that an object is a recents object
 * @param a
 * @returns
 */
function validateRecents(a: any): a is Array<{
  _id: string;
  title: string;
  png: Buffer;
}> {
  for (let entry of a) {
    if (
      typeof entry._id !== 'string' ||
      typeof entry.title !== 'string' ||
      !entry.png ||
      entry.png.type !== 'Buffer' ||
      typeof entry.png.data !== 'object'
    ) {
      return false;
    }
  }
  return true;
}

/**
 *
 * @returns The six most recently edited maps
 */
export function getRecents(): Promise<
  Array<{
    _id: string;
    title: string;
    png: Buffer;
  }>
> {
  return MapAPI.getRecentMapIds(6).then(res => {
    if (res.status === 200) {
      let maps = res.data.maps;
      if (typeof maps !== 'object') {
        throw new Error(`Unexpected maps type ` + typeof maps);
      }
      if (validateRecents(maps)) {
        return maps;
      }
    }
    throw new Error(res.status.toString() + JSON.stringify(res.data));
  });
}

/**
 *
 * @param map the map to create
 * @returns the id of the newly created map
 */
export function createNewMap(map: MHJSON): Promise<string> {
  return MapAPI.createMap(map).then(res => {
    if (res.status === 200) {
      return res.data.map.mapID;
    }
    throw new Error(res.status.toString() + JSON.stringify(res.data));
  });
}

export function loadMapById(id: string): Promise<MHJSON> {
  return MapAPI.getMapById(id).then(res => {
    // TODO: verify MHJSON
    if (res.status === 200) {
      let map = res.data.map as MHJSON;
      return map;
    }
    throw new Error(res.status.toString() + JSON.stringify(res.data));
  });
}
