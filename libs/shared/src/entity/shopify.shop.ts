// import { Shop as ShopifyShop } from '@shopify/shopify-api/dist/rest-resources/2022-04/index.js';

import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  EntitySchema,
  EntityOptions
} from 'typeorm';

@Entity("shop")
export class ShopifyShopEntity {
  
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @CreateDateColumn()
  public my_created_date: Date;

  @UpdateDateColumn()
  public my_updated_date: Date;

  @Column({ nullable: false })
  public shopify_token: string;

  // https://github.com/Shopify/shopify-node-api/blob/main/src/rest-resources/2022-04/shop.ts
  @Column({ nullable: true })
  public address1: string | null;

  @Column({ nullable: true })
  public address2: string | null;

  @Column({ nullable: true })
  public checkout_api_supported: boolean | null;

  @Column({ nullable: true })
  public city: string | null;

  @Column({ nullable: true })
  public cookie_consent_level: string | null;

  @Column({ nullable: true })
  public country: string | null;

  @Column({ nullable: true })
  public country_code: string | null;

  @Column({ nullable: true })
  public country_name: string | null;

  @Column({ nullable: true })
  public county_taxes: string | null;

  @Column({ nullable: true })
  public created_at: Date | null;

  @Column({ nullable: true })
  public currency: string | null;

  @Column({ nullable: true })
  public customer_email: string | null;

  @Column({ nullable: true })
  public domain: string | null;

  @Column({ nullable: true })
  public eligible_for_card_reader_giveaway: boolean | null;

  @Column({ nullable: true })
  public eligible_for_payments: boolean | null;

  @Column({ nullable: true })
  public email: string | null;

  @Column({ nullable: true, type: 'jsonb' })
  public enabled_presentment_currencies: string[] | null;

  @Column({ nullable: true })
  public finances: boolean | null;

  @Column({ nullable: true })
  public force_ssl: boolean | null;

  @Column({ nullable: true })
  public google_apps_domain: string | null;

  @Column({ nullable: true })
  public google_apps_login_enabled: string | null;

  @Column({ nullable: true })
  public has_discounts: boolean | null;

  @Column({ nullable: true })
  public has_gift_cards: boolean | null;

  @Column({ nullable: true })
  public has_storefront: boolean | null;

  @Column({ nullable: true })
  public iana_timezone: string | null;

  @Column({ nullable: true, type: 'float' })
  public latitude: number | null;

  @Column({ nullable: true, type: 'float' })
  public longitude: number | null;

  @Column({ nullable: true })
  public money_format: string | null;

  @Column({ nullable: true })
  public money_in_emails_format: string | null;

  @Column({ nullable: true })
  public money_with_currency_format: string | null;

  @Column({ nullable: true })
  public money_with_currency_in_emails_format: string | null;

  @Column({ nullable: true })
  public multi_location_enabled: boolean | null;

  @Column({ nullable: true })
  public myshopify_domain: string | null;

  @Column({ nullable: true })
  public name: string | null;

  @Column({ nullable: true })
  public password_enabled: boolean | null;

  @Column({ nullable: true })
  public phone: string | null;

  @Column({ nullable: true })
  public plan_display_name: string | null;

  @Column({ nullable: true })
  public plan_name: string | null;

  @Column({ nullable: true })
  public pre_launch_enabled: boolean | null;

  @Column({ nullable: true })
  public primary_locale: string | null;

  @Column({ nullable: true, type: 'bigint' })
  public primary_location_id: number | null;

  @Column({ nullable: true })
  public province: string | null;

  @Column({ nullable: true })
  public province_code: string | null;

  @Column({ nullable: true })
  public requires_extra_payments_agreement: boolean | null;

  @Column({ nullable: true })
  public setup_required: boolean | null;

  @Column({ nullable: true })
  public shop_owner: string | null;

  @Column({ nullable: true })
  public source: string | null;

  @Column({ nullable: true })
  public tax_shipping: string | null;

  @Column({ nullable: true })
  public taxes_included: string | null;

  @Column({ nullable: true })
  public timezone: string | null;

  @Column({ nullable: true })
  public transactional_sms_disabled: boolean | null;

  @Column({ nullable: true })
  public updated_at: Date | null;

  @Column({ nullable: true })
  public weight_unit: string | null;

  @Column({ nullable: true })
  public zip: string | null;

  // public static async createOrUpdate(
  //   shopObj: ShopifyShop,
  //   accessToken: string
  // ): Promise<Shop> {
  //   const dataSrouce = getDataSource();
  //   const shop = new Shop();
  //   const columnNames = dataSrouce
  //     .getMetadata(Shop)
  //     .ownColumns.map((column) => column.propertyName);
  //   for (const columnName of columnNames) {
  //     if (columnName in shopObj) {
  //       shop[columnName] = shopObj[columnName];
  //     }
  //   }
  //   shop.shopify_token = accessToken;
  //   await dataSrouce.manager.save(shop);
  //   return shop;
  // }

}
