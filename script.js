let audioCtx = null, playing = false, stopFlag = false, currentVersion = 'v1';
let reverbNode, reverbGain, dryGain, delayNode, delayFeedback, delayGain, chorusDelay, chorusLFO, chorusGain, tremoloLFO, tremoloGain, masterOutput;
let currentEmotion = { pitch: 1, speed: 1, volume: 1, whisper: false, vibrato: 1 };
let cachedEffectsInput = null, effectsNeedUpdate = true, activeOscillators = [];

const VOICES = {
    // Классика v1.0
    male1: { pitch: 120, formant: 1.0 }, female1: { pitch: 200, formant: 1.15 }, robot: { pitch: 100, formant: 1.0, robot: true },
    male2: { pitch: 140, formant: 1.0 }, female2: { pitch: 220, formant: 1.2 },
    dmitry: { pitch: 95, formant: 0.92 }, alex: { pitch: 125, formant: 1.0 }, elena: { pitch: 210, formant: 1.18 }, olga: { pitch: 250, formant: 1.25 }, child: { pitch: 300, formant: 1.4 },
    // v3.0 Мужские
    v3_boris: { pitch: 85, formant: 0.88, vibrato: 4 }, v3_dmitry: { pitch: 105, formant: 0.95, vibrato: 4.5 },
    v3_alex: { pitch: 130, formant: 1.0, vibrato: 5 }, v3_ivan: { pitch: 155, formant: 1.05, vibrato: 5 },
    v3_nikolay: { pitch: 95, formant: 0.9, vibrato: 3, rough: true }, v3_sergey: { pitch: 145, formant: 1.02, vibrato: 5.5 },
    // v3.0 Женские
    v3_anna: { pitch: 180, formant: 1.12, vibrato: 5 }, v3_elena: { pitch: 210, formant: 1.18, vibrato: 5.5 },
    v3_maria: { pitch: 260, formant: 1.28, vibrato: 6 }, v3_olga: { pitch: 280, formant: 1.32, vibrato: 6 },
    v3_natalia: { pitch: 200, formant: 1.15, vibrato: 5 }, v3_tatiana: { pitch: 245, formant: 1.25, vibrato: 5.5 },
    // v3.0 Детские
    v3_boy: { pitch: 290, formant: 1.38, vibrato: 6 }, v3_girl: { pitch: 320, formant: 1.45, vibrato: 6.5 },
    // v3.0 Специальные
    v3_robot: { pitch: 120, formant: 1.0, robot: true }, v3_whisper: { pitch: 150, formant: 1.0, whisper: true },
    v3_grandpa: { pitch: 90, formant: 0.85, vibrato: 3, tremor: true }, v3_grandma: { pitch: 170, formant: 1.1, vibrato: 4, tremor: true },
    // v3.5 Новые
    v35_maxim: { pitch: 115, formant: 0.98, vibrato: 4 }, v35_oleg: { pitch: 95, formant: 0.88, vibrato: 3 },
    v35_victoria: { pitch: 230, formant: 1.22, vibrato: 5.5 }, v35_kristina: { pitch: 270, formant: 1.3, vibrato: 6 },
    v35_baby: { pitch: 350, formant: 1.55, vibrato: 7 }, v35_monster: { pitch: 60, formant: 0.7, vibrato: 2, rough: true },
    v35_alien: { pitch: 400, formant: 1.8, vibrato: 10, robot: true }, v35_drunk: { pitch: 110, formant: 0.95, vibrato: 8, tremor: true },
    // v5.0 Новые голоса
    v5_andrey: { pitch: 125, formant: 1.0, vibrato: 6 }, v5_vladimir: { pitch: 90, formant: 0.88, vibrato: 3 },
    v5_ekaterina: { pitch: 195, formant: 1.15, vibrato: 4, whisper: false }, v5_svetlana: { pitch: 220, formant: 1.2, vibrato: 5 },
    v5_schoolboy: { pitch: 260, formant: 1.35, vibrato: 6 }, v5_schoolgirl: { pitch: 300, formant: 1.42, vibrato: 6.5 },
    v5_villain: { pitch: 75, formant: 0.8, vibrato: 2, rough: true }, v5_angel: { pitch: 280, formant: 1.35, vibrato: 7 },
    v5_pirate: { pitch: 100, formant: 0.9, vibrato: 4, rough: true }, v5_cartoon: { pitch: 350, formant: 1.6, vibrato: 8 },
    // v6.0 MEGA голоса
    v6_rapper: { pitch: 95, formant: 0.9, vibrato: 3, rough: true }, v6_opera_m: { pitch: 130, formant: 1.1, vibrato: 8 },
    v6_opera_f: { pitch: 280, formant: 1.35, vibrato: 9 }, v6_commentator: { pitch: 110, formant: 1.0, vibrato: 2 },
    v6_beatboxer: { pitch: 100, formant: 0.85, vibrato: 1, robot: true }, v6_hypnotist: { pitch: 85, formant: 0.95, vibrato: 3 },
    v6_storyteller: { pitch: 120, formant: 1.05, vibrato: 5 }, v6_demon: { pitch: 55, formant: 0.6, vibrato: 2, rough: true },
    v6_fairy: { pitch: 380, formant: 1.7, vibrato: 8 }, v6_diva: { pitch: 300, formant: 1.4, vibrato: 7 },
    // v6.5 ULTRA голоса
    v65_hd_m: { pitch: 120, formant: 1.0, vibrato: 5 }, v65_hd_f: { pitch: 220, formant: 1.2, vibrato: 5.5 },
    v65_studio: { pitch: 115, formant: 0.98, vibrato: 4 }, v65_celebrity: { pitch: 125, formant: 1.02, vibrato: 5 },
    v65_podcast: { pitch: 110, formant: 0.95, vibrato: 4 }, v65_gamer: { pitch: 140, formant: 1.05, vibrato: 6 },
    // v8.0 Голоса
    v8_broadcaster: { pitch: 115, formant: 0.98, vibrato: 4 },
    v8_narrator: { pitch: 105, formant: 0.95, vibrato: 4 },
    v8_actor: { pitch: 125, formant: 1.02, vibrato: 5 },
    v8_actress: { pitch: 220, formant: 1.2, vibrato: 5.5 },
    v8_singer: { pitch: 240, formant: 1.28, vibrato: 6.5 },
    v8_hero: { pitch: 135, formant: 1.05, vibrato: 4.5 },
    v8_villain: { pitch: 85, formant: 0.85, vibrato: 3, rough: true },
    v8_wizard: { pitch: 110, formant: 1.0, vibrato: 6 },
    v8_dragon: { pitch: 60, formant: 0.7, vibrato: 2, rough: true },
    v8_ghost: { pitch: 160, formant: 1.15, vibrato: 8, whisper: true },
    v8_pirate: { pitch: 100, formant: 0.9, vibrato: 4, rough: true },
    v8_android: { pitch: 120, formant: 1.0, vibrato: 2, robot: true },
    v8_elf: { pitch: 210, formant: 1.25, vibrato: 6 },
    v8_orc: { pitch: 70, formant: 0.75, vibrato: 2.5, rough: true },
    // v9.0 Голоса
    v9_anchor: { pitch: 118, formant: 1.0, vibrato: 4 },
    v9_director: { pitch: 102, formant: 0.95, vibrato: 3.5 },
    v9_virtual: { pitch: 125, formant: 1.05, vibrato: 2, robot: true },
    v9_cinematic: { pitch: 90, formant: 0.85, vibrato: 2.5, rough: true },
    v9_radio: { pitch: 130, formant: 1.05, vibrato: 4.5 },
    v9_stage: { pitch: 140, formant: 1.1, vibrato: 5 },
    // v9.5 Голоса
    v95_master: { pitch: 120, formant: 1.02, vibrato: 4.5 },
    v95_cinema: { pitch: 95, formant: 0.9, vibrato: 3, rough: true },
    v95_holo: { pitch: 135, formant: 1.1, vibrato: 2.5, robot: true },
    v95_ultra: { pitch: 150, formant: 1.12, vibrato: 5.5 },
    // v10.0 Neural
    v10_neural_m: { pitch: 118, formant: 1.0, vibrato: 4.5 },
    v10_neural_f: { pitch: 210, formant: 1.18, vibrato: 5.2 },
    v10_actor: { pitch: 130, formant: 1.05, vibrato: 4.8 },
    v10_streamer: { pitch: 140, formant: 1.08, vibrato: 6 },
    v10_asmr: { pitch: 170, formant: 1.12, vibrato: 3.5, whisper: true },
    // v11.0 Neural HyperReal
    v11_neural_prime: { pitch: 126, formant: 1.03, vibrato: 4.6 },
    v11_neural_female: { pitch: 220, formant: 1.22, vibrato: 5.6 },
    v11_neural_male: { pitch: 112, formant: 0.98, vibrato: 4.2 },
    v11_neural_cinematic: { pitch: 98, formant: 0.92, vibrato: 3.6, rough: true },
    v11_neural_emotive: { pitch: 165, formant: 1.15, vibrato: 6.2 },
    v11_neural_idol: { pitch: 250, formant: 1.3, vibrato: 7.2 },
    v11_neural_duo: { pitch: 135, formant: 1.08, vibrato: 5.1 },
    v11_neural_whisper: { pitch: 175, formant: 1.1, vibrato: 3.4, whisper: true },
    v11_neural_radiant: { pitch: 145, formant: 1.12, vibrato: 5.8 },
    v11_neural_astral: { pitch: 105, formant: 0.96, vibrato: 4.0 }
};

const VOWELS = { 'А': { f1: 800, f2: 1200, f3: 2600 }, 'О': { f1: 500, f2: 850, f3: 2550 }, 'У': { f1: 320, f2: 650, f3: 2400 }, 'Э': { f1: 550, f2: 1850, f3: 2600 }, 'И': { f1: 280, f2: 2300, f3: 3000 }, 'Ы': { f1: 330, f2: 1550, f3: 2550 } };

const CONSONANTS = {
    'Б': { voiced: true, type: 'stop', freq: 200 }, 'П': { voiced: false, type: 'stop', freq: 400 },
    'В': { voiced: true, type: 'fric', freq: 350 }, 'Ф': { voiced: false, type: 'fric', freq: 1400 },
    'Г': { voiced: true, type: 'stop', freq: 280 }, 'К': { voiced: false, type: 'stop', freq: 500 },
    'Д': { voiced: true, type: 'stop', freq: 320 }, 'Т': { voiced: false, type: 'stop', freq: 420 },
    'Ж': { voiced: true, type: 'fric', freq: 2200 }, 'Ш': { voiced: false, type: 'fric', freq: 3000 },
    'З': { voiced: true, type: 'fric', freq: 4000 }, 'С': { voiced: false, type: 'fric', freq: 5500 },
    'Л': { voiced: true, type: 'son', freq: 400 }, 'М': { voiced: true, type: 'nas', freq: 280 },
    'Н': { voiced: true, type: 'nas', freq: 350 }, 'Р': { voiced: true, type: 'trill', freq: 450 },
    'Х': { voiced: false, type: 'fric', freq: 1300 }, 'Ц': { voiced: false, type: 'affr', freq: 5000 },
    'Ч': { voiced: false, type: 'affr', freq: 3800 }, 'Щ': { voiced: false, type: 'fric', freq: 3200 },
    'Й': { voiced: true, type: 'glide', freq: 280 }
};

const STRESS = { 'ПРИВЕТ': 4, 'ПОКА': 3, 'МАМА': 1, 'ПАПА': 1, 'ДЕЛА': 3, 'ХОРОШО': 5, 'СПАСИБО': 4, 'РОССИЯ': 3, 'МОСКВА': 4, 'МЫЛА': 1, 'РАМУ': 1 };

const DIGITS = { '0': 'НОЛЬ', '1': 'ОДИН', '2': 'ДВА', '3': 'ТРИ', '4': 'ЧЕТЫРЕ', '5': 'ПЯТЬ', '6': 'ШЕСТЬ', '7': 'СЕМЬ', '8': 'ВОСЕМЬ', '9': 'ДЕВЯТЬ' };

const SYMBOLS = { '=': 'РАВНО', '-': 'МИНУС', '+': 'ПЛЮС', '_': 'ПОДЧЁРКИВАНИЕ' };

const ENGLISH_MAP = { 'A':'А','B':'Б','C':'К','D':'Д','E':'Е','F':'Ф','G':'Г','H':'Х','I':'И','J':'ДЖ','K':'К','L':'Л','M':'М','N':'Н','O':'О','P':'П','Q':'К','R':'Р','S':'С','T':'Т','U':'У','V':'В','W':'В','X':'КС','Y':'Й','Z':'З' };

const ENGLISH_WORDS = { 'HELLO':'ХЭЛОУ','HI':'ХАЙ','WORLD':'ВОРЛД','THE':'ЗЭ','YOU':'Ю','YOUR':'ЁР','MY':'МАЙ','IS':'ИЗ','ARE':'АР','YES':'ЙЕС','NO':'НОУ','PLEASE':'ПЛИЗ','THANK':'СЭНК','THANKS':'СЭНКС','GOOD':'ГУД','BAD':'БЭД','OK':'ОКЭЙ','OKAY':'ОКЭЙ','BYE':'БАЙ','LOVE':'ЛАВ','LIKE':'ЛАЙК','SORRY':'СОРИ','WELCOME':'УЭЛКОМ','ROBOT':'РОБОТ','COMPUTER':'КОМПЬЮТЕР','TEXT':'ТЕКСТ','VOICE':'ВОЙС','SPEECH':'СПИЧ','MUSIC':'МЬЮЗИК','SOUND':'САУНД','PLAY':'ПЛЭЙ','STOP':'СТОП' };

const ACCENTS = {
    ru: { pitch: 1, formant: 1, speed: 1, transform: t => t },
    ua: { pitch: 1.08, formant: 1.05, speed: 0.95, transform: t => t.replace(/Г/g, 'ГХ').replace(/И/g, 'Ы').replace(/Е/g, 'Э') },
    kz: { pitch: 0.88, formant: 0.92, speed: 0.88, transform: t => t.replace(/К/g, 'Қ').replace(/Ы/g, 'Ұ').replace(/Г/g, 'Ғ') },
    tj: { pitch: 1.05, formant: 1.1, speed: 0.8, transform: t => t.replace(/О/g, 'У').replace(/А/g, 'О') },
    ge: { pitch: 0.75, formant: 0.85, speed: 0.85, transform: t => t.replace(/К/g, 'КХ').replace(/Р/g, 'РР').replace(/П/g, 'ПХ') },
    am: { pitch: 0.92, formant: 1.02, speed: 0.88, transform: t => t.replace(/Т/g, 'ТЬ').replace(/Д/g, 'ДЬ').replace(/К/g, 'КЬ') },
    az: { pitch: 1.02, formant: 0.98, speed: 0.92, transform: t => t.replace(/К/g, 'Г').replace(/Ы/g, 'И').replace(/Э/g, 'Е') },
    uz: { pitch: 0.98, formant: 1.03, speed: 0.9, transform: t => t.replace(/О/g, 'У').replace(/Ч/g, 'Ш').replace(/Щ/g, 'Ш') },
    by: { pitch: 1.02, formant: 1.0, speed: 0.95, transform: t => t.replace(/Ч/g, 'ДЗ').replace(/Щ/g, 'ШЧ').replace(/И/g, 'Ы') },
    md: { pitch: 1.1, formant: 1.08, speed: 0.9, transform: t => t.replace(/Ы/g, 'И').replace(/Э/g, 'Е').replace(/Х/g, 'Г') },
    ee: { pitch: 0.85, formant: 0.9, speed: 0.7, transform: t => t.replace(/Р/g, 'РР').replace(/Л/g, 'ЛЬ').replace(/Т/g, 'ТТ') },
    lv: { pitch: 0.9, formant: 0.92, speed: 0.75, transform: t => t.replace(/Г/g, 'К').replace(/Д/g, 'Т').replace(/Ж/g, 'Ш') },
    lt: { pitch: 0.95, formant: 0.95, speed: 0.8, transform: t => t.replace(/Ч/g, 'ТЬ').replace(/Ш/g, 'С').replace(/Ж/g, 'З') },
    en: { pitch: 1.0, formant: 1.0, speed: 1.1, transform: t => t.replace(/Р/g, 'Р').replace(/Х/g, 'Г').replace(/Ы/g, 'И') },
    de: { pitch: 0.9, formant: 0.95, speed: 0.85, transform: t => t.replace(/В/g, 'Ф').replace(/Д/g, 'Т').replace(/Ж/g, 'Ш').replace(/Р/g, 'ГР') },
    fr: { pitch: 1.1, formant: 1.1, speed: 0.9, transform: t => t.replace(/Р/g, 'ГР').replace(/Н/g, 'НН').replace(/Х/g, 'Г') }
};

const ACCENT_SOUNDS = {
    'ГХ': { type: 'fric', voiced: true, freq: 400 },
    'Қ': { type: 'stop', voiced: false, freq: 600, guttural: true },
    'Ғ': { type: 'fric', voiced: true, freq: 350, guttural: true },
    'Ұ': { type: 'vowel', f1: 350, f2: 1400, f3: 2500 },
    'КХ': { type: 'fric', voiced: false, freq: 1500 },
    'РР': { type: 'trill', voiced: true, freq: 500, long: true },
    'ПХ': { type: 'affr', voiced: false, freq: 800 },
    'Ö': { type: 'vowel', f1: 400, f2: 1600, f3: 2400 },
    'Ү': { type: 'vowel', f1: 300, f2: 1700, f3: 2300 }
};

const STYLES = {
    normal: { pitch: 1, speed: 1, volume: 1 },
    news: { pitch: 1.05, speed: 1.2, volume: 1.1 },
    fairy: { pitch: 1.1, speed: 0.75, volume: 0.9 },
    cinema: { pitch: 0.95, speed: 0.8, volume: 1.15 },
    radio: { pitch: 1.1, speed: 1.15, volume: 1.2 },
    audiobook: { pitch: 1.0, speed: 0.85, volume: 0.95 },
    standup: { pitch: 1.15, speed: 1.1, volume: 1.1 }
};

