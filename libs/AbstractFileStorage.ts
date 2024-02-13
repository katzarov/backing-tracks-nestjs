import { Readable, Writable } from 'node:stream';

// TODO: I dont like it... need to make it mooore abstract
// support paths, think more about what info i want to store and what metadata
export declare abstract class AbstractFileStorage {
  abstract getReadableStream(
    folderName: string,
    fileName: string,
    fileFormat: string,
  ): Readable;
  abstract getWritableStream(
    folderName: string,
    fileName: string,
    fileFormat: string,
  ): Writable;
  // abstract delete(fileName: string): void;

  // fileExistsInDirectory() {}
}
