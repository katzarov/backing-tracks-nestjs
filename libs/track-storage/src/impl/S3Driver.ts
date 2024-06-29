import { Readable } from 'node:stream';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface S3DriverOptions {
  region: string;
  bucket: string;
}
export class S3Driver {
  s3Client: S3Client;
  bucket: string;

  constructor({ region, bucket }: S3DriverOptions) {
    this.s3Client = new S3Client({ region });
    this.bucket = bucket;
  }

  async uploadObject(stream: Readable, key: string) {
    const uploadParams = {
      Bucket: this.bucket,
      Key: key,
      Body: stream,
    };

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: uploadParams,
      });

      upload.on('httpUploadProgress', (progress) => {
        console.log(progress);
      });

      await upload.done();
      console.log(`File uploaded successfully to ${this.bucket}/${key}`);
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  }

  createPresignedUrl(key: string) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    // TODO: set expiration to just a few seconds for production | make it env configurable
    // ideally would like to make it a one time url but that is not possible out of the box I believe
    return getSignedUrl(this.s3Client, command, { expiresIn: 30 });
  }

  // TODO: consider ? allowing users to upload straight to s3, again with a presigned url
  // TODO: react app / browser needs to trust downloads from s3 ? and auto start the download w/o user interaction.
}
