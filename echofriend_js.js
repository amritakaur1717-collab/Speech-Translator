lucide.createIcons();

let isRecording = false;
let recognition = null;
let synthesis = window.speechSynthesis;
let translationHistory = JSON.parse(localStorage.getItem('echofriend_history') || '[]');
let currentProfile = 'grandpa';
let currentFontSize = 'normal';

const profiles = {
    grandpa: {
        name: "Grandpa Joe's Medical & Daily Chat",
        source: 'en-US',
        target: 'es-ES',
        phrases: [
            { en: "Where does it hurt?", es: "¿Dónde le duele?" },
            { en: "Take this medicine with water.", es: "Tome esta medicina con agua." },
            { en: "I love you very much.", es: "Te quiero mucho." },
            { en: "How are you feeling today?", es: "¿Cómo se siente hoy?" }
        ]
    },
    roommate: {
        name: "Roommate Mateo (Groceries & Chores)",
        source: 'en-US',
        target: 'fr-FR',
        phrases: [
            { en: "We need milk and eggs.", es: "Nous avons besoin de lait et d'œufs." },
            { en: "It's your turn to wash the dishes.", es: "C'est à votre tour de faire la vaisselle." },
            { en: "Let's order pizza tonight.", es: "Commandons des pizzas ce soir." }
        ]
    }
};

const offlineDictionary = {
    "es": {
        "hello": "¡Hola!",
        "where does it hurt?": "¿Dónde le duele?",
        "take this medicine with water.": "Tome esta medicina con agua.",
        "i love you very much.": "Te quiero mucho.",
        "how are you feeling today?": "¿Cómo se siente hoy?"
    },
    "fr": {
        "hello": "Bonjour !",
        "we need milk and eggs.": "Nous avons besoin de lait et d'œufs."
    }
};

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        
        recognition.onstart = () => {
            isRecording = true;
            document.getElementById('recordStateLabel').innerText = "Listening... Speak clearly";
            document.getElementById('micPulseRing').classList.remove('hidden');
            document.getElementById('recordBtn').classList.add('bg-red-500', 'from-red-600', 'to-rose-500');
            document.getElementById('recordIcon').setAttribute('data-lucide', 'square');
            lucide.createIcons();
        };

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            document.getElementById('sourceText').value = transcript;
            translateText(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            stopRecording();
        };

        recognition.onend = () => {
            stopRecording();
        };
    } else {
        showToast("Speech Recognition not supported in this browser.");
    }
}

function toggleRecord() {
    if (!recognition) initSpeechRecognition();
    if (!recognition) return;

    if (isRecording) {
        recognition.stop();
    } else {
        recognition.lang = document.getElementById('sourceLang').value;
        try { recognition.start(); } catch (e) { console.error(e); }
    }
}

function stopRecording() {
    isRecording = false;
    document.getElementById('recordStateLabel').innerText = "Tap to Start Voice Translation";
    document.getElementById('micPulseRing').classList.add('hidden');
    document.getElementById('recordBtn').classList.remove('bg-red-500', 'from-red-600', 'to-rose-500');
    document.getElementById('recordIcon').setAttribute('data-lucide', 'mic');
    lucide.createIcons();
}

async function translateText(text) {
    if (!text.trim()) {
        document.getElementById('targetText').innerHTML = '<span class="text-slate-400 dark:text-slate-600 text-base font-normal">Translation will appear here instantly...</span>';
        return;
    }

    const targetLangCode = document.getElementById('targetLang').value.split('-')[0];
    const sourceLangCode = document.getElementById('sourceLang').value.split('-')[0];
    const engine = document.getElementById('engineSelect').value;
    let translated = "";

    if (engine === 'ollama') {
        try {
            const ollamaUrl = document.getElementById('ollamaUrl').value;
            const response = await fetch(`${ollamaUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "llama3",
                    prompt: `Translate the following text from ${sourceLangCode} to ${targetLangCode}. Output ONLY translated text:\n\n${text}`,
                    stream: false
                })
            });
            const data = await response.json();
            translated = data.response ? data.response.trim() : "";
        } catch (err) {
            console.warn("Ollama connection failed, using offline fallback.", err);
        }
    }

    if (!translated) {
        const lowerText = text.toLowerCase().trim();
        if (offlineDictionary[targetLangCode] && offlineDictionary[targetLangCode][lowerText]) {
            translated = offlineDictionary[targetLangCode][lowerText];
        } else {
            translated = `[${targetLangCode.toUpperCase()}]: ${text}`;
        }
    }

    document.getElementById('targetText').innerText = translated;
    addToHistory(text, translated);
}

document.getElementById('sourceText').addEventListener('input', (e) => {
    translateText(e.target.value);
});

function speakTranslation() {
    const textToSpeak = document.getElementById('targetText').innerText;
    if (!textToSpeak || textToSpeak.includes("Translation will appear")) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = document.getElementById('targetLang').value;
    utterance.rate = parseFloat(document.getElementById('speechRate').value);
    synthesis.speak(utterance);
}

function addToHistory(source, target) {
    translationHistory.unshift({ source, target, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    if (translationHistory.length > 20) translationHistory.pop();
    localStorage.setItem('echofriend_history', JSON.stringify(translationHistory));
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('historyList');
    if (translationHistory.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No recent translations yet.</p>';
        return;
    }

    container.innerHTML = translationHistory.map((item) => `
        <div onclick="loadHistoryItem('${item.source.replace(/'/g, "\\'")}', '${item.target.replace(/'/g, "\\'")}')" class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition border border-slate-100 dark:border-slate-800">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>${item.time}</span>
                <i data-lucide="arrow-right" class="w-3 h-3"></i>
            </div>
            <p class="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">${item.source}</p>
            <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">${item.target}</p>
        </div>
    `).join('');
    lucide.createIcons();
}

function loadHistoryItem(source, target) {
    document.getElementById('sourceText').value = source;
    document.getElementById('targetText').innerText = target;
}

function clearHistory() {
    translationHistory = [];
    localStorage.removeItem('echofriend_history');
    renderHistory();
    showToast("History cleared");
}

function renderQuickPhrases() {
    const profile = profiles[currentProfile];
    const container = document.getElementById('quickPhrasesContainer');
    container.innerHTML = profile.phrases.map(p => `
        <button onclick="loadQuickPhrase('${p.en.replace(/'/g, "\\'")}', '${p.es ? p.es.replace(/'/g, "\\'") : ''}')" class="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition flex items-center justify-between group">
            <span class="text-xs font-medium text-slate-700 dark:text-slate-300">${p.en}</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition"></i>
        </button>
    `).join('');
    lucide.createIcons();
}

function loadQuickPhrase(en, targetTranslation) {
    document.getElementById('sourceText').value = en;
    document.getElementById('targetText').innerText = targetTranslation;
}

function openFriendModal() { document.getElementById('friendModal').classList.remove('hidden'); }
function closeFriendModal() { document.getElementById('friendModal').classList.add('hidden'); }

function selectFriendProfile(key) {
    currentProfile = key;
    const profile = profiles[key];
    document.getElementById('currentFriendName').innerText = profile.name;
    document.getElementById('sourceLang').value = profile.source;
    document.getElementById('targetLang').value = profile.target;
    renderQuickPhrases();
    closeFriendModal();
    showToast(`Loaded profile for ${profile.name}`);
}

function openSettingsModal() { document.getElementById('settingsModal').classList.remove('hidden'); }
function closeSettingsModal() { document.getElementById('settingsModal').classList.add('hidden'); }

document.getElementById('engineSelect').addEventListener('change', (e) => {
    const box = document.getElementById('ollamaConfigBox');
    if (e.target.value === 'ollama') box.classList.remove('hidden');
    else box.classList.add('hidden');
});

function saveSettings() {
    closeSettingsModal();
    showToast("Settings saved successfully");
}

function swapLanguages() {
    const src = document.getElementById('sourceLang');
    const tgt = document.getElementById('targetLang');
    const temp = src.value;
    src.value = tgt.value;
    tgt.value = temp;
    showToast("Languages swapped");
}

function clearSource() {
    document.getElementById('sourceText').value = '';
    document.getElementById('targetText').innerHTML = '<span class="text-slate-400 dark:text-slate-600 text-base font-normal">Translation will appear here instantly...</span>';
}

function copyToClipboard(elementId) {
    const text = elementId === 'sourceText' ? document.getElementById('sourceText').value : document.getElementById('targetText').innerText;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast("Copied to clipboard!");
}

function increaseFontSize() {
    const tgt = document.getElementById('targetText');
    if (currentFontSize === 'normal') {
        tgt.classList.remove('text-2xl');
        tgt.classList.add('text-4xl');
        currentFontSize = 'large';
        showToast("Large text enabled");
    } else {
        tgt.classList.remove('text-4xl');
        tgt.classList.add('text-2xl');
        currentFontSize = 'normal';
        showToast("Standard text size");
    }
}

function toggleDarkMode() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    document.getElementById('themeIcon').setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    lucide.createIcons();
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
}

renderQuickPhrases();
renderHistory();