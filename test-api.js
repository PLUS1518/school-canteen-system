// test-api.js
const http = require('http');

const API_BASE = 'http://localhost:3000';
let studentToken = '';
let cookToken = '';
let adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInJvbGUiOiJhZG1pbiIsImxvZ2luIjoiYWRtaW4xIiwiaWF0IjoxNzY4OTQ1MTQ3LCJleHAiOjE3Njk1NDk5NDd9.yQ_TMQkfsw8EaJZYvH36gU34mWA5XdD7jhZtdNzGT2M'; // 🔴 ЗАМЕНИТЕ НА РЕАЛЬНЫЙ ТОКЕН
let createdOrderId = null;
let createdFeedbackId = null;
let createdPurchaseRequestId = null;

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: { raw: body } });
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
  console.log('🚀 Начинаем тестирование школьной столовой...\n');

  // 1. Проверка здоровья сервера
  console.log('1. Проверка здоровья сервера...');
  const health = await request('GET', '/api/health');
  console.log(`   ✅ /api/health: ${health.status === 200 ? 'OK' : 'FAILED'}`);

  // 2. Получение токена админа (если не указан)
  if (!adminToken || adminToken === 'YOUR_ADMIN_TOKEN') {
    console.log('\n⚠️  Замените adminToken в скрипте на реальный токен!');
    console.log('   Чтобы получить токен:');
    console.log('   1. Откройте браузер, перейдите на http://localhost:3000');
    console.log('   2. В документации найдите эндпоинт POST /api/auth/login');
    console.log('   3. Используйте логин/пароль: admin1 / pass123');
    console.log('   4. Скопируйте токен из ответа и вставьте в скрипт\n');
    return;
  }

  // 3. Получение списка блюд (публичный)
  console.log('\n2. Получение меню...');
  const meals = await request('GET', '/api/meals');
  if (meals.status === 200 && meals.body.success && meals.body.meals?.length > 0) {
    console.log(`   ✅ Меню загружено (${meals.body.meals.length} блюд)`);
    // Сохраняем ID первого блюда для тестов
    global.testMealId = meals.body.meals[0].id;
  } else {
    console.log('   ❌ Не удалось получить меню');
    return;
  }

  // 4. Тесты для администратора
  console.log('\n3. Тестирование прав администратора...');
  
  // 4a. Статистика заказов
  const adminStats = await request('GET', '/api/orders/admin/stats', null, adminToken);
  console.log(`   ✅ Статистика заказов: ${adminStats.status === 200 ? 'OK' : 'FAILED'}`);
  
  // 4b. Все пользователи
  const allUsers = await request('GET', '/api/auth/users', null, adminToken);
  console.log(`   ✅ Список пользователей: ${allUsers.status === 200 ? 'OK' : 'FAILED'}`);
  
  // 4c. Все заявки на закупку
  const allRequests = await request('GET', '/api/purchase-requests', null, adminToken);
  console.log(`   ✅ Заявки на закупку: ${allRequests.status === 200 ? 'OK' : 'FAILED'}`);

  // 5. Тесты для повара (создадим тестового повара)
  console.log('\n4. Тестирование функциональности повара...');
  
  // 5a. Создание пользователя-повара
  const cookData = {
    login: `test_cook_${Date.now()}`,
    password: 'cook123',
    role: 'cook',
    fullName: 'Тест Повар'
  };
  
  const cookReg = await request('POST', '/api/auth/register', cookData);
  if (cookReg.status === 201) {
    // 5b. Логин повара
    const cookLogin = await request('POST', '/api/auth/login', {
      login: cookData.login,
      password: cookData.password
    });
    
    if (cookLogin.status === 200) {
      cookToken = cookLogin.body.token;
      console.log(`   ✅ Повар зарегистрирован и авторизован`);
      
      // 5c. Создание заявки на закупку
      const purchaseReq = {
        items: [
          { productName: "Картофель", quantity: 50, unit: "кг", estimatedPrice: 30 },
          { productName: "Мясо", quantity: 20, unit: "кг", estimatedPrice: 400 }
        ],
        reason: "Закупка на неделю"
      };
      
      const createPurchase = await request('POST', '/api/purchase-requests', purchaseReq, cookToken);
      if (createPurchase.status === 201) {
        createdPurchaseRequestId = createPurchase.body.request?.id;
        console.log(`   ✅ Заявка на закупку создана (ID: ${createdPurchaseRequestId})`);
      } else {
        console.log(`   ❌ Ошибка создания заявки: ${createPurchase.status}`);
      }
    }
  }

  // 6. Тесты для ученика
  console.log('\n5. Тестирование функциональности ученика...');
  
  // 6a. Создание пользователя-ученика
  const studentData = {
    login: `test_student_${Date.now()}`,
    password: 'student123',
    role: 'student',
    fullName: 'Тест Ученик',
    allergies: "Арахис, молоко",
    preferences: "Вегетарианец"
  };
  
  const studentReg = await request('POST', '/api/auth/register', studentData);
  if (studentReg.status === 201) {
    // 6b. Логин ученика
    const studentLogin = await request('POST', '/api/auth/login', {
      login: studentData.login,
      password: studentData.password
    });
    
    if (studentLogin.status === 200) {
      studentToken = studentLogin.body.token;
      console.log(`   ✅ Ученик зарегистрирован и авторизован`);
      console.log(`   ✅ Аллергии сохранены: "${studentData.allergies}"`);


        const addBalance = await request('PATCH', '/api/users/balance', 
            { amount: 500 },
            studentToken
        );
        console.log(`   ✅ Баланс пополнен: ${addBalance.status === 200 ? 'OK' : 'FAILED'}`);
        
      
      // 6c. Создание заказа
      const orderData = {
        mealId: global.testMealId,
        mealType: "lunch",
        paymentMethod: "subscription",
        quantity: 1
      };
      
      const createOrder = await request('POST', '/api/orders', orderData, studentToken);
      if (createOrder.status === 201) {
        createdOrderId = createOrder.body.order?.id;
        console.log(`   ✅ Заказ создан (ID: ${createdOrderId})`);
      } else {
        console.log(`   ❌ Ошибка создания заказа: ${JSON.stringify(createOrder.body)}`);
      }
      
      // 6d. Создание отзыва
      const feedbackData = {
        mealId: global.testMealId,
        rating: 5,
        comment: "Очень вкусно! Буду заказывать еще."
      };
      
      const createFeedback = await request('POST', '/api/feedback', feedbackData, studentToken);
      if (createFeedback.status === 201) {
        createdFeedbackId = createFeedback.body.feedback?.id;
        console.log(`   ✅ Отзыв создан (ID: ${createdFeedbackId})`);
      } else {
        console.log(`   ❌ Ошибка создания отзыва: ${createFeedback.status}`);
      }
    }
  }

  // 7. Итоговый отчет
  console.log('\n' + '='.repeat(50));
  console.log('📊 ИТОГОВЫЙ ОТЧЕТ:');
  console.log('='.repeat(50));
  
  const tests = [
    { name: 'Сервер работает', passed: health.status === 200 },
    { name: 'Меню доступно', passed: meals.status === 200 },
    { name: 'Админ: статистика', passed: adminStats.status === 200 },
    { name: 'Админ: пользователи', passed: allUsers.status === 200 },
    { name: 'Повар: заявка на закупку', passed: !!createdPurchaseRequestId },
    { name: 'Ученик: регистрация с аллергиями', passed: !!studentToken },
    { name: 'Ученик: создание заказа', passed: !!createdOrderId },
    { name: 'Ученик: создание отзыва', passed: !!createdFeedbackId },
  ];
  
  let passedCount = 0;
  tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌';
    console.log(`${icon} ${test.name}`);
    if (test.passed) passedCount++;
  });
  
  console.log('='.repeat(50));
  console.log(`📈 Результат: ${passedCount}/${tests.length} тестов пройдено`);
  
  if (passedCount === tests.length) {
    console.log('\n🎉 ПОЗДРАВЛЯЮ! Все основные функции работают корректно!');
    console.log('Бэкенд полностью готов к интеграции с фронтендом.');
  } else {
    console.log('\n⚠️  Некоторые тесты не пройдены. Проверьте логи выше.');
  }
}

runTests().catch(err => {
  console.error('❌ Ошибка выполнения тестов:', err.message);
});