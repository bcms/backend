import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as YAML from 'yamljs';
import { ObjectUtility } from '@becomes/purple-cheetah';

export interface IResponseCode {
  [key: string]: {
    msg: string;
  };
}

export class ResponseCode {
  private static codes: IResponseCode = {};

  private static async fileTree(dir: string) {
    const ft: string[] = [];
    const files = await util.promisify(fs.readdir)(dir);
    for (const i in files) {
      const file = files[i];
      if (file.endsWith('.yml')) {
        ft.push(path.join(dir, file));
      } else if (file.indexOf('.') === -1) {
        const fsstat = await util.promisify(fs.lstat)(path.join(dir, file));
        if (fsstat.isFile() === false) {
          (await this.fileTree(path.join(dir, file))).forEach((e) => {
            ft.push(e);
          });
        }
      }
    }
    return ft;
  }

  static async init() {
    const buffer: Array<{ name: string; data: IResponseCode }> = [];
    const files = await this.fileTree(path.join(__dirname, 'codes'));
    for (const i in files) {
      const file = files[i];
      buffer.push({
        name: file,
        data: YAML.load(file),
      });
    }
    for (const i in buffer) {
      if (typeof buffer[i] !== 'object') {
        throw new Error(
          `${buffer[i].name} ---> Expected an "object" but got "${typeof buffer[
            i
          ]}".`,
        );
      }
      for (const key in buffer[i].data) {
        const data = buffer[i].data;
        try {
          ObjectUtility.compareWithSchema(data[key], {
            msg: {
              __type: 'string',
              __required: true,
            },
          });
        } catch (error) {
          throw new Error(`${buffer[i].name} ---> ${error.message}`);
        }
        if (this.codes[key]) {
          throw new Error(
            `${buffer[i].name} ---> Multiple declarations of "${key}".`,
          );
        }
        this.codes[key] = data[key];
      }
    }
  }

  static get(
    code: string,
    vars?: any,
  ): {
    code: string;
    message: string;
  } {
    const c = this.codes[code];
    if (!c) {
      throw new Error(`Code "${code}" does not exist.`);
    }
    let msg = '' + c.msg;
    if (vars) {
      for (const key in vars) {
        msg = c.msg.replace(new RegExp(`%${key}%`, 'g'), vars[key]);
      }
    }
    return {
      code,
      message: msg,
    };
  }
}
