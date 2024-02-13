import { Injectable } from '@nestjs/common';
import { AbstractFileStorage } from 'libs/AbstractFileStorage';
import { existsSync, mkdirSync, createReadStream, createWriteStream } from 'fs';

@Injectable()
export class LocalDiskFileStorageService implements AbstractFileStorage {
  getReadableStream(folderName: string, fileName: string, fileFormat: string) {
    return createReadStream(`${folderName}/${fileName}.${fileFormat}`);
  }

  getWritableStream(folderName: string, fileName: string, fileFormat: string) {
    try {
      if (!existsSync(folderName)) {
        mkdirSync(folderName);
      }
    } catch (err) {
      console.error(err);
    }

    // TODO UP: process filename && escape / in names, etc
    return createWriteStream(`${folderName}/${fileName}.${fileFormat}`, {
      encoding: 'utf-8',
    });
  }
  // delete(fileName: string): void {
  //   throw new Error('Method not implemented.');
  // }
}
