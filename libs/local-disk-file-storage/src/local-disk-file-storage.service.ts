import { Injectable } from '@nestjs/common';
import { AbstractFileStorage } from 'libs/AbstractFileStorage';
import { existsSync, mkdirSync, createReadStream, createWriteStream } from 'fs';

@Injectable()
export class LocalDiskFileStorageService implements AbstractFileStorage {
  getReadableStream(path: string, fileName: string, fileFormat: string) {
    return createReadStream(`${path}/${fileName}.${fileFormat}`);
  }

  getWritableStream(path: string, fileName: string, fileFormat: string) {
    try {
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }
    } catch (err) {
      console.error(err);
    }

    // TODO: rename "folder" => "path" in rest of app.
    // TODO UP: process filename && escape / in names, etc
    return createWriteStream(`${path}/${fileName}.${fileFormat}`, {
      encoding: 'utf-8',
    });
  }
  // delete(fileName: string): void {
  //   throw new Error('Method not implemented.');
  // }
}
