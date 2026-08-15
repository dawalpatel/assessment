const { sequelize, Rating } = require('../src/models');
const { Op } = require('sequelize');

const cleanup = async () => {
  try {
    console.log('--- STARTING RATINGS DUPLICATE CLEANUP SCRIPT ---');
    
    // Find all user_id, store_id pairs with duplicates
    const [duplicates] = await sequelize.query(`
      SELECT user_id, store_id, COUNT(*) as count
      FROM ratings
      GROUP BY user_id, store_id
      HAVING COUNT(*) > 1;
    `);

    console.log(`Found ${duplicates.length} duplicate pairs to clean.`);

    let totalDeleted = 0;

    for (const dup of duplicates) {
      const { user_id, store_id } = dup;
      console.log(`Cleaning duplicate ratings for User: ${user_id}, Store: ${store_id}`);

      // Fetch all ratings for this pair, sorted by updated_at / created_at descending
      const ratings = await Rating.findAll({
        where: { user_id, store_id },
        order: [
          ['updatedAt', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });

      // Keep the first (most recent) and delete the rest
      const [mostRecent, ...toDelete] = ratings;
      console.log(`Keeping rating: ${mostRecent.id} (Value: ${mostRecent.rating})`);

      for (const rating of toDelete) {
        await rating.destroy();
        totalDeleted++;
        console.log(`Deleted duplicate rating ID: ${rating.id}`);
      }
    }

    console.log(`\nCleanup complete! Deleted ${totalDeleted} duplicate rows.`);

    // Confirm with a query
    const [remainingDuplicates] = await sequelize.query(`
      SELECT user_id, store_id, COUNT(*) as count
      FROM ratings
      GROUP BY user_id, store_id
      HAVING COUNT(*) > 1;
    `);

    console.log(`Remaining duplicate count: ${remainingDuplicates.length}`);
    if (remainingDuplicates.length === 0) {
      console.log('✔ Verification successful: No duplicate ratings exist in the database!');
    } else {
      console.log('❌ Error: Duplicates still remain!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanup();