const EMOJIS = {
    '☺️': 'УЛЫБКА', '☺': 'УЛЫБКА',
    '☹️': 'ГРУСТЬ', '☹': 'ГРУСТЬ',
    '☠️': 'ЧЕРЕП', '☠': 'ЧЕРЕП',
    '❣️': 'СЕРДЦЕ ВОСКЛИЦАНИЕ', '❣': 'СЕРДЦЕ ВОСКЛИЦАНИЕ',
    '❤️': 'СЕРДЦЕ', '❤': 'СЕРДЦЕ',
    '✌️': 'ПОБЕДА', '✌': 'ПОБЕДА',
    '☝️': 'ПАЛЕЦ ВВЕРХ', '☝': 'ПАЛЕЦ ВВЕРХ'
};

const FUNNY_TRANSLATIONS = {
    'ПРИВЕТ': 'ПРЕВЕД',
    'ПОЖАЛУЙСТА': 'ПЖЛСТА',
    'СПАСИБО': 'СПС',
    'КАК': 'КАГ',
    'ЧТО': 'ЧЕГО',
    'ГДЕ': 'ГДЕЖ',
    'СЕЙЧАС': 'СЧАС',
    'ХОРОШО': 'ХОРАШО',
    'ПЛОХО': 'ПЛОХА',
    'МОЖНО': 'МОЖНА',
    'НЕЛЬЗЯ': 'НЕЛЬЗЯЯ',
    'СИНТЕЗАТОР': 'СИНТЕЗАТАР',
    'ГОЛОС': 'ГАЛОС',
    'РЕЧЬ': 'РЕЧЬКЕ',
    'КОМПЬЮТЕР': 'КОМПУТЕР',
    'ТЕКСТ': 'ТЕКСТЕ',
    'МИР': 'МИРК',
    'ДРУГ': 'ДРУЖОК',
    'ДЕЛА': 'ДЕЛИШКИ',
    'СПИЧ': 'СПИЩ',
    'ЗВУК': 'ЗВУЧОК',
    'МУЗЫКА': 'МУЗЫЧКА',
    'ВЕРСИЯ': 'ВЕРСИЕ',
    'ПРИВЕТСТВУЮ': 'ПРЕВЕДСТВУЮ'
};

function applyFunnyTranslation(text) {
    if (!['v1', 'v15', 'v2', 'v3', 'v35'].includes(currentVersion)) return text;
    let result = text;
    Object.entries(FUNNY_TRANSLATIONS).forEach(([word, rep]) => {
        result = result.replace(new RegExp('\\b' + word + '\\b', 'g'), rep);
    });
    result = result
        .replace(/ШТО/g, 'ШО')
        .replace(/КТО/g, 'КТОО')
        .replace(/ЕГО/g, 'ЕВО')
        .replace(/СЯ/g, 'СЕ')
        .replace(/ТЬСЯ/g, 'ЦА');
    return result;
}

function transliterateText(text) {
    text = text.toUpperCase();
    for (const [emoji, word] of Object.entries(EMOJIS)) {
        text = text.replace(new RegExp(emoji, 'g'), ' ' + word + ' ');
    }
    text = text.replace(/-/g, ' ');
    for (const [sym, word] of Object.entries(SYMBOLS)) {
        if (sym !== '-') {
            text = text.replace(new RegExp('\\' + sym, 'g'), ' ' + word + ' ');
        }
    }
    text = text.replace(/\d+/g, function(match) {
        const n = parseInt(match);
        const ones = ['НОЛЬ', 'ОДИН', 'ДВА', 'ТРИ', 'ЧЕТЫРЕ', 'ПЯТЬ', 'ШЕСТЬ', 'СЕМЬ', 'ВОСЕМЬ', 'ДЕВЯТЬ', 'ДЕСЯТЬ', 'ОДИННАДЦАТЬ', 'ДВЕНАДЦАТЬ', 'ТРИНАДЦАТЬ', 'ЧЕТЫРНАДЦАТЬ', 'ПЯТНАДЦАТЬ', 'ШЕСТНАДЦАТЬ', 'СЕМНАДЦАТЬ', 'ВОСЕМНАДЦАТЬ', 'ДЕВЯТНАДЦАТЬ'];
        const tens = ['', '', 'ДВАДЦАТЬ', 'ТРИДЦАТЬ', 'СОРОК', 'ПЯТЬДЕСЯТ', 'ШЕСТЬДЕСЯТ', 'СЕМЬДЕСЯТ', 'ВОСЕМЬДЕСЯТ', 'ДЕВЯНОСТО'];
        if (n === 0) return ' НОЛЬ ';
        if (n <= 19) return ' ' + ones[n] + ' ';
        if (n <= 99) {
            const t = Math.floor(n / 10), o = n % 10;
            return ' ' + tens[t] + (o > 0 ? ' ' + ones[o] : '') + ' ';
        }
        if (n === 100) return ' СТО ';
        return ' ' + match.split('').map(function(d) { return ones[parseInt(d)]; }).join(' ') + ' ';
    });
    for (const [eng, rus] of Object.entries(ENGLISH_WORDS)) {
        text = text.replace(new RegExp('\\b' + eng + '\\b', 'g'), rus);
    }
    for (const [eng, rus] of Object.entries(ENGLISH_MAP)) {
        text = text.replace(new RegExp(eng, 'g'), rus);
    }
    text = applyAccentToText(text);
    text = applyFunnyTranslation(text);
    return text.replace(/\s+/g, ' ').trim();
}

function getCtx() {
    if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); createEffects(audioCtx); }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function createEffects(ctx) {
    const len = ctx.sampleRate * 2, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.5)); }
    reverbNode = ctx.createConvolver(); reverbNode.buffer = buf;
    reverbGain = ctx.createGain(); reverbGain.gain.value = 0;
    dryGain = ctx.createGain(); dryGain.gain.value = 1;
    delayNode = ctx.createDelay(1); delayNode.delayTime.value = 0.3;
    delayFeedback = ctx.createGain(); delayFeedback.gain.value = 0;
    delayGain = ctx.createGain(); delayGain.gain.value = 0;
    delayNode.connect(delayFeedback); delayFeedback.connect(delayNode); delayNode.connect(delayGain);
    chorusDelay = ctx.createDelay(0.1); chorusDelay.delayTime.value = 0.025;
    chorusLFO = ctx.createOscillator(); chorusLFO.frequency.value = 1.5; chorusLFO.type = 'sine';
    const chorusLFOGain = ctx.createGain(); chorusLFOGain.gain.value = 0;
    chorusLFO.connect(chorusLFOGain); chorusLFOGain.connect(chorusDelay.delayTime); chorusLFO.start();
    chorusGain = ctx.createGain(); chorusGain.gain.value = 0; chorusDelay.connect(chorusGain);
    tremoloGain = ctx.createGain(); tremoloGain.gain.value = 1;
    tremoloLFO = ctx.createOscillator(); tremoloLFO.frequency.value = 5; tremoloLFO.type = 'sine';
    const tremoloLFOGain = ctx.createGain(); tremoloLFOGain.gain.value = 0;
    tremoloLFO.connect(tremoloLFOGain); tremoloLFOGain.connect(tremoloGain.gain); tremoloLFO.start();
    masterOutput = ctx.createGain(); masterOutput.gain.value = 1.5;
    dryGain.connect(tremoloGain); reverbNode.connect(reverbGain); reverbGain.connect(tremoloGain);
    delayGain.connect(tremoloGain); chorusGain.connect(tremoloGain); tremoloGain.connect(masterOutput); masterOutput.connect(ctx.destination);
    chorusDelay._lfoGain = chorusLFOGain; tremoloGain._lfoGain = tremoloLFOGain;
}

function getEffectValues() {
    const s = currentVersion === 'v1' ? '1' : currentVersion === 'v15' ? '15' : currentVersion === 'v2' ? '2' : currentVersion === 'v35' ? '35' : currentVersion === 'v4' ? '4' : currentVersion === 'v5' ? '5' : currentVersion === 'v6' ? '6' : currentVersion === 'v65' ? '65' : currentVersion === 'v7' ? '7' : currentVersion === 'v8' ? '8' : currentVersion === 'v9' ? '9' : currentVersion === 'v95' ? '95' : currentVersion === 'v10' ? '10' : currentVersion === 'v11' ? '11' : '3';
    return {
        reverb: parseInt(document.getElementById('reverb' + s)?.value || 0) / 100,
        echo: parseInt(document.getElementById('echo' + s)?.value || 0) / 100,
        chorus: parseInt(document.getElementById('chorus' + s)?.value || 0) / 100,
        tremolo: parseInt(document.getElementById('tremolo' + s)?.value || 0) / 100,
        spatial: parseInt(document.getElementById('spatial' + s)?.value || 0) / 100,
        bitcrush: parseInt(document.getElementById('bitcrush' + s)?.value || 0) / 100,
        flanger: parseInt(document.getElementById('flanger' + s)?.value || 0) / 100,
        compress: parseInt(document.getElementById('compress' + s)?.value || 0) / 100,
        eqbass: parseInt(document.getElementById('eqbass' + s)?.value || 50) / 100,
        wahwah: parseInt(document.getElementById('wahwah' + s)?.value || 0) / 100,
        autotune: parseInt(document.getElementById('autotune' + s)?.value || 0) / 100,
        distortion: parseInt(document.getElementById('distortion' + s)?.value || 0) / 100,
        clarity: parseInt(document.getElementById('clarity' + s)?.value || 0) / 100,
        humanness: parseInt(document.getElementById('humanness' + s)?.value || 0) / 100,
        sharpness: parseInt(document.getElementById('sharpness' + s)?.value || 0) / 100,
        smoothness: parseInt(document.getElementById('smoothness' + s)?.value || 0) / 100,
        hdquality: parseInt(document.getElementById('hdquality' + s)?.value || 0) / 100,
        depth: parseInt(document.getElementById('depth' + s)?.value || 0) / 100
    };
}

let mainInputNode = null;
let lastEffectNode = null;

function cleanupAudio() {
    activeOscillators = activeOscillators.filter(osc => {
        try {
            if (osc.context && osc.context.currentTime > (osc.stopTime || 0) + 0.5) {
                osc.disconnect();
                return false;
            }
            return true;
        } catch(e) { return false; }
    });
}

function resetAudioContext() {
    if (audioCtx) {
        try { audioCtx.close(); } catch(e) {}
        audioCtx = null;
        mainInputNode = null;
        lastEffectNode = null;
        reverbNode = null;
        reverbGain = null;
        dryGain = null;
        delayNode = null;
        delayFeedback = null;
        delayGain = null;
        chorusDelay = null;
        chorusLFO = null;
        chorusGain = null;
        tremoloLFO = null;
        tremoloGain = null;
        masterOutput = null;
    }
}

function getEffectsInput() {
    const ctx = getCtx(), fx = getEffectValues();
    if (activeOscillators.length > 30) cleanupAudio();
    try { tremoloGain.disconnect(); tremoloGain.connect(masterOutput); } catch(e) {}
    if (reverbGain) reverbGain.gain.value = fx.reverb * 0.7;
    if (dryGain) dryGain.gain.value = 1 - fx.reverb * 0.3;
    if (delayFeedback) delayFeedback.gain.value = fx.echo * 0.5;
    if (delayGain) delayGain.gain.value = fx.echo * 0.6;
    if (chorusGain) chorusGain.gain.value = fx.chorus * 0.5;
    if (chorusDelay?._lfoGain) chorusDelay._lfoGain.gain.value = fx.chorus * 0.005;
    if (tremoloGain?._lfoGain) tremoloGain._lfoGain.gain.value = fx.tremolo * 0.5;
    const inputNode = ctx.createGain(); inputNode.gain.value = 1;
    
    let lastNode = inputNode;
    if (fx.eqbass !== 0.5) {
        const bassFilter = ctx.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 200;
        bassFilter.gain.value = (fx.eqbass - 0.5) * 24;
        inputNode.connect(bassFilter);
        lastNode = bassFilter;
    }
    
    if (fx.compress > 0) {
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -50 + fx.compress * 30;
        compressor.knee.value = 10;
        compressor.ratio.value = 1 + fx.compress * 11;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.1;
        lastNode.connect(compressor);
        lastNode = compressor;
    }
    
    if (fx.flanger > 0) {
        const flangerDelay = ctx.createDelay(0.02);
        flangerDelay.delayTime.value = 0.005;
        const flangerLFO = ctx.createOscillator();
        flangerLFO.type = 'sine';
        flangerLFO.frequency.value = 0.2 + fx.flanger * 2;
        const flangerLFOGain = ctx.createGain();
        flangerLFOGain.gain.value = 0.003 * fx.flanger;
        flangerLFO.connect(flangerLFOGain);
        flangerLFOGain.connect(flangerDelay.delayTime);
        flangerLFO.start();
        const flangerFeedback = ctx.createGain();
        flangerFeedback.gain.value = fx.flanger * 0.7;
        const flangerWet = ctx.createGain();
        flangerWet.gain.value = fx.flanger * 0.5;
        lastNode.connect(flangerDelay);
        flangerDelay.connect(flangerFeedback);
        flangerFeedback.connect(flangerDelay);
        flangerDelay.connect(flangerWet);
        flangerWet.connect(dryGain);
    }
    
    if (fx.wahwah > 0) {
        const wahFilter = ctx.createBiquadFilter();
        wahFilter.type = 'bandpass';
        wahFilter.Q.value = 5 + fx.wahwah * 20;
        wahFilter.frequency.value = 800;
        const wahLFO = ctx.createOscillator();
        wahLFO.type = 'sine';
        wahLFO.frequency.value = 2 + fx.wahwah * 6;
        const wahLFOGain = ctx.createGain();
        wahLFOGain.gain.value = 1200 * fx.wahwah;
        wahLFO.connect(wahLFOGain);
        wahLFOGain.connect(wahFilter.frequency);
        wahLFO.start();
        const wahMix = ctx.createGain();
        wahMix.gain.value = 1;
        lastNode.connect(wahFilter);
        wahFilter.connect(wahMix);
        lastNode = wahMix;
    }
    
    if (fx.bitcrush > 0) {
        const bitcrushFilter = ctx.createBiquadFilter();
        bitcrushFilter.type = 'lowpass';
        bitcrushFilter.frequency.value = 22050 - fx.bitcrush * 20000;
        bitcrushFilter.Q.value = 1 + fx.bitcrush * 5;
        const bitcrushGain = ctx.createGain();
        bitcrushGain.gain.value = 1 + fx.bitcrush * 0.5;
        lastNode.connect(bitcrushFilter);
        bitcrushFilter.connect(bitcrushGain);
        lastNode = bitcrushGain;
    }
    
    if (fx.distortion > 0) {
        const distortionNode = ctx.createWaveShaper();
        const distAmount = fx.distortion * 100;
        const curve = new Float32Array(44100);
        for (let i = 0; i < 44100; i++) {
            const x = (i * 2 / 44100) - 1;
            curve[i] = (Math.PI + distAmount) * x / (Math.PI + distAmount * Math.abs(x));
        }
        distortionNode.curve = curve;
        distortionNode.oversample = '4x';
        lastNode.connect(distortionNode);
        lastNode = distortionNode;
    }
    
    if (fx.autotune > 0) {
        const autotuneDelay = ctx.createDelay(0.05);
        autotuneDelay.delayTime.value = 0.01;
        const autotuneLFO = ctx.createOscillator();
        autotuneLFO.type = 'sine';
        autotuneLFO.frequency.value = 80 + fx.autotune * 120;
        const autotuneLFOGain = ctx.createGain();
        autotuneLFOGain.gain.value = 0.003 * fx.autotune;
        autotuneLFO.connect(autotuneLFOGain);
        autotuneLFOGain.connect(autotuneDelay.delayTime);
        autotuneLFO.start();
        lastNode.connect(autotuneDelay);
        lastNode = autotuneDelay;
    }
    
    if (fx.clarity > 0) {
        const clarityFilter1 = ctx.createBiquadFilter();
        clarityFilter1.type = 'peaking';
        clarityFilter1.frequency.value = 2000;
        clarityFilter1.Q.value = 1.2;
        clarityFilter1.gain.value = fx.clarity * 10;
        
        const clarityFilter2 = ctx.createBiquadFilter();
        clarityFilter2.type = 'peaking';
        clarityFilter2.frequency.value = 3500;
        clarityFilter2.Q.value = 1.5;
        clarityFilter2.gain.value = fx.clarity * 6;
        
        const clarityHipass = ctx.createBiquadFilter();
        clarityHipass.type = 'highpass';
        clarityHipass.frequency.value = 80 + fx.clarity * 50;
        clarityHipass.Q.value = 0.7;
        
        lastNode.connect(clarityHipass);
        clarityHipass.connect(clarityFilter1);
        clarityFilter1.connect(clarityFilter2);
        lastNode = clarityFilter2;
    }
    
    if (fx.humanness > 0) {
        const humanDelay = ctx.createDelay(0.03);
        humanDelay.delayTime.value = 0.008;
        
        const humanLFO1 = ctx.createOscillator();
        humanLFO1.type = 'sine';
        humanLFO1.frequency.value = 0.8 + fx.humanness * 1.5;
        
        const humanLFOGain1 = ctx.createGain();
        humanLFOGain1.gain.value = 0.002 * fx.humanness;
        
        humanLFO1.connect(humanLFOGain1);
        humanLFOGain1.connect(humanDelay.delayTime);
        humanLFO1.start();
        
        const humanLFO2 = ctx.createOscillator();
        humanLFO2.type = 'triangle';
        humanLFO2.frequency.value = 0.3 + fx.humanness * 0.5;
        
        const humanLFOGain2 = ctx.createGain();
        humanLFOGain2.gain.value = 0.001 * fx.humanness;
        
        humanLFO2.connect(humanLFOGain2);
        humanLFOGain2.connect(humanDelay.delayTime);
        humanLFO2.start();
        
        const humanGain = ctx.createGain();
        humanGain.gain.value = 1;
        
        const shimmerLFO = ctx.createOscillator();
        shimmerLFO.type = 'sine';
        shimmerLFO.frequency.value = 3 + fx.humanness * 4;
        
        const shimmerGain = ctx.createGain();
        shimmerGain.gain.value = 0.05 * fx.humanness;
        
        shimmerLFO.connect(shimmerGain);
        shimmerGain.connect(humanGain.gain);
        shimmerLFO.start();
        
        const warmthFilter = ctx.createBiquadFilter();
        warmthFilter.type = 'lowshelf';
        warmthFilter.frequency.value = 300;
        warmthFilter.gain.value = fx.humanness * 3;
        
        lastNode.connect(humanDelay);
        humanDelay.connect(humanGain);
        humanGain.connect(warmthFilter);
        lastNode = warmthFilter;
    }
    
    if (fx.sharpness > 0) {
        const sharpFilter1 = ctx.createBiquadFilter();
        sharpFilter1.type = 'highshelf';
        sharpFilter1.frequency.value = 3000;
        sharpFilter1.gain.value = fx.sharpness * 8;
        
        const sharpFilter2 = ctx.createBiquadFilter();
        sharpFilter2.type = 'peaking';
        sharpFilter2.frequency.value = 5000;
        sharpFilter2.Q.value = 1.0;
        sharpFilter2.gain.value = fx.sharpness * 5;
        
        const sharpComp = ctx.createDynamicsCompressor();
        sharpComp.threshold.value = -20;
        sharpComp.knee.value = 10;
        sharpComp.ratio.value = 2;
        sharpComp.attack.value = 0.005;
        sharpComp.release.value = 0.1;
        
        lastNode.connect(sharpFilter1);
        sharpFilter1.connect(sharpFilter2);
        if (fx.sharpness > 0.5) {
            sharpFilter2.connect(sharpComp);
            lastNode = sharpComp;
        } else {
            lastNode = sharpFilter2;
        }
    }
    
    if (fx.smoothness > 0) {
        const smoothFilter = ctx.createBiquadFilter();
        smoothFilter.type = 'lowpass';
        smoothFilter.frequency.value = 12000 - fx.smoothness * 6000;
        smoothFilter.Q.value = 0.5;
        lastNode.connect(smoothFilter);
        lastNode = smoothFilter;
    }
    
    if (fx.hdquality > 0) {
        const hdBass = ctx.createBiquadFilter();
        hdBass.type = 'lowshelf';
        hdBass.frequency.value = 150;
        hdBass.gain.value = fx.hdquality * 4;
        const hdTreble = ctx.createBiquadFilter();
        hdTreble.type = 'highshelf';
        hdTreble.frequency.value = 6000;
        hdTreble.gain.value = fx.hdquality * 3;
        const hdComp = ctx.createDynamicsCompressor();
        hdComp.threshold.value = -24;
        hdComp.ratio.value = 4;
        hdComp.attack.value = 0.003;
        hdComp.release.value = 0.15;
        lastNode.connect(hdBass);
        hdBass.connect(hdTreble);
        hdTreble.connect(hdComp);
        lastNode = hdComp;
    }
    
    if (fx.depth > 0) {
        const depthFilter = ctx.createBiquadFilter();
        depthFilter.type = 'lowshelf';
        depthFilter.frequency.value = 200;
        depthFilter.gain.value = fx.depth * 12;
        lastNode.connect(depthFilter);
        lastNode = depthFilter;
    }
    
    lastNode.connect(dryGain); lastNode.connect(reverbNode); lastNode.connect(delayNode); lastNode.connect(chorusDelay);
    
    if (fx.spatial > 0) {
        const panner = ctx.createStereoPanner(), panLFO = ctx.createOscillator(), panLFOGain = ctx.createGain();
        panLFO.frequency.value = 0.5 + fx.spatial * 2; panLFO.type = 'sine'; panLFOGain.gain.value = fx.spatial;
        panLFO.connect(panLFOGain); panLFOGain.connect(panner.pan); panLFO.start();
        tremoloGain.disconnect(); tremoloGain.connect(panner); panner.connect(masterOutput);
    }
    return inputNode;
}

