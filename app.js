// Herní data a konfigurace
const gameData = {
    timeLimit: 3600, // 60 minut v sekundách
    maxHints: 3,
    tasks: [
        {
            id: 1,
            name: "Zabezpečený vchod",
            answer: "1987",
            hints: [
                "Na zdi je nápis: 'Rok, kdy vše začalo...'",
                "Vzpomeňte si na rok zmizení Dr. Nováka",
                "Je to rok z 80. let minulého století"
            ]
        },
        {
            id: 2,
            name: "Chemická formule",
            answer: "H2O + NaCl + C6H12O6",
            hints: [
                "Poznámka: 'Život potřebuje 3 základní složky'",
                "Symboly na tabuli: H2O (voda), NaCl (sůl), C6H12O6 (cukr)",
                "Hledáte základní látky pro život"
            ]
        },
        {
            id: 3,
            name: "Šifrovaný deník",
            answer: "LABORATOŘ JE NEBEZPEČNÁ",
            hints: [
                "Každé písmeno je posunuto o 3 místa v abecedě dopředu",
                "O → L, D → A, E → B...",
                "Caesarova šifra s posunem o 3"
            ]
        },
        {
            id: 4,
            name: "Sekvence světel",
            answer: ["Zelená", "Modrá", "Červená", "Žlutá"],
            hints: [
                "Tabule ukazuje prvky: H (zelená), He (modrá), Li (červená), Be (žlutá)",
                "Pořadí podle atomového čísla prvků v periodické tabulce",
                "H=1, He=2, Li=3, Be=4"
            ]
        },
        {
            id: 5,
            name: "Finální únik",
            answer: "Chemie pro začátečníky",
            hints: [
                "Dr. Novák napsal: 'Když se vše zdá ztracené, vraťte se k základům'",
                "Hledejte knihu o základech chemie",
                "Nejjednodušší kniha v knihovně"
            ]
        }
    ]
};

// Herní stav
let gameState = {
    currentTask: 1,
    timeRemaining: gameData.timeLimit,
    hintsUsed: 0,
    hintsUsedPerTask: [0, 0, 0, 0, 0],
    isGameRunning: false,
    startTime: null,
    selectedSequence: [],
    timerInterval: null
};

// DOM elementy
const elements = {
    introScreen: document.getElementById('intro-screen'),
    gameScreen: document.getElementById('game-screen'),
    resultScreen: document.getElementById('result-screen'),
    startGameBtn: document.getElementById('start-game'),
    timer: document.getElementById('timer'),
    progress: document.getElementById('progress'),
    currentTaskSpan: document.getElementById('current-task'),
    hintsLeftSpan: document.getElementById('hints-left'),
    hintBtn: document.getElementById('hint-btn'),
    hintDisplay: document.getElementById('hint-display'),
    playAgainBtn: document.getElementById('play-again'),
    successResult: document.getElementById('success-result'),
    failureResult: document.getElementById('failure-result'),
    completionTime: document.getElementById('completion-time'),
    hintsUsedSpan: document.getElementById('hints-used')
};

// Inicializace hry
function initGame() {
    elements.startGameBtn.addEventListener('click', startGame);
    elements.playAgainBtn.addEventListener('click', resetGame);
    elements.hintBtn.addEventListener('click', showHint);
    
    initTaskControls();
}

// Inicializace ovládání úkolů
function initTaskControls() {
    // Úkol 1: Číselný kód
    const codeInput = document.getElementById('code-input');
    const submitCodeBtn = document.getElementById('submit-code');
    
    codeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
    
    submitCodeBtn.addEventListener('click', () => {
        const value = codeInput.value.trim();
        if (value) {
            checkAnswer(1, value);
        }
    });
    
    codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const value = codeInput.value.trim();
            if (value) {
                checkAnswer(1, value);
            }
        }
    });

    // Úkol 2: Chemická formule
    document.querySelectorAll('#task-2 .option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Zrušit předchozí výběr
            document.querySelectorAll('#task-2 .option-btn').forEach(b => b.classList.remove('selected'));
            // Vybrat aktuální
            e.target.classList.add('selected');
            // Zkontrolovat odpověď po krátké pauze
            setTimeout(() => {
                checkAnswer(2, e.target.dataset.value);
            }, 300);
        });
    });

    // Úkol 3: Caesarova šifra
    const cipherInput = document.getElementById('cipher-input');
    const submitCipherBtn = document.getElementById('submit-cipher');
    
    submitCipherBtn.addEventListener('click', () => {
        const value = cipherInput.value.trim().toUpperCase();
        if (value) {
            checkAnswer(3, value);
        }
    });
    
    cipherInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const value = cipherInput.value.trim().toUpperCase();
            if (value) {
                checkAnswer(3, value);
            }
        }
    });

    // Úkol 4: Sekvence barev
    document.querySelectorAll('#task-4 .color-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.classList.add('clicked');
            setTimeout(() => e.target.classList.remove('clicked'), 150);
            
            const color = e.target.dataset.color;
            gameState.selectedSequence.push(color);
            updateSequenceDisplay();
            
            // Automaticky zkontrolovat po výběru 4 barev
            if (gameState.selectedSequence.length === 4) {
                setTimeout(() => {
                    checkAnswer(4, [...gameState.selectedSequence]);
                }, 500);
            }
        });
    });
    
    document.getElementById('reset-sequence').addEventListener('click', () => {
        gameState.selectedSequence = [];
        updateSequenceDisplay();
    });
    
    document.getElementById('submit-sequence').addEventListener('click', () => {
        if (gameState.selectedSequence.length === 4) {
            checkAnswer(4, [...gameState.selectedSequence]);
        } else {
            showFeedback('Musíte vybrat všechny 4 barvy v pořadí!', 'error');
        }
    });

    // Úkol 5: Knihovna
    document.querySelectorAll('#task-5 .book-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const value = e.target.dataset.value;
            if (value) {
                checkAnswer(5, value);
            }
        });
    });
}

