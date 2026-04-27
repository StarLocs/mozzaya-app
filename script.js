// --- 1. ОБЛАЧНОЕ ВОССТАНОВЛЕНИЕ ДАННЫХ ИЗ ССЫЛКИ ---
function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('s');
    const e = params.get('e');
    const w = params.get('w');

    if (s) localStorage.setItem('dmb_s', s);
    if (e) localStorage.setItem('dmb_e', e);
    if (w) localStorage.setItem('wishes', w);
}
// Запускаем сразу до прогрузки остального
loadFromUrl();

// --- 2. ИНИЦИАЛИЗАЦИЯ TELEGRAM WEBAPP ---
let tg = window.Telegram.WebApp;
tg.expand();
tg.headerColor = '#0a0a0a';

// Навигация
function nav(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'scr-dmb') checkDMB();
}

// --- 3. ДМБ ТАЙМЕР ---
let dmbInterval;

function checkDMB() {
    const s = localStorage.getItem('dmb_s');
    const e = localStorage.getItem('dmb_e');
    if (s && e) {
        document.getElementById('dmb-setup').style.display = 'none';
        document.getElementById('dmb-view').style.display = 'block';
        if (!dmbInterval) dmbInterval = setInterval(updateDMB, 50); 
    } else {
        document.getElementById('dmb-setup').style.display = 'block';
        document.getElementById('dmb-view').style.display = 'none';
    }
}

function saveDMB() {
    const start = document.getElementById('in-start').value;
    const end = document.getElementById('in-end').value;
    if (!start || !end) {
        tg.showAlert("Пожалуйста, выберите обе даты!");
        return;
    }
    localStorage.setItem('dmb_s', start);
    localStorage.setItem('dmb_e', end);
    checkDMB();
}

function clearDMB() {
    localStorage.removeItem('dmb_s');
    localStorage.removeItem('dmb_e');
    clearInterval(dmbInterval);
    dmbInterval = null;
    checkDMB();
}

function updateDMB() {
    const startStr = localStorage.getItem('dmb_s');
    const endStr = localStorage.getItem('dmb_e');
    if(!startStr || !endStr) return;

    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = new Date().getTime();

    const total = end - start;
    const passed = now - start;
    const left = end - now;

    if (now < start) {
        document.getElementById('perc-val').innerText = "Ожидание призыва...";
        return;
    }
    if (now >= end) {
        document.getElementById('perc-val').innerText = "100.00000000% ДЕМБЕЛЬ!";
        document.getElementById('progress-bar').style.width = '100%';
        return;
    }

    const p = (passed / total) * 100;
    document.getElementById('progress-bar').style.width = p + '%';
    document.getElementById('perc-val').innerText = p.toFixed(8) + '%';

    document.getElementById('t-d').innerText = Math.floor(left / 86400000);
    document.getElementById('t-h').innerText = Math.floor((left % 86400000) / 3600000).toString().padStart(2, '0');
    document.getElementById('t-m').innerText = Math.floor((left % 3600000) / 60000).toString().padStart(2, '0');
    document.getElementById('t-s').innerText = Math.floor((left % 60000) / 1000).toString().padStart(2, '0');

    const eqDays = Math.floor((start + total / 2 - now) / 86400000);
    document.getElementById('m-eq').innerText = eqDays > 0 ? eqDays : "ПРОЙДЕН";
    
    const ordDays = Math.floor((end - 100 * 86400000 - now) / 86400000);
    document.getElementById('m-ord').innerText = ordDays > 0 ? ordDays : "ВЫШЕЛ";
}

// --- 4. КОРЗИНА СЧАСТЬЯ ---
let wishes = JSON.parse(localStorage.getItem('wishes') || '[]');

function renderWishlist() {
    const list = document.getElementById('w-list');
    if (wishes.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#555; font-size:12px;">Тут пока пусто...</p>';
        return;
    }
    list.innerHTML = wishes.map((w, i) => 
        `<div class="wish-item"><span>${w}</span><span class="del-btn" onclick="delWish(${i})">×</span></div>`
    ).join('');
}

function addWish() {
    const input = document.getElementById('w-input');
    const val = input.value.trim();
    if (!val) return;
    wishes.push(val);
    input.value = '';
    localStorage.setItem('wishes', JSON.stringify(wishes));
    renderWishlist();
}

function delWish(i) {
    wishes.splice(i, 1);
    localStorage.setItem('wishes', JSON.stringify(wishes));
    renderWishlist();
}

renderWishlist();

// --- 5. СИНХРОНИЗАЦИЯ С БОТОМ (ОТПРАВКА ДАННЫХ) ---
function syncWithBot() {
    const data = { 
        s: localStorage.getItem('dmb_s'), 
        e: localStorage.getItem('dmb_e'), 
        w: wishes 
    };
    tg.sendData(JSON.stringify(data));
}

// --- 6. РАЗРЫВ СВЯЗИ ---
function breakPair() {
    tg.showConfirm("Вы уверены, что хотите разорвать связь? Все совместные данные будут удалены.", function(confirmed) {
        if (confirmed) {
            localStorage.clear();
            const data = { action: "break_pair" };
            tg.sendData(JSON.stringify(data));
        }
    });
}