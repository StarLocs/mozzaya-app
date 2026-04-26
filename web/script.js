let tg = window.Telegram.WebApp;
tg.expand();

// РАСПОРЯДОК ДНЯ (База данных действий)
const schedules = {
    vdv: [
        {h: 6, m: 0, text: "ПОДЪЁМ! 🪖"},
        {h: 6, m: 30, text: "Зарядка (ВДВ не бегает, ВДВ летает!)"},
        {h: 7, m: 30, text: "Завтрак десантника ☕"},
        {h: 9, m: 0, text: "Боевая подготовка / Прыжки 🪂"},
        {h: 14, m: 0, text: "Обед (Силы нужны!)"},
        {h: 15, m: 0, text: "Уход за техникой / ПХД"},
        {h: 18, m: 0, text: "Ужин"},
        {h: 21, m: 0, text: "Вечерняя поверка"},
        {h: 22, m: 0, text: "ОТБОЙ 😴"}
    ],
    // Можно добавить другие войска аналогично
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id === 'screen-dmb') checkDMB();
}

function checkDMB() {
    const start = localStorage.getItem('dmb_start');
    if (start) {
        document.getElementById('dmb-settings').classList.add('hidden');
        document.getElementById('dmb-display').classList.remove('hidden');
        updateDMB();
    } else {
        document.getElementById('dmb-settings').classList.remove('hidden');
        document.getElementById('dmb-display').classList.add('hidden');
    }
}

function saveDMB() {
    localStorage.setItem('dmb_start', document.getElementById('dmb-start-input').value);
    localStorage.setItem('dmb_end', document.getElementById('dmb-end-input').value);
    localStorage.setItem('dmb_branch', document.getElementById('branch-select').value);
    checkDMB();
}

function resetDMB() {
    localStorage.clear();
    location.reload();
}

function updateDMB() {
    const start = new Date(localStorage.getItem('dmb_start')).getTime();
    const end = new Date(localStorage.getItem('dmb_end')).getTime();
    const branch = localStorage.getItem('dmb_branch') || 'vdv';
    const now = new Date();

    const total = end - start;
    const passed = now.getTime() - start;
    const left = end - now.getTime();

    // 1. Проценты
    const p = Math.min(100, (passed / total) * 100);
    document.getElementById('bar-fill').style.width = p + '%';
    document.getElementById('perc-val').innerText = p.toFixed(6) + '%';

    // 2. Таймер
    document.getElementById('d-val').innerText = Math.floor(left / 86400000);
    document.getElementById('h-val').innerText = now.getHours().toString().padStart(2,'0');
    document.getElementById('m-val').innerText = now.getMinutes().toString().padStart(2,'0');
    document.getElementById('s-val').innerText = now.getSeconds().toString().padStart(2,'0');

    // 3. Динамический распорядок дня
    const todaySchedule = schedules[branch] || schedules.vdv;
    let currentTask = "Личное время / Сон";
    const currentMin = now.getHours() * 60 + now.getMinutes();

    for (let task of todaySchedule) {
        if (currentMin >= (task.h * 60 + task.m)) {
            currentTask = task.text;
        }
    }
    document.getElementById('activity-desc').innerText = currentTask;

    // 4. Милестоуны
    const daysLeft = Math.floor(left / 86400000);
    document.getElementById('eq-days').innerText = Math.max(0, daysLeft - 182);
    document.getElementById('ord-days').innerText = Math.max(0, daysLeft - 100);
    document.getElementById('bath-days').innerText = (7 - (now.getDay() || 7)) || "Сегодня!";
}

setInterval(() => {
    if(!document.getElementById('dmb-display').classList.contains('hidden')) updateDMB();
}, 1000);