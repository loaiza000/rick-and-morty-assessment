import { QueryInterface, Op } from 'sequelize';
import { RickAndMortyApiService } from '../../services/rickAndMortyApi';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const apiService = new RickAndMortyApiService();

  const characters = await apiService.getCharacters(1);
  const first15 = characters.slice(0, 15);

  const now = new Date();
  const rows = first15.map((char) => ({
    id: char.id,
    name: char.name,
    status: char.status,
    species: char.species,
    gender: char.gender,
    origin: char.origin,
    image: char.image,
    createdAt: now,
    updatedAt: now,
  }));

  await queryInterface.bulkInsert('characters', rows);
  console.log(`[Seed] Inserted ${rows.length} characters`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('characters', {
    id: { [Op.between]: [1, 15] },
  });
  console.log('[Seed] Removed initial characters');
}
