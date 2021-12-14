import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import type { BCMSChangeName } from '@bcms/types';
import type { Module } from '@becomes/purple-cheetah/types';

async function init() {
  const names: BCMSChangeName[] = [
    'color',
    'entry',
    'group',
    'language',
    'media',
    'status',
    'tag',
    'templates',
    'widget',
  ];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (!(await BCMSRepo.change.methods.findByName(name))) {
      await BCMSRepo.change.add(
        BCMSFactory.change.create({
          count: 0,
          name: name,
        }),
      );
    }
  }
}
export function createChangeInitializeModule(): Module {
  return {
    name: 'Change initialization',
    initialize({ next }) {
      init()
        .then(() => next())
        .catch((err) => next(err));
    },
  };
}