function getEmotionModifiers() {
    if (currentVersion !== 'v35' && currentVersion !== 'v4' && currentVersion !== 'v5' && currentVersion !== 'v6' && currentVersion !== 'v65' && currentVersion !== 'v7' && currentVersion !== 'v8' && currentVersion !== 'v9' && currentVersion !== 'v95' && currentVersion !== 'v10' && currentVersion !== 'v11') return { pitch: 1, speed: 1, volume: 1, whisper: false, vibrato: 1 };
    const emotion = document.getElementById(
        currentVersion === 'v11' ? 'emotion11' :
        currentVersion === 'v10' ? 'emotion10' :
        currentVersion === 'v95' ? 'emotion95' :
        currentVersion === 'v9' ? 'emotion9' :
        currentVersion === 'v8' ? 'emotion8' :
        currentVersion === 'v7' ? 'emotion7' :
        currentVersion === 'v65' ? 'emotion65' :
        currentVersion === 'v6' ? 'emotion6' :
        currentVersion === 'v5' ? 'emotion5' :
        currentVersion === 'v4' ? 'emotion4' : 'emotion35'
    )?.value || 'neutral';
    const mods = { neutral: { pitch: 1, speed: 1, volume: 1, whisper: false, vibrato: 1 },
        happy: { pitch: 1.2, speed: 1.2, volume: 1.15, whisper: false, vibrato: 1.8 },
        sad: { pitch: 0.85, speed: 0.7, volume: 0.6, whisper: false, vibrato: 0.3 },
        angry: { pitch: 1.15, speed: 1.3, volume: 1.4, whisper: false, vibrato: 2.5 },
        whisper: { pitch: 1.0, speed: 0.75, volume: 0.4, whisper: true, vibrato: 0 },
        shout: { pitch: 1.2, speed: 1.1, volume: 1.5, whisper: false, vibrato: 1.5 },
        love: { pitch: 1.1, speed: 0.85, volume: 0.9, whisper: false, vibrato: 2 },
        fear: { pitch: 1.3, speed: 1.4, volume: 1.2, whisper: false, vibrato: 3 },
        shock: { pitch: 1.4, speed: 1.5, volume: 1.3, whisper: false, vibrato: 2.5 },
        cry: { pitch: 0.9, speed: 0.6, volume: 0.7, whisper: false, vibrato: 4 },
        laugh: { pitch: 1.25, speed: 1.3, volume: 1.2, whisper: false, vibrato: 3 },
        sarcasm: { pitch: 0.95, speed: 0.9, volume: 0.9, whisper: false, vibrato: 1.2 },
        heroic: { pitch: 1.05, speed: 1.0, volume: 1.25, whisper: false, vibrato: 1.6 },
        radio: { pitch: 1.0, speed: 1.05, volume: 1.1, whisper: false, vibrato: 1.1 }
    };
    return mods[emotion] || mods.neutral;
}

function getAccentModifiers() {
    if (currentVersion !== 'v5' && currentVersion !== 'v6' && currentVersion !== 'v65' && currentVersion !== 'v7' && currentVersion !== 'v8' && currentVersion !== 'v9' && currentVersion !== 'v95' && currentVersion !== 'v10' && currentVersion !== 'v11') return { pitch: 1, formant: 1, speed: 1, transform: t => t };
    const accentId = currentVersion === 'v11' ? 'accent11' : currentVersion === 'v10' ? 'accent10' : currentVersion === 'v95' ? 'accent95' : currentVersion === 'v9' ? 'accent9' : currentVersion === 'v8' ? 'accent8' : currentVersion === 'v7' ? 'accent7' : currentVersion === 'v65' ? 'accent65' : currentVersion === 'v6' ? 'accent6' : 'accent5';
    const accent = document.getElementById(accentId)?.value || 'ru';
    return ACCENTS[accent] || ACCENTS.ru;
}

function applyAccentToText(text) {
    if (currentVersion !== 'v5' && currentVersion !== 'v6' && currentVersion !== 'v65' && currentVersion !== 'v7' && currentVersion !== 'v8' && currentVersion !== 'v9' && currentVersion !== 'v95' && currentVersion !== 'v10' && currentVersion !== 'v11') return text;
    const accentId = currentVersion === 'v11' ? 'accent11' : currentVersion === 'v10' ? 'accent10' : currentVersion === 'v95' ? 'accent95' : currentVersion === 'v9' ? 'accent9' : currentVersion === 'v8' ? 'accent8' : currentVersion === 'v7' ? 'accent7' : currentVersion === 'v65' ? 'accent65' : currentVersion === 'v6' ? 'accent6' : 'accent5';
    const accent = document.getElementById(accentId)?.value || 'ru';
    const accentData = ACCENTS[accent];
    if (accentData && accentData.transform) {
        return accentData.transform(text.toUpperCase());
    }
    return text;
}

function getStyleModifiers() {
    if (currentVersion !== 'v5' && currentVersion !== 'v6' && currentVersion !== 'v65' && currentVersion !== 'v7' && currentVersion !== 'v8' && currentVersion !== 'v9' && currentVersion !== 'v95' && currentVersion !== 'v10' && currentVersion !== 'v11') return { pitch: 1, speed: 1, volume: 1 };
    if (currentVersion === 'v6' || currentVersion === 'v65' || currentVersion === 'v7' || currentVersion === 'v8' || currentVersion === 'v9' || currentVersion === 'v95' || currentVersion === 'v10' || currentVersion === 'v11') {
        const modeId = currentVersion === 'v11' ? 'mode11' : currentVersion === 'v10' ? 'mode10' : currentVersion === 'v95' ? 'mode95' : currentVersion === 'v9' ? 'mode9' : currentVersion === 'v8' ? 'mode8' : currentVersion === 'v7' ? 'mode7' : currentVersion === 'v65' ? 'mode65' : 'mode6';
        const mode = document.getElementById(modeId)?.value || 'speech';
        const modes = {
            speech: { pitch: 1, speed: 1, volume: 1 },
            singing: { pitch: 1.1, speed: 0.7, volume: 1.1 },
            rap: { pitch: 0.95, speed: 1.4, volume: 1.2 },
            beatbox: { pitch: 1, speed: 1, volume: 1.3 },
            karaoke: { pitch: 1.05, speed: 0.85, volume: 1.1 },
            asmr: { pitch: 0.9, speed: 0.6, volume: 0.4 },
            trailer: { pitch: 0.8, speed: 0.7, volume: 1.4 },
            horror: { pitch: 0.7, speed: 0.8, volume: 1.2 },
            podcast: { pitch: 1.0, speed: 0.9, volume: 1.0 },
            audiobook: { pitch: 1.0, speed: 0.85, volume: 0.95 },
            narrator: { pitch: 0.95, speed: 0.9, volume: 1.05 },
            news: { pitch: 1.05, speed: 1.15, volume: 1.1 },
            cartoon: { pitch: 1.2, speed: 1.1, volume: 1.1 },
            fantasy: { pitch: 1.05, speed: 0.85, volume: 1.0 },
            meditation: { pitch: 0.85, speed: 0.6, volume: 0.6 },
            live: { pitch: 1.0, speed: 1.05, volume: 1.2 },
            stadium: { pitch: 0.95, speed: 1.0, volume: 1.3 },
            cinema: { pitch: 0.9, speed: 0.8, volume: 1.25 },
            retro: { pitch: 1.05, speed: 0.95, volume: 0.9 },
            surround: { pitch: 1.0, speed: 0.95, volume: 1.1 },
            standup: { pitch: 1.15, speed: 1.1, volume: 1.1 },
            slowmo: { pitch: 0.85, speed: 0.55, volume: 0.9 },
            neural: { pitch: 1.05, speed: 0.95, volume: 1.1 },
            emotion: { pitch: 1.1, speed: 0.9, volume: 1.2 },
            realtime: { pitch: 1.0, speed: 1.1, volume: 1.0 },
            broadcast: { pitch: 1.0, speed: 1.15, volume: 1.15 }
        };
        return modes[mode] || modes.speech;
    }
    const style = document.getElementById('style5')?.value || 'normal';
    return STYLES[style] || STYLES.normal;
}

function setVersion(v) { 
    document.body.className = v; 
    currentVersion = v; 
    
    if (v === 'beta') {
        return;
    }
    
    if (v === 'v7') {
        const clarity = document.getElementById('clarity7');
        const humanness = document.getElementById('humanness7');
        const sharpness = document.getElementById('sharpness7');
        
        if (clarity && parseInt(clarity.value) === 0) {
            clarity.value = 70;
            document.getElementById('clarityVal7').textContent = '70%';
        }
        if (humanness && parseInt(humanness.value) === 0) {
            humanness.value = 80;
            document.getElementById('humannessVal7').textContent = '80%';
        }
        if (sharpness && parseInt(sharpness.value) === 0) {
            sharpness.value = 60;
            document.getElementById('sharpnessVal7').textContent = '60%';
        }
    }

    if (v === 'v8') {
        const clarity = document.getElementById('clarity8');
        const humanness = document.getElementById('humanness8');
        const sharpness = document.getElementById('sharpness8');
        if (clarity && parseInt(clarity.value) === 0) {
            clarity.value = 85;
            document.getElementById('clarityVal8').textContent = '85%';
        }
        if (humanness && parseInt(humanness.value) === 0) {
            humanness.value = 90;
            document.getElementById('humannessVal8').textContent = '90%';
        }
        if (sharpness && parseInt(sharpness.value) === 0) {
            sharpness.value = 65;
            document.getElementById('sharpnessVal8').textContent = '65%';
        }
        const envStat = document.getElementById('envStat8');
        if (envStat) envStat.textContent = '🌍 Нет';
    }

    if (v === 'v9') {
        // СБРОС ВСЕХ ЭФФЕКТОВ для чистого звука
        ['reverb', 'echo', 'chorus', 'spatial', 'autotune', 'distortion'].forEach(fx => {
            const el = document.getElementById(fx + '9');
            const valEl = document.getElementById(fx + 'Val9');
            if (el) { el.value = 0; if(valEl) valEl.textContent = '0%'; }
        });
        
        // Установка качественных параметров голоса, но без искажений
        const clarity = document.getElementById('clarity9');
        const humanness = document.getElementById('humanness9');
        const sharpness = document.getElementById('sharpness9');
        const smoothness = document.getElementById('smoothness9');
        const hdquality = document.getElementById('hdquality9');
        
        if (clarity) { clarity.value = 90; document.getElementById('clarityVal9').textContent = '90%'; }
        if (humanness) { humanness.value = 85; document.getElementById('humannessVal9').textContent = '85%'; }
        if (sharpness) { sharpness.value = 60; document.getElementById('sharpnessVal9').textContent = '60%'; }
        if (smoothness) { smoothness.value = 70; document.getElementById('smoothnessVal9').textContent = '70%'; }
        if (hdquality) { hdquality.value = 80; document.getElementById('hdqualityVal9').textContent = '80%'; }

        const envStat = document.getElementById('envStat9');
        if (envStat) envStat.textContent = '🌍 Студия';
        
        // Сброс выбора окружения на "Студия" (нейтральный)
        setEnvironment9('studio');
    }

    if (v === 'v95') {
        const clarity = document.getElementById('clarity95');
        const humanness = document.getElementById('humanness95');
        const sharpness = document.getElementById('sharpness95');
        if (clarity && parseInt(clarity.value) === 0) {
            clarity.value = 92;
            document.getElementById('clarityVal95').textContent = '92%';
        }
        if (humanness && parseInt(humanness.value) === 0) {
            humanness.value = 95;
            document.getElementById('humannessVal95').textContent = '95%';
        }
        if (sharpness && parseInt(sharpness.value) === 0) {
            sharpness.value = 78;
            document.getElementById('sharpnessVal95').textContent = '78%';
        }
        const envStat = document.getElementById('envStat95');
        if (envStat) envStat.textContent = '🌍 Студия';
        const defaults95 = { reverb: 20, echo: 8, chorus: 12, spatial: 25, autotune: 0, distortion: 0 };
        Object.entries(defaults95).forEach(([fx, val]) => {
            const el = document.getElementById(fx + '95');
            const valEl = document.getElementById(fx + 'Val95');
            if (el) {
                el.value = val;
                if (valEl) valEl.textContent = val + '%';
            }
        });
    }

    if (v === 'v11') {
        const defaults11 = {
            clarity: 96,
            humanness: 94,
            sharpness: 82,
            smoothness: 80,
            hdquality: 90,
            depth: 65,
            reverb: 22,
            echo: 12,
            chorus: 18,
            spatial: 30,
            autotune: 10,
            distortion: 0
        };
        Object.entries(defaults11).forEach(([fx, val]) => {
            const el = document.getElementById(fx + '11');
            const valEl = document.getElementById(fx + 'Val11');
            if (el) {
                el.value = val;
                if (valEl) valEl.textContent = val + '%';
            }
        });
        const envStat = document.getElementById('stat11');
        if (envStat) envStat.textContent = 'Neural Ready';
        const mode11 = document.getElementById('mode11');
        if (mode11) mode11.value = 'speech';
        const voice11 = document.getElementById('voice11');
        if (voice11) voice11.value = 'v11_neural_prime';
        setEnvironment11('studio');
    }
}

const delay = ms => new Promise(r => setTimeout(r, ms));

function getHumanSettings() {
    if (currentVersion !== 'v7' && currentVersion !== 'v65') return { clarity: 0, humanness: 0, sharpness: 0 };
    const s = currentVersion === 'v7' ? '7' : '65';
    return {
        clarity: parseInt(document.getElementById('clarity' + s)?.value || 0) / 100,
        humanness: parseInt(document.getElementById('humanness' + s)?.value || 0) / 100,
        sharpness: parseInt(document.getElementById('sharpness' + s)?.value || 0) / 100
    };
}

