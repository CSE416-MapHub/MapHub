import { blobToBase64String } from 'blob-util';
import DropZoneManager, { DropZoneOptions } from './dropZoneManager';

class ImageDropZoneManager extends DropZoneManager {
  constructor(options: DropZoneOptions) {
    super({
      allowedExtensions: ['.png', '.jpg', '.jpeg', '.gif'],
      multiple: false,
      ...options,
    });
  }

  async process() {
    return Promise.all(this.files.map(async file => blobToBase64String(file)));
  }
}

export default ImageDropZoneManager;
