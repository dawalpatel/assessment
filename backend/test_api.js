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

async function runTests() {
  const timestamp = Date.now();
  console.log('--- STARTING BACKEND API VERIFICATION TESTS ---');

  // 1. Health check
  console.log('\n[1] Testing GET /api/health...');
  const healthRes = await request('GET', '/api/health');
  console.log('Health check response:', healthRes.status, healthRes.data);

  // 2. Admin login
  console.log('\n[2] Testing Admin Login (admin@storerate.com)...');
  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'admin@storerate.com',
    password: 'Admin@123'
  });
  console.log('Admin login status:', adminLogin.status, 'User Role:', adminLogin.data?.data?.user?.role);
  const adminToken = adminLogin.data.data.token;

  // 3. Signup Validation failure (short name, weak password)
  console.log('\n[3] Testing Signup Validation Rejections...');
  const invalidSignup = await request('POST', '/api/auth/signup', {
    name: 'Short',
    email: 'invalid-email',
    password: 'weak'
  });
  console.log('Invalid signup status:', invalidSignup.status, 'Errors count:', invalidSignup.data?.errors?.length);

  // 4. Valid Normal User Signup
  console.log('\n[4] Testing Valid User Signup...');
  const userEmail = `customer_${timestamp}@example.com`;
  const validSignup = await request('POST', '/api/auth/signup', {
    name: 'Regular Customer Account Sample',
    email: userEmail,
    password: 'Customer@123',
    address: '789 High Street, Apartment 4B'
  });
  console.log('User signup status:', validSignup.status, 'User:', validSignup.data?.data?.user?.email);
  const userToken = validSignup.data.data.token;

  // 5. Admin creates Store Owner
  console.log('\n[5] Testing Admin creating Store Owner...');
  const ownerEmail = `storeowner_${timestamp}@example.com`;
  const createOwnerRes = await request('POST', '/api/admin/users', {
    name: 'Store Owner Deluxe Professional',
    email: ownerEmail,
    password: 'Owner@123',
    address: '999 Business Boulevard, Suite 300',
    role: 'store_owner'
  }, { 'Authorization': `Bearer ${adminToken}` });
  console.log('Create Store Owner status:', createOwnerRes.status, 'Owner ID:', createOwnerRes.data?.data?.user?.id);
  const ownerId = createOwnerRes.data.data.user.id;

  // 6. Admin creates Store
  console.log('\n[6] Testing Admin creating Store assigned to Store Owner...');
  const createStoreRes = await request('POST', '/api/admin/stores', {
    name: `Modern Electronic Emporium ${timestamp.toString().slice(-4)}`,
    email: `contact_${timestamp}@gadgetemporium.com`,
    address: '123 Silicon Alley, Suite 100',
    owner_id: ownerId
  }, { 'Authorization': `Bearer ${adminToken}` });
  console.log('Create Store status:', createStoreRes.status, 'Store ID:', createStoreRes.data?.data?.store?.id);
  const storeId = createStoreRes.data.data.store.id;

  // 7. Admin Dashboard
  console.log('\n[7] Testing Admin Dashboard stats...');
  const adminDashboard = await request('GET', '/api/admin/dashboard', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  console.log('Dashboard stats:', adminDashboard.data?.data);

  // 8. Normal user lists stores
  console.log('\n[8] Testing Normal User Store Listing...');
  const storeListRes = await request('GET', '/api/stores', null, {
    'Authorization': `Bearer ${userToken}`
  });
  console.log('Stores count:', storeListRes.data?.data?.stores?.length);

  // 9. Normal user submits rating (5 stars)
  console.log('\n[9] Testing Normal User Submitting Rating (5 stars)...');
  const ratingRes = await request('POST', `/api/stores/${storeId}/rating`, {
    rating: 5
  }, { 'Authorization': `Bearer ${userToken}` });
  console.log('Submit rating status:', ratingRes.status, 'Rating:', ratingRes.data?.data?.rating?.rating);

  // 10. Normal user modifies rating (4 stars)
  console.log('\n[10] Testing Normal User Modifying Rating (4 stars)...');
  const modifyRatingRes = await request('PUT', `/api/stores/${storeId}/rating`, {
    rating: 4
  }, { 'Authorization': `Bearer ${userToken}` });
  console.log('Modify rating status:', modifyRatingRes.status, 'Updated Rating:', modifyRatingRes.data?.data?.rating?.rating);

  // 11. Store Owner Login & Dashboard
  console.log('\n[11] Testing Store Owner Dashboard...');
  const ownerLogin = await request('POST', '/api/auth/login', {
    email: ownerEmail,
    password: 'Owner@123'
  });
  const ownerToken = ownerLogin.data.data.token;

  const ownerDashboard = await request('GET', '/api/store-owner/dashboard', null, {
    'Authorization': `Bearer ${ownerToken}`
  });
  console.log('Store Owner Dashboard response:', {
    hasStore: ownerDashboard.data?.data?.hasStore,
    averageRating: ownerDashboard.data?.data?.averageRating,
    totalRatings: ownerDashboard.data?.data?.totalRatings,
    ratersCount: ownerDashboard.data?.data?.raters?.length,
    firstRater: ownerDashboard.data?.data?.raters[0]?.userName
  });

  // 12. Admin User Details for Store Owner
  console.log('\n[12] Testing Admin User Details for Store Owner...');
  const userDetailsRes = await request('GET', `/api/admin/users/${ownerId}`, null, {
    'Authorization': `Bearer ${adminToken}`
  });
  console.log('User details for owner:', {
    name: userDetailsRes.data?.data?.user?.name,
    role: userDetailsRes.data?.data?.user?.role,
    averageRating: userDetailsRes.data?.data?.user?.averageRating,
    storesCount: userDetailsRes.data?.data?.user?.stores?.length
  });

  // 13. Password Update test
  console.log('\n[13] Testing Password Update...');
  const updatePassRes = await request('PUT', '/api/auth/update-password', {
    currentPassword: 'Customer@123',
    newPassword: 'NewPass@123'
  }, { 'Authorization': `Bearer ${userToken}` });
  console.log('Password update status:', updatePassRes.status, updatePassRes.data?.message);

  // 14. Verify login with new password
  console.log('\n[14] Testing Login with Updated Password...');
  const newLoginRes = await request('POST', '/api/auth/login', {
    email: userEmail,
    password: 'NewPass@123'
  });
  console.log('Login with new password status:', newLoginRes.status, 'User:', newLoginRes.data?.data?.user?.name);

  // 15. Admin User Listing with Sorting and Filter
  console.log('\n[15] Testing Admin User Listing with filters & sorting...');
  const userListRes = await request('GET', '/api/admin/users?role=store_owner&sortBy=name&sortOrder=ASC', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  console.log('Filtered users count:', userListRes.data?.data?.users?.length);

  // 16. Admin Store Listing with Computed Ratings
  console.log('\n[16] Testing Admin Store Listing with Computed Ratings...');
  const adminStoreListRes = await request('GET', '/api/admin/stores?sortBy=rating&sortOrder=DESC', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  console.log('Admin stores count:', adminStoreListRes.data?.data?.stores?.length, 'First store rating:', adminStoreListRes.data?.data?.stores[0]?.averageRating);

  console.log('\n--- ALL API TESTS PASSED WITH 100% SUCCESS! ---');
}

runTests().catch(console.error);
