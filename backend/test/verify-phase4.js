import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import http from 'http';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { authorizeRoles } from '../src/middleware/roleMiddleware.js';
import { requireAuth } from '../src/middleware/authMiddleware.js';

let mongod;
let server;
let baseUrl;

async function setup() {
  console.log('🚀 Setting up In-Memory MongoDB & Test Server for Phase 4...');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri);
  console.log(`✅ In-Memory MongoDB Connected at ${uri}`);

  // Also mount a temporary admin-only test route to thoroughly test roleMiddleware
  app.get('/api/test-admin-only', requireAuth, authorizeRoles('admin'), (req, res) => {
    res.json({ success: true, message: 'Admin access granted', user: req.user });
  });

  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`✅ Test Server running at ${baseUrl}`);
      resolve();
    });
  });
}

async function teardown() {
  console.log('\n🧹 Cleaning up test environment...');
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
  console.log('✅ Teardown complete.');
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const { headers, ...restOptions } = options;
  const res = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runPhase4Tests() {
  try {
    await setup();

    console.log('\n======================================================');
    console.log('🧪 RUNNING PHASE 4 AUTHENTICATION & USER SUITE');
    console.log('======================================================\n');

    // ------------------------------------------------------------------------
    // 1. User Registration (POST /api/auth/register)
    // ------------------------------------------------------------------------
    console.log('--- 1. User Registration Tests ---');
    const validUser = {
      name: 'Alice Developer',
      email: 'alice@example.com',
      password: 'SecurePassword123'
    };

    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(validUser)
    });

    assert(regRes.status === 201, `Registration returns 201 Created (got ${regRes.status})`);
    assert(regRes.data?.success === true, 'Registration response success is true');
    assert(regRes.data?.data?.user?.email === 'alice@example.com', 'Returned user has correct email');
    assert(regRes.data?.data?.user?.name === 'Alice Developer', 'Returned user has correct name');
    assert(regRes.data?.data?.user?.role === 'user', 'Default role is "user"');
    assert(!regRes.data?.data?.user?.password, 'Password is NOT exposed in registration response');

    // Check DB record for bcrypt hash
    const dbUser = await User.findOne({ email: 'alice@example.com' });
    assert(dbUser !== null, 'User is stored in MongoDB');
    assert(dbUser.password !== 'SecurePassword123', 'Password is NOT plain-text in DB');
    assert(dbUser.password.startsWith('$2a$') || dbUser.password.startsWith('$2b$'), 'Password is valid bcrypt hash');

    // ------------------------------------------------------------------------
    // 2. Duplicate Email Registration
    // ------------------------------------------------------------------------
    console.log('\n--- 2. Duplicate Email Prevention ---');
    const dupRes = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate Alice',
        email: 'ALICE@EXAMPLE.COM', // Test case normalization
        password: 'AnotherPassword456'
      })
    });
    assert(dupRes.status === 400, `Duplicate email registration returns 400 (got ${dupRes.status})`);
    assert(dupRes.data?.success === false, 'Duplicate email returns success: false');

    // ------------------------------------------------------------------------
    // 3. Registration Validation Errors
    // ------------------------------------------------------------------------
    console.log('\n--- 3. Registration Input Validation ---');
    const invalidReg = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: '',
        email: 'not-an-email',
        password: '123'
      })
    });
    assert(invalidReg.status === 400, `Invalid fields return 400 Bad Request (got ${invalidReg.status})`);
    assert(invalidReg.data?.errors?.length >= 3, 'Validation returns descriptive errors for each invalid field');

    // ------------------------------------------------------------------------
    // 4. User Login (POST /api/auth/login)
    // ------------------------------------------------------------------------
    console.log('\n--- 4. User Login Tests ---');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'SecurePassword123'
      })
    });

    assert(loginRes.status === 200, `Valid login returns 200 OK (got ${loginRes.status})`);
    assert(loginRes.data?.success === true, 'Login response success is true');
    assert(typeof loginRes.data?.data?.token === 'string', 'Login returns JWT token string');
    assert(loginRes.data?.data?.user?.email === 'alice@example.com', 'Login returns user profile');
    assert(!loginRes.data?.data?.user?.password, 'Password hash is NOT exposed in login response');

    const aliceToken = loginRes.data?.data?.token;

    // ------------------------------------------------------------------------
    // 5. Invalid Login Credentials
    // ------------------------------------------------------------------------
    console.log('\n--- 5. Invalid Credentials Tests ---');
    const wrongPasswordRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'WrongPassword999'
      })
    });
    assert(wrongPasswordRes.status === 401, `Wrong password returns 401 Unauthorized (got ${wrongPasswordRes.status})`);
    assert(wrongPasswordRes.data?.success === false, 'Wrong password returns success: false');

    const nonExistentRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nobody@example.com',
        password: 'SecurePassword123'
      })
    });
    assert(nonExistentRes.status === 401, `Non-existent user returns 401 (got ${nonExistentRes.status})`);

    // ------------------------------------------------------------------------
    // 6. Protected User Profile (GET /api/users/profile)
    // ------------------------------------------------------------------------
    console.log('\n--- 6. Protected User Profile Tests ---');
    const profileRes = await request('/api/users/profile', {
      headers: {
        Authorization: `Bearer ${aliceToken}`
      }
    });

    assert(profileRes.status === 200, `Authorized profile fetch returns 200 OK (got ${profileRes.status})`);
    assert(profileRes.data?.data?.email === 'alice@example.com', 'Profile email matches authenticated user');
    assert(profileRes.data?.data?.name === 'Alice Developer', 'Profile name matches authenticated user');
    assert(profileRes.data?.data?.role === 'user', 'Profile role is correct');
    assert(!profileRes.data?.data?.password, 'Profile does NOT expose password');

    // ------------------------------------------------------------------------
    // 7. Unauthorized Profile Access
    // ------------------------------------------------------------------------
    console.log('\n--- 7. Unauthorized Profile Access Tests ---');
    const noTokenRes = await request('/api/users/profile');
    assert(noTokenRes.status === 401, `Missing token returns 401 Unauthorized (got ${noTokenRes.status})`);

    const invalidTokenRes = await request('/api/users/profile', {
      headers: {
        Authorization: 'Bearer invalid.token.string'
      }
    });
    assert(invalidTokenRes.status === 401, `Invalid token returns 401 Unauthorized (got ${invalidTokenRes.status})`);

    // ------------------------------------------------------------------------
    // 8. Update User Profile (PUT /api/users/profile)
    // ------------------------------------------------------------------------
    console.log('\n--- 8. Update Profile Tests ---');
    const updateRes = await request('/api/users/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${aliceToken}`
      },
      body: JSON.stringify({
        name: 'Alice Wonder',
        role: 'admin' // Attempted privilege escalation should be ignored
      })
    });

    assert(updateRes.status === 200, `Profile update returns 200 OK (got ${updateRes.status})`);
    assert(updateRes.data?.data?.name === 'Alice Wonder', 'Profile name is updated');
    assert(updateRes.data?.data?.role === 'user', 'Role escalation is prevented (role remains "user")');

    // ------------------------------------------------------------------------
    // 9. Role-Based Authorization Middleware Tests
    // ------------------------------------------------------------------------
    console.log('\n--- 9. Role Authorization Middleware Tests ---');
    // Alice is a normal 'user', so accessing an admin-only route should return 403
    const userAdminAccess = await request('/api/users/admin/overview', {
      headers: {
        Authorization: `Bearer ${aliceToken}`
      }
    });
    assert(userAdminAccess.status === 403, `Normal user accessing admin route returns 403 Forbidden (got ${userAdminAccess.status})`);

    // Create an admin user directly and log in
    await User.create({
      name: 'Bob Admin',
      email: 'bob.admin@example.com',
      password: 'AdminPassword123',
      role: 'admin'
    });

    const adminLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'bob.admin@example.com',
        password: 'AdminPassword123'
      })
    });

    const adminToken = adminLoginRes.data?.data?.token;
    assert(typeof adminToken === 'string', 'Admin user login generates token');

    const adminAccessRes = await request('/api/users/admin/overview', {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    assert(adminAccessRes.status === 200, `Admin user accessing admin route returns 200 OK (got ${adminAccessRes.status})`);
    assert(adminAccessRes.data?.success === true, 'Admin access granted successfully');

    // ------------------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------------------
    console.log('\n======================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Test execution threw an error:', err);
    process.exit(1);
  } finally {
    await teardown();
  }
}

runPhase4Tests();
