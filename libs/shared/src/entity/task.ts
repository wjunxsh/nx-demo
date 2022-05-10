import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';

@Entity("task")
export class TaskEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "name", length: 128, unique: true, comment: "任务名称" })
  public name: string;

  @Column({ name: "rule", length: 128, default: true, comment: "执行规则" })
  public rule: string;

  @Column({ name: "enable", nullable: true, default: true, comment: "启用状态 true 启用， false 停用" })
  public enable: boolean;

  @Column({ name: "describe", type: "text", nullable: true, comment: "备注" })
  public describe: string;

  @Column({ name: "execute_diff", default: 0, comment: "运行差（毫秒）， 当前时间 - 最近运行启动时间 小于当前设置则立即执行" })
  public execute_diff: number;

  @CreateDateColumn({ name: "execute_start_at", nullable: true, comment: "最近运行启动时间" })
  public execute_start_at: Date;

  @CreateDateColumn({ name: "execute_end_at", nullable: true, comment: "最近运行结束时间" })
  public execute_end_at: Date;

  @CreateDateColumn({ name: "created_at", nullable: true, comment: "创建时间" })
  public created_at: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, comment: "修改时间" })
  public updated_at: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, comment: "删除时间" })
  public deleted_at: Date;

}
