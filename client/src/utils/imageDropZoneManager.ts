import DropZoneManager, { DropZoneOptions } from './dropZoneManager';

class ImageDropZoneManager extends DropZoneManager {
  constructor(options: DropZoneOptions) {
    super({
      allowedExtensions: ['.png', '.jpg', '.jpeg', '.gif'],
      multiple: false,
      ...options,
    });
  }
}

export default ImageDropZoneManager;
