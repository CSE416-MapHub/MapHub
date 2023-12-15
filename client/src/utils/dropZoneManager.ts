interface DropZoneOptions {
  // Allowed extensions is a list of allowed file extensions that the dropzone
  // accepts. An empty list indicates that all files are accepted,
  allowedExtensions?: string[];
  multiple?: boolean;
}

interface DropZoneFile extends File {
  id: string;
}

class DropZoneError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DropZoneError';

    Object.setPrototypeOf(this, DropZoneError.prototype);
  }
}

/**
 * DropZoneManager manages the files for file inputs and drag-and-drop.
 */
abstract class DropZoneManager {
  files: DropZoneFile[];
  allowedExtensions: string[];
  multiple: boolean;
  private count: number;

  protected constructor(options?: DropZoneOptions) {
    this.count = 0;
    this.files = [];
    this.allowedExtensions = options?.allowedExtensions
      ? options.allowedExtensions.map(extension => extension.toLowerCase())
      : [];
    this.multiple = options?.multiple !== undefined ? options.multiple : true;
  }

  addAll(fileList: FileList) {
    if (!this.multiple && fileList.length !== 1) {
      throw new DropZoneError('Please upload one file.');
    }

    for (let i = 0; i < fileList.length; i += 1) {
      if (!this.isValidFile(fileList[i])) {
        throw new DropZoneError('Please upload valid files.');
      }
    }

    for (let i = 0; i < fileList.length; i += 1) {
      this.files.push({
        id: `${fileList[i].name}-${this.count++}`,
        ...fileList[i],
      });
    }

    return this;
  }

  remove(id: string) {
    this.files.filter(file => file.id !== id);
    return this;
  }

  private isValidFile(file: File) {
    // If all files are valid
    if (this.allowedExtensions.length === 0) {
      return true;
    }

    // If file name does not have an extension
    const splitFileName = file.name.toLowerCase().split('.');
    if (splitFileName.length < 2) {
      return false;
    }

    const fileExtension = `.${splitFileName.pop()}`;
    return this.allowedExtensions.includes(fileExtension);
  }

  abstract process(): Promise<string[]>;
}

export type { DropZoneOptions };
export { DropZoneError };
export default DropZoneManager;
