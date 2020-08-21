import * as path from 'path';
import { FSUtil } from '@becomes/purple-cheetah';
import { FSMedia, Media, MediaType } from '../media';

export class MediaUtil {
  static get fs() {
    return {
      getPath(media: Media | FSMedia): string {
        if (media.type === MediaType.DIR) {
          return path.join(process.cwd(), 'uploads', media.path);
        }
        return path.join(process.cwd(), 'uploads', media.path, media.name);
      },
      async exist(media: Media | FSMedia): Promise<boolean> {
        if (media.type === MediaType.DIR) {
          return await FSUtil.exist(
            path.join(process.cwd(), 'uploads', media.path),
          );
        }
        return await FSUtil.exist(
          path.join(process.cwd(), 'uploads', media.path, media.name),
        );
      },
      async get(media: Media | FSMedia): Promise<Buffer> {
        return await FSUtil.read(
          path.join(process.cwd(), 'uploads', media.path, media.name),
        );
      },
      async save(media: Media | FSMedia, binary: Buffer) {
        await FSUtil.save(
          binary,
          path.join(process.cwd(), 'uploads', media.path, media.name),
        );
      },
      async removeFile(media: Media | FSMedia) {
        await FSUtil.deleteFile(
          path.join(process.cwd(), 'uploads', media.path, media.name),
        );
      },
      async removeDir(media: Media | FSMedia) {
        await FSUtil.deleteDir(path.join(process.cwd(), 'uploads', media.path));
      },
    };
  }
  // TODO: Add support for other mimetypes.
  public static mimetypeToMediaType(mimetype: string): MediaType {
    switch (mimetype.split('/')[0]) {
      case 'image': {
        return MediaType.IMG;
      }
      default: {
        return MediaType.OTH;
      }
    }
  }
}