async function playVowel(vowel, duration, volume, voice, pitchMod = 1, isStressed = true) {
    if (stopFlag) return;
    
    const ctx = getCtx(), vow = VOWELS[vowel], vc = VOICES[voice] || VOICES.alex;
    if (!vow) return;

    // Neural Logic (AI Prediction)
    let effectiveVolume = volume;
    if (currentVersion === 'v10' || currentVersion === 'v11') {
        document.body.classList.add('neural-active');
        // Predict prosody based on character code (pseudo-context)
        const inputVal = vowel.charCodeAt(0) / 1000;
        if (currentVersion === 'v11') {
            const prediction = neuralNetV11.predict(inputVal);
            pitchMod *= prediction.pitchMod;
            duration *= prediction.durMod;
            effectiveVolume *= prediction.energyMod;
        } else {
            const prediction = neuralNet.predict(inputVal);
            pitchMod *= prediction.pitchMod;
            duration *= prediction.durMod;
        }
        visualizeNeuralNet(true);
        setTimeout(() => visualizeNeuralNet(false), duration * 0.8);
    } else {
        document.body.classList.remove('neural-active');
    }
    
    const humanSettings = getHumanSettings();
    const isHumanMode = (currentVersion === 'v7' || currentVersion === 'v65') && humanSettings.humanness > 0;
    
    const jitterAmount = isHumanMode ? humanSettings.humanness * 0.008 : 0;
    const shimmerAmount = isHumanMode ? humanSettings.humanness * 0.15 : 0;
    const durationVariation = isHumanMode ? 1 + (Math.random() - 0.5) * humanSettings.humanness * 0.1 : 1;
    
    const dur = (duration / 1000) * (isStressed ? 1.3 : 0.9) * durationVariation;
    const basePitch = vc.pitch * pitchMod;
    const pitchJitter = isHumanMode ? basePitch * (1 + (Math.random() - 0.5) * jitterAmount) : basePitch;
    const pitch = pitchJitter;
    const shift = vc.formant || 1;
    
    const master = ctx.createGain(); 
    master.connect(getEffectsInput());
    
    const useWhisper = vc.whisper || currentEmotion.whisper;
    
    if (useWhisper) {
        const bufLen = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, bufLen, ctx.sampleRate), data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
        const noise = ctx.createBufferSource(); noise.buffer = buf;
        [vow.f1, vow.f2].forEach((f, idx) => {
            const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = f * shift; filt.Q.value = 8;
            const g = ctx.createGain(); g.gain.value = effectiveVolume * (idx === 0 ? 0.4 : 0.25);
            noise.connect(filt); filt.connect(g); g.connect(master);
        });
        const now = ctx.currentTime;
        master.gain.setValueAtTime(0, now); master.gain.linearRampToValueAtTime(effectiveVolume * 0.4, now + 0.03);
        master.gain.setValueAtTime(effectiveVolume * 0.4, now + dur - 0.03); master.gain.linearRampToValueAtTime(0, now + dur);
        noise.start(); noise.stop(ctx.currentTime + dur);
        await delay(dur * 1000);
        return;
    }
    
    let osc;
    if ((currentVersion === 'v10' || currentVersion === 'v11') && !vc.robot) {
        // Use Neural Glottal Pulse for realistic human voice
        osc = currentVersion === 'v11' ? createNeuralSourceV11(ctx, pitch) : createNeuralSource(ctx, pitch);
    } else {
        // Standard synthesis for older versions
        osc = ctx.createOscillator(); 
        osc.type = vc.robot ? 'square' : 'sawtooth'; 
        osc.frequency.value = pitch;
    }
    
    if (isHumanMode && !vc.robot) {
        const jitterLFO = ctx.createOscillator();
        jitterLFO.type = 'sine';
        jitterLFO.frequency.value = 1.5 + Math.random() * 2.5;
        const jitterGain = ctx.createGain();
        jitterGain.gain.value = pitch * jitterAmount;
        jitterLFO.connect(jitterGain);
        jitterGain.connect(osc.frequency);
        jitterLFO.start();
        jitterLFO.stop(ctx.currentTime + dur);
        
        const jitterLFO2 = ctx.createOscillator();
        jitterLFO2.type = 'sine';
        jitterLFO2.frequency.value = 0.3 + Math.random() * 0.7;
        const jitterGain2 = ctx.createGain();
        jitterGain2.gain.value = pitch * jitterAmount * 0.5;
        jitterLFO2.connect(jitterGain2);
        jitterGain2.connect(osc.frequency);
        jitterLFO2.start();
        jitterLFO2.stop(ctx.currentTime + dur);
    }
    
    if (vc.vibrato && !vc.robot) {
        const vib = ctx.createOscillator(), vibGain = ctx.createGain(), vibratoMod = currentEmotion.vibrato || 1;
        vib.frequency.value = vc.vibrato * vibratoMod; 
        vibGain.gain.value = pitch * 0.015 * vibratoMod;
        vib.connect(vibGain); vibGain.connect(osc.frequency); 
        vib.start(); vib.stop(ctx.currentTime + dur);
    }
    
    const clarityBoost = humanSettings.clarity;
    const sharpnessBoost = humanSettings.sharpness;
    
    [
        { f: vow.f1 * shift, q: 12 - clarityBoost * 4, g: 1.0 + clarityBoost * 0.2 }, 
        { f: vow.f2 * shift, q: 14 - clarityBoost * 3, g: 0.65 + clarityBoost * 0.15 + sharpnessBoost * 0.1 }, 
        { f: vow.f3 * shift, q: 16 - clarityBoost * 2, g: 0.3 + sharpnessBoost * 0.15 }
    ].forEach(fd => {
        const filt = ctx.createBiquadFilter(); 
        filt.type = 'bandpass'; 
        filt.frequency.value = fd.f; 
        filt.Q.value = Math.max(2, fd.q);
        const gain = ctx.createGain(); 
        gain.gain.value = effectiveVolume * fd.g;
        osc.connect(filt); filt.connect(gain); gain.connect(master);
    });
    
    const now = ctx.currentTime;
    
    if (isHumanMode && shimmerAmount > 0) {
        const attackTime = 0.02 + Math.random() * 0.015;
        const releaseTime = 0.025 + Math.random() * 0.015;
        master.gain.setValueAtTime(0, now);
        master.gain.linearRampToValueAtTime(effectiveVolume * (1 + (Math.random() - 0.5) * shimmerAmount), now + attackTime);
        const numPoints = Math.floor(dur / 0.05);
        for (let i = 1; i < numPoints; i++) {
            const t = now + attackTime + (dur - attackTime - releaseTime) * (i / numPoints);
            const volVariation = effectiveVolume * (1 + (Math.random() - 0.5) * shimmerAmount * 0.5);
            master.gain.linearRampToValueAtTime(volVariation, t);
        }
        master.gain.linearRampToValueAtTime(effectiveVolume * 0.8, now + dur - releaseTime);
        master.gain.linearRampToValueAtTime(0, now + dur);
    } else {
        master.gain.setValueAtTime(0, now); 
        master.gain.linearRampToValueAtTime(effectiveVolume, now + 0.025);
        master.gain.setValueAtTime(effectiveVolume, now + dur - 0.03); 
        master.gain.linearRampToValueAtTime(0, now + dur);
    }
    
    osc.onended = function() {
        try { this.disconnect(); } catch(e) {}
        const idx = activeOscillators.indexOf(this);
        if (idx > -1) activeOscillators.splice(idx, 1);
    };
    osc.start(); osc.stop(ctx.currentTime + dur);
    activeOscillators.push(osc);
    await delay(dur * 1000);
}

