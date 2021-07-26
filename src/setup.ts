import { useStringUtility } from '@becomes/purple-cheetah';
import type { Module } from '@becomes/purple-cheetah/types';
import { useBcmsStatusFactory, useBcmsStatusRepository } from './status';

async function exec() {
  const stringUtil = useStringUtility();
  const statusRepo = useBcmsStatusRepository();
  const statusFactory = useBcmsStatusFactory();
  const draftStatus = await statusRepo.methods.findByName('Draft');
  if (!draftStatus) {
    await statusRepo.add(
      statusFactory.create({
        label: 'Draft',
        name: stringUtil.toSlugUnderscore('Draft'),
      }) as never,
    );
  }
  const activeStatus = await statusRepo.methods.findByName('Active');
  if (!activeStatus) {
    await statusRepo.add(
      statusFactory.create({
        label: 'Active',
        name: stringUtil.toSlugUnderscore('Active'),
      }) as never,
    );
  }
}

export function bcmsSetup(): Module {
  return {
    name: 'Setup',
    initialize(moduleConfig) {
      exec()
        .then(() => {
          moduleConfig.next();
        })
        .catch((error) => {
          moduleConfig.next(error);
        });
    },
  };
}
