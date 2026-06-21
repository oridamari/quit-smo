const GIST_ID = '4fbf52509b7d6c89d83bc2988325edbc';
const STATE = {
    gistId: GIST_ID,
    token: '',
    data: {
        settings: {
            dailyGoal: 10,
            milestones: [
                { name: "עיסוי", cost: 200 },
                { name: "מסעדה טובה", cost: 500 }
            ]
        },
        history: []
    }
};

const ENCOURAGING_MESSAGES = [
    "אלופה! כל הכבוד!",
    "את חזקה יותר מהדודא!",
    "איזה יופי, עוד ניצחון בדרך ליעד!",
    "מלכה! המשיכי כך!",
    "גאה בך מאוד!"
];

// Elements
const views = {
    settings: document.getElementById('settings-view'),
    main: document.getElementById('main-view'),
    admin: document.getElementById('admin-view')
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    STATE.gistId = GIST_ID;

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
        localStorage.setItem('quit_smo_token', tokenFromUrl);
        STATE.token = tokenFromUrl;
        urlParams.delete('token');
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.replaceState(null, '', newUrl);
    } else {
        STATE.token = localStorage.getItem('quit_smo_token') || '';
    }

    const isAdmin = urlParams.get('view') === 'admin';

    if (!STATE.token) {
        showView('settings');
    } else {
        loadData(isAdmin ? 'admin' : 'main');
    }

    setupEventListeners();
});

function showView(viewName) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    if (views[viewName]) {
        views[viewName].classList.remove('hidden');
    }
}

function showLoading(show) {
    document.getElementById('loading-overlay').classList.toggle('hidden', !show);
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
        if(container.contains(toast)) {
            container.removeChild(toast);
        }
    }, 3000);
}

function setupEventListeners() {
    // Settings
    document.getElementById('save-settings').addEventListener('click', async () => {
        const token = document.getElementById('gist-token').value.trim();
        if(!token) return showToast('נא להזין טוקן');
        
        STATE.token = token;
        
        showLoading(true);
        const success = await fetchGistData();
        if (success) {
            localStorage.setItem('quit_smo_token', token);
            const isAdmin = new URLSearchParams(window.location.search).get('view') === 'admin';
            updateUI();
            showView(isAdmin ? 'admin' : 'main');
        } else {
            showToast('שגיאה בהתחברות ל-Gist. בדקי את הפרטים.');
        }
        showLoading(false);
    });

    // Main App
    document.getElementById('btn-victory').addEventListener('click', async () => {
        const lastCraving = [...STATE.data.history].reverse().find(i => i.type === 'craving_defeated');
        if (lastCraving) {
            const hoursSince = (Date.now() - new Date(lastCraving.date).getTime()) / (1000 * 60 * 60);
            if (hoursSince < 3) {
                return showToast('אפשר לדווח על ניצחון רק פעם ב-3 שעות!');
            }
        }

        const msg = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
        
        const newEntry = {
            id: Date.now().toString(),
            type: 'craving_defeated',
            date: new Date().toISOString(),
            earned: 5,
            desc: 'ניצחון על דודא!'
        };
        
        STATE.data.history.push(newEntry);
        
        // Confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        
        showToast(msg);
        updateUI();
        await saveGistData();
    });

    document.getElementById('btn-checkout').addEventListener('click', async () => {
        const lastCheckout = [...STATE.data.history].reverse().find(i => i.type === 'daily_checkout');
        if (lastCheckout) {
            const hoursSince = (Date.now() - new Date(lastCheckout.date).getTime()) / (1000 * 60 * 60);
            if (hoursSince < 12) {
                return showToast('ניתן לבצע סיכום יומי רק פעם ב-12 שעות!');
            }
        }

        const smokedInput = document.getElementById('daily-smoked');
        const smoked = parseInt(smokedInput.value, 10);
        
        if (isNaN(smoked) || smoked < 0) {
            return showToast('נא להזין מספר תקין');
        }

        const goal = STATE.data.settings.dailyGoal;
        let earned = 0;
        let desc = `סיכום יומי (${smoked} סיגריות)`;

        if (smoked < goal) {
            earned = (goal - smoked) * 5;
            confetti({ particleCount: 50, spread: 60 });
            showToast(`כל הכבוד! חסכת ${earned} ₪`);
        } else {
            showToast('לא נורא, מחר יום חדש!');
        }

        const newEntry = {
            id: Date.now().toString(),
            type: 'daily_checkout',
            date: new Date().toISOString(),
            smoked: smoked,
            earned: earned,
            desc: desc
        };

        STATE.data.history.push(newEntry);
        smokedInput.value = '0';
        updateUI();
        await saveGistData();
    });

    // Admin
    document.getElementById('btn-exit-admin').addEventListener('click', () => {
        window.history.replaceState(null, '', window.location.pathname);
        showView('main');
    });

    document.getElementById('admin-save-settings').addEventListener('click', async () => {
        const goal = parseInt(document.getElementById('admin-daily-goal').value, 10);
        if(!isNaN(goal) && goal >= 0) {
            STATE.data.settings.dailyGoal = goal;
            updateUI();
            showLoading(true);
            await saveGistData();
            showLoading(false);
            showToast('הגדרות נשמרו');
        }
    });

    document.getElementById('admin-reset-all').addEventListener('click', async () => {
        if(confirm('האם את בטוחה שברצונך למחוק את כל ההיסטוריה? פעולה זו בלתי הפיכה!')) {
            STATE.data.history = [];
            updateUI();
            showLoading(true);
            await saveGistData();
            showLoading(false);
            showToast('הנתונים אופסו');
        }
    });
}

// API Functions
async function fetchGistData() {
    try {
        const res = await fetch(`https://api.github.com/gists/${STATE.gistId}`, {
            headers: {
                'Authorization': `token ${STATE.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (!res.ok) return false;
        
        const gist = await res.json();
        const file = gist.files['quit_smo_data.json'];
        
        if (file && file.content) {
            const parsed = JSON.parse(file.content);
            STATE.data = { ...STATE.data, ...parsed }; // Merge in case of missing fields
        } else {
            // Initialize empty file in gist
            await saveGistData();
        }
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

async function saveGistData() {
    try {
        const res = await fetch(`https://api.github.com/gists/${STATE.gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${STATE.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    'quit_smo_data.json': {
                        content: JSON.stringify(STATE.data, null, 2)
                    }
                }
            })
        });
        return res.ok;
    } catch (e) {
        console.error(e);
        showToast('שגיאה בשמירת נתונים!');
        return false;
    }
}

async function loadData(targetView) {
    showLoading(true);
    const success = await fetchGistData();
    showLoading(false);
    
    if (success) {
        updateUI();
        showView(targetView);
    } else {
        showToast('שגיאה בטעינת נתונים, מציג מסך הגדרות.');
        showView('settings');
        // Pre-fill if exists
        document.getElementById('gist-token').value = STATE.token;
    }
}

// UI Updates
function updateUI() {
    // Calc Pot
    const pot = STATE.data.history.reduce((sum, item) => sum + (item.earned || 0), 0);
    document.getElementById('pot-total').innerText = `${pot} ₪`;
    
    // Calc Progress
    const milestones = STATE.data.settings.milestones.sort((a,b) => a.cost - b.cost);
    let nextMilestone = milestones.find(m => m.cost > pot);
    
    if (nextMilestone) {
        const diff = nextMilestone.cost - pot;
        document.getElementById('progress-text').innerText = `עוד ${diff} ₪ ל${nextMilestone.name}!`;
        const percentage = Math.min(100, Math.max(0, (pot / nextMilestone.cost) * 100));
        document.getElementById('progress-bar').style.width = `${percentage}%`;
    } else {
        document.getElementById('progress-text').innerText = 'השגת את כל היעדים! איזה אלופה!';
        document.getElementById('progress-bar').style.width = '100%';
    }

    // Stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const cravingsThisWeek = STATE.data.history.filter(item => 
        item.type === 'craving_defeated' && new Date(item.date) >= oneWeekAgo
    ).length;
    
    document.getElementById('stat-cravings').innerText = cravingsThisWeek;
    document.getElementById('stat-earned').innerText = `${pot} ₪`;
    
    // Main View specific
    document.getElementById('display-daily-goal').innerText = STATE.data.settings.dailyGoal;

    // Admin View specific
    document.getElementById('admin-daily-goal').value = STATE.data.settings.dailyGoal;
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-list');
    container.innerHTML = '';
    
    const sorted = [...STATE.data.history].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    sorted.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        const dateStr = new Date(item.date).toLocaleString('he-IL');
        
        div.innerHTML = `
            <div class="info">
                <span class="desc">${item.desc}</span>
                <span class="date">${dateStr}</span>
            </div>
            <div>
                <span class="amount">+${item.earned || 0} ₪</span>
                <button class="btn-del" data-id="${item.id}">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });

    // Add delete listeners
    container.querySelectorAll('.btn-del').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if(confirm('למחוק רשומה זו?')) {
                STATE.data.history = STATE.data.history.filter(item => item.id !== id);
                updateUI();
                showLoading(true);
                await saveGistData();
                showLoading(false);
            }
        });
    });
}
