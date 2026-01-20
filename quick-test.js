const http = require('http');

async function quickTest() {
  console.log('1. Регистрация ученика...');
  const reg = await request('POST', '/api/auth/register', {
    login: `test${Date.now()}`,
    password: 'test123',
    role: 'student',
    fullName: 'Тест'
  });
  
  if (reg.body.token) {
    const token = reg.body.token;
    console.log('✅ Получен токен');
    
    console.log('2. Проверка токена...');
    const profile = await request('GET', '/api/auth/profile', null, token);
    console.log(`✅ Профиль: ${profile.status === 200 ? 'OK' : 'FAILED'}`);
    
    console.log('3. Пополнение баланса...');
    const balance = await request('PATCH', '/api/users/balance', { amount: 500 }, token);
    console.log(`✅ Баланс: ${balance.status === 200 ? 'OK' : JSON.stringify(balance.body)}`);
  }
}

quickTest();