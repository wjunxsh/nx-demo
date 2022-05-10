// import { Shop as ShopifyShop } from '@shopify/shopify-api/dist/rest-resources/2022-04/index.js';

import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';

import { ShopifyUserEntity } from './shopify.user';

@Entity("shop_user_shop")
export class ShopifyUserShopEntity {

  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne((type) => ShopifyUserEntity, (ShopUser) => ShopUser.shops, {cascade: ["insert"], onDelete: "CASCADE"})
  @JoinColumn({ name: "shop_user_id" })
  public shopUserId: ShopifyUserEntity | number;

  @Index()
  @Column({ name: "shop", length: 512, comment: "店铺地址" })
  public shop: string;

  @Column({ name: "account_owner", nullable: true, default: false, comment: "店铺所有权" })
  public account_owner: boolean;

  @Column({ name: "collaborator", nullable: true, default: false, comment: "店铺合作者" })
  public collaborator: boolean;

  @CreateDateColumn({ name: "created_at", nullable: true, comment: "创建时间" })
  public created_at: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, comment: "修改时间" })
  public updated_at: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, comment: "删除时间" })
  public deleted_at: Date;

}
