import {
  createController,
  createControllerMethod,
  useFS,
} from '@becomes/purple-cheetah';
import * as path from 'path';
import { useBcmsConfig } from '../config';
import { setup } from 'swagger-ui-express';
import * as YAML from 'yamljs';

let swaggerHandler: (request: any, response: any, callback: () => void) => void;

export const BCMSSwaggerController = createController({
  name: 'Swagger Controller',
  path: '/api/swagger',
  methods: [
    createControllerMethod({
      path: '',
      name: 'get',
      type: 'get',
      async handler({ request, response }) {
        if (!swaggerHandler) {
          const bcmsConfig = useBcmsConfig();
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
  ],
});
