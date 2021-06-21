import {
  createController,
  createControllerMethod,
  useFS,
} from '@becomes/purple-cheetah';
import * as path from 'path';
import { useBcmsConfig } from '../config';
import { setup } from 'swagger-ui-express';
import * as YAML from 'yamljs';
import type { BCMSConfig } from '../types';
import type { Request, Response } from 'express';

let swaggerHandler: (
  request: Request,
  response: Response,
  callback: () => void,
) => void;

export const BCMSSwaggerController = createController<{
  bcmsConfig: BCMSConfig;
}>({
  name: 'Swagger Controller',
  path: '/api/swagger',
  setup() {
    return {
      bcmsConfig: useBcmsConfig(),
    };
  },
  methods({ bcmsConfig }) {
    return {
      get: createControllerMethod({
        path: '',
        type: 'get',
        async handler({ request, response }) {
          if (!swaggerHandler) {
            const fs = useFS();
            const file = (await fs.read(path.join(__dirname, 'spec.yaml')))
              .toString()
              .replace('@PORT', '' + bcmsConfig.port);
            swaggerHandler = setup(YAML.parse(file), {
              customCss: '.swagger-ui .topbar { display: none }',
            });
          }
          swaggerHandler(request, response, () => {
            return;
          });
        },
      }),
    };
  },
});
