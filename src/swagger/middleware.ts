import { createMiddleware } from '@becomes/purple-cheetah';
import { serve } from 'swagger-ui-express';

export const BCMSSwaggerMiddleware = createMiddleware({
  name: 'Swagger Middleware',
  path: '/api/swagger',
  after: false,
  handler() {
    return serve;
  },
});
