import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';

export const BCMSCypressController = createController({
  name: 'Cypress controller',
  path: '/api/cy',
  methods: [
    createControllerMethod({
      path: '/reset',
      name: 'reset',
      type: 'post',
      async handler() {
        // TODO: create database
      },
    }),
  ],
});
