import { FileValidator } from '@nestjs/common';
import { fromBuffer, FileExtension, MimeType } from 'file-type';

export class FileMagicNumberValidator extends FileValidator<{
  fileExtension: FileExtension;
  mimeType: MimeType;
}> {
  async isValid(file: Express.Multer.File) {
    const fileType = await fromBuffer(file.buffer);

    if (fileType === undefined) {
      return false;
    }

    const { ext, mime } = fileType;
    const { fileExtension, mimeType } = this.validationOptions;

    if (ext !== fileExtension || mime !== mimeType) {
      return false;
    }

    return true;
  }

  buildErrorMessage() {
    return 'File is corrupt.';
  }
}