async function playConsonant(cons, duration, volume, voice, pitchMod = 1, isSoft = false) {
    if (stopFlag) return;
    
    const ctx = getCtx(), con = CONSONANTS[cons], vc = VOICES[voice] || VOICES.alex;
    if (!con) return;
    
    const humanSettings = getHumanSettings();
    const isHumanMode = (currentVersion === 'v7' || currentVersion === 'v65') && humanSettings.humanness > 0;
    const durationVariation = isHumanMode ? 1 + (Math.random() - 0.5) * humanSettings.humanness * 0.08 : 1;
    const volumeVariation = isHumanMode ? 1 + (Math.random() - 0.5) * humanSettings.humanness * 0.1 : 1;
    
    const useWhisper = vc.whisper || currentEmotion.whisper;
    const basePitch = vc.pitch * pitchMod;
    const pitch = isHumanMode ? basePitch * (1 + (Math.random() - 0.5) * humanSettings.humanness * 0.006) : basePitch;
    
    const softMod = isSoft ? 1.15 : 1.0, shift = (vc.formant || 1) * softMod;
    let dur = con.type === 'stop' || con.type === 'affr' ? (duration / 1000) * 0.35 : con.type === 'trill' ? (duration / 1000) * 0.55 : (duration / 1000) * 0.45;
    dur *= durationVariation;
    
    const adjustedVolume = volume * volumeVariation;
    const master = ctx.createGain(); master.connect(getEffectsInput());

    if (con.type === 'trill') {
        const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = pitch;
        const trem = ctx.createOscillator(), tremGain = ctx.createGain(); trem.frequency.value = 25; tremGain.gain.value = 0.5;
        trem.connect(tremGain); const mainGain = ctx.createGain(); mainGain.gain.value = volume * 0.5; tremGain.connect(mainGain.gain);
        const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 500 * shift; filt.Q.value = 6;
        osc.connect(filt); filt.connect(mainGain); mainGain.connect(master);
        const now = ctx.currentTime; master.gain.setValueAtTime(0, now); master.gain.linearRampToValueAtTime(volume * 0.75, now + 0.02);
        master.gain.setValueAtTime(volume * 0.75, now + dur - 0.02); master.gain.linearRampToValueAtTime(0, now + dur);
        osc.start(); osc.stop(ctx.currentTime + dur); trem.start(); trem.stop(ctx.currentTime + dur);
        await delay(dur * 1000);
        return;
    }
    if (con.type === 'glide') {
        const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = pitch * 1.1;
        const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 2200 * shift; filt.Q.value = 10;
        const gain = ctx.createGain(); gain.gain.value = volume * 1.1;
        osc.connect(filt); filt.connect(gain); gain.connect(master);
        const now = ctx.currentTime, glideDur = dur * 0.7;
        master.gain.setValueAtTime(0, now); master.gain.linearRampToValueAtTime(volume * 0.9, now + 0.02);
        master.gain.setValueAtTime(volume * 0.85, now + glideDur * 0.6); master.gain.linearRampToValueAtTime(0, now + glideDur);
        osc.start(); osc.stop(ctx.currentTime + glideDur);
        await delay(glideDur * 1000);
        return;
    }
    if (con.type === 'nas') {
        const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = pitch;
        const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 280 * shift; f1.Q.value = 8;
        const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = (cons === 'М' ? 1000 : 1400) * shift; f2.Q.value = 6;
        const g1 = ctx.createGain(); g1.gain.value = volume * 0.6; const g2 = ctx.createGain(); g2.gain.value = volume * 0.35;
        osc.connect(f1); osc.connect(f2); f1.connect(g1); f2.connect(g2); g1.connect(master); g2.connect(master);
        const now = ctx.currentTime; master.gain.setValueAtTime(0, now); master.gain.linearRampToValueAtTime(volume * 0.7, now + 0.02);
        master.gain.setValueAtTime(volume * 0.7, now + dur - 0.02); master.gain.linearRampToValueAtTime(0, now + dur);
        osc.start(); osc.stop(ctx.currentTime + dur);
        await delay(dur * 1000);
        return;
    }
    if (con.type === 'son') {
        const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = pitch;
        [{ f: 350 * shift, q: 8, g: 0.7 }, { f: 1200 * shift, q: 10, g: 0.45 }, { f: 2400 * shift, q: 12, g: 0.2 }].forEach(fd => {
            const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = fd.f; filt.Q.value = fd.q;
            const gain = ctx.createGain(); gain.gain.value = volume * fd.g;
            osc.connect(filt); filt.connect(gain); gain.connect(master);
        });
        const now = ctx.currentTime; master.gain.setValueAtTime(0, now); master.gain.linearRampToValueAtTime(volume * 0.7, now + 0.02);
        master.gain.setValueAtTime(volume * 0.7, now + dur - 0.02); master.gain.linearRampToValueAtTime(0, now + dur);
        osc.start(); osc.stop(ctx.currentTime + dur);
        await delay(dur * 1000 * 0.95);
        return;
    }
    if (con.type === 'stop' && con.voiced && !vc.robot && !useWhisper) {
        const stopDur = 0.04, osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = pitch;
        const vFilt = ctx.createBiquadFilter(); vFilt.type = 'lowpass'; vFilt.frequency.value = 500;
        const vGain = ctx.createGain(); vGain.gain.value = volume * 0.3;
        osc.connect(vFilt); vFilt.connect(vGain); vGain.connect(master);
        const burstLen = Math.floor(ctx.sampleRate * 0.025), burstBuf = ctx.createBuffer(1, burstLen, ctx.sampleRate), burstData = burstBuf.getChannelData(0);
        for (let i = 0; i < burstLen; i++) burstData[i] = (Math.random() * 2 - 1) * (1 - i / burstLen);
        const burst = ctx.createBufferSource(); burst.buffer = burstBuf;
        const burstFreqs = { 'Б': 500, 'Д': 1800, 'Г': 1200 };
        const burstFilt = ctx.createBiquadFilter(); burstFilt.type = 'bandpass'; burstFilt.frequency.value = (burstFreqs[cons] || 1000) * shift; burstFilt.Q.value = 2;
        const burstGain = ctx.createGain(); burstGain.gain.value = volume * 0.5;
        burst.connect(burstFilt); burstFilt.connect(burstGain); burstGain.connect(master);
        const now = ctx.currentTime; master.gain.setValueAtTime(0.01, now); master.gain.linearRampToValueAtTime(volume * 0.85, now + 0.008);
        master.gain.exponentialRampToValueAtTime(0.01, now + stopDur);
        osc.start(now); osc.stop(now + stopDur * 0.5); burst.start(now + 0.005); burst.stop(now + stopDur);
        await delay(stopDur * 1000); return;
    }
    if (con.type === 'stop' && !con.voiced) {
        const stopDur = 0.05, burstLen = Math.floor(ctx.sampleRate * 0.04), burstBuf = ctx.createBuffer(1, burstLen, ctx.sampleRate), burstData = burstBuf.getChannelData(0);
        for (let i = 0; i < burstLen; i++) burstData[i] = (Math.random() * 2 - 1) * (1 - i / burstLen) * 1.2;
        const burst = ctx.createBufferSource(); burst.buffer = burstBuf;
        const burstFreqs = { 'П': 700, 'Т': 2500, 'К': 1500 };
        const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = (burstFreqs[cons] || con.freq) * shift; filt.Q.value = 2.5;
        const noiseGain = ctx.createGain(); noiseGain.gain.value = volume * 0.69;
        burst.connect(filt); filt.connect(noiseGain); noiseGain.connect(master);
        if (cons === 'П') {
            const aspLen = Math.floor(ctx.sampleRate * 0.025), aspBuf = ctx.createBuffer(1, aspLen, ctx.sampleRate), aspData = aspBuf.getChannelData(0);
            for (let i = 0; i < aspLen; i++) aspData[i] = (Math.random() * 2 - 1) * (1 - i / aspLen) * 0.6;
            const aspNoise = ctx.createBufferSource(); aspNoise.buffer = aspBuf;
            const aspFilt = ctx.createBiquadFilter(); aspFilt.type = 'bandpass'; aspFilt.frequency.value = 1800 * shift; aspFilt.Q.value = 1.5;
            const aspGain = ctx.createGain(); aspGain.gain.value = volume * 0.45;
            aspNoise.connect(aspFilt); aspFilt.connect(aspGain); aspGain.connect(master);
            aspNoise.start(ctx.currentTime + 0.015); aspNoise.stop(ctx.currentTime + stopDur);
        }
        const now = ctx.currentTime; master.gain.setValueAtTime(0.01, now); master.gain.linearRampToValueAtTime(volume * 1.125, now + 0.003);
        master.gain.exponentialRampToValueAtTime(0.01, now + stopDur);
        burst.start(now); burst.stop(now + stopDur);
        await delay(stopDur * 1000); return;
    }
    if (con.type === 'affr') {
        const affrDur = 0.07, burstLen = Math.floor(ctx.sampleRate * affrDur), burstBuf = ctx.createBuffer(1, burstLen, ctx.sampleRate), burstData = burstBuf.getChannelData(0);
        for (let i = 0; i < burstLen; i++) { const t = i / burstLen; burstData[i] = (Math.random() * 2 - 1) * (t < 0.2 ? t * 5 : 1 - (t - 0.2) * 0.8); }
        const burst = ctx.createBufferSource(); burst.buffer = burstBuf;
        const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = con.freq * shift; filt.Q.value = 4;
        const noiseGain = ctx.createGain(); noiseGain.gain.value = volume * 0.45;
        burst.connect(filt); filt.connect(noiseGain); noiseGain.connect(master);
        const now = ctx.currentTime; master.gain.setValueAtTime(0.01, now); master.gain.linearRampToValueAtTime(volume * 0.7, now + 0.01);
        master.gain.setValueAtTime(volume * 0.6, now + affrDur * 0.5); master.gain.exponentialRampToValueAtTime(0.01, now + affrDur);
        burst.start(now); burst.stop(now + affrDur);
        await delay(affrDur * 1000 * 0.8); return;
    }
    const fricDur = dur * 0.8, bufLen = Math.floor(ctx.sampleRate * fricDur), buf = ctx.createBuffer(1, bufLen, ctx.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource(); noise.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = con.freq * shift; filt.Q.value = 5;
    const noiseGain = ctx.createGain(); noiseGain.gain.value = volume * 0.35;
    noise.connect(filt); filt.connect(noiseGain); noiseGain.connect(master);
    if (con.voiced && !vc.robot && !useWhisper) {
        const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = pitch;
        const vFilt = ctx.createBiquadFilter(); vFilt.type = 'lowpass'; vFilt.frequency.value = 800;
        const vGain = ctx.createGain(); vGain.gain.value = volume * 0.3;
        osc.connect(vFilt); vFilt.connect(vGain); vGain.connect(master);
        osc.start(); osc.stop(ctx.currentTime + fricDur);
    }
    const now = ctx.currentTime; master.gain.setValueAtTime(0, now); master.gain.linearRampToValueAtTime(volume * 0.6, now + 0.015);
    master.gain.setValueAtTime(volume * 0.6, now + fricDur - 0.015); master.gain.linearRampToValueAtTime(0, now + fricDur);
    noise.start(); noise.stop(ctx.currentTime + fricDur);
    const microPause = isHumanMode ? Math.random() * humanSettings.humanness * 2 : 0;
    await delay(fricDur * 1000 * 0.7 + microPause);
}

function applyPronunciationRules(text) {
    text = text.toUpperCase();
    text = text.replace(/ЖИ/g, 'ЖЫ').replace(/ШИ/g, 'ШЫ').replace(/ЦИ/g, 'ЦЫ');
    text = text.replace(/ЧА/g, 'ЧЯ').replace(/ЩА/g, 'ЩЯ');
    text = text.replace(/ЧУ/g, 'ЧЮ').replace(/ЩУ/g, 'ЩЮ');
    text = text.replace(/ТЬСЯ/g, 'ЦА').replace(/ТСЯ/g, 'ЦА');
    text = text.replace(/СЧ/g, 'Щ').replace(/ЗЧ/g, 'Щ').replace(/ЖЧ/g, 'Щ');
    text = text.replace(/КОНЕЧНО/g, 'КОНЕШНО').replace(/СКУЧНО/g, 'СКУШНО').replace(/НАРОЧНО/g, 'НАРОШНО');
    text = text.replace(/ЯИЧНИЦ/g, 'ЯИШНИЦ').replace(/ПУСТЯЧН/g, 'ПУСТЯШН').replace(/ПРАЧЕЧН/g, 'ПРАЧЕШН');
    text = text.replace(/ЧТО/g, 'ШТО').replace(/ЧТОБЫ/g, 'ШТОБЫ').replace(/НИЧТО/g, 'НИШТО');
    text = text.replace(/ГК/g, 'ХК').replace(/ГЧ/g, 'ХЧ');
    text = text.replace(/ЛЁГК/g, 'ЛЁХК').replace(/МЯГК/g, 'МЯХК');
    text = text.replace(/СШ/g, 'ШШ').replace(/ЗШ/g, 'ШШ');
    text = text.replace(/СЖ/g, 'ЖЖ').replace(/ЗЖ/g, 'ЖЖ');
    text = text.replace(/ОГО(\s|$|[.!?,;:])/g, 'ОВО$1').replace(/ЕГО(\s|$|[.!?,;:])/g, 'ЕВО$1');
    text = text.replace(/Б(\s|$|[.!?,;:])/g, 'П$1').replace(/В(\s|$|[.!?,;:])/g, 'Ф$1');
    text = text.replace(/Г(\s|$|[.!?,;:])/g, 'К$1').replace(/Д(\s|$|[.!?,;:])/g, 'Т$1');
    text = text.replace(/Ж(\s|$|[.!?,;:])/g, 'Ш$1').replace(/З(\s|$|[.!?,;:])/g, 'С$1');
    return text;
}

function isVowel(c) { return 'АОУЭИЫЕЁЮЯ'.includes(c); }
function getWord(chars, pos) { let s = pos, e = pos; while (s > 0 && !' .!?,;:'.includes(chars[s-1])) s--; while (e < chars.length && !' .!?,;:'.includes(chars[e])) e++; return { start: s, word: chars.slice(s, e).join('') }; }
function findStress(word) { if (STRESS[word] !== undefined) return STRESS[word]; const vowPos = []; for (let i = 0; i < word.length; i++) if (isVowel(word[i])) vowPos.push(i); if (vowPos.length <= 1) return vowPos[0] || 0; const yoPos = word.indexOf('Ё'); if (yoPos >= 0) return yoPos; return vowPos[Math.max(0, vowPos.length - 2)]; }
function isStressedPosition(chars, pos) { const { start, word } = getWord(chars, pos); return (pos - start) === findStress(word); }
function processAdjectiveEndings(text) { return text.replace(/ОГО(\s|$|[.!?,;:])/gi, 'ОВО$1').replace(/ЕГО(\s|$|[.!?,;:])/gi, 'ЕВО$1'); }

function textToPhonemes(text) {
    text = transliterateText(text);
    text = applyPronunciationRules(text);
    text = processAdjectiveEndings(text.toUpperCase());
    const chars = text.split(''), result = [];
    for (let i = 0; i < chars.length; i++) {
        const c = chars[i], prev = chars[i - 1], isStart = !prev || ' .!?,;:'.includes(prev), isStressed = isStressedPosition(chars, i);
        if (c === 'Ь') { if (result.length > 0 && result[result.length - 1].sounds && CONSONANTS[result[result.length - 1].sounds[0]]) { result[result.length - 1].soft = true; } result.push({ char: c, sounds: ['Й'], phoneme: '[ь]', softSign: true, softVolume: 0.8 }); continue; }
        if (c === 'Ъ') continue;
        if (c === 'Я') { if (!isStart && prev !== 'Ь' && prev !== 'Ъ' && !isVowel(prev) && CONSONANTS[prev] && result.length > 0) result[result.length - 1].soft = true; result.push({ char: c, sounds: ['Й', 'А'], phoneme: '[йа]', stressed: isStressed }); continue; }
        if (c === 'Ю') { if (!isStart && prev !== 'Ь' && prev !== 'Ъ' && !isVowel(prev) && CONSONANTS[prev] && result.length > 0) result[result.length - 1].soft = true; result.push({ char: c, sounds: ['Й', 'У'], phoneme: '[йу]', stressed: isStressed }); continue; }
        if (c === 'Ё') { if (!isStart && prev !== 'Ь' && prev !== 'Ъ' && !isVowel(prev) && CONSONANTS[prev] && result.length > 0) result[result.length - 1].soft = true; result.push({ char: c, sounds: ['Й', 'О'], phoneme: '[йо]', stressed: true }); continue; }
        if (c === 'Е') { if (!isStart && prev !== 'Ь' && prev !== 'Ъ' && !isVowel(prev) && CONSONANTS[prev]) { if (result.length > 0) result[result.length - 1].soft = true; result.push({ char: c, sounds: ['Э'], phoneme: '[э]', stressed: isStressed }); } else { result.push({ char: c, sounds: ['Й', 'Э'], phoneme: '[йэ]', stressed: isStressed }); } continue; }
        if (c === 'И') { if (result.length > 0 && result[result.length - 1].sounds && CONSONANTS[result[result.length - 1].sounds[0]]) result[result.length - 1].soft = true; result.push({ char: c, sounds: ['И'], phoneme: '[и]', stressed: isStressed }); continue; }
        if (VOWELS[c]) { result.push({ char: c, sounds: [c], phoneme: `[${c.toLowerCase()}]`, stressed: isStressed }); continue; }
        if (CONSONANTS[c]) { result.push({ char: c, sounds: [c], phoneme: `[${c.toLowerCase()}]`, soft: false }); continue; }
        if (c === ' ') { result.push({ char: c, sounds: [' '], phoneme: '', isSpace: true }); continue; }
        if ('.!?,;:'.includes(c)) { result.push({ char: c, sounds: [c], phoneme: '', isPunct: true, punctType: c }); }
    }
    return result;
}

function splitSentences(text) { const sentences = []; let cur = ''; for (const c of text) { cur += c; if ('.!?'.includes(c)) { sentences.push({ text: cur.trim(), type: c === '?' ? 'question' : c === '!' ? 'exclaim' : 'normal' }); cur = ''; } } if (cur.trim()) sentences.push({ text: cur.trim(), type: 'normal' }); return sentences; }

async function playBreath(volume) {
    if (currentVersion !== 'v7' && currentVersion !== 'v65') return;
    const humanSettings = getHumanSettings();
    if (humanSettings.humanness < 0.5) return;
    if (Math.random() > 0.15) return;
    
    const ctx = getCtx();
    const breathDur = 0.04 + Math.random() * 0.03;
    const breathVol = volume * 0.04 * humanSettings.humanness;
    
    const bufLen = Math.floor(ctx.sampleRate * breathDur);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    
    for (let i = 0; i < bufLen; i++) {
        const env = Math.sin(Math.PI * i / bufLen);
        data[i] = (Math.random() * 2 - 1) * env * 0.2;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400 + Math.random() * 200;
    filter.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.value = breathVol;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + breathDur);
}

async function speak() {
    stop();
    const s = currentVersion === 'v1' ? '1' : currentVersion === 'v15' ? '15' : currentVersion === 'v2' ? '2' : currentVersion === 'v35' ? '35' : currentVersion === 'v4' ? '4' : currentVersion === 'v5' ? '5' : currentVersion === 'v6' ? '6' : currentVersion === 'v65' ? '65' : currentVersion === 'v7' ? '7' : currentVersion === 'v8' ? '8' : currentVersion === 'v9' ? '9' : currentVersion === 'v95' ? '95' : currentVersion === 'v10' ? '10' : currentVersion === 'v11' ? '11' : '3';
    const text = document.getElementById('text' + s).value;
    const emotionMods = getEmotionModifiers();
    const accentMods = getAccentModifiers();
    const styleMods = getStyleModifiers();
    currentEmotion = { ...emotionMods };
    const speed = parseInt(document.getElementById('speed' + s).value) / emotionMods.speed / styleMods.speed / accentMods.speed;
    const volume = Math.min(1.0, (parseInt(document.getElementById('vol' + s).value) / 100) * emotionMods.volume * styleMods.volume);
    const voiceSelect = document.getElementById('voice' + s);
    const voice = voiceSelect ? voiceSelect.value : 'v3_alex';
    if (!VOICES[voice] && voiceSelect) {
        voiceSelect.value = 'v3_alex';
    }
    if (!VOICES[voice]) {
        console.warn('Unknown voice id:', voice, 'fallback to v3_alex');
    }
    let pitchMult = emotionMods.pitch * accentMods.pitch * styleMods.pitch;
    if (currentVersion === 'v35' || currentVersion === 'v4' || currentVersion === 'v5' || currentVersion === 'v6' || currentVersion === 'v65' || currentVersion === 'v7' || currentVersion === 'v8' || currentVersion === 'v9' || currentVersion === 'v95' || currentVersion === 'v10' || currentVersion === 'v11') { const ps = document.getElementById('pitch' + s); if (ps) pitchMult *= parseInt(ps.value) / 100; }
    if (!text.trim()) return;
    playing = true; stopFlag = false;
    const sentences = splitSentences(text);
    for (const sentence of sentences) {
        if (stopFlag) break;
        const phonemes = textToPhonemes(sentence.text), soundCount = phonemes.filter(p => !p.isSpace && !p.isPunct).length;
        let soundIndex = 0;
        for (let i = 0; i < phonemes.length; i++) {
            if (stopFlag) break;
            const ph = phonemes[i];
            document.getElementById('charDisplay').textContent = ph.char === ' ' ? '_' : ph.char;
            document.getElementById('phonemeDisplay').textContent = ph.phoneme + (ph.stressed ? ' ́' : '');
            let pitchMod = 1.0;
            if (!ph.isSpace && !ph.isPunct) {
                soundIndex++;
                const progress = soundIndex / soundCount;
                if (sentence.type === 'question' && soundCount - soundIndex <= 1) pitchMod = 1.35;
                else if (sentence.type === 'question' && soundCount - soundIndex <= 2) pitchMod = 1.15;
                else if (sentence.type === 'exclaim') pitchMod = 1.1 - progress * 0.08;
                else pitchMod = 1 - progress * 0.04;
                if (ph.stressed) pitchMod *= 1.02;
                pitchMod *= pitchMult;
            }
            document.getElementById('statusDisplay').textContent = `${soundIndex}/${soundCount}`;
            const progEl = document.getElementById('prog' + s); if (progEl) progEl.style.width = ((i + 1) / phonemes.length * 100) + '%';
            if (soundIndex % 20 === 0) cleanupAudio();
            if (soundIndex % 100 === 0 && soundIndex > 0) { resetAudioContext(); await delay(50); }
            for (const sound of ph.sounds) {
                if (stopFlag) break;
                const soundVol = ph.softSign ? volume * 0.8 : volume;
                if (sound === ' ') {
                    playBreath(volume);
                    await delay(speed * 0.12);
                }
                else if (VOWELS[sound]) await playVowel(sound, speed, soundVol, voice, pitchMod, ph.stressed);
                else if (CONSONANTS[sound]) await playConsonant(sound, speed, soundVol, voice, pitchMod, ph.soft || false);
            }
            if (ph.isPunct) await delay(ph.punctType === '.' ? speed * 0.5 : ph.punctType === ',' ? speed * 0.35 : ph.punctType === ';' ? speed * 0.3 : ph.punctType === ':' ? speed * 0.25 : speed * 0.4);
        }
        await delay(speed * 0.5);
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '✓'; document.getElementById('phonemeDisplay').textContent = ''; document.getElementById('statusDisplay').textContent = '✅ Готово'; }
    playing = false;
}

function stop() {
    stopFlag = true; playing = false; currentEmotion = { pitch: 1, speed: 1, volume: 1, whisper: false, vibrato: 1 };
    document.getElementById('charDisplay').textContent = '_'; document.getElementById('phonemeDisplay').textContent = ''; document.getElementById('statusDisplay').textContent = 'Стоп';
    ['prog15', 'prog2', 'prog3', 'prog35', 'prog4', 'prog5', 'prog6', 'prog65', 'prog7', 'prog8', 'prog9', 'prog95', 'prog10', 'prog11'].forEach(id => { const el = document.getElementById(id); if (el) el.style.width = '0%'; });
    activeOscillators.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch(e) {} });
    activeOscillators = [];
    resetAudioContext();
}

// Slider handlers
['1', '15', '2', '3', '35', '4', '5', '6', '65', '7', '8', '9', '95', '10', '11'].forEach(s => {
    const sp = document.getElementById('speed' + s), vl = document.getElementById('vol' + s);
    if (sp) sp.oninput = function() { const valEl = document.getElementById('speedVal' + s); if (valEl) valEl.textContent = this.value; };
    if (vl) vl.oninput = function() { const valEl = document.getElementById('volVal' + s); if (valEl) valEl.textContent = this.value + '%'; };
    ['reverb', 'echo', 'chorus', 'tremolo', 'spatial', 'bitcrush', 'pitch', 'flanger', 'compress', 'eqbass', 'wahwah', 'autotune', 'distortion', 'clarity', 'humanness', 'sharpness', 'smoothness', 'hdquality', 'depth'].forEach(fx => {
        const el = document.getElementById(fx + s);
        if (el) el.oninput = function() { const valEl = document.getElementById(fx + 'Val' + s); if (valEl) valEl.textContent = this.value + '%'; };
    });
});

// Beta
const BETA_SOUNDS = { 'А':[1,'sine'],'Б':[0.5,'sawtooth'],'В':[0.6,'sawtooth'],'Г':[0.55,'sawtooth'],'Д':[0.7,'sawtooth'],'Е':[1.1,'sine'],'Ё':[1.1,'sine'],'Ж':[0.4,'square'],'З':[0.8,'sawtooth'],'И':[1.3,'sine'],'Й':[1.25,'sine'],'К':[0.45,'triangle'],'Л':[0.75,'sine'],'М':[0.5,'sine'],'Н':[0.6,'sine'],'О':[0.85,'sine'],'П':[0.35,'triangle'],'Р':[0.65,'square'],'С':[1.5,'sawtooth'],'Т':[0.55,'triangle'],'У':[0.7,'sine'],'Ф':[0.5,'triangle'],'Х':[0.4,'triangle'],'Ц':[1.4,'triangle'],'Ч':[1.2,'square'],'Ш':[0.9,'square'],'Щ':[1,'square'],'Ъ':[0.8,'sine'],'Ы':[0.75,'sine'],'Ь':[1.1,'sine'],'Э':[0.95,'sine'],'Ю':[0.8,'sine'],'Я':[1.05,'sine'] };
let betaPlaying = false, betaTimeout = null;
function betaPlaySound(freq, type, dur) { const ctx = getCtx(), osc = ctx.createOscillator(), gain = ctx.createGain(); osc.type = type; osc.frequency.value = freq; gain.gain.value = 0.3; osc.connect(gain); gain.connect(ctx.destination); osc.start(); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur / 1000); osc.stop(ctx.currentTime + dur / 1000); }
function betaPlay() { betaStop(); const text = document.getElementById('textBeta').value.toUpperCase(), pitch = parseInt(document.getElementById('betaPitch').value), speed = parseInt(document.getElementById('betaSpeed').value); if (!text) return; betaPlaying = true; let i = 0; function next() { if (!betaPlaying || i >= text.length) { document.getElementById('betaChar').textContent = '✓'; betaPlaying = false; return; } const char = text[i]; document.getElementById('betaChar').textContent = char; if (BETA_SOUNDS[char]) betaPlaySound(pitch * BETA_SOUNDS[char][0], BETA_SOUNDS[char][1], speed * 0.8); i++; betaTimeout = setTimeout(next, speed); } next(); }
function betaStop() { betaPlaying = false; clearTimeout(betaTimeout); document.getElementById('betaChar').textContent = '_'; }
function exitBeta() { const ctx = getCtx(); [523, 392, 330, 262].forEach((f, i) => { const osc = ctx.createOscillator(), g = ctx.createGain(); osc.frequency.value = f; osc.type = 'square'; g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.08); osc.connect(g); g.connect(ctx.destination); osc.start(ctx.currentTime + i * 0.08); osc.stop(ctx.currentTime + i * 0.08 + 0.1); }); setTimeout(() => { document.body.className = 'v3'; currentVersion = 'v3'; }, 350); }
document.getElementById('betaPitch').oninput = function() { document.getElementById('betaPitchVal').textContent = this.value; };
document.getElementById('betaSpeed').oninput = function() { document.getElementById('betaSpeedVal').textContent = this.value; };

// Konami
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiIndex = 0;
document.addEventListener('keydown', e => { 
    if (e.code === konamiCode[konamiIndex]) { 
        konamiIndex++; 
        if (konamiIndex === konamiCode.length) { 
            konamiIndex = 0; 
            setVersion('beta');
            const ctx = getCtx(); 
            [262, 330, 392, 523].forEach((f, i) => { 
                const osc = ctx.createOscillator(), g = ctx.createGain(); 
                osc.frequency.value = f; osc.type = 'square'; 
                g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1); 
                g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.1); 
                osc.connect(g); g.connect(ctx.destination); 
                osc.start(ctx.currentTime + i * 0.1); osc.stop(ctx.currentTime + i * 0.1 + 0.15); 
            }); 
        } 
    } else { 
        konamiIndex = 0; 
    }
});

// ===== DEBUG FUNCTIONS =====
function getDebugOutput() {
    const s = currentVersion === 'v35' ? '35' : currentVersion === 'v4' ? '4' : currentVersion === 'v5' ? '5' : currentVersion === 'v6' ? '6' : currentVersion === 'v65' ? '65' : currentVersion === 'v7' ? '7' : currentVersion === 'v8' ? '8' : currentVersion === 'v9' ? '9' : currentVersion === 'v95' ? '95' : currentVersion === 'v10' ? '10' : currentVersion === 'v11' ? '11' : '3';
    return document.getElementById('debugOutput' + s);
}
function getDebugFreq() {
    const s = currentVersion === 'v35' ? '35' : currentVersion === 'v4' ? '4' : currentVersion === 'v5' ? '5' : currentVersion === 'v6' ? '6' : currentVersion === 'v65' ? '65' : currentVersion === 'v7' ? '7' : currentVersion === 'v8' ? '8' : currentVersion === 'v9' ? '9' : currentVersion === 'v95' ? '95' : currentVersion === 'v10' ? '10' : currentVersion === 'v11' ? '11' : '3';
    return document.getElementById('debugFreq' + s);
}

function testFormants() {
    const output = getDebugOutput(); if (!output) return;
    output.value = '=== ТЕСТ ФОРМАНТ ===\n\n';
    for (const [v, d] of Object.entries(VOWELS)) output.value += v + ': F1=' + d.f1 + 'Hz F2=' + d.f2 + 'Hz F3=' + d.f3 + 'Hz\n';
    (async () => {
        const s = currentVersion === 'v35' ? '35' : currentVersion === 'v4' ? '4' : currentVersion === 'v5' ? '5' : currentVersion === 'v6' ? '6' : currentVersion === 'v65' ? '65' : currentVersion === 'v7' ? '7' : currentVersion === 'v8' ? '8' : currentVersion === 'v9' ? '9' : currentVersion === 'v95' ? '95' : currentVersion === 'v10' ? '10' : currentVersion === 'v11' ? '11' : '3';
        const voice = document.getElementById('voice' + s)?.value || 'v3_alex';
        for (const vowel of ['А', 'О', 'У', 'Э', 'И', 'Ы']) {
            if (stopFlag) break;
            output.value += '\nИграю: ' + vowel + '...';
            await playVowel(vowel, 300, 0.5, voice, 1, true);
            await delay(100);
        }
        output.value += '\n\n✅ Готово!';
    })();
}

function analyzeText() {
    const output = getDebugOutput(); if (!output) return;
    const s = currentVersion === 'v35' ? '35' : currentVersion === 'v4' ? '4' : currentVersion === 'v5' ? '5' : currentVersion === 'v6' ? '6' : currentVersion === 'v65' ? '65' : currentVersion === 'v7' ? '7' : currentVersion === 'v8' ? '8' : currentVersion === 'v9' ? '9' : currentVersion === 'v95' ? '95' : currentVersion === 'v10' ? '10' : currentVersion === 'v11' ? '11' : '3';
    const text = document.getElementById('text' + s)?.value || '';
    output.value = '=== АНАЛИЗ ТЕКСТА ===\n\nТекст: "' + text + '"\n\nФонемы:\n';
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (ph.isSpace) continue;
        output.value += ph.char + ' -> ' + (ph.sounds?.join('+') || '-') + ' ' + (ph.phoneme || '') + '\n';
    }
}

function testVoice() {
    const output = getDebugOutput(); if (!output) return;
    const s = currentVersion === 'v35' ? '35' : currentVersion === 'v4' ? '4' : currentVersion === 'v5' ? '5' : currentVersion === 'v6' ? '6' : currentVersion === 'v65' ? '65' : currentVersion === 'v7' ? '7' : currentVersion === 'v8' ? '8' : currentVersion === 'v9' ? '9' : currentVersion === 'v95' ? '95' : currentVersion === 'v10' ? '10' : currentVersion === 'v11' ? '11' : '3';
    const voiceId = document.getElementById('voice' + s)?.value || 'v3_alex';
    const v = VOICES[voiceId] || VOICES.v3_alex;
    output.value = '=== ПАРАМЕТРЫ ГОЛОСА ===\n\nID: ' + voiceId + '\nPitch: ' + v.pitch + ' Hz\nFormant: ' + (v.formant || 1.0) + '\nVibrato: ' + (v.vibrato || 'нет') + ' Hz';
}

function testFreq() {
    const output = getDebugOutput(), freqInput = getDebugFreq();
    if (!output || !freqInput) return;
    const freq = parseInt(freqInput.value) || 440;
    output.value = '=== ТЕСТ ЧАСТОТЫ ===\n\nЧастота: ' + freq + ' Hz\n\nИграю...';
    const ctx = getCtx(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.frequency.value = freq; osc.type = 'sine'; gain.gain.value = 0.3;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 1);
    setTimeout(function() { output.value += '\n\n✅ Готово!'; }, 1000);
}

function playPiano() {
    const output = getDebugOutput(); if (!output) return;
    output.value = '🎹 ПИАНИНО\n\n';
    const notes = [{n:'До',f:261},{n:'Ре',f:293},{n:'Ми',f:329},{n:'Фа',f:349},{n:'Соль',f:392},{n:'Ля',f:440},{n:'Си',f:493},{n:'До2',f:523}];
    const ctx = getCtx(); let time = ctx.currentTime;
    notes.forEach(function(note, i) {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.frequency.value = note.f; osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(time); osc.stop(time + 0.5); time += 0.3;
        setTimeout(function() { output.value += note.n + ' '; }, i * 300);
    });
    setTimeout(function() { output.value += '\n\nГотово!'; }, notes.length * 300);
}

function easterEgg() {
    const output = getDebugOutput(); if (!output) return;
    const eggs = ['🥚 Пасхалка!\n\n© Софтина от 0_080463', '🎮 KONAMI CODE:\n↑↑↓↓←→←→BA', '🤖 Я синтезатор!', '🎵 Музыка из текста TOP 1994'];
    output.value = eggs[Math.floor(Math.random() * eggs.length)];
    const ctx = getCtx(); let time = ctx.currentTime;
    [523, 659, 784, 1047].forEach(function(f) {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.frequency.value = f; osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(time); osc.stop(time + 0.2); time += 0.1;
    });
}

// ===== V6 MEGA FUNCTIONS =====
async function playSinging() {
    stop();
    const s = currentVersion === 'v11' ? '11' : currentVersion === 'v10' ? '10' : currentVersion === 'v95' ? '95' : currentVersion === 'v9' ? '9' : currentVersion === 'v8' ? '8' : currentVersion === 'v7' ? '7' : currentVersion === 'v65' ? '65' : '6';
    const text = document.getElementById('text' + s)?.value || 'ЛЯ ЛЯ ЛЯ';
    const voice = document.getElementById('voice' + s)?.value || 'v6_opera_f';
    const volume = parseInt(document.getElementById('vol' + s)?.value || 90) / 100;
    const melody = [261, 293, 329, 349, 392, 440, 493, 523];
    playing = true; stopFlag = false;
    const phonemes = textToPhonemes(text);
    let noteIndex = 0;
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace || ph.isPunct) continue;
        document.getElementById('charDisplay').textContent = ph.char;
        const freq = melody[noteIndex % melody.length];
        const pitchMod = freq / 261;
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, 400, volume, voice, pitchMod, true);
            else if (CONSONANTS[sound]) await playConsonant(sound, 150, volume, voice, pitchMod, ph.soft);
        }
        noteIndex++;
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '🎵'; document.getElementById('statusDisplay').textContent = '✅ Песня окончена!'; }
    playing = false;
}

async function playRap() {
    stop();
    const s = currentVersion === 'v11' ? '11' : currentVersion === 'v10' ? '10' : currentVersion === 'v95' ? '95' : currentVersion === 'v9' ? '9' : currentVersion === 'v8' ? '8' : currentVersion === 'v7' ? '7' : currentVersion === 'v65' ? '65' : '6';
    const text = document.getElementById('text' + s)?.value || 'ЙО ЙО ПРИВЕТ';
    const voice = document.getElementById('voice' + s)?.value || 'v6_rapper';
    const volume = parseInt(document.getElementById('vol' + s)?.value || 90) / 100;
    playing = true; stopFlag = false;
    const words = text.split(/\s+/);
    let beat = 0;
    for (const word of words) {
        if (stopFlag) break;
        const phonemes = textToPhonemes(word);
        for (const ph of phonemes) {
            if (stopFlag) break;
            if (ph.isSpace || ph.isPunct) continue;
            document.getElementById('charDisplay').textContent = ph.char;
            const pitchMod = beat % 2 === 0 ? 1.0 : 0.95;
            for (const sound of ph.sounds) {
                if (stopFlag) break;
                if (VOWELS[sound]) await playVowel(sound, 80, volume, voice, pitchMod, true);
                else if (CONSONANTS[sound]) await playConsonant(sound, 50, volume, voice, pitchMod, ph.soft);
            }
        }
        beat++;
        await delay(100);
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '🎤'; document.getElementById('statusDisplay').textContent = '✅ Рэп окончен!'; }
    playing = false;
}

async function playBeatbox() {
    stop();
    const ctx = getCtx();
    playing = true; stopFlag = false;
    const pattern = ['kick', 'hihat', 'snare', 'hihat', 'kick', 'kick', 'snare', 'hihat'];
    document.getElementById('statusDisplay').textContent = '🥁 Бит...';
    for (let i = 0; i < 16 && !stopFlag; i++) {
        const sound = pattern[i % pattern.length];
        document.getElementById('charDisplay').textContent = sound === 'kick' ? '💥' : sound === 'snare' ? '🥁' : '🎵';
        if (sound === 'kick') {
            const osc = ctx.createOscillator(), gain = ctx.createGain();
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.8, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.15);
        } else if (sound === 'snare') {
            const bufLen = Math.floor(ctx.sampleRate * 0.1), buf = ctx.createBuffer(1, bufLen, ctx.sampleRate), data = buf.getChannelData(0);
            for (let j = 0; j < bufLen; j++) data[j] = (Math.random() * 2 - 1) * (1 - j/bufLen);
            const noise = ctx.createBufferSource(), gain = ctx.createGain(), filt = ctx.createBiquadFilter();
            noise.buffer = buf; filt.type = 'highpass'; filt.frequency.value = 1000;
            gain.gain.setValueAtTime(0.6, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            noise.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
            noise.start(); noise.stop(ctx.currentTime + 0.1);
        } else {
            const bufLen = Math.floor(ctx.sampleRate * 0.05), buf = ctx.createBuffer(1, bufLen, ctx.sampleRate), data = buf.getChannelData(0);
            for (let j = 0; j < bufLen; j++) data[j] = (Math.random() * 2 - 1) * (1 - j/bufLen);
            const noise = ctx.createBufferSource(), gain = ctx.createGain(), filt = ctx.createBiquadFilter();
            noise.buffer = buf; filt.type = 'highpass'; filt.frequency.value = 8000;
            gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            noise.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
            noise.start(); noise.stop(ctx.currentTime + 0.05);
        }
        await delay(200);
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '🥁'; document.getElementById('statusDisplay').textContent = '✅ Бит окончен!'; }
    playing = false;
}

function testSinging() { const output = getDebugOutput(); if (output) output.value = '🎵 ТЕСТ ПЕНИЯ\n\nПою гамму...'; playSinging(); }
function testBeatbox() { const output = getDebugOutput(); if (output) output.value = '🥁 ТЕСТ БИТБОКСА\n\nИграю бит...'; playBeatbox(); }

// ===== V6.5 ULTRA FUNCTIONS =====
function hdTest() {
    const output = getDebugOutput(); if (!output) return;
    output.value = '✨ HD ТЕСТ v6.5\n\nТестирую HD качество...\n';
    (async () => {
        const text = 'ТЕСТ';
        const phonemes = textToPhonemes(text);
        const voice = document.getElementById('voice65')?.value || 'v65_hd_m';
        output.value += '\nГолос: ' + voice;
        output.value += '\nПонятность: ' + (document.getElementById('clarity65')?.value || 70) + '%';
        output.value += '\nЧеловечность: ' + (document.getElementById('humanness65')?.value || 80) + '%';
        output.value += '\nHD качество: ' + (document.getElementById('hdquality65')?.value || 0) + '%\n';
        for (const ph of phonemes) {
            if (stopFlag) break;
            for (const sound of ph.sounds) {
                if (VOWELS[sound]) await playVowel(sound, 300, 0.6, voice, 1, true);
                else if (CONSONANTS[sound]) await playConsonant(sound, 200, 0.6, voice, 1, ph.soft);
            }
        }
        output.value += '\n✅ HD тест завершён!';
    })();
}

function studioTest() {
    const output = getDebugOutput(); if (!output) return;
    output.value = '🎙️ СТУДИО ТЕСТ v6.5\n\nТестирую студийный режим...\n';
    (async () => {
        const clarity = document.getElementById('clarity65');
        const humanness = document.getElementById('humanness65');
        const sharpness = document.getElementById('sharpness65');
        const smoothness = document.getElementById('smoothness65');
        if (clarity) { clarity.value = 80; document.getElementById('clarityVal65').textContent = '80%'; }
        if (humanness) { humanness.value = 90; document.getElementById('humannessVal65').textContent = '90%'; }
        if (sharpness) { sharpness.value = 70; document.getElementById('sharpnessVal65').textContent = '70%'; }
        if (smoothness) { smoothness.value = 60; document.getElementById('smoothnessVal65').textContent = '60%'; }
        output.value += '\n📊 Студийные настройки применены:';
        output.value += '\n  Понятность: 80%\n  Человечность: 90%\n  Чёткость: 70%\n  Плавность: 60%\n';
        const text = 'СТУДИЯ';
        const phonemes = textToPhonemes(text);
        const voice = document.getElementById('voice65')?.value || 'v65_studio';
        for (const ph of phonemes) {
            if (stopFlag) break;
            document.getElementById('charDisplay').textContent = ph.char;
            for (const sound of ph.sounds) {
                if (VOWELS[sound]) await playVowel(sound, 250, 0.7, voice, 1, true);
                else if (CONSONANTS[sound]) await playConsonant(sound, 150, 0.7, voice, 1, ph.soft);
            }
        }
        output.value += '\n✅ Студио тест завершён!';
        document.getElementById('charDisplay').textContent = '🎙️';
    })();
}

function hdEnhance() {
    ['clarity65', 'humanness65', 'sharpness65', 'smoothness65', 'hdquality65', 'depth65'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = 80; const valEl = document.getElementById(id.replace('65', 'Val65')); if (valEl) valEl.textContent = '80%'; }
    });
    alert('✨ HD-улучшение активировано!\nВсе параметры качества установлены на 80%');
    speak();
}

function studioMode() {
    document.getElementById('mode65').value = 'podcast';
    document.getElementById('voice65').value = 'v65_studio';
    document.getElementById('clarity65').value = 85;
    document.getElementById('humanness65').value = 95;
    document.getElementById('sharpness65').value = 60;
    document.getElementById('smoothness65').value = 70;
    document.getElementById('reverb65').value = 20;
    document.getElementById('echo65').value = 10;
    ['clarity', 'humanness', 'sharpness', 'smoothness', 'reverb', 'echo'].forEach(fx => {
        const el = document.getElementById(fx + '65');
        const valEl = document.getElementById(fx + 'Val65');
        if (el && valEl) valEl.textContent = el.value + '%';
    });
    alert('🎙️ Студийный режим активирован!\nОптимальные настройки для подкастов и озвучки.');
    speak();
}

// ===== V7 FUNCTIONS =====
async function playChipmunk() {
    stop();
    const text = document.getElementById('text7')?.value || 'ПРИВЕТ';
    const volume = parseInt(document.getElementById('vol7')?.value || 90) / 100;
    playing = true; stopFlag = false;
    document.getElementById('statusDisplay').textContent = '🐿️ Бурундук говорит...';
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace || ph.isPunct) continue;
        document.getElementById('charDisplay').textContent = ph.char;
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, 60, volume, 'v3_girl', 2.5, true);
            else if (CONSONANTS[sound]) await playConsonant(sound, 40, volume, 'v3_girl', 2.5, ph.soft);
        }
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '🐿️'; document.getElementById('statusDisplay').textContent = '✅ Бурундук закончил!'; }
    playing = false;
}

async function playRobot() {
    stop();
    const text = document.getElementById('text7')?.value || 'Я РОБОТ';
    const volume = parseInt(document.getElementById('vol7')?.value || 90) / 100;
    playing = true; stopFlag = false;
    document.getElementById('statusDisplay').textContent = '🤖 Робот говорит...';
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace || ph.isPunct) { await delay(100); continue; }
        document.getElementById('charDisplay').textContent = ph.char;
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, 150, volume, 'robot', 1, true);
            else if (CONSONANTS[sound]) await playConsonant(sound, 100, volume, 'robot', 1, false);
        }
        await delay(50);
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '🤖'; document.getElementById('statusDisplay').textContent = '✅ Робот закончил!'; }
    playing = false;
}

function hdEnhance7() {
    ['clarity7', 'humanness7', 'sharpness7', 'smoothness7', 'hdquality7', 'depth7'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = 85;
            const valEl = document.getElementById(id.replace('7', 'Val7'));
            if (valEl) valEl.textContent = '85%';
        }
    });
    document.getElementById('reverb7').value = 35;
    document.getElementById('reverbVal7').textContent = '35%';
    document.getElementById('chorus7').value = 25;
    document.getElementById('chorusVal7').textContent = '25%';
    alert('✨ HD-улучшение v7.0 активировано!\nМаксимальное качество голоса включено.');
    speak();
}

