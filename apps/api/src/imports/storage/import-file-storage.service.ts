import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  mkdir,
  readFile,
  unlink,
  access,
  writeFile,
} from 'node:fs/promises';

import { join } from 'node:path';

@Injectable()
export class ImportFileStorageService {
  private readonly uploadDirectory = join(
    process.cwd(),
    'uploads',
    'imports',
  );

async save(
  importJobId: string,
  buffer: Buffer,
): Promise<void> {
  await mkdir(this.uploadDirectory, {
    recursive: true,
  });

  await writeFile(
    this.getFilePath(importJobId),
    buffer,
  );
}

  async get(
    importJobId: string,
  ): Promise<Buffer> {
    const filePath =
      this.getFilePath(importJobId);

    try {
      await access(filePath);
    } catch {
      throw new NotFoundException(
        'Import source file was not found.',
      );
    }

    return readFile(filePath);
  }

  async delete(
    importJobId: string,
  ): Promise<void> {
    const filePath =
      this.getFilePath(importJobId);

    try {
      await unlink(filePath);
    } catch {
      // File may already be gone.
    }
  }

  private getFilePath(
    importJobId: string,
  ): string {
    return join(
      this.uploadDirectory,
      `${importJobId}.xlsx`,
    );
  }
}