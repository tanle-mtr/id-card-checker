const { Agent } = require('undici');

// Test 1: Direct undici request
const { request } = require('undici');
async function test1() {
  try {
    const res = await request('https://api.vercel.com/v1/user', {
      method: 'GET',
      headers: { 'user-agent': 'test' }
    });
    console.log('Test 1 (undici direct):', res.statusCode);
  } catch (e) {
    console.log('Test 1 error:', e.message, e.code);
  }
}

// Test 2: With dispatcher
async function test2() {
  const agent = new Agent({ connect: { rejectUnauthorized: true } });
  try {
    const res = await request('https://api.vercel.com/v1/user', {
      method: 'GET',
      headers: { 'user-agent': 'test' },
      dispatcher: agent
    });
    console.log('Test 2 (undici with dispatcher):', res.statusCode);
  } catch (e) {
    console.log('Test 2 error:', e.message, e.code);
  } finally {
    agent.close();
  }
}

// Test 3: globalThis.fetch
async function test3() {
  try {
    const res = await globalThis.fetch('https://api.vercel.com/v1/user', {
      headers: { 'user-agent': 'test' }
    });
    console.log('Test 3 (globalThis.fetch):', res.status);
  } catch (e) {
    console.log('Test 3 error:', e.message, e.code);
  }
}

// Test 4: globalThis.fetch with dispatcher
async function test4() {
  const agent = new Agent({ connect: { rejectUnauthorized: true } });
  try {
    const res = await globalThis.fetch('https://api.vercel.com/v1/user', {
      headers: { 'user-agent': 'test' },
      dispatcher: agent
    });
    console.log('Test 4 (globalThis.fetch with dispatcher):', res.status);
  } catch (e) {
    console.log('Test 4 error:', e.message, e.code);
  } finally {
    agent.close();
  }
}

async function main() {
  await test1();
  await test2();
  await test3();
  await test4();
}

main().catch(console.error);
