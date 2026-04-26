let tg = window.Telegram.WebApp;
tg.expand();

// РАСПОРЯДОК ВДВ
const vdvSchedule = [
    {h: 6, m: 0, t: "ПОДЪЁМ! 🪖"},
    {h: 6, m: 30, t: "Зарядка (Прыжки на месте)"},
    {h: 7, m: 30, t: "Завтрак"},
    {h: 9, m: 0, t: "ВДП (Укладка парашютов) 🪂"},
    {h: 12, m: 0, t: "Занятия на снарядах"},
    {h: 14, m: 0, t: "Обед"},
    {h: 15, m: 30, t: "Огневая подготовка"},
    {h: 18, m: 0, t: "Ужин"},
    {h: 21, m: 0, t: "Вечерняя поверка"},
    {h: 22, m: 0, t: "ОТБОЙ 😴"}
];

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id === 'screen-dmb') checkDMB();
}

function checkDMB() {
    const start = localStorage.getItem('dmb_start');
    if (start) {
        document.getElementById('dmb-settings').style.display = 'none';
        document.getElementById('dmb-display').style.display = 'block';
        updateDMB();
    } else {
        document.getElementById('dmb-settings').style.display = 'block';
        document.getElementById('dmb-display').style.display = 'none';
    }
}

function saveDMB() {
    const s = document.getElementById('dmb-start-input').value;
    const e = document.getElementById('dmb-end-input').value;
    if(!s || !e) return;
    localStorage.setItem('dmb_start', s);
    localStorage.setItem('dmb_end', e);
    checkDMB();
}

function resetDMB() {
    localStorage.removeItem('dmb_start');
    localStorage.removeItem('dmb_end');
    location.reload();
}

function updateDMB() {
    const start = new Date(localStorage.getItem('dmb_start')).getTime();
    const end = new Date(localStorage.getItem('dmb_end')).getTime();
    const now = new Date();

    const total = end - start;
    const passed = now.getTime() - start;
    const left = end - now.getTime();

    // 1. Проценты и Таймер
    const p = Math.min(100, (passed / total) * 100);
    document.getElementById('bar-fill').style.width = p + '%';
    document.getElementById('perc-val').innerText = p.toFixed(6) + '%';
    
    document.getElementById('d-big').innerText = Math.floor(left / 86400000);
    document.getElementById('h-big').innerText = Math.floor((left % 86400000) / 3600000).toString().padStart(2, '0');
    document.getElementById('m-big').innerText = Math.floor((left % 3600000) / 60000).toString().padStart(2, '0');
    document.getElementById('s-big').innerText = Math.floor((left % 60000) / 1000).toString().padStart(2, '0');

    // 2. Статус (Звание по времени)
    const daysPassed = Math.floor(passed / 86400000);
    let rank = "ЗАПАХ";
    if(daysPassed > 45) rank = "ДУХ";
    if(daysPassed > 100) rank = "СЛОН";
    if(daysPassed > 150) rank = "ЧЕРЕП";
    if(daysPassed > 250) rank = "ДЕД";
    if(daysPassed > 300) rank = "ДЕМБЕЛЬ";
    document.getElementById('rank-text').innerText = rank;

    // 3. Распорядок
    const currentMin = now.getHours() * 60 + now.getMinutes();
    let activity = "Сон / Личное время";
    for(let task of vdvSchedule) {
        if(currentMin >= (task.h * 60 + task.m)) activity = task.t;
    }
    document.getElementById('current-activity').innerText = activity;

    // 4. Экватор и Приказ
    document.getElementById('eq-val').innerText = Math.max(0, Math.floor((start + total/2 - now.getTime())/86400000));
    document.getElementById('ord-val').innerText = Math.max(0, Math.floor((end - 100*86400000 - now.getTime())/86400000));
}

// WISHLIST (ПОЛНОСТЬЮ ПОЧИНЕН)
let wishes = JSON.parse(localStorage.getItem('wishes') || '[]');

function renderWishes() {
    const list = document.getElementById('wish-list');
    list.innerHTML = wishes.map((w, i) => 
        `<div class="wish-item"><span>${w}</span><span class="del-btn" onclick="removeWish(${i})">×</span></div>`
    ).join('');
}

function addWish() {
    const input = document.getElementById('wish-input');
    if(!input.value.trim()) return;
    wishes.push(input.value.trim());
    input.value = '';
    saveWishes();
}

function removeWish(i) {
    wishes.splice(i, 1);
    saveWishes();
}

function saveWishes() {
    localStorage.setItem('wishes', JSON.stringify(wishes));
    renderWishes();
}

function syncData() {
    const data = { start: localStorage.getItem('dmb_start'), end: localStorage.getItem('dmb_end'), wishes: wishes };
    tg.sendData(JSON.stringify(data));
}

renderWishes();
setInterval(() => { if(localStorage.getItem('dmb_start')) updateDMB(); }, 1000);