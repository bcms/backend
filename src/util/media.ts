import * as sharp from 'sharp';
import * as path from 'path';
import { FSUtil } from '@becomes/purple-cheetah';
import { FSMedia, Media, MediaType } from '../media';
import { CacheControl } from '../cache';
import * as fse from 'fs-extra';

export class MediaUtil {
  static get fs() {
    return {
      async getPath(media: Media | FSMedia, size?: 'small'): Promise<string> {
        if (media.type === MediaType.DIR) {
          return path.join(process.cwd(), 'uploads', media.path);
        }
        if (size && media.type === MediaType.IMG) {
          const nameParts = {
            name: media.name.split('.')[0],
            ext: media.name.split('.')[1].toLowerCase(),
          };
          if (
            nameParts.ext === 'jpg' ||
            nameParts.ext === 'jpeg' ||
            nameParts.ext === 'png'
          ) {
            if (size === 'small') {
              const location = path.join(
                process.cwd(),
                'uploads',
                media.path,
                `300-${media.name}`,
              );
              if (await FSUtil.exist(location)) {
                return location;
              }
            }
          }
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
      async get(media: Media | FSMedia, size?: 'small'): Promise<Buffer> {
        if (size && media.type === MediaType.IMG) {
          const nameParts = {
            name: media.name.split('.')[0],
            ext: media.name.split('.')[1].toLowerCase(),
          };
          if (
            nameParts.ext === 'jpg' ||
            nameParts.ext === 'jpeg' ||
            nameParts.ext === 'png'
          ) {
            if (size === 'small') {
              const location = path.join(
                process.cwd(),
                'uploads',
                media.path,
                `300-${media.name}`,
              );
              if (await FSUtil.exist(location)) {
                return await FSUtil.read(location);
              }
            }
          }
        }
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
        if (media.type === MediaType.IMG) {
          const nameParts = {
            name: media.name.split('.')[0],
            ext: media.name.split('.')[1].toLowerCase(),
          };
          if (nameParts.ext === 'png') {
            const output = await sharp(binary)
              .resize({
                width: 300,
                withoutEnlargement: true,
              })
              .png({
                quality: 50,
              })
              .toBuffer();
            await FSUtil.save(
              output,
              path.join(
                process.cwd(),
                'uploads',
                media.path,
                `300-${media.name}`,
              ),
            );
          } else if (nameParts.ext === 'jpg' || nameParts.ext === 'jpeg') {
            const output = await sharp(binary)
              .resize({
                width: 300,
                withoutEnlargement: true,
              })
              .jpeg({
                quality: 50,
              })
              .toBuffer();
            await FSUtil.save(
              output,
              path.join(
                process.cwd(),
                'uploads',
                media.path,
                `300-${media.name}`,
              ),
            );
          }
        }
      },
      async removeFile(media: Media | FSMedia) {
        await FSUtil.deleteFile(
          path.join(process.cwd(), 'uploads', media.path, media.name),
        );
        if (media.type === MediaType.IMG) {
          const nameParts = {
            name: media.name.split('.')[0],
            ext: media.name.split('.')[1].toLowerCase(),
          };
          if (
            nameParts.ext === 'jpg' ||
            nameParts.ext === 'jpeg' ||
            nameParts.ext === 'png'
          ) {
            await FSUtil.deleteFile(
              path.join(
                process.cwd(),
                'uploads',
                media.path,
                `300-${media.name}`,
              ),
            );
          }
        }
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
