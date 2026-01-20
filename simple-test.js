const http = require('http');

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (token) options.headers.Authorization = `Bearer ${token}`;
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: body ? JSON.parse(body) : {} }));
    });
    
    req.on('error', () => resolve({ status: 500, body: {} }));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function test() {
  console.log('1. Логин админа...');
  const login = await request('POST', '/api/auth/login', {
    login: 'admin1',
    password: 'pass123'
  });
  
  if (login.body.token) {
    console.log('✅ Токен получен');
    const token = login.body.token;
    
    console.log('2. Проверка статистики...');
    const stats = await request('GET', '/api/orders/admin/stats', null, token);
    console.log(`Статистика: ${stats.status} ${stats.body.error || 'OK'}`);
    
    console.log('3. Проверка заявок...');
    const requests = await request('GET', '/api/purchase-requests', null, token);
    console.log(`Заявки: ${requests.status} ${requests.body.error || 'OK'}`);
  } else {
    console.log('❌ Не удалось получить токен:', login.body);
  }
}

test();