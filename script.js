function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('s');
    const e = params.get('e');
    const w = params.get('w');

    if (s) localStorage.setItem('dmb_s', s);
    if (e) localStorage.setItem('dmb_e', e);
    if (w) {
        try {
            const decodedWishes = decodeURIComponent(w);
            JSON.parse(decodedWishes); 
            localStorage.setItem('wishes', decodedWishes);
        } catch(e) { console.error("Ошибка чтения списка желаний"); }
    }
}
loadFromUrl();

let tg = window.Telegram.WebApp;
tg.expand();
tg.headerColor = '#0a0a0a';

function nav(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'scr-dmb') checkDMB();
    if (id === 'scr-wish') renderWishlist();
}

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
        tg.showAlert("Выбери даты!");
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
    const s = localStorage.getItem('dmb_s');
    const e = localStorage.getItem('dmb_e');
    if(!s || !e) return;
    const start = new Date(s).getTime();
    const end = new Date(e).getTime();
    const now = new Date().getTime();
    const total = end - start;
    const passed = now - start;
    const left = end - now;

    if (now < start) { document.getElementById('perc-val').innerText = "Ожидание призыва..."; return; }
    if (now >= end) { document.getElementById('perc-val').innerText = "100% ДЕМБЕЛЬ!"; return; }

    const p = (passed / total) * 100;
    document.getElementById('progress-bar').style.width = p + '%';
    document.getElementById('perc-val').innerText = p.toFixed(8) + '%';
    document.getElementById('t-d').innerText = Math.floor(left / 86400000);
    document.getElementById('t-h').innerText = Math.floor((left % 86400000) / 3600000).toString().padStart(2, '0');
    document.getElementById('t-m').innerText = Math.floor((left % 3600000) / 60000).toString().padStart(2, '0');
    document.getElementById('t-s').innerText = Math.floor((left % 60000) / 1000).toString().padStart(2, '0');
    
    const eq = Math.floor((start + total / 2 - now) / 86400000);
    document.getElementById('m-eq').innerText = eq > 0 ? eq : "ПРОЙДЕН";
    const ord = Math.floor((end - 100 * 86400000 - now) / 86400000);
    document.getElementById('m-ord').innerText = ord > 0 ? ord : "ВЫШЕЛ";
}

let wishes = JSON.parse(localStorage.getItem('wishes') || '[]');
function renderWishlist() {
    const list = document.getElementById('w-list');
    list.innerHTML = wishes.length === 0 ? '<p style="text-align:center; color:#555;">Пусто...</p>' : 
    wishes.map((w, i) => `<div class="wish-item"><span>${w}</span><span class="del-btn" onclick="delWish(${i})">×</span></div>`).join('');
}
function addWish() {
    const val = document.getElementById('w-input').value.trim();
    if (!val) return;
    wishes.push(val);
    document.getElementById('w-input').value = '';
    localStorage.setItem('wishes', JSON.stringify(wishes));
    renderWishlist();
}
function delWish(i) {
    wishes.splice(i, 1);
    localStorage.setItem('wishes', JSON.stringify(wishes));
    renderWishlist();
}

function syncWithBot() {
    const s = localStorage.getItem('dmb_s');
    const e = localStorage.getItem('dmb_e');
    const w = JSON.parse(localStorage.getItem('wishes') || '[]');
    
    if(!s || !e) { tg.showAlert("Сначала настрой даты ДМБ!"); return; }

    const data = { s: s, e: e, w: w };
    tg.sendData(JSON.stringify(data));
}

function breakPair() {
    tg.showConfirm("Разорвать связь?", function(c) {
        if (c) { localStorage.clear(); tg.sendData(JSON.stringify({action:"break_pair"})); }
    });
}