import 'dotenv/config';
import { DataSource } from 'typeorm';

export class DatabaseStorage extends DataSource {
    // MixedList<()=> any | string | EntitySchema> 
    constructor(entities: any) {
        super({
            type: process.env.TYPEORM_TYPE as "mysql" | "postgres",
            host: process.env.TYPEORM_HOST,
            port: Number(process.env.TYPEORM_PORT),
            username: process.env.TYPEORM_USERNAME,
            password: process.env.TYPEORM_PASSWORD,
            database: process.env.TYPEORM_DATABASE,
            synchronize: true,
            // dropSchema:true,
            // logging: true,
            entities: entities,
            migrations: [],
            subscribers: [],
        });
    }
    
}