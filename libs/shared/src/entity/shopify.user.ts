// import { Shop as ShopifyShop } from '@shopify/shopify-api/dist/rest-resources/2022-04/index.js';

import {
  Entity,
  Column,
  Index,
  PrimaryColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';

import { ShopifyUserShopEntity } from './shopify.user.shop';
import { ShopifyShopAuthEntity } from './shopify.shop.auth';


@Entity("shop_user")
export class ShopifyUserEntity {

  @PrimaryColumn({ type: 'bigint', primary: true })
  id: number;

  @Column({ name: "first_name", length: 128, comment: "用户姓" })
  public first_name: string;

  @Column({ name: "last_name", length: 128, comment: "用户名" })
  public last_name: string;

  @Column({ name: "locale", length: 32, comment: "用户设置语种" })
  public locale: string;

  @Index()
  @Column({ name: "email", length: 256, comment: "用户邮箱" })
  public email: string;

  @Column({ name: "email_verified", nullable: true, default: true, comment: "用户邮箱验证状态" })
  public email_verified: boolean;

  @OneToMany(() => ShopifyUserShopEntity, (shop) => shop.shop)
  public shops: ShopifyUserShopEntity[];

  @OneToMany(() => ShopifyShopAuthEntity, (shop) => shop.shop)
  public shop_auth: ShopifyShopAuthEntity[];

  @CreateDateColumn({ name: "created_at", nullable: true, comment: "创建时间" })
  public created_at: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, comment: "修改时间" })
  public updated_at: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, comment: "删除时间" })
  public deleted_at: Date;

}
