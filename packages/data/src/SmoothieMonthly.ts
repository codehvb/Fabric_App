import {
  date,
  decimal,
  entity,
  int,
  one,
  role,
  text,
  uuid,
} from '@microsoft/rayfin-core';

import { Smoothie } from './Smoothie.js';

/** One month of sales for a smoothie, feeding its trend charts. */
@entity()
@role('authenticated', 'read')
@role('authenticated', 'create', {
  policy: (claims, item) => claims.sub.eq(item.owner_id),
})
@role('authenticated', 'update', {
  policy: (claims, item) => claims.sub.eq(item.owner_id),
})
@role('authenticated', 'delete', {
  policy: (claims, item) => claims.sub.eq(item.owner_id),
})
export class SmoothieMonthly {
  @uuid() id!: string;
  @date() month!: Date;
  @int() unitsSold!: number;
  @decimal() revenueUsd!: number;
  @decimal() avgRating!: number;
  @uuid() smoothie_id!: string;
  @one(() => Smoothie) smoothie!: Smoothie;
  @text({ max: 200 }) owner_id!: string;
}
