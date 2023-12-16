import { blobToBase64String } from 'blob-util';

interface DropZoneOptions {
  // Allowed extensions is a list of allowed file extensions that the dropzone
  // accepts. An empty list indicates that all files are accepted,
  allowedExtensions?: string[];
  multiple?: boolean;
}

interface DropZoneFile {
  id: string;
  file: File;
}

class DropZoneError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DropZoneError';
  }
}

/**
 * DropZoneManager manages the files for file inputs and drag-and-drop.
 */
class DropZoneManager {
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
    // Throw an error when the dropzone does not accept multiple files and
    // there are multiple files being added.
    if (!this.multiple && fileList.length > 1) {
      console.log(fileList);
      throw new DropZoneError('Please upload only one file.');
    }

    // Check that every file being added is valid according to the
    // accepted extensions.
    for (let i = 0; i < fileList.length; i += 1) {
      if (!this.isValidFile(fileList[i])) {
        throw new DropZoneError('Please upload valid files.');
      }
    }

    // Replace the file if the dropzone does not accept multiple files and
    // there is only a single file being added.
    if (!this.multiple && fileList.length === 1) {
      this.clear();
    }

    // Add each file with a unique ID.
    for (let i = 0; i < fileList.length; i += 1) {
      this.files.push({
        id: `${fileList[i].name}-${this.count++}`,
        file: fileList[i],
      });
    }

    return this;
  }

  remove(id: string) {
    this.files.filter(file => file.id !== id);
    return this;
  }

  clear() {
    this.files = [];
  }

  getAccept() {
    return this.allowedExtensions.toString();
  }

  async process() {
    return Promise.all(
      this.files.map(
        async ({ file }) =>
          `data:${file.type};base64,${await blobToBase64String(file)}`,
      ),
    );
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
}

export type { DropZoneOptions };
export { DropZoneError };
export default DropZoneManager;
