import cron from 'node-cron';
import { RickAndMortyApiService } from '../services/rickAndMortyApi';
import { Character } from '../models';
import { cacheService } from '../config/redis';

const apiService = new RickAndMortyApiService();

async function updateCharacters(): Promise<void> {
  console.log('[Cron] Starting character update...');

  try {
    const apiCharacters = await apiService.getCharacters(1);
    const first15 = apiCharacters.slice(0, 15);

    let updated = 0;
    let created = 0;

    for (const char of first15) {
      const [instance, wasCreated] = await Character.upsert({
        id: char.id,
        name: char.name,
        status: char.status,
        species: char.species,
        gender: char.gender,
        origin: char.origin,
        image: char.image,
      });

      if (wasCreated) {
        created++;
      } else {
        updated++;
      }
    }

    // Invalidate cache after update
    await cacheService.invalidatePattern('characters:*');
    await cacheService.invalidatePattern('character:*');
    await cacheService.del('favorites:all');

    console.log(`[Cron] Character update complete: ${created} created, ${updated} updated`);
  } catch (error) {
    console.error('[Cron] Character update failed:', (error as Error).message);
  }
}

export function startCharacterUpdaterCron(): void {
  // Run every 12 hours: at minute 0 of hours 0 and 12
  cron.schedule('0 */12 * * *', () => {
    updateCharacters();
  });

  console.log('[Cron] Character updater scheduled (every 12 hours)');
}
