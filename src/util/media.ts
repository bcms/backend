import * as path from 'path';
import { FSUtil } from '@becomes/purple-cheetah';
import { FSMedia, Media, MediaType } from '../media';
import { CacheControl } from '../cache';
import * as fse from 'fs-extra';
import { rename } from 'fs';

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
      async mkdir(media: Media | FSMedia) {
        if (media.type === MediaType.DIR) {
          await FSUtil.save(
            '',
            path.join(process.cwd(), 'uploads', media.path, 'tmp.txt'),
          );
          await FSUtil.deleteFile(
            path.join(process.cwd(), 'uploads', media.path, 'tmp.txt'),
          );
        }
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
      async move(from: string, to: string) {
        await fse.move(
          path.join(process.cwd(), 'uploads', from),
          path.join(process.cwd(), 'uploads', to),
        );
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
  public static async getChildren(
    media: Media | FSMedia,
  ): Promise<Array<Media | FSMedia>> {
    const children = await CacheControl.media.findAllByParentIdDepth1(
      `${media._id}`,
    );
    const childrenOfChildren: Array<Media | FSMedia> = [];
    for (const i in children) {
      const child = children[i];
      if (child.type === MediaType.DIR) {
        (await this.getChildren(child)).forEach((e) => {
          childrenOfChildren.push(e);
        });
      }
    }
    return [...children, ...childrenOfChildren];
  }
}
