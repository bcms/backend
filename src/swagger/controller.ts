import {
  createController,
  createControllerMethod,
  useFS,
} from '@becomes/purple-cheetah';
import * as path from 'path';
import { setup } from 'swagger-ui-express';
import * as YAML from 'yamljs';
import type { Request, Response } from 'express';
import { BCMSConfig } from '@bcms/config';

let swaggerHandler: (
  request: Request,
  response: Response,
  callback: () => void,
) => void;

export const BCMSSwaggerController = createController({
  name: 'Swagger Controller',
  path: '/api/swagger',
  methods() {
    return {
      get: createControllerMethod({
        path: '',
        type: 'get',
        async handler({ request, response }) {
          if (!swaggerHandler) {
            const fs = useFS();
            const file = (
              await fs.read(
                path.join(process.cwd(), 'bcms-backend-api.spec.yml'),
              )
            )
              .toString()
              .replace('@PORT', '' + BCMSConfig.port);
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
