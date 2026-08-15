'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let usersAdded = 0;
    let storesAdded = 0;
    let ratingsAdded = 0;

    // Password hashes
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const ownerPasswordHash = await bcrypt.hash('Owner@123', 10);
    const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

    // Helper: Seed user if not exists
    const seedUser = async (name, email, passwordHash, role, address) => {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE email = '${email}' LIMIT 1;`
      );
      if (!existing || existing.length === 0) {
        const id = uuidv4();
        await queryInterface.bulkInsert('users', [{
          id,
          name,
          email,
          password: passwordHash,
          address,
          role,
          created_at: new Date(),
          updated_at: new Date()
        }]);
        usersAdded++;
        return id;
      }
      return existing[0].id;
    };

    // Helper: Seed store if not exists
    const seedStore = async (name, email, address, ownerId) => {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM stores WHERE name = ? LIMIT 1;`,
        { replacements: [name] }
      );
      if (!existing || existing.length === 0) {
        const id = uuidv4();
        await queryInterface.bulkInsert('stores', [{
          id,
          name,
          email,
          address,
          owner_id: ownerId,
          created_at: new Date(),
          updated_at: new Date()
        }]);
        storesAdded++;
        return id;
      }
      return existing[0].id;
    };

    // Helper: Seed rating if not exists
    const seedRating = async (userId, storeId, ratingValue) => {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM ratings WHERE user_id = '${userId}' AND store_id = '${storeId}' LIMIT 1;`
      );
      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('ratings', [{
          id: uuidv4(),
          user_id: userId,
          store_id: storeId,
          rating: ratingValue,
          created_at: new Date(),
          updated_at: new Date()
        }]);
        ratingsAdded++;
      }
    };

    // 1. Seed Core Users (Admin, Owner, Normal User)
    const adminId = await seedUser('Aarav Sharma', 'admin@storerate.com', adminPasswordHash, 'admin', '100 Global Headquarters, Suite 500, Tech Park, City');
    const owner1Id = await seedUser('Vikram Malhotra', 'owner@storerate.com', ownerPasswordHash, 'store_owner', '999 Business Boulevard, Suite 300, Hubtown');
    const customer1Id = await seedUser('Rohan Verma', 'customer1@example.com', customerPasswordHash, 'user', '789 High Street, Apartment 4B, Central City');

    // 2. Seed Core Store & Rating
    const store1Id = await seedStore('Croma Electronics', 'contact@croma.com', '123 Silicon Alley, Tech Hub District, Bengaluru', owner1Id);
    await seedRating(customer1Id, store1Id, 5);

    // 3. Seed More Store Owners (2 more)
    const owner2Id = await seedUser('Priya Iyer', 'owner2@storerate.com', ownerPasswordHash, 'store_owner', '555 Elite Residency, Outer Ring Road, Bengaluru');
    const owner3Id = await seedUser('Aditya Deshmukh', 'owner3@storerate.com', ownerPasswordHash, 'store_owner', '222 Executive Towers, Sector 15, Gurgaon');

    // 4. Seed More Normal Users (4 more)
    const customer2Id = await seedUser('Neha Kapoor', 'customer2@example.com', customerPasswordHash, 'user', '101 Camelot Castle Way, Sector 6, Noida');
    const customer3Id = await seedUser('Siddharth Sen', 'customer3@example.com', customerPasswordHash, 'user', '52 French Quarter Alley, Whitefield, Bengaluru');
    const customer4Id = await seedUser('Ananya Nair', 'customer4@example.com', customerPasswordHash, 'user', '303 Platinum Heights, Jubilee Hills, Hyderabad');
    const customer5Id = await seedUser('Kabir Joshi', 'customer5@example.com', customerPasswordHash, 'user', '90 royal Enclave, Indiranagar, Bengaluru');

    // 5. Seed More Stores (7 more)
    const store2Id = await seedStore('Nature\'s Basket Organic', 'contact@naturesbasket.com', '789 Greenway Street, Sector 3, Bengaluru', owner2Id);
    const store3Id = await seedStore('Zara Fashion Boutique', 'info@zarafashion.com', '555 Velvet Boulevard, Bandra West, Mumbai', owner2Id);
    const store4Id = await seedStore('Reliance Digital Hub', 'support@reliancedigital.com', '101 Innovation Park Road, Hinjewadi, Pune', owner3Id);
    const store5Id = await seedStore('Blue Tokai Coffee Roasters', 'hello@bluetokai.com', '22 Fountain Square Garden, Nungambakkam, Chennai', owner3Id);
    const store6Id = await seedStore('Fabindia Home Furnishings', 'sales@fabindia.com', '33 Palace View Lane, Amer Road, Jaipur', owner1Id);
    const store7Id = await seedStore('Apollo Pharmacy & Cosmetics', 'info@apollopharmacy.com', '88 Health Way Avenue, Madhapur, Hyderabad', null);
    const store8Id = await seedStore('Bosch Car Service', 'tuning@boschservice.com', '44 Speed Ring Way, Sector 62, Noida', null);

    // 6. Seed More Ratings with varied values (1-5)
    // Ratings for store 1 (Croma Electronics)
    await seedRating(customer2Id, store1Id, 4);
    await seedRating(customer3Id, store1Id, 3);
    await seedRating(customer4Id, store1Id, 5);

    // Ratings for store 2 (Nature's Basket Organic)
    await seedRating(customer1Id, store2Id, 5);
    await seedRating(customer2Id, store2Id, 4);
    await seedRating(customer3Id, store2Id, 5);

    // Ratings for store 3 (Zara Fashion Boutique)
    await seedRating(customer2Id, store3Id, 3);
    await seedRating(customer3Id, store3Id, 4);
    await seedRating(customer4Id, store3Id, 2);

    // Ratings for store 4 (Reliance Digital Hub)
    await seedRating(customer1Id, store4Id, 4);
    await seedRating(customer3Id, store4Id, 5);
    await seedRating(customer5Id, store4Id, 4);

    // Ratings for store 5 (Blue Tokai Coffee Roasters)
    await seedRating(customer2Id, store5Id, 5);
    await seedRating(customer4Id, store5Id, 4);
    await seedRating(customer5Id, store5Id, 5);

    // Ratings for store 6 (Fabindia Home Furnishings)
    await seedRating(customer1Id, store6Id, 3);
    await seedRating(customer4Id, store6Id, 4);

    // Ratings for store 7 (Apollo Pharmacy & Cosmetics)
    await seedRating(customer3Id, store7Id, 4);
    await seedRating(customer5Id, store7Id, 3);

    // Ratings for store 8 (Bosch Car Service)
    await seedRating(customer2Id, store8Id, 5);
    await seedRating(customer5Id, store8Id, 4);

    console.log('\n======================================================');
    console.log('SEED DATA SUMMARY:');
    console.log(`- New Users Added:   ${usersAdded}`);
    console.log(`- New Stores Added:  ${storesAdded}`);
    console.log(`- New Ratings Added: ${ratingsAdded}`);
    console.log('======================================================\n');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('stores', null, {});
    await queryInterface.bulkDelete('ratings', null, {});
  }
};
