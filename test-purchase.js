// test-purchase.js
const http = require('http');

async function testPurchase() {
  console.log('1. Логин повара...');
  const login = await request('POST', '/api/auth/login', {
    login: 'cook1',
    password: 'pass123'
  });
  
  if (!login.body.token) {
    console.log('Создаем повара...');
    const reg = await request('POST', '/api/auth/register', {
      login: 'cook1',
      password: 'pass123',
      role: 'cook',
      fullName: 'Тест Повар'
    });
    if (reg.body.token) {
      var token = reg.body.token;
    }
  } else {
    var token = login.body.token;
  }
  
  console.log('✅ Токен повара получен');
  
  console.log('2. Создание заявки...');
  const purchaseData = {
    items: [
      { productName: "Картофель", quantity: "50", unit: "кг", estimatedPrice: "30" },
      { productName: "Мясо", quantity: "20", unit: "кг", estimatedPrice: "400" }
    ],
    reason: "Закупка на неделю"
  };
  
  const createRes = await request('POST', '/api/purchase-requests', purchaseData, token);
  console.log('Создание заявки:', createRes.status, createRes.body);
  
  console.log('3. Мои заявки...');
  const myRequests = await request('GET', '/api/purchase-requests/my', null, token);
  console.log('Мои заявки:', myRequests.status);
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

testPurchase();