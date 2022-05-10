import { DataSource } from 'typeorm';

let dataSource: DataSource;

async function initDataSource(entities): Promise<DataSource> {
  dataSource = new DataSource({
    // @ts-ignore
    type: process.env.TYPEORM_TYPE,
    host: process.env.TYPEORM_HOST,
    port: Number(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    synchronize: true,
    logging: false,
    entities: entities,
    migrations: [],
    subscribers: [],
  });
  await dataSource.initialize();
  return dataSource;
}

function getDataSource(): DataSource {
  return dataSource;
}

function shared(): string {
  return 'shared';
}

export { shared, getDataSource, initDataSource };
