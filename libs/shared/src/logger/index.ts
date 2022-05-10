import 'dotenv/config';
import * as winston from "winston"
import { format, LogCallback, LoggerOptions } from "winston"

export class Logger {

    public Logger: winston.Logger

    private env = process.env.NODE_ENV;
    private level = 'debug';
    private isProduction = false;
    private path = "";
    constructor(opt?: { env?: string, level?: string, path?: string }) {
        if (opt) {
            this.env = opt.env || process.env.NODE_ENV;
            this.isProduction = opt.env === 'production';
            this.level = opt.level || (this.isProduction ? `warn` : 'debug');
            this.path = opt.path || './logger/';
        }
        this.initial();
    }

    private async initial() {
        this.createLogger();
    }

    private createLogger() {
        this.Logger = winston.createLogger({
            level: this.level,
            format: this.format(),
            transports: this.transports(),
        });
    }

    private format() {
        if (this.isProduction) {
            return format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss.SSS'
                }),
                format.errors({ stack: true }),
                format.splat(),
                format.json()
            )
        } else {
            return format.combine(
                format.colorize(),
                format.timestamp({
                    format: 'HH:mm:ss.SSS'
                }),
                format.printf(info => {
                    const infoData = Object.assign({}, info, {
                        level: undefined,
                        message: undefined,
                        splat: undefined,
                        label: undefined,
                        timestamp: undefined,
                    });
                    delete infoData.level
                    delete infoData.message
                    delete infoData.splat
                    delete infoData.label
                    delete infoData.timestamp
                    return `[${info.timestamp}] ${info.level} ${info.message} ${Object.keys(infoData).length > 0 ? JSON.stringify(infoData) : ""}`
                }

                )
            )
        }
    }

    private transports() {
        if (this.isProduction) {
            return [
                new winston.transports.File({ filename: `${this.path}error.log`, level: 'error' }),
                new winston.transports.File({ filename: `${this.path}combined.log` }),
            ];
        } else {
            return [
                new winston.transports.Console(),
            ];
        }
    }

    public log(level: string, message: string, meta?: any, callback?: LogCallback) {
        this.Logger.log(level, message, meta, callback);
    }

    public error(message: string, meta?: any, callback?: LogCallback) {
        this.Logger.log("error", message, meta, callback);
    }
    public warn(message: string, meta?: any, callback?: LogCallback) {
        this.Logger.log("warn", message, meta, callback);
    }

    public info(message: string, meta?: any, callback?: LogCallback) {
        this.Logger.log("info", message, meta, callback);
    }

    public debug(message: string, meta?: any, callback?: LogCallback) {
        this.Logger.log("debug", message, meta, callback);
    }

}