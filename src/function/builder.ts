import { useObjectUtility } from '@becomes/purple-cheetah';
import { ObjectUtilityError } from '@becomes/purple-cheetah/types';
import { BCMSFunction, BCMSFunctionSchema } from '../types';

export function createBcmsFunction<Payload>(
  config: BCMSFunction<Payload>,
): BCMSFunction<Payload> {
  const objectUtil = useObjectUtility();
  const checkModel = objectUtil.compareWithSchema(
    config,
    BCMSFunctionSchema,
    'function',
  );
  if (checkModel instanceof ObjectUtilityError) {
    throw Error(checkModel.message);
  }
  return config;
}
