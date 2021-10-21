import * as path from 'path';
import { useFS, useLogger, useObjectUtility } from '@becomes/purple-cheetah';
import { Module, ObjectUtilityError } from '@becomes/purple-cheetah/types';
import {
  BCMSEvent,
  BCMSEventConfigMethod,
  BCMSEventConfigScope,
  BCMSEventManager,
  BCMSEventSchema,
} from '../types';

let eventManager: BCMSEventManager;

export function useBcmsEventManager(): BCMSEventManager {
  return eventManager;
}

export function createBcmsEventModule(): Module {
  return {
    name: 'Event',
    initialize(moduleConfig) {
      const events: BCMSEvent[] = [];
      const logger = useLogger({ name: 'Event manager' });
      const fs = useFS();
      const objectUtil = useObjectUtility();
      const eventsPath = path.join(process.cwd(), 'events');

      fs.exist(eventsPath)
        .then(async (result) => {
          if (result) {
            const eventNames = await fs.readdir(eventsPath);
            for (let i = 0; i < eventNames.length; i++) {
              const eventName = eventNames[i];
              if (eventName.endsWith('.js') || eventName.endsWith('.ts')) {
                const eventFn: { default: () => Promise<BCMSEvent> } = await import(
                  path.join(eventsPath, eventName)
                );
                const checkFn = objectUtil.compareWithSchema(
                  { fn: eventFn.default },
                  {
                    fn: {
                      __type: 'function',
                      __required: true,
                    },
                  },
                  eventName,
                );
                if (checkFn instanceof ObjectUtilityError) {
                  moduleConfig.next(Error(checkFn.message));
                  return;
                }
                const event = await eventFn.default();
                const checkObject = objectUtil.compareWithSchema(
                  event,
                  BCMSEventSchema,
                  eventName,
                );
                if (checkObject instanceof ObjectUtilityError) {
                  moduleConfig.next(Error(checkObject.message));
                  return;
                }
                events.push(event);
              }
            }

            eventManager = {
              async emit(scope, method, data) {
                for (let i = 0; i < events.length; i++) {
                  const event = events[i];
                  if (
                    event.config.scope === BCMSEventConfigScope.ALL ||
                    event.config.scope === scope
                  ) {
                    if (
                      event.config.method === method ||
                      event.config.method === BCMSEventConfigMethod.ALL
                    ) {
                      try {
                        await event.handler({ scope, method, payload: data });
                      } catch (error) {
                        logger.error('emit', {
                          event,
                          error,
                        });
                      }
                    }
                  }
                }
              },
            };
          }
          moduleConfig.next();
        })
        .catch((error) => {
          moduleConfig.next(error);
        });
    },
  };
}
