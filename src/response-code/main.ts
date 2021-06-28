import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as YAML from 'yamljs';
import { useObjectUtility } from '@becomes/purple-cheetah';
import { ObjectUtilityError } from '@becomes/purple-cheetah/types';
import type { ResponseCode, ResponseCodeList } from '../types';

let responseCode: ResponseCode;

export function useResponseCode(): ResponseCode {
  return responseCode;
}
export async function loadResponseCode(): Promise<void> {
  const codes: ResponseCodeList = {};
  const registry: Array<{
    name: string;
    msg: string;
  }> = [];

  async function fileTree(dir: string) {
    const ft: string[] = [];
    const files = await util.promisify(fs.readdir)(dir);
    for (const i in files) {
      const file = files[i];
      if (file.endsWith('.yml')) {
        ft.push(path.join(dir, file));
      } else if (file.indexOf('.') === -1) {
        const stat = await util.promisify(fs.lstat)(path.join(dir, file));
        if (!stat.isFile()) {
          (await fileTree(path.join(dir, file))).forEach((e) => {
            ft.push(e);
          });
        }
      }
    }
    return ft;
  }

  const objectUtil = useObjectUtility();
  const buffer: Array<{ name: string; data: ResponseCodeList }> = [];
  const files = await fileTree(path.join(__dirname, 'codes'));
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    buffer.push({
      name: file,
      data: YAML.load(file),
    });
  }
  for (let i = 0; i < buffer.length; i++) {
    if (typeof buffer[i] !== 'object') {
      throw Error(
        `${buffer[i].name} ---> Expected an "object" but got "${typeof buffer[
          i
        ]}".`,
      );
    }
    const dataKeys = Object.keys(buffer[i].data);
    for (let j = 0; j < dataKeys.length; j++) {
      const key = dataKeys[j];
      const data = buffer[i].data;
      const checkSchema = objectUtil.compareWithSchema(data[key], {
        msg: {
          __type: 'string',
          __required: true,
        },
      });
      if (checkSchema instanceof ObjectUtilityError) {
        throw Error(
          `${buffer[i].name} ---> ${checkSchema.errorCode}: ${checkSchema.message}`,
        );
      }
      if (codes[key]) {
        throw Error(
          `${buffer[i].name} ---> Multiple declarations of "${key}".`,
        );
      }
      codes[key] = data[key];
      registry.forEach((e) => {
        if (!codes[e.name]) {
          codes[e.name] = {
            msg: e.msg,
          };
        }
      });
    }
  }
  responseCode = {
    register(_codes) {
      _codes.forEach((code) => {
        registry.push(code);
      });
    },
    get(code, vars) {
      const c = codes[code];
      if (!c) {
        throw new Error(`Code "${code}" does not exist.`);
      }
      let msg = '' + c.msg;
      if (vars) {
        for (const key in vars) {
          let buf = '' + msg;
          // eslint-disable-next-line no-constant-condition
          while (true) {
            msg = msg.replace(`%${key}%`, vars[key] as string);
            if (buf === msg) {
              break;
            }
            buf = '' + msg;
          }
        }
      }
      return {
        code,
        message: msg,
      };
    },
  };
}
