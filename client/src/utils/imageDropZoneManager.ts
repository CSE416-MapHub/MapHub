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

  process() {
    return this.files.map(file => blobToBase64String(file));
  }
}

export default ImageDropZoneManager;