function studioMode7() {
    document.getElementById('mode7').value = 'podcast';
    document.getElementById('voice7').value = 'v65_studio';
    document.getElementById('clarity7').value = 90;
    document.getElementById('clarityVal7').textContent = '90%';
    document.getElementById('humanness7').value = 95;
    document.getElementById('humannessVal7').textContent = '95%';
    document.getElementById('sharpness7').value = 65;
    document.getElementById('sharpnessVal7').textContent = '65%';
    document.getElementById('smoothness7').value = 70;
    document.getElementById('smoothnessVal7').textContent = '70%';
    document.getElementById('hdquality7').value = 80;
    document.getElementById('hdqualityVal7').textContent = '80%';
    document.getElementById('depth7').value = 50;
    document.getElementById('depthVal7').textContent = '50%';
    document.getElementById('reverb7').value = 25;
    document.getElementById('reverbVal7').textContent = '25%';
    document.getElementById('echo7').value = 10;
    document.getElementById('echoVal7').textContent = '10%';
    document.getElementById('chorus7').value = 15;
    document.getElementById('chorusVal7').textContent = '15%';
    alert('🎙️ Студийный режим v7.0 активирован!\nИдеально для подкастов, озвучки и профессиональной записи.');
    speak();
}

// ===== V8 FUNCTIONS =====
function setEnvironment8(env) {
    const envButtons = document.querySelectorAll('.v8-only .env-btn');
    envButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = Array.from(envButtons).find(btn => btn.getAttribute('onclick')?.includes(env));
    if (activeBtn) activeBtn.classList.add('active');
    const envStat = document.getElementById('envStat8');
    const labels = {
        none: '🌍 Нет',
        room: '🌍 Комната',
        hall: '🌍 Зал',
        cave: '🌍 Пещера',
        phone: '🌍 Телефон',
        radio: '🌍 Радио',
        stadium: '🌍 Стадион',
        underwater: '🌍 Под водой'
    };
    if (envStat) envStat.textContent = labels[env] || '🌍 Нет';
}

function loadPreset8(preset) {
    const presets = {
        natural: { clarity: 80, humanness: 85, sharpness: 60, smoothness: 70, reverb: 10, echo: 0, chorus: 10 },
        broadcaster: { clarity: 90, humanness: 80, sharpness: 75, smoothness: 55, reverb: 15, echo: 5, chorus: 15 },
        audiobook: { clarity: 85, humanness: 90, sharpness: 55, smoothness: 75, reverb: 20, echo: 0, chorus: 5 },
        warm: { clarity: 70, humanness: 85, sharpness: 45, smoothness: 80, reverb: 20, echo: 5, chorus: 10 },
        crisp: { clarity: 95, humanness: 70, sharpness: 85, smoothness: 50, reverb: 5, echo: 0, chorus: 5 },
        vintage: { clarity: 60, humanness: 65, sharpness: 40, smoothness: 60, reverb: 30, echo: 15, chorus: 20 }
    };
    const p = presets[preset] || presets.natural;
    ['clarity', 'humanness', 'sharpness', 'smoothness', 'reverb', 'echo', 'chorus'].forEach(key => {
        const el = document.getElementById(key + '8');
        const valEl = document.getElementById(key + 'Val8');
        if (el) el.value = p[key];
        if (valEl) valEl.textContent = p[key] + '%';
    });
}

function hdEnhance8() {
    ['clarity8', 'humanness8', 'sharpness8', 'smoothness8', 'hdquality8', 'depth8'].forEach(id => {
        const el = document.getElementById(id);
        const valEl = document.getElementById(id.replace('8', 'Val8'));
        if (el) { el.value = 90; }
        if (valEl) { valEl.textContent = '90%'; }
    });
    document.getElementById('reverb8').value = 25;
    document.getElementById('reverbVal8').textContent = '25%';
    document.getElementById('chorus8').value = 20;
    document.getElementById('chorusVal8').textContent = '20%';
    speak();
}

function studioMode8() {
    document.getElementById('mode8').value = 'podcast';
    document.getElementById('voice8').value = 'v65_studio';
    document.getElementById('clarity8').value = 90;
    document.getElementById('clarityVal8').textContent = '90%';
    document.getElementById('humanness8').value = 95;
    document.getElementById('humannessVal8').textContent = '95%';
    document.getElementById('sharpness8').value = 60;
    document.getElementById('sharpnessVal8').textContent = '60%';
    document.getElementById('smoothness8').value = 70;
    document.getElementById('smoothnessVal8').textContent = '70%';
    document.getElementById('hdquality8').value = 80;
    document.getElementById('hdqualityVal8').textContent = '80%';
    document.getElementById('depth8').value = 50;
    document.getElementById('depthVal8').textContent = '50%';
    document.getElementById('reverb8').value = 20;
    document.getElementById('reverbVal8').textContent = '20%';
    document.getElementById('echo8').value = 5;
    document.getElementById('echoVal8').textContent = '5%';
    speak();
}

async function playCharacter8(type) {
    const map = {
        hero: { voice: 'v8_hero', pitch: 1.1 },
        dragon: { voice: 'v8_dragon', pitch: 0.7 },
        ghost: { voice: 'v8_ghost', pitch: 1.2 }
    };
    const data = map[type] || map.hero;
    stop();
    const text = document.getElementById('text8')?.value || 'ПРИВЕТ';
    const volume = parseInt(document.getElementById('vol8')?.value || 90) / 100;
    playing = true; stopFlag = false;
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace || ph.isPunct) continue;
        document.getElementById('charDisplay').textContent = ph.char;
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, 120, volume, data.voice, data.pitch, true);
            else if (CONSONANTS[sound]) await playConsonant(sound, 80, volume, data.voice, data.pitch, ph.soft);
        }
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '✓'; document.getElementById('statusDisplay').textContent = '✅ Готово'; }
    playing = false;
}

async function playChipmunk8() {
    stop();
    const text = document.getElementById('text8')?.value || 'ПРИВЕТ';
    const volume = parseInt(document.getElementById('vol8')?.value || 90) / 100;
    playing = true; stopFlag = false;
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace || ph.isPunct) continue;
        document.getElementById('charDisplay').textContent = ph.char;
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, 60, volume, 'v3_girl', 2.5, true);
            else if (CONSONANTS[sound]) await playConsonant(sound, 40, volume, 'v3_girl', 2.5, ph.soft);
        }
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '🐿️'; document.getElementById('statusDisplay').textContent = '✅ Готово'; }
    playing = false;
}

async function playRobot8() {
    stop();
    const text = document.getElementById('text8')?.value || 'Я РОБОТ';
    const volume = parseInt(document.getElementById('vol8')?.value || 90) / 100;
    playing = true; stopFlag = false;
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace || ph.isPunct) { await delay(100); continue; }
        document.getElementById('charDisplay').textContent = ph.char;
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, 150, volume, 'robot', 1, true);
            else if (CONSONANTS[sound]) await playConsonant(sound, 100, volume, 'robot', 1, false);
        }
        await delay(50);
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '🤖'; document.getElementById('statusDisplay').textContent = '✅ Готово'; }
    playing = false;
}

// ===== V9 FUNCTIONS =====
function setEnvironment9(env) {
    const envButtons = document.querySelectorAll('.v9-only .env-btn');
    envButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = Array.from(envButtons).find(btn => btn.getAttribute('onclick')?.includes(env));
    if (activeBtn) activeBtn.classList.add('active');
    const envStat = document.getElementById('envStat9');
    const labels = {
        none: '🌍 Нет',
        studio: '🌍 Студия',
        hall: '🌍 Зал',
        cave: '🌍 Пещера',
        phone: '🌍 Телефон',
        radio: '🌍 Радио',
        stadium: '🌍 Стадион',
        underwater: '🌍 Под водой',
        space: '🌍 Космос',
        city: '🌍 Город',
        forest: '🌍 Лес',
        subway: '🌍 Метро'
    };
    if (envStat) envStat.textContent = labels[env] || '🌍 Студия';
}

function loadPreset9(preset) {
    const presets = {
        stage: { clarity: 90, humanness: 88, sharpness: 80, smoothness: 60, reverb: 40, echo: 15, chorus: 20 },
        cinema: { clarity: 85, humanness: 92, sharpness: 70, smoothness: 75, reverb: 30, echo: 10, chorus: 10 },
        retro: { clarity: 60, humanness: 70, sharpness: 45, smoothness: 55, reverb: 25, echo: 20, chorus: 30 },
        radio: { clarity: 88, humanness: 80, sharpness: 85, smoothness: 65, reverb: 15, echo: 10, chorus: 25 },
        hall: { clarity: 80, humanness: 85, sharpness: 65, smoothness: 70, reverb: 50, echo: 15, chorus: 20 },
        stadium: { clarity: 78, humanness: 80, sharpness: 70, smoothness: 60, reverb: 60, echo: 25, chorus: 30 },
        night: { clarity: 75, humanness: 95, sharpness: 55, smoothness: 85, reverb: 20, echo: 5, chorus: 5 },
        crystal: { clarity: 95, humanness: 90, sharpness: 90, smoothness: 55, reverb: 20, echo: 10, chorus: 10 },
        human: { clarity: 92, humanness: 98, sharpness: 60, smoothness: 88, reverb: 8, echo: 0, chorus: 6 },
        oldtts: { clarity: 55, humanness: 30, sharpness: 35, smoothness: 45, reverb: 5, echo: 10, chorus: 5 }
    };
    const p = presets[preset] || presets.stage;
    ['clarity', 'humanness', 'sharpness', 'smoothness', 'reverb', 'echo', 'chorus'].forEach(key => {
        const el = document.getElementById(key + '9');
        const valEl = document.getElementById(key + 'Val9');
        if (el) el.value = p[key];
        if (valEl) valEl.textContent = p[key] + '%';
    });
}

function hdEnhance9() {
    ['clarity9', 'humanness9', 'sharpness9', 'smoothness9', 'hdquality9', 'depth9'].forEach(id => {
        const el = document.getElementById(id);
        const valEl = document.getElementById(id.replace('9', 'Val9'));
        if (el) { el.value = 92; }
        if (valEl) { valEl.textContent = '92%'; }
    });
    document.getElementById('reverb9').value = 20;
    document.getElementById('reverbVal9').textContent = '20%';
    document.getElementById('chorus9').value = 15;
    document.getElementById('chorusVal9').textContent = '15%';
    speak();
}

function studioMode9() {
    document.getElementById('mode9').value = 'podcast';
    document.getElementById('voice9').value = 'v65_studio';
    document.getElementById('clarity9').value = 92;
    document.getElementById('clarityVal9').textContent = '92%';
    document.getElementById('humanness9').value = 96;
    document.getElementById('humannessVal9').textContent = '96%';
    document.getElementById('sharpness9').value = 65;
    document.getElementById('sharpnessVal9').textContent = '65%';
    document.getElementById('smoothness9').value = 75;
    document.getElementById('smoothnessVal9').textContent = '75%';
    document.getElementById('hdquality9').value = 88;
    document.getElementById('hdqualityVal9').textContent = '88%';
    document.getElementById('depth9').value = 55;
    document.getElementById('depthVal9').textContent = '55%';
    document.getElementById('reverb9').value = 18;
    document.getElementById('reverbVal9').textContent = '18%';
    document.getElementById('echo9').value = 6;
    document.getElementById('echoVal9').textContent = '6%';
    speak();
}

async function playCharacter9(type) {
    const map = {
        hero: { voice: 'v9_stage', pitch: 1.1 },
        dragon: { voice: 'v8_dragon', pitch: 0.7 },
        ghost: { voice: 'v8_ghost', pitch: 1.2 }
    };
    const data = map[type] || map.hero;
    stop();
    const text = document.getElementById('text9')?.value || 'ПРИВЕТ';
    const volume = parseInt(document.getElementById('vol9')?.value || 90) / 100;
    playing = true; stopFlag = false;
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace || ph.isPunct) continue;
        document.getElementById('charDisplay').textContent = ph.char;
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, 120, volume, data.voice, data.pitch, true);
            else if (CONSONANTS[sound]) await playConsonant(sound, 80, volume, data.voice, data.pitch, ph.soft);
        }
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '✓'; document.getElementById('statusDisplay').textContent = '✅ Готово'; }
    playing = false;
}

async function playChipmunk9() {
    stop();
    const text = document.getElementById('text9')?.value || 'ПРИВЕТ';
    const volume = parseInt(document.getElementById('vol9')?.value || 90) / 100;
    playing = true; stopFlag = false;
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace || ph.isPunct) continue;
        document.getElementById('charDisplay').textContent = ph.char;
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, 60, volume, 'v3_girl', 2.5, true);
            else if (CONSONANTS[sound]) await playConsonant(sound, 40, volume, 'v3_girl', 2.5, ph.soft);
        }
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '🐿️'; document.getElementById('statusDisplay').textContent = '✅ Готово'; }
    playing = false;
}

async function playRobot9() {
    stop();
    const text = document.getElementById('text9')?.value || 'Я РОБОТ';
    const volume = parseInt(document.getElementById('vol9')?.value || 90) / 100;
    playing = true; stopFlag = false;
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace || ph.isPunct) { await delay(100); continue; }
        document.getElementById('charDisplay').textContent = ph.char;
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, 150, volume, 'robot', 1, true);
            else if (CONSONANTS[sound]) await playConsonant(sound, 100, volume, 'robot', 1, false);
        }
        await delay(50);
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '🤖'; document.getElementById('statusDisplay').textContent = '✅ Готово'; }
    playing = false;
}

// ===== V9.5 FUNCTIONS =====
function setEnvironment95(env) {
    const envButtons = document.querySelectorAll('.v95-only .env-btn');
    envButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = Array.from(envButtons).find(btn => btn.getAttribute('onclick')?.includes(env));
    if (activeBtn) activeBtn.classList.add('active');
    const envStat = document.getElementById('envStat95');
    const labels = {
        none: '🌍 Нет',
        studio: '🌍 Студия',
        hall: '🌍 Зал',
        cave: '🌍 Пещера',
        phone: '🌍 Телефон',
        radio: '🌍 Радио',
        stadium: '🌍 Стадион',
        underwater: '🌍 Под водой',
        space: '🌍 Космос',
        city: '🌍 Город',
        forest: '🌍 Лес',
        subway: '🌍 Метро',
        arena: '🌍 Арена',
        lofi: '🌍 Lo-Fi',
        broadcast: '🌍 Эфир',
        cathedral: '🌍 Собор'
    };
    if (envStat) envStat.textContent = labels[env] || '🌍 Студия';
}

function loadPreset95(preset) {
    const presets = {
        ultra: { clarity: 95, humanness: 97, sharpness: 82, smoothness: 85, reverb: 20, echo: 5, chorus: 10, hdquality: 95, autotune: 0, distortion: 0, spatial: 35, depth: 60 },
        cinema: { clarity: 90, humanness: 92, sharpness: 70, smoothness: 80, reverb: 35, echo: 10, chorus: 15, hdquality: 90, autotune: 0, distortion: 5, spatial: 40, depth: 55 },
        broadcast: { clarity: 92, humanness: 85, sharpness: 88, smoothness: 70, reverb: 10, echo: 8, chorus: 20, hdquality: 88, autotune: 0, distortion: 0, spatial: 25, depth: 45 },
        neon: { clarity: 85, humanness: 80, sharpness: 95, smoothness: 60, reverb: 25, echo: 18, chorus: 30, hdquality: 90, autotune: 15, distortion: 10, spatial: 45, depth: 50 },
        deep: { clarity: 80, humanness: 88, sharpness: 60, smoothness: 82, reverb: 45, echo: 12, chorus: 12, hdquality: 85, autotune: 0, distortion: 0, spatial: 30, depth: 70 },
        retro: { clarity: 55, humanness: 40, sharpness: 35, smoothness: 45, reverb: 15, echo: 20, chorus: 8, hdquality: 40, autotune: 5, distortion: 8, spatial: 20, depth: 35 },
        human: { clarity: 96, humanness: 98, sharpness: 65, smoothness: 90, reverb: 8, echo: 0, chorus: 6, hdquality: 92, autotune: 0, distortion: 0, spatial: 10, depth: 40 },
        crystal: { clarity: 98, humanness: 92, sharpness: 95, smoothness: 60, reverb: 18, echo: 6, chorus: 10, hdquality: 95, autotune: 5, distortion: 0, spatial: 35, depth: 45 },
        night: { clarity: 78, humanness: 94, sharpness: 55, smoothness: 88, reverb: 18, echo: 5, chorus: 5, hdquality: 86, autotune: 0, distortion: 0, spatial: 15, depth: 55 },
        stadium: { clarity: 82, humanness: 84, sharpness: 75, smoothness: 62, reverb: 55, echo: 25, chorus: 22, hdquality: 88, autotune: 0, distortion: 3, spatial: 55, depth: 65 },
        holo: { clarity: 88, humanness: 80, sharpness: 92, smoothness: 70, reverb: 22, echo: 12, chorus: 18, hdquality: 93, autotune: 8, distortion: 6, spatial: 40, depth: 55 },
        cinematic: { clarity: 91, humanness: 90, sharpness: 78, smoothness: 76, reverb: 28, echo: 10, chorus: 14, hdquality: 92, autotune: 0, distortion: 2, spatial: 35, depth: 60 }
    };
    const p = presets[preset] || presets.ultra;
    ['clarity', 'humanness', 'sharpness', 'smoothness', 'reverb', 'echo', 'chorus', 'hdquality', 'autotune', 'distortion', 'spatial', 'depth'].forEach(key => {
        const el = document.getElementById(key + '95');
        const valEl = document.getElementById(key + 'Val95');
        if (el && p[key] !== undefined) el.value = p[key];
        if (valEl && p[key] !== undefined) valEl.textContent = p[key] + '%';
    });
}

function hdEnhance95() {
    ['clarity95', 'humanness95', 'sharpness95', 'smoothness95', 'hdquality95', 'depth95'].forEach(id => {
        const el = document.getElementById(id);
        const valEl = document.getElementById(id.replace('95', 'Val95'));
        if (el) { el.value = 95; }
        if (valEl) { valEl.textContent = '95%'; }
    });
    document.getElementById('reverb95').value = 22;
    document.getElementById('reverbVal95').textContent = '22%';
    document.getElementById('chorus95').value = 18;
    document.getElementById('chorusVal95').textContent = '18%';
    document.getElementById('autotune95').value = 0;
    document.getElementById('autotuneVal95').textContent = '0%';
    document.getElementById('distortion95').value = 0;
    document.getElementById('distortionVal95').textContent = '0%';
    document.getElementById('spatial95').value = 35;
    document.getElementById('spatialVal95').textContent = '35%';
    speak();
}