// Spuštění hry
function startGame() {
    gameState.isGameRunning = true;
    gameState.startTime = Date.now();
    gameState.timeRemaining = gameData.timeLimit;
    gameState.currentTask = 1;
    
    showScreen('game');
    startTimer();
    updateProgress();
    updateHintsDisplay();
    showTask(1);
}

// Zobrazení obrazovky
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    
    switch(screenName) {
        case 'intro':
            elements.introScreen.classList.add('active');
            break;
        case 'game':
            elements.gameScreen.classList.add('active');
            break;
        case 'result':
            elements.resultScreen.classList.add('active');
            break;
    }
}

// Spuštění časovače
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        updateTimerDisplay();
        
        if (gameState.timeRemaining <= 0) {
            endGame(false);
        }
    }, 1000);
}

// Aktualizace zobrazení časovače
function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    elements.timer.textContent = timeString;
    
    if (gameState.timeRemaining <= 300) { // Posledních 5 minut
        elements.timer.classList.add('warning');
    }
}

// Zobrazení úkolu
function showTask(taskNumber) {
    // Skrýt všechny úkoly
    document.querySelectorAll('.task').forEach(task => task.classList.remove('active'));
    
    // Zobrazit požadovaný úkol
    const taskElement = document.getElementById(`task-${taskNumber}`);
    if (taskElement) {
        taskElement.classList.add('active');
    }
    
    // Aktualizovat stav
    gameState.currentTask = taskNumber;
    elements.currentTaskSpan.textContent = taskNumber;
    updateHintsDisplay();
    updateProgress();
    
    // Reset specifických stavů úkolů
    if (taskNumber === 4) {
        gameState.selectedSequence = [];
        updateSequenceDisplay();
    }
    
    // Skrýt předchozí nápovědu
    elements.hintDisplay.classList.remove('show');
}

// Aktualizace progress baru
function updateProgress() {
    const progress = ((gameState.currentTask - 1) / gameData.tasks.length) * 100;
    elements.progress.style.width = `${progress}%`;
}

// Kontrola odpovědi
function checkAnswer(taskId, answer) {
    // Ujistit se, že kontrolujeme správný úkol
    if (taskId !== gameState.currentTask) {
        console.warn(`Task ID mismatch: expected ${gameState.currentTask}, got ${taskId}`);
        return;
    }
    
    const task = gameData.tasks[taskId - 1];
    let isCorrect = false;
    
    console.log(`Checking task ${taskId}: "${answer}" vs "${task.answer}"`);
    
    if (taskId === 4) {
        // Speciální kontrola pro sekvenci barev
        isCorrect = JSON.stringify(answer) === JSON.stringify(task.answer);
    } else {
        isCorrect = answer.toString().trim() === task.answer.toString().trim();
    }
    
    if (isCorrect) {
        showFeedback('Správně! Pokračujte na další úkol.', 'success');
        
        if (taskId === gameData.tasks.length) {
            // Poslední úkol - konec hry
            setTimeout(() => endGame(true), 1500);
        } else {
            // Přechod na další úkol
            setTimeout(() => {
                const nextTask = taskId + 1;
                showTask(nextTask);
            }, 1500);
        }
    } else {
        showFeedback('Nesprávná odpověď. Zkuste to znovu.', 'error');
        
        // Animace chyby
        const currentTaskElement = document.getElementById(`task-${taskId}`);
        if (currentTaskElement) {
            currentTaskElement.classList.add('shake');
            setTimeout(() => currentTaskElement.classList.remove('shake'), 500);
        }
    }
}

// Zobrazení zpětné vazby
function showFeedback(message, type) {
    // Odstranění předchozí zpětné vazby
    const existingFeedback = document.querySelector('.feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    
    const currentTask = document.querySelector('.task.active');
    if (currentTask) {
        currentTask.appendChild(feedback);
        
        // Automatické odstranění po 3 sekundách
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 3000);
    }
}

// Zobrazení nápovědy
function showHint() {
    const taskIndex = gameState.currentTask - 1;
    const currentHints = gameState.hintsUsedPerTask[taskIndex];
    
    if (currentHints >= gameData.maxHints) {
        showFeedback('Již jste použili všechny nápovědy pro tento úkol.', 'error');
        return;
    }
    
    const task = gameData.tasks[taskIndex];
    const hint = task.hints[currentHints];
    
    elements.hintDisplay.textContent = hint;
    elements.hintDisplay.classList.add('show');
    elements.hintDisplay.classList.add('pulse');
    
    gameState.hintsUsedPerTask[taskIndex]++;
    gameState.hintsUsed++;
    updateHintsDisplay();
    
    setTimeout(() => {
        elements.hintDisplay.classList.remove('pulse');
    }, 600);
}

// Aktualizace zobrazení nápověd
function updateHintsDisplay() {
    const taskIndex = gameState.currentTask - 1;
    const hintsLeft = gameData.maxHints - gameState.hintsUsedPerTask[taskIndex];
    
    if (elements.hintsLeftSpan) {
        elements.hintsLeftSpan.textContent = hintsLeft;
    }
    
    if (hintsLeft <= 0) {
        elements.hintBtn.disabled = true;
        elements.hintBtn.textContent = 'Žádné nápovědy';
    } else {
        elements.hintBtn.disabled = false;
        elements.hintBtn.innerHTML = `Nápověda (<span id="hints-left">${hintsLeft}</span> zbývá)`;
        // Aktualizovat referenci na nový element
        elements.hintsLeftSpan = document.getElementById('hints-left');
    }
}

// Aktualizace zobrazení sekvence barev
function updateSequenceDisplay() {
    const container = document.getElementById('selected-sequence');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.selectedSequence.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'selected-color';
        colorDiv.textContent = color;
        
        // Přidání příslušné barvy
        switch(color) {
            case 'Zelená':
                colorDiv.style.backgroundColor = '#4ade80';
                colorDiv.style.color = '#065f46';
                break;
            case 'Modrá':
                colorDiv.style.backgroundColor = '#60a5fa';
                colorDiv.style.color = '#1e3a8a';
                break;
            case 'Červená':
                colorDiv.style.backgroundColor = '#f87171';
                colorDiv.style.color = '#7f1d1d';
                break;
            case 'Žlutá':
                colorDiv.style.backgroundColor = '#fbbf24';
                colorDiv.style.color = '#78350f';
                break;
        }
        
        container.appendChild(colorDiv);
    });
}

// Konec hry
function endGame(success) {
    gameState.isGameRunning = false;
    clearInterval(gameState.timerInterval);
    
    if (success) {
        elements.successResult.classList.add('active');
        elements.failureResult.classList.remove('active');
        
        // Výpočet času dokončení
        const totalTime = gameData.timeLimit - gameState.timeRemaining;
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        elements.completionTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        elements.hintsUsedSpan.textContent = gameState.hintsUsed;
    } else {
        elements.failureResult.classList.add('active');
        elements.successResult.classList.remove('active');
    }
    
    showScreen('result');
}

// Reset hry
function resetGame() {
    // Reset herního stavu
    gameState = {
        currentTask: 1,
        timeRemaining: gameData.timeLimit,
        hintsUsed: 0,
        hintsUsedPerTask: [0, 0, 0, 0, 0],
        isGameRunning: false,
        startTime: null,
        selectedSequence: [],
        timerInterval: null
    };
    
    // Reset UI elementů
    clearInterval(gameState.timerInterval);
    elements.timer.classList.remove('warning');
    elements.hintDisplay.classList.remove('show');
    
    // Reset formulářů a výběrů
    const codeInput = document.getElementById('code-input');
    const cipherInput = document.getElementById('cipher-input');
    
    if (codeInput) codeInput.value = '';
    if (cipherInput) cipherInput.value = '';
    
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.feedback').forEach(feedback => feedback.remove());
    
    // Reset result screens
    elements.successResult.classList.remove('active');
    elements.failureResult.classList.remove('active');
    
    showScreen('intro');
}

// Spuštění při načtení stránky
document.addEventListener('DOMContentLoaded', initGame);