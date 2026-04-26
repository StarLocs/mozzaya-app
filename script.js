let tg = window.Telegram.WebApp;
tg.expand();

// РАСПОРЯДОК ВДВ
const vdvTasks = [
    {h: 6, m: 0, t: "ПОДЪЁМ! 🪖"},
    {h: 6, m: 30, t: "Зарядка (ВДВ летает!)"},
    {h: 7, m: 30, t: "Завтрак десантника"},
    {h: 9, m: 0, t: "ВДП (Парашюты, укладка)"},
    {h: 14, m: 0, t: "Обед (По расписанию)"},
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
    if (s) {
        document.getElementById('dmb-settings').style.display = 'none';
        document.getElementById('dmb-display').style.display = 'block';
        runTimer();
    } else {
        document.getElementById('dmb-settings').style.display = 'block';
        document.getElementById('dmb-display').style.display = 'none';
    }
}

function saveDMB() {
    const start = document.getElementById('dmb-start').value;
    const end = document.getElementById('dmb-end').value;
    if(!start || !end) return;
    localStorage.setItem('dmb_start', start);
    localStorage.setItem('dmb_end', end);
    initDMB();
}

function resetData() { localStorage.clear(); location.reload(); }

function runTimer() {
    const start = new Date(localStorage.getItem('dmb_start')).getTime();
    const end = new Date(localStorage.getItem('dmb_end')).getTime();
    const now = new Date();

    const total = end - start;
    const passed = now.getTime() - start;
    const left = end - now.getTime();

    // Прогресс
    const p = Math.min(100, (passed / total) * 100);
    document.getElementById('progress-fill').style.width = p + '%';
    document.getElementById('percent-display').innerText = p.toFixed(6) + '%';

    // Главные цифры
    document.getElementById('val-d').innerText = Math.floor(left / 86400000);
    document.getElementById('val-h').innerText = Math.floor((left % 86400000) / 3600000).toString().padStart(2, '0');
    document.getElementById('val-m').innerText = Math.floor((left % 3600000) / 60000).toString().padStart(2, '0');
    document.getElementById('val-s').innerText = Math.floor((left % 60000) / 1000).toString().padStart(2, '0');

    // Звание
    const daysPassed = Math.floor(passed / 86400000);
    let r = "ЗАПАХ";
    if(daysPassed > 45) r = "ДУХ";
    if(daysPassed > 100) r = "СЛОН";
    if(daysPassed > 150) r = "ЧЕРЕП";
    if(daysPassed > 250) r = "ДЕД";
    if(daysPassed > 300) r = "ДЕМБЕЛЬ";
    document.getElementById('rank-name').innerText = r;

    // Распорядок
    const curM = now.getHours() * 60 + now.getMinutes();
    let act = "Сон / Личное время";
    for(let task of vdvTasks) { if(curM >= (task.h * 60 + task.m)) act = task.t; }
    document.getElementById('current-activity').innerText = act;

    // Счётчики
    document.getElementById('val-eq').innerText = Math.max(0, Math.floor((start + total/2 - now.getTime())/86400000));
    document.getElementById('val-ord').innerText = Math.max(0, Math.floor((end - 100*86400000 - now.getTime())/86400000));
}

// Wishlist
let wishes = JSON.parse(localStorage.getItem('w_data') || '[]');
function renderW() {
    document.getElementById('wish-list-container').innerHTML = wishes.map((w, i) => 
        `<div class="wish-item"><span>${w}</span><span class="del-icon" onclick="delW(${i})">×</span></div>`
    ).join('');
}
function addWish() {
    const i = document.getElementById('wish-in');
    if(!i.value.trim()) return;
    wishes.push(i.value.trim());
    i.value = '';
    saveW();
}
function delW(i) { wishes.splice(i, 1); saveW(); }
function saveW() { localStorage.setItem('w_data', JSON.stringify(wishes)); renderW(); }

renderW();
setInterval(() => { if(localStorage.getItem('dmb_start')) runTimer(); }, 1000);

function syncWithBot() {
    const data = { s: localStorage.getItem('dmb_start'), e: localStorage.getItem('dmb_end'), w: wishes };
    tg.sendData(JSON.stringify(data));
}