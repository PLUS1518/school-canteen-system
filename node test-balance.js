const http = require('http');

async function testBalance() {
  // 1. Регистрируем ученика
  const reg = await request('POST', '/api/auth/register', {
    login: `teststudent_${Date.now()}`,
    password: 'test123',
    role: 'student',
    fullName: 'Тест Ученик'
  });
  
  console.log('1. Регистрация:', reg.body.success ? '✅' : '❌');
  
  if (reg.body.token) {
    const token = reg.body.token;
    
    // 2. Проверяем баланс (должен быть 0)
    const profile = await request('GET', '/api/users/profile', null, token);
    console.log('2. Баланс до пополнения:', profile.body.user?.balance || 0);
    
    // 3. Пополняем баланс
    const balanceRes = await request('PATCH', '/api/users/balance', 
      { amount: 500 }, token);
    console.log('3. Пополнение баланса:', balanceRes.status === 200 ? '✅' : '❌', balanceRes.body);
    
    // 4. Проверяем новый баланс
    const newProfile = await request('GET', '/api/users/profile', null, token);
    console.log('4. Баланс после пополнения:', newProfile.body.user?.balance);
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

testBalance();