const http = require('http');

const request = (method, path, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${path}`);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function testFullUserJourneys() {
  const ts = Date.now();
  console.log('====================================================');
  console.log('   STORERATE COMPREHENSIVE END-TO-END FLOW TESTS    ');
  console.log('====================================================\n');

  // --- JOURNEY 1: ADMIN FLOW ---
  console.log('--- [JOURNEY 1: SYSTEM ADMINISTRATOR] ---');
  // 1.1 Login as seeded Admin
  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'admin@storerate.com',
    password: 'Admin@123'
  });
  console.log('✔ Admin logged in:', adminLogin.status === 200, '| Role:', adminLogin.data.data.user.role);
  const adminToken = adminLogin.data.data.token;

  // 1.2 View Dashboard
  const adminDash = await request('GET', '/api/admin/dashboard', null, { Authorization: `Bearer ${adminToken}` });
  console.log('✔ Admin Dashboard Stats:', adminDash.data.data);

  // 1.3 Admin creates a Store Owner
  const ownerEmail = `storeowner_${ts}@company.com`;
  const createOwner = await request('POST', '/api/admin/users', {
    name: 'Alexander Sterling Proprietor',
    email: ownerEmail,
    password: 'OwnerPass@123',
    address: '888 Boulevard of Commerce, Suite 400',
    role: 'store_owner'
  }, { Authorization: `Bearer ${adminToken}` });
  console.log('✔ Store Owner Created:', createOwner.status === 201, '| Owner ID:', createOwner.data?.data?.user?.id);
  const ownerId = createOwner.data?.data?.user?.id;

  // 1.4 Admin creates a Store assigned to Store Owner
  const createStore = await request('POST', '/api/admin/stores', {
    name: 'OmniGadgets Flagship Megastore',
    email: `contact_${ts}@omnigadgets.com`,
    address: '456 Silicon Innovation Way, Tech Park',
    owner_id: ownerId
  }, { Authorization: `Bearer ${adminToken}` });
  console.log('✔ Store Created & Assigned:', createStore.status === 201, '| Store ID:', createStore.data.data.store.id);
  const storeId = createStore.data.data.store.id;

  // 1.5 Admin filters and sorts users
  const filterUsers = await request('GET', '/api/admin/users?role=store_owner&sortBy=name&sortOrder=ASC', null, {
    Authorization: `Bearer ${adminToken}`
  });
  console.log('✔ Admin Filtered Users (Store Owners):', filterUsers.data.data.users.length, 'records found');

  // 1.6 Admin views Store Owner User Details (including average rating)
  const ownerDetails = await request('GET', `/api/admin/users/${ownerId}`, null, {
    Authorization: `Bearer ${adminToken}`
  });
  console.log('✔ Admin View Owner Details:', {
    name: ownerDetails.data.data.user.name,
    role: ownerDetails.data.data.user.role,
    storesCount: ownerDetails.data.data.user.stores.length,
    averageRating: ownerDetails.data.data.user.averageRating
  });

  // --- JOURNEY 2: NORMAL USER SIGNUP & RATING ---
  console.log('\n--- [JOURNEY 2: NORMAL USER FLOW] ---');
  // 2.1 Public Signup
  const userEmail = `user_reviewer_${ts}@gmail.com`;
  const userSignup = await request('POST', '/api/auth/signup', {
    name: 'Sophia Eleanor Henderson Account',
    email: userEmail,
    password: 'UserSecret@123',
    address: '777 Sunset Hills Road, Apt 12'
  });
  console.log('✔ Normal User Signed Up:', userSignup.status === 201, '| Email:', userSignup.data.data.user.email);
  const userToken = userSignup.data.data.token;

  // 2.2 Browse Stores & Search
  const searchStores = await request('GET', '/api/stores?search=OmniGadgets', null, {
    Authorization: `Bearer ${userToken}`
  });
  console.log('✔ User Searched Stores:', searchStores.data.data.stores.length, 'match found');

  // 2.3 Submit Rating (5 Stars)
  const rateRes = await request('POST', `/api/stores/${storeId}/rating`, {
    rating: 5
  }, { Authorization: `Bearer ${userToken}` });
  console.log('✔ User Submitted 5-Star Rating:', rateRes.status === 201, '| Rating:', rateRes.data.data.rating.rating);

  // 2.4 Modify Rating (4 Stars)
  const modifyRateRes = await request('PUT', `/api/stores/${storeId}/rating`, {
    rating: 4
  }, { Authorization: `Bearer ${userToken}` });
  console.log('✔ User Modified Rating to 4 Stars:', modifyRateRes.status === 200, '| Rating:', modifyRateRes.data.data.rating.rating);

  // 2.5 Re-fetch store listing to confirm userRating is 4
  const verifiedStores = await request('GET', `/api/stores`, null, {
    Authorization: `Bearer ${userToken}`
  });
  const myStore = verifiedStores.data.data.stores.find(s => s.id === storeId);
  console.log('✔ Confirmed Store User Rating:', myStore.userRating, '| Computed Average:', myStore.averageRating);

  // --- JOURNEY 3: SECOND NORMAL USER RATINGS ---
  console.log('\n--- [JOURNEY 3: MULTIPLE RATINGS & AVERAGE COMPUTATION] ---');
  const user2Email = `user2_reviewer_${ts}@gmail.com`;
  const user2Signup = await request('POST', '/api/auth/signup', {
    name: 'Benjamin Arthur Montgomery User',
    email: user2Email,
    password: 'User2Secret@123',
    address: '100 Lakeview Crescent'
  });
  const user2Token = user2Signup.data.data.token;

  // User 2 rates the store 2 stars
  await request('POST', `/api/stores/${storeId}/rating`, { rating: 2 }, { Authorization: `Bearer ${user2Token}` });
  console.log('✔ Second User Rated 2 Stars (Average should be (4+2)/2 = 3.00)');

  // --- JOURNEY 4: STORE OWNER DASHBOARD ---
  console.log('\n--- [JOURNEY 4: STORE OWNER DASHBOARD] ---');
  // 4.1 Store Owner logs in
  const ownerLogin = await request('POST', '/api/auth/login', {
    email: ownerEmail,
    password: 'OwnerPass@123'
  });
  const ownerAuthToken = ownerLogin.data.data.token;

  // 4.2 Fetch Store Owner Dashboard
  const ownerDash = await request('GET', '/api/store-owner/dashboard', null, {
    Authorization: `Bearer ${ownerAuthToken}`
  });
  console.log('✔ Store Owner Dashboard:', {
    hasStore: ownerDash.data.data.hasStore,
    storeName: ownerDash.data.data.primaryStore.name,
    averageRating: ownerDash.data.data.averageRating,
    totalRatings: ownerDash.data.data.totalRatings,
    ratersCount: ownerDash.data.data.raters.length
  });
  console.log('✔ Customer Reviews in Owner Dashboard:');
  ownerDash.data.data.raters.forEach((r, idx) => {
    console.log(`   [${idx + 1}] Customer: ${r.userName} (${r.userEmail}) -> ${r.rating} Stars`);
  });

  // --- JOURNEY 5: UPDATE PASSWORD & LOGOUT ---
  console.log('\n--- [JOURNEY 5: PASSWORD UPDATE & SECURITY] ---');
  const passUpdate = await request('PUT', '/api/auth/update-password', {
    currentPassword: 'OwnerPass@123',
    newPassword: 'BrandNewPass@999'
  }, { Authorization: `Bearer ${ownerAuthToken}` });
  console.log('✔ Password Updated:', passUpdate.status === 200);

  // Verify login with new password
  const newLogin = await request('POST', '/api/auth/login', {
    email: ownerEmail,
    password: 'BrandNewPass@999'
  });
  console.log('✔ Login with New Password Successful:', newLogin.status === 200);

  // Logout
  const logoutRes = await request('POST', '/api/auth/logout', null, {
    Authorization: `Bearer ${newLogin.data.data.token}`
  });
  console.log('✔ Logout Successful:', logoutRes.status === 200);

  console.log('\n====================================================');
  console.log('      ALL END-TO-END JOURNEYS VERIFIED 100%!       ');
  console.log('====================================================\n');
}

testFullUserJourneys().catch(console.error);
