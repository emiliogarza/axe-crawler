import {
  AxeResult,
  ViolationsReport,
  PassesReport,
} from './schemas.js';

import Logger from '../logger.js';

export default async function queries(knex) {
  const log = new Logger('debug');

  log.debug('Defining CRUD FNs');
  AxeResult.knex(knex);
  ViolationsReport.knex(knex);
  PassesReport.knex(knex);
  await AxeResult.createTable(knex);
  await ViolationsReport.createTable(knex);
  await PassesReport.createTable(knex);

  const create = {
    axe_result: async ({
      url, viewPort, violations, passes,
    }) => {
      log.debug('Inserting axe_result');
      return Promise.all([
        AxeResult
          .query()
          .insert({ url }),
        ViolationsReport
          .query()
          .insert({ url, viewPort, report: violations }),
        PassesReport
          .query()
          .insert({ url, viewPort, report: passes }),
      ]).catch((err) => {
        log.error(`at queries.js:28\n${err}`);
      });
    },
  };

  const read = {
    axe_result: ({ url, viewPort }) => {
      log.debug('Reading axe_result');
      AxeResult
        .query()
        // .where('url', url)
        .then(res => log.debug(`Result received: ${JSON.stringify(res)}`))
        .catch(err => log.error(`Error reading from DB: ${err}`));

      ViolationsReport
        .query()
        // .where('url', url)
        .then(res => log.debug(`Result received: ${JSON.stringify(res)}`))
        .catch(err => log.error(`Error reading from DB: ${err}`));
    },
    tested_pages: () => {
      log.debug('Fetching test results');
      return AxeResult
        .query();
    },
    violations_summary: ({ url }) => ViolationsReport
      .query()
      .where('url', url),
    passes_summary: ({ url }) => PassesReport
      .query()
      .where('url', url),
    summary: async ({ url }) => {
      const violations = await ViolationsReport.query().where('url', url);
      const passes = await PassesReport.query().where('url', url);
      return { violations, passes };
    },
  };

  const update = {};

  const del = {};

  log.debug('Returning CRUD FNs');
  return {
    create,
    read,
    update,
    delete: del,
  };
}

