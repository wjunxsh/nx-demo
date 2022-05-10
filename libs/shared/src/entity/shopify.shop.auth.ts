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

@Entity("shop_auth")
export class ShopifyShopAuthEntity {

  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Index()
  @Column({ name: "shop", length: 512, comment: "店铺地址" })
  public shop: string;

  @Column({ name: "scope", length: 1024, comment: "接口可访问权限" })
  public scope: string;

  @Column({ name: "user_scope", nullable: true, length: 1024, comment: "给定用户权限" })
  public user_scope: string;

  @Column({ name: "is_online", nullable: true, default: true, comment: "授权方式 true 在线， false 离线" })
  public is_online: boolean;

  @Column({ name: "is_storefront", nullable: true, default: false, comment: "店面授权 true 是， false 否" })
  public is_storefront: boolean;

  @Column({ name: "token", length: 64, nullable: true, comment: "令牌, 店面令牌" })
  public token: string;

  @Column({ name: "access_token", length: 64, comment: "访问令牌" })
  public access_token: string;

  @Column({ name: "expires", nullable: true, comment: "令牌过期时间" })
  public expires: Date;

  @CreateDateColumn({ name: "created_at", nullable: true, comment: "创建时间" })
  public created_at: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true, comment: "修改时间" })
  public updated_at: Date;

  @DeleteDateColumn({ name: "deleted_at", nullable: true, comment: "删除时间" })
  public deleted_at: Date;

  @ManyToOne(() => ShopifyUserEntity, (ShopUser) => ShopUser.shops, { cascade: ["insert"], onDelete: "CASCADE" })
  @JoinColumn({ name: "shop_user_id" })
  public shop_user_id: ShopifyUserEntity | number;

}
