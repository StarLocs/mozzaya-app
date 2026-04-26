let tg = window.Telegram.WebApp;
tg.expand();

const vdvSchedule = [
    {h: 6, m: 0, t: "ПОДЪЁМ! 🪖"},
    {h: 6, m: 30, t: "Зарядка (ВДВ летает!)"},
    {h: 7, m: 30, t: "Завтрак"},
    {h: 9, m: 0, t: "ВДП (Укладка парашютов)"},
    {h: 14, m: 0, t: "Обед"},
    {h: 15, m: 30, t: "Боевая подготовка"},
    {h: 18, m: 0, t: "Ужин"},
    {h: 21, m: 0, t: "Вечерняя поверка"},
    {h: 22, m: 0, t: "ОТБОЙ 😴"}
];

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id === 'screen-dmb') initDMB();
}

function initDMB() {
    const s = localStorage.getItem('dmb_start');
    const display = document.getElementById('dmb-display');
    const settings = document.getElementById('dmb-settings');

    if (s) {
        settings.style.display = 'none';
        display.style.display = 'block';
        runTimer();
    } else {
        settings.style.display = 'block';
        display.style.display = 'none';
    }
}

function saveDMB() {
    const start = document.getElementById('dmb-start').value;
    const end = document.getElementById('dmb-end').value;

    if(!start || !end) {
        alert("Ошибка: Выбери обе даты!");
        return;
    }

    localStorage.setItem('dmb_start', start);
    localStorage.setItem('dmb_end', end);
    initDMB();
}

function resetData() {
    localStorage.clear();
    location.reload();
}

function runTimer() {
    const startStr = localStorage.getItem('dmb_start');
    const endStr = localStorage.getItem('dmb_end');
    if(!startStr || !endStr) return;

    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = new Date();

    const total = end - start;
    const passed = now.getTime() - start;
    const left = end - now.getTime();

    // Прогресс
    const p = Math.min(100, (passed / total) * 100);
    document.getElementById('progress-fill').style.width = p + '%';
    document.getElementById('percent-display').innerText = p.toFixed(6) + '%';

    // Таймер
    document.getElementById('val-d').innerText = Math.floor(left / 86400000);
    document.getElementById('val-h').innerText = Math.floor((left % 86400000) / 3600000).toString().padStart(2, '0');
    document.getElementById('val-m').innerText = Math.floor((left % 3600000) / 60000).toString().padStart(2, '0');
    document.getElementById('val-s').innerText = Math.floor((left % 60000) / 1000).toString().padStart(2, '0');

    // Звание
    const days = Math.floor(passed / 86400000);
    let r = "ЗАПАХ";
    if(days > 45) r = "ДУХ";
    if(days > 100) r = "СЛОН";
    if(days > 150) r = "ЧЕРЕП";
    if(days > 250) r = "ДЕД";
    if(days > 300) r = "ДЕМБЕЛЬ";
    document.getElementById('rank-name').innerText = r;

    // Распорядок
    const curM = now.getHours() * 60 + now.getMinutes();
    let act = "Сон / Личное время";
    for(let task of vdvSchedule) { if(curM >= (task.h * 60 + task.m)) act = task.t; }
    document.getElementById('current-activity').innerText = act;

    // Счётчики
    document.getElementById('val-eq').innerText = Math.max(0, Math.floor((start + total/2 - now.getTime())/86400000));
    document.getElementById('val-ord').innerText = Math.max(0, Math.floor((end - 100*86400000 - now.getTime())/86400000));
}

// Wishlist
let wishes = JSON.parse(localStorage.getItem('w_data') || '[]');

function renderW() {
    const container = document.getElementById('wish-list-container');
    container.innerHTML = wishes.map((w, i) => 
        `<div class="wish-item"><span>${w}</span><span class="del-icon" onclick="delW(${i})">×</span></div>`
    ).join('');
}

function addWish() {
    const input = document.getElementById('wish-in');
    const val = input.value.trim();
    if(!val) return;
    wishes.push(val);
    input.value = '';
    saveW();
}

function delW(i) {
    wishes.splice(i, 1);
    saveW();
}

function saveW() {
    localStorage.setItem('w_data', JSON.stringify(wishes));
    renderW();
}

renderW();
setInterval(() => { if(localStorage.getItem('dmb_start')) runTimer(); }, 1000);

function syncWithBot() {
    const data = { s: localStorage.getItem('dmb_start'), e: localStorage.getItem('dmb_end'), w: wishes };
    tg.sendData(JSON.stringify(data));
}