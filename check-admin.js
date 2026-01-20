const http = require('http');

async function checkAdmin() {
  // 1. Логинимся админом
  const loginRes = await request('POST', '/api/auth/login', {
    login: 'admin1',
    password: 'pass123'
  });
  
  console.log('Ответ логина:', JSON.stringify(loginRes.body, null, 2));
  
  if (loginRes.body.token) {
    const token = loginRes.body.token;
    
    // 2. Декодируем токен (просто для просмотра)
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    console.log('\n🔐 Декодированный токен:', decoded);
    
    // 3. Проверяем доступ к админскому эндпоинту
    const statsRes = await request('GET', '/api/orders/admin/stats', null, token);
    console.log('\n📊 Статистика:', statsRes.status, statsRes.body.error || 'OK');
  }
}

function request(method, path, data = null, token = null) {
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
      res.on('end', () => resolve({ 
        status: res.statusCode, 
        body: body ? JSON.parse(body) : {} 
      }));
    });
    
    req.on('error', () => resolve({ status: 500, body: {} }));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

checkAdmin();