const http = require('http');

async function checkAdmin() {
  console.log('1. Логин админа...');
  
  const login = await request('POST', '/api/auth/login', {
    login: 'admin1',
    password: 'pass123'
  });
  
  if (login.status !== 200 || !login.body.token) {
    console.log('Создаём админа...');
    const reg = await request('POST', '/api/auth/register', {
      login: 'admin1',
      password: 'pass123',
      role: 'admin',
      fullName: 'Главный Администратор'
    });
    
    if (reg.status !== 201 || !reg.body.token) {
      console.log('❌ Не удалось создать админа');
      return;
    }
    var token = reg.body.token;
  } else {
    var token = login.body.token;
  }
  
  console.log('✅ Токен админа получен');
  
  console.log('\n2. Тест админских функций:');
  
  const tests = [
    { name: 'Статистика', path: '/api/orders/admin/stats' },
    { name: 'Пользователи', path: '/api/auth/users' },
    { name: 'Заявки на закупку', path: '/api/purchase-requests' }
  ];
  
  for (const test of tests) {
    const result = await request('GET', test.path, null, token);
    console.log(`   ${test.name}: ${result.status === 200 ? '✅' : '❌'} (${result.status})`);
  }
}

function request(method, path, data, token) {
  return new Promise(resolve => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (token) options.headers.Authorization = `Bearer ${token}`;
    
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ 
            status: res.statusCode, 
            body: body ? JSON.parse(body) : {} 
          });
        } catch (e) {
          resolve({ status: res.statusCode, body: { raw: body } });
        }
      });
    });
    
    req.on('error', () => resolve({ status: 500, body: {} }));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

checkAdmin();