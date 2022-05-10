import 'dotenv/config';
import { ControllerBase, ControllerBaseInterface } from "../common/controller"
import * as schedule from 'node-schedule';
import type { RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit } from 'node-schedule';

import { TaskEntity } from '../entity/task';
// import { TestTask } from './test';
import { ProduceTask } from './produce';

export class Task extends ControllerBase {

    private TaskFunMap: { [key: string]: () => Promise<any> } = {};

    constructor(bootstrap: ControllerBaseInterface) {
        super(bootstrap);
        this.initial();
    }

    private async initial() {
        const produceTask = new ProduceTask(this);
        await this.register("produce.register", '*/5 * * * * *', true, produceTask.register(), "测试模拟两个定时任务共享一个Class生命周期，执行注册");
        await this.register("produce.run", '*/10 * * * * *', true, produceTask.run(), "测试模拟两个定时任务共享一个Class生命周期,执行打印", 60 * 1000);
    }

    // RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date 
    public async register(name: string, rule: string, enable: boolean, fun: () => Promise<any>, describe: string, diff: number = 0) {
        this.TaskFunMap[name] = fun;
        const taskRepository = this.Database.getRepository(TaskEntity);
        const findTask = await taskRepository.findOne({ where: { name: name } });
        if (findTask) {
            if (findTask.rule != rule || findTask.execute_diff != diff || findTask.enable != enable || findTask.describe != describe) {
                findTask.rule = rule;
                findTask.execute_diff = diff;
                findTask.enable = enable;
                findTask.describe = describe;
                await taskRepository.save(findTask);
            }
        } else {
            const task = taskRepository.create();
            task.name = name;
            task.rule = rule;
            task.execute_diff = diff;
            task.enable = enable;
            task.describe = describe;
            await taskRepository.save(task);
        }
    }

    public async start() {
        const taskRepository = this.Database.getRepository(TaskEntity);
        const findTask = await taskRepository.find({ where: { enable: true } });
        for (const task of findTask) {

            if (task && task.execute_diff > 0 && (Date.now() - task.execute_start_at.getTime()) >= task.execute_diff) {
                if (this.TaskFunMap[task.name]) {
                    try {
                        if (this.TaskFunMap[task.name]) {
                            this.TaskFunMap[task.name]().then(() => {
                                task.execute_end_at = new Date();
                                taskRepository.save(findTask);
                            }).catch((error) => {
                                this.Logger.error(`Task ${JSON.stringify(error)}`)
                            }).finally(() => {
                            });
                        }
                    } catch (err) {
                        this.Logger.error(`Task ${JSON.stringify(err)}`)
                    }
                }
            }

            schedule.scheduleJob(task.rule, () => {
                task.execute_start_at = new Date();
                taskRepository.save(findTask);
                try {
                    if (this.TaskFunMap[task.name]) {
                        this.TaskFunMap[task.name]().then(() => {
                            task.execute_end_at = new Date();
                            taskRepository.save(findTask);
                        }).catch((error) => {
                            this.Logger.error(`Task ${JSON.stringify(error)}`)
                        }).finally(() => {
                            // task.execute_end_at = new Date();
                            // taskRepository.save(findTask);
                        });
                    }
                } catch (err) {
                    this.Logger.error(`Task ${JSON.stringify(err)}`)
                }
            });



        }
    }

}