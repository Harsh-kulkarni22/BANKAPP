const http = require('http');

async function test() {
    console.log('--- Testing /api/login via Proxy ---');
    const loginRes = await fetch('http://localhost:5173/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testverify1', password: 'password123' })
    });
    console.log('Login Status:', loginRes.status);
    const setCookie = loginRes.headers.get('set-cookie');
    console.log('Set-Cookie received:', setCookie);

    if (!setCookie) {
        console.error('No cookie set!');
        return;
    }

    console.log('\n--- Testing /api/balance via Proxy ---');
    const balanceRes = await fetch('http://localhost:5173/api/balance', {
        method: 'GET',
        headers: {
            'Cookie': setCookie // just pass the first cookie string for testing
        }
    });

    console.log('Balance Status:', balanceRes.status);
    const text = await balanceRes.text();
    console.log('Balance Body:', text);
}

test().catch(console.error);
