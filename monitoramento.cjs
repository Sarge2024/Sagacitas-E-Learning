const puppeteer = require('puppeteer');

(async () => {
  console.log("--- Iniciando Pipeline de Agente de Monitoramento (Puppeteer via Google Chromium) ---");
  console.log("-> Esta automação não utiliza recursos da Microsoft/Azure.");

  const browser = await puppeteer.launch({
    headless: true, // run headless for speed
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  
  // Forward browser console logs to Node console
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  try {
    const startTimeTotal = Date.now();
    
    // 1. Navegação
    console.log("[1] Navegando para o portal (http://localhost:12000)...");
    const t0 = Date.now();
    await page.goto('http://localhost:12000', { waitUntil: 'networkidle2' });
    console.log(`⏱️  Tempo de carregamento inicial: ${Date.now() - t0}ms`);

    // 2. Login como Admin
    console.log("[2] Autenticando como Admin Master...");
    await page.type('#login-email', 'admin.master@sagacitas.com.br');
    await page.type('#login-password', 'Admin12345');
    
    const t1 = Date.now();
    await page.click('#login-submit-btn');
    
    // Wait for dashboard to load
    await page.waitForSelector("::-p-xpath(//h2[contains(., 'Bem-vindo de volta')])", { timeout: 15000 });
    console.log(`⏱️  Tempo de autenticação e renderização do Dashboard: ${Date.now() - t1}ms`);

    // 3. Navegar para Gestão de Acessos
    console.log("[3] Navegando para Gestão de Acessos...");
    await page.waitForSelector('#nav-expert-sub-users');
    await page.evaluate(() => document.querySelector('#nav-expert-sub-users').click());
    
    await page.waitForSelector("::-p-xpath(//h2[contains(., 'Controle de Acessos') or contains(., 'Gestão de Usuários')])", { timeout: 10000 });
    console.log(`⏱️  Navegação concluída.`);

    // 4. Cadastrar Visitante
    console.log("[4] Cadastrando Usuário Visitante...");
    let t2 = Date.now();
    const newUserBtn = await page.waitForSelector("::-p-xpath(//button[contains(., 'Novo Usuário')])");
    await newUserBtn.click();
    
    await page.waitForSelector("::-p-xpath(//h3[contains(., 'Novo Usuário do Sistema')])", { timeout: 5000 });
    console.log(`⏱️  Tempo de abertura do modal: ${Date.now() - t2}ms`);
    
    const nameInput = await page.waitForSelector("::-p-xpath(//input[@placeholder='Ex: João da Silva'])");
    await nameInput.type('Monitor Visitante');
    
    const emailInput = await page.waitForSelector("::-p-xpath(//input[@placeholder='Ex: joao@empresa.com.br'])");
    await emailInput.type(`visitante${Date.now()}@sagacitas.com`);
    
    // Select Profile "Visitante" (value 2) or fallback to Gestor
    const roleSelect = await page.waitForSelector("::-p-xpath(//select)");
    await roleSelect.select('Visitante');
    
    const saveBtn = await page.waitForSelector("::-p-xpath(//button[@type='submit'])");
    let t3 = Date.now();
    await saveBtn.click();
    
    await page.waitForSelector("::-p-xpath(//h3[contains(., 'Usuário Cadastrado!')])", { timeout: 10000 });
    console.log(`⏱️  Tempo de latência do Firebase para cadastro (Visitante): ${Date.now() - t3}ms`);
    
    await new Promise(r => setTimeout(r, 3000));

    // 5. Cadastrar Gestor
    console.log("[5] Cadastrando Usuário Gestor...");
    const newUserBtn2 = await page.waitForSelector("::-p-xpath(//button[contains(., 'Novo Usuário')])");
    await newUserBtn2.click();
    await page.waitForSelector("::-p-xpath(//h3[contains(., 'Novo Usuário do Sistema')])", { timeout: 5000 });
    
    const nameInput2 = await page.waitForSelector("::-p-xpath(//input[@placeholder='Ex: João da Silva'])");
    await nameInput2.type('Monitor Gestor');
    
    const emailInput2 = await page.waitForSelector("::-p-xpath(//input[@placeholder='Ex: joao@empresa.com.br'])");
    await emailInput2.type(`gestor${Date.now()}@sagacitas.com`);
    
    const roleSelect2 = await page.waitForSelector("::-p-xpath(//select)");
    await roleSelect2.select('Gestor');
    
    const saveBtn2 = await page.waitForSelector("::-p-xpath(//button[@type='submit'])");
    let t4 = Date.now();
    await saveBtn2.click();
    
    await page.waitForSelector("::-p-xpath(//h3[contains(., 'Usuário Cadastrado!')])", { timeout: 10000 });
    console.log(`⏱️  Tempo de latência do Firebase para cadastro (Gestor): ${Date.now() - t4}ms`);
    
    console.log(`\n✅ Sucesso! Tempos de resposta capturados perfeitamente.`);
    console.log(`⏱️  Tempo total da pipeline automatizada: ${Date.now() - startTimeTotal}ms`);

  } catch (error) {
    console.error("❌ Ocorreu um erro durante a automação:", error);
    try {
      await page.screenshot({ path: '/home/sstulzer/.gemini/antigravity-ide/brain/934c8595-1f2a-4a42-95e3-bc16e3a629f1/error_screenshot.png' });
      console.log("📸 Screenshot de erro salvo em error_screenshot.png");
    } catch (ssErr) {
      console.error("Erro ao salvar screenshot:", ssErr);
    }
  } finally {
    await browser.close();
  }
})();