function studioMode95() {
    document.getElementById('mode95').value = 'podcast';
    document.getElementById('voice95').value = 'v65_studio';
    document.getElementById('clarity95').value = 94;
    document.getElementById('clarityVal95').textContent = '94%';
    document.getElementById('humanness95').value = 98;
    document.getElementById('humannessVal95').textContent = '98%';
    document.getElementById('sharpness95').value = 66;
    document.getElementById('sharpnessVal95').textContent = '66%';
    document.getElementById('smoothness95').value = 82;
    document.getElementById('smoothnessVal95').textContent = '82%';
    document.getElementById('hdquality95').value = 92;
    document.getElementById('hdqualityVal95').textContent = '92%';
    document.getElementById('depth95').value = 58;
    document.getElementById('depthVal95').textContent = '58%';
    document.getElementById('reverb95').value = 16;
    document.getElementById('reverbVal95').textContent = '16%';
    document.getElementById('echo95').value = 6;
    document.getElementById('echoVal95').textContent = '6%';
    document.getElementById('autotune95').value = 0;
    document.getElementById('autotuneVal95').textContent = '0%';
    document.getElementById('distortion95').value = 0;
    document.getElementById('distortionVal95').textContent = '0%';
    document.getElementById('spatial95').value = 20;
    document.getElementById('spatialVal95').textContent = '20%';
    speak();
}

async function playCharacter95(type) {
    const map = {
        hero: { voice: 'v95_master', pitch: 1.1 },
        dragon: { voice: 'v8_dragon', pitch: 0.7 },
        ghost: { voice: 'v8_ghost', pitch: 1.2 }
    };
    const data = map[type] || map.hero;
    stop();
    const text = document.getElementById('text95')?.value || 'ПРИВЕТ';
    const volume = parseInt(document.getElementById('vol95')?.value || 95) / 100;
    playing = true; stopFlag = false;
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace || ph.isPunct) continue;
        document.getElementById('charDisplay').textContent = ph.char;
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, 120, volume, data.voice, data.pitch, true);
            else if (CONSONANTS[sound]) await playConsonant(sound, 80, volume, data.voice, data.pitch, ph.soft);
        }
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '✓'; document.getElementById('statusDisplay').textContent = '✅ Готово'; }
    playing = false;
}

async function playChipmunk95() {
    stop();
    const text = document.getElementById('text95')?.value || 'ПРИВЕТ';
    const volume = parseInt(document.getElementById('vol95')?.value || 95) / 100;
    playing = true; stopFlag = false;
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace || ph.isPunct) continue;
        document.getElementById('charDisplay').textContent = ph.char;
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, 60, volume, 'v3_girl', 2.5, true);
            else if (CONSONANTS[sound]) await playConsonant(sound, 40, volume, 'v3_girl', 2.5, ph.soft);
        }
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '🐿️'; document.getElementById('statusDisplay').textContent = '✅ Готово'; }
    playing = false;
}

async function playRobot95() {
    stop();
    const text = document.getElementById('text95')?.value || 'Я РОБОТ';
    const volume = parseInt(document.getElementById('vol95')?.value || 95) / 100;
    playing = true; stopFlag = false;
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace || ph.isPunct) { await delay(100); continue; }
        document.getElementById('charDisplay').textContent = ph.char;
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, 150, volume, 'robot', 1, true);
            else if (CONSONANTS[sound]) await playConsonant(sound, 100, volume, 'robot', 1, false);
        }
        await delay(50);
    }
    if (!stopFlag) { document.getElementById('charDisplay').textContent = '🤖'; document.getElementById('statusDisplay').textContent = '✅ Готово'; }
    playing = false;
}

// Init
let welcomePlayed = false;

async function sayWelcome() {
    if (welcomePlayed) return;
    welcomePlayed = true;

    try {
        getCtx();
        document.getElementById('statusDisplay').textContent = '🔊 Загрузка...';
        await delay(50);

        const welcomeText = 'ПРИВЕТ';
        const voice = 'v3_alex';
        const volume = 0.6;
        const speed = 120;

        playing = true;
        stopFlag = false;

        const phonemes = textToPhonemes(welcomeText);
        for (const ph of phonemes) {
            if (stopFlag) break;
            if (ph.isSpace || ph.isPunct) continue;
            document.getElementById('charDisplay').textContent = ph.char;
            for (const sound of ph.sounds) {
                if (stopFlag) break;
                if (VOWELS[sound]) await playVowel(sound, speed, volume, voice, 1, ph.stressed);
                else if (CONSONANTS[sound]) await playConsonant(sound, speed, volume, voice, 1, ph.soft);
            }
        }

        playing = false;
        document.getElementById('charDisplay').textContent = '✓';
        document.getElementById('statusDisplay').textContent = '✅ Готов';
    } catch (err) {
        console.error('Ошибка приветствия:', err);
        document.getElementById('statusDisplay').textContent = '✅ Готов';
    }
}

window.addEventListener('load', function () {
    document.getElementById('statusDisplay').textContent = '👆 Кликни чтобы активировать';

    document.body.addEventListener('click', function initHandler(e) {
        if (!e.target.closest('button') && !e.target.closest('select') &&
            !e.target.closest('input') && !e.target.closest('textarea')) {
            document.body.removeEventListener('click', initHandler);
            sayWelcome();
        }
    });

    document.body.addEventListener('click', function initAudio() {
        if (!audioCtx) getCtx();
        initNeuralViz(); // Initialize neural visualization context
    }, { once: true });
});

// V9.0 Easter Egg (Valera Jelly Bear)
let keySequence = [];
const SECRET_CODE = ['ж', 'м', 'в'];

document.addEventListener('keypress', function(e) {
    if (currentVersion !== 'v9') return;
    
    const key = e.key.toLowerCase();
    keySequence.push(key);
    
    if (keySequence.length > 3) keySequence.shift();
    
    if (keySequence.join('') === 'жмв') {
        playValera();
        keySequence = [];
    }
});

async function playValera() {
    stop();
    playing = true;
    stopFlag = false;
    
    const ctx = getCtx();
    const valeraImg = document.getElementById('valeraImg');
    
    // Показываем Валеру
    if (valeraImg) valeraImg.style.display = 'block';
    
    document.getElementById('charDisplay').textContent = '🐻';
    document.getElementById('statusDisplay').textContent = '🍬 ЖЕЛЕЙНЫЙ МЕДВЕДЬ ВАЛЕРА';
    
    // Play "DAI KONFETKU"
    const text = 'ДАЙ КОНФЕТКУ';
    const volume = 1.0;
    const speed = 110;
    const voice = 'v3_boy'; // High pitched like a gummy bear
    
    const phonemes = textToPhonemes(text);
    for (const ph of phonemes) {
        if (stopFlag) break;
        if (ph.isSpace) { await delay(100); continue; }
        
        // Bouncy character display
        document.getElementById('charDisplay').style.transform = `scale(${1 + Math.random() * 0.3})`;
        
        for (const sound of ph.sounds) {
            if (stopFlag) break;
            if (VOWELS[sound]) await playVowel(sound, speed, volume, voice, 1.8, ph.stressed); // High pitch
            else if (CONSONANTS[sound]) await playConsonant(sound, speed * 0.8, volume, voice, 1.8, ph.soft);
        }
        await delay(50);
    }
    
    document.getElementById('charDisplay').style.transform = 'scale(1)';
    
    if (!stopFlag) {
        await delay(200);
        // Funny closing sound
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.1);
        osc.type = 'triangle';
        g.gain.setValueAtTime(0.5, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
        
        document.getElementById('statusDisplay').textContent = '✅ Готов';
    }
    
    // Скрываем Валеру
    if (valeraImg) valeraImg.style.display = 'none';
    playing = false;
}

// V10 Functions
function studioMode10() {
    document.getElementById('mode10').value = 'podcast';
    document.getElementById('voice10').value = 'v10_actor';
    document.getElementById('reverb10').value = 15;
    document.getElementById('speed10').value = 140;
    document.getElementById('statusDisplay').textContent = '🎙️ Studio Mode Activated';
    speak();
}

function neuralBoost10() {
    alert('🧠 Neural Boost activated! Processing power allocated.');
    document.getElementById('stat10').textContent = 'Neural Boost ON';
    document.getElementById('speed10').value = 180;
    document.getElementById('clarity10').value = 100;
}

async function playCharacter10(type) {
    stop();
    const chars = {
        hero: { text: 'I AM THE HERO', voice: 'v8_hero', pitch: 1.0 },
        dragon: { text: 'ROARRRR', voice: 'v8_dragon', pitch: 0.6 },
        ghost: { text: 'BOOOO', voice: 'v8_ghost', pitch: 1.3 }
    };
    const c = chars[type] || chars.hero;
    document.getElementById('text10').value = c.text;
    document.getElementById('voice10').value = c.voice;
    speak();
}

// V11 Functions
function setEnvironment11(scene) {
    const presets = {
        studio: { reverb: 18, echo: 8, chorus: 12, spatial: 16, autotune: 8, distortion: 0 },
        cinema: { reverb: 38, echo: 18, chorus: 20, spatial: 35, autotune: 4, distortion: 0 },
        broadcast: { reverb: 12, echo: 6, chorus: 10, spatial: 12, autotune: 6, distortion: 0 },
        lofi: { reverb: 25, echo: 20, chorus: 22, spatial: 18, autotune: 0, distortion: 8 },
        space: { reverb: 45, echo: 30, chorus: 25, spatial: 45, autotune: 6, distortion: 0 },
        cathedral: { reverb: 55, echo: 22, chorus: 15, spatial: 40, autotune: 0, distortion: 0 },
        underwater: { reverb: 35, echo: 18, chorus: 30, spatial: 28, autotune: 0, distortion: 6 },
        stadium: { reverb: 48, echo: 24, chorus: 20, spatial: 42, autotune: 10, distortion: 0 },
        forest: { reverb: 20, echo: 12, chorus: 10, spatial: 18, autotune: 0, distortion: 0 },
        city: { reverb: 16, echo: 14, chorus: 12, spatial: 20, autotune: 6, distortion: 4 },
        none: { reverb: 0, echo: 0, chorus: 0, spatial: 0, autotune: 0, distortion: 0 }
    };
    const settings = presets[scene] || presets.studio;
    Object.entries(settings).forEach(([fx, val]) => {
        const el = document.getElementById(fx + '11');
        const valEl = document.getElementById(fx + 'Val11');
        if (el) {
            el.value = val;
            if (valEl) valEl.textContent = val + '%';
        }
    });
    const stat = document.getElementById('stat11');
    if (stat) stat.textContent = `Scene: ${scene}`;
    document.querySelectorAll('.v11-only .env-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.scene === scene);
    });
}

function studioMode11() {
    document.getElementById('mode11').value = 'podcast';
    document.getElementById('voice11').value = 'v11_neural_prime';
    document.getElementById('speed11').value = 150;
    document.getElementById('pitch11').value = 105;
    setEnvironment11('studio');
    document.getElementById('stat11').textContent = '🎙️ Studio Mode';
    speak();
}

function neuralBoost11() {
    alert('🧠 Neural Boost+ activated! HyperReal capacity online.');
    document.getElementById('stat11').textContent = 'Neural Boost+ ON';
    document.getElementById('speed11').value = 185;
    document.getElementById('clarity11').value = 100;
    document.getElementById('humanness11').value = 100;
    document.getElementById('clarityVal11').textContent = '100%';
    document.getElementById('humannessVal11').textContent = '100%';
}

function duetMode11() {
    document.getElementById('mode11').value = 'surround';
    document.getElementById('voice11').value = 'v11_neural_duo';
    document.getElementById('speed11').value = 165;
    setEnvironment11('broadcast');
    document.getElementById('stat11').textContent = '🎙️ Neural Duo';
    speak();
}

function cinemaMode11() {
    document.getElementById('mode11').value = 'cinema';
    document.getElementById('voice11').value = 'v11_neural_cinematic';
    document.getElementById('speed11').value = 145;
    document.getElementById('pitch11').value = 95;
    setEnvironment11('cinema');
    document.getElementById('stat11').textContent = '🎬 Cinema Mode';
    speak();
}

async function playCharacter11(type) {
    stop();
    const chars = {
        hero: { text: 'I AM THE HERO', voice: 'v11_neural_prime', pitch: 1.0 },
        dragon: { text: 'ROARRRR', voice: 'v8_dragon', pitch: 0.6 },
        ghost: { text: 'BOOOO', voice: 'v11_neural_whisper', pitch: 1.3 }
    };
    const c = chars[type] || chars.hero;
    document.getElementById('text11').value = c.text;
    document.getElementById('voice11').value = c.voice;
    speak();
}

// ===== V10 REAL NEURAL NETWORK =====

class MiniNeuralNet {
    constructor() {
        // Simple 3-layer network: Input (1) -> Hidden (4) -> Output (2: Pitch, Duration)
        // Weights are randomized to create unique "personality" for the run
        this.weights1 = Array(4).fill(0).map(() => Math.random() * 2 - 1);
        this.bias1 = Array(4).fill(0).map(() => Math.random() * 2 - 1);
        this.weights2 = Array(4).fill(0).map(() => [Math.random() * 2 - 1, Math.random() * 2 - 1]); // 4 hidden to 2 outputs
        this.bias2 = [Math.random() * 2 - 1, Math.random() * 2 - 1];
        this.memory = 0; // Recurrent part (LSTM-like simple memory)
    }

    // Tanh activation function
    activate(x) {
        return Math.tanh(x);
    }

    predict(inputVal) {
        // Input Layer -> Hidden Layer
        let hidden = [];
        for (let i = 0; i < 4; i++) {
            // Combine input with previous memory (Recurrent connection)
            let sum = (inputVal * this.weights1[i]) + (this.memory * 0.5) + this.bias1[i];
            hidden[i] = this.activate(sum);
        }

        // Hidden Layer -> Output Layer
        let outputs = [0, 0]; // Pitch, Duration
        for (let j = 0; j < 2; j++) {
            let sum = this.bias2[j];
            for (let i = 0; i < 4; i++) {
                sum += hidden[i] * this.weights2[i][j];
            }
            outputs[j] = this.activate(sum);
        }

        // Update memory for next step
        this.memory = hidden[0]; // Simplified memory update

        return {
            pitchMod: 1 + (outputs[0] * 0.15), // +/- 15% pitch variation
            durMod: 1 + (outputs[1] * 0.2)     // +/- 20% duration variation
        };
    }
}

class NeuralNetV11 {
    constructor() {
        this.weights1 = Array(6).fill(0).map(() => Math.random() * 2 - 1);
        this.bias1 = Array(6).fill(0).map(() => Math.random() * 2 - 1);
        this.weights2 = Array(6).fill(0).map(() => [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1]);
        this.bias2 = [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1];
        this.memory = [0, 0];
    }

    activate(x) {
        return Math.tanh(x);
    }

    predict(inputVal) {
        const hidden = [];
        for (let i = 0; i < 6; i++) {
            const memoryMix = (this.memory[0] + this.memory[1]) * 0.35;
            const sum = (inputVal * this.weights1[i]) + memoryMix + this.bias1[i];
            hidden[i] = this.activate(sum);
        }

        const outputs = [0, 0, 0];
        for (let j = 0; j < 3; j++) {
            let sum = this.bias2[j];
            for (let i = 0; i < 6; i++) {
                sum += hidden[i] * this.weights2[i][j];
            }
            outputs[j] = this.activate(sum);
        }

        this.memory = [hidden[1], hidden[4]];

        return {
            pitchMod: 1 + (outputs[0] * 0.22),
            durMod: 1 + (outputs[1] * 0.25),
            energyMod: 1 + (outputs[2] * 0.12)
        };
    }
}

const neuralNet = new MiniNeuralNet();
const neuralNetV11 = new NeuralNetV11();
const neuralCanvases = {
    v10: document.getElementById('neuralCanvas'),
    v11: document.getElementById('neuralCanvas11')
};
const neuralCtxMap = { v10: null, v11: null };

function initNeuralViz() {
    Object.entries(neuralCanvases).forEach(([key, canvas]) => {
        if (canvas) neuralCtxMap[key] = canvas.getContext('2d');
    });
}

function visualizeNeuralNet(active) {
    if (currentVersion !== 'v10' && currentVersion !== 'v11') return;
    const canvas = neuralCanvases[currentVersion];
    const ctx = neuralCtxMap[currentVersion];
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, w, h);
    
    if (!active) return;

    // Draw "Neurons"
    ctx.strokeStyle = currentVersion === 'v11' ? '#5b7cff' : '#0078d4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Fake connections animation
    for (let i = 0; i < 6; i++) {
        let x1 = Math.random() * w;
        let y1 = Math.random() * h;
        let x2 = Math.random() * w;
        let y2 = Math.random() * h;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    // Glowing nodes
    ctx.fillStyle = currentVersion === 'v11' ? '#7bffdf' : '#00ff00';
    for (let i = 0; i < 4; i++) {
        let x = Math.random() * w;
        let y = Math.random() * h;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Advanced Glottal Pulse Generator for V10 (Makes it sound like real vocal cords)
function createNeuralSource(ctx, freq) {
    // Creating a wavetable that mimics the Rosenberg glottal pulse (human voice source)
    const size = 4096;
    const real = new Float32Array(size);
    const imag = new Float32Array(size);
    
    // Generate harmonics for a buzz-like sound but richer
    for (let i = 1; i < size; i++) {
        // Spectral slope of human voice approx -12dB/octave
        const amp = 1 / Math.pow(i, 1.5); 
        real[i] = 0; // Cosine terms
        imag[i] = amp; // Sine terms
    }
    
    const wave = ctx.createPeriodicWave(real, imag);
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = freq;
    return osc;
}

function createNeuralSourceV11(ctx, freq) {
    const size = 4096;
    const real = new Float32Array(size);
    const imag = new Float32Array(size);
    
    for (let i = 1; i < size; i++) {
        const amp = 1 / Math.pow(i, 1.25);
        real[i] = Math.sin(i * 0.05) * 0.05;
        imag[i] = amp;
    }
    
    const wave = ctx.createPeriodicWave(real, imag);
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = freq;
    return osc;
}
