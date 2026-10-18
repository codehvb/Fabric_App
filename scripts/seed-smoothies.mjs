// Loads the Maison Nectar sample menu into the app's Fabric database.
//
// Run `npm run dev` first, then `npm run seed` in a second terminal. The script
// signs in as you through the dev server's local sign-in endpoint (which reuses
// your `rayfin login`), so no password or secret is involved. Re-running it
// replaces the rows you seeded earlier with a fresh copy.

import { signInWithBrokeredToken } from '@microsoft/rayfin-auth-provider-fabric';
import { RayfinClient } from '@microsoft/rayfin-client';

import { buildMenu } from './seed/smoothie-menu.mjs';

const devServer = process.env.SEED_DEV_SERVER ?? 'http://localhost:5173';
const started = Date.now();
const log = (...parts) =>
  console.log(`[${((Date.now() - started) / 1000).toFixed(1)}s]`, ...parts);

async function getJson(path) {
  let response;
  try {
    response = await fetch(new URL(path, devServer));
  } catch {
    throw new Error(
      `Could not reach the dev server at ${devServer}. Start it with \`npm run dev\` and try again.`
    );
  }
  if (!response.ok) {
    throw new Error(
      `${path} returned HTTP ${response.status}. Is \`npm run dev\` running with local sign-in enabled?`
    );
  }
  return response.json();
}

async function main() {
  const config = await getJson('/rayfin.config.json');
  const token = await getJson('/.rayfin/dev/session-token');

  const client = new RayfinClient({
    baseUrl: config.apiUrl,
    publishableKey: config.publishableKey,
    authStorage: false,
    runtimeConfig: config,
  });
  const session = await signInWithBrokeredToken(client.auth, token);
  // Row policies compare `owner_id` with the session user's id.
  const owner = session.user?.id;
  if (!owner) throw new Error('Signed in, but the session carries no user id.');
  log('Signed in.');

  // Clear the rows this user seeded before, children first.
  const oldMonths = await client.data.SmoothieMonthly.select(['id'])
    .where({ owner_id: { eq: owner } })
    .first(1000)
    .execute();
  for (const row of oldMonths) await client.data.SmoothieMonthly.delete({ id: row.id });
  const oldSmoothies = await client.data.Smoothie.select(['id'])
    .where({ owner_id: { eq: owner } })
    .first(1000)
    .execute();
  for (const row of oldSmoothies) await client.data.Smoothie.delete({ id: row.id });
  log(`Removed ${oldSmoothies.length} smoothies and ${oldMonths.length} monthly rows.`);

  const now = new Date();
  for (const { months, ...smoothie } of buildMenu()) {
    log(`Creating ${smoothie.code}…`);
    const created = await client.data.Smoothie.create({
      ...smoothie,
      updatedAt: now,
      owner_id: owner,
    });
    for (const month of months) {
      await client.data.SmoothieMonthly.create({
        ...month,
        smoothie_id: created.id,
        owner_id: owner,
      });
    }
    log(`  ${smoothie.code}  ${smoothie.name}  (+${months.length} months)`);
  }

  const check = await client.data.Smoothie.select(['code', 'name', 'priceUsd', 'unitsSold', 'revenueUsd', 'avgRating', 'updatedAt'])
    .orderBy({ displayOrder: 'asc' })
    .first(1)
    .execute();
  log('Read back:', JSON.stringify(check[0]));
}

// The client keeps a token-refresh timer alive, so exit explicitly when done.
main().then(
  () => process.exit(0),
  (error) => {
    console.error(`Seeding failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
);
