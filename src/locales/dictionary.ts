export type Locale = 'en' | 'zh';

export type GamePlatform = 'steam' | 'android' | 'ios' | 'web';

export interface GameLink {
    platform: GamePlatform;
    url: string;
}

export type GameStatus = 'Released' | 'Coming Soon';

export type GameCategory = 'past' | 'developing' | 'prototype';

export interface Game {
    id: string;
    category: GameCategory;
    title: string;
    role: string;
    description: string;
    details?: string[];
    tags: string[];
    status: GameStatus;
    links: GameLink[];
    thumbnailGradient: string;
}

// Structural data shared by every locale — edit links/status/category once here.
const gamesBase: Omit<Game, 'title' | 'role' | 'description' | 'details' | 'tags'>[] = [
    {
        id: "super-real-ai",
        category: "developing",
        status: "Coming Soon",
        links: [
            { platform: 'steam', url: 'https://store.steampowered.com/app/4077630/Super_Real_AI/' }
        ],
        thumbnailGradient: "from-cyan-950 to-slate-900",
    },
    {
        id: "arie-moonprayer",
        category: "past",
        status: "Coming Soon",
        links: [
            { platform: 'steam', url: 'https://store.steampowered.com/app/2476690/ARIE/' }
        ],
        thumbnailGradient: "from-gray-600 to-slate-900",
    },
    {
        id: "opus-echo",
        category: "past",
        status: "Released",
        links: [
            { platform: 'steam', url: 'https://store.steampowered.com/app/1504500/OPUS/' }
        ],
        thumbnailGradient: "from-indigo-500 to-cyan-900",
    },
    {
        id: "rocket-prologue",
        category: "past",
        status: "Released",
        links: [
            { platform: 'steam', url: 'https://store.steampowered.com/app/910460/Rocket_of_Whispers_Prologue/' }
        ],
        thumbnailGradient: "from-gray-600 to-slate-900",
    },
    {
        id: "realm-chronicle",
        category: "past",
        status: "Released",
        links: [
            { platform: 'android', url: 'https://play.google.com/store/apps/details?id=com.sheena3d.rc&pcampaignid=web_share' }
        ],
        thumbnailGradient: "from-red-600 to-orange-900",
    },
    {
        id: "chrono-echo",
        category: "prototype",
        status: "Released",
        links: [
            { platform: 'web', url: '/play/chrono-echo/index.html' }
        ],
        thumbnailGradient: "from-cyan-700 to-slate-900",
    },
];

interface GameText {
    title: string;
    role: string;
    description: string;
    details?: string[];
    tags: string[];
}

const gamesText: Record<Locale, Record<string, GameText>> = {
    en: {
        "super-real-ai": {
            title: "Super Real AI",
            role: "Game Design",
            description: "",
            details: [
                "Game Design"
            ],
            tags: ["Simulation", "AI", "Dystopian", "Narrative"],
        },
        "arie-moonprayer": {
            title: "ARIE: Moonprayer",
            role: "Environment Design · Puzzle Design",
            description: "",
            details: [
                "Environment Design",
                "Puzzle Design"
            ],
            tags: ["Adventure", "Narrative", "Puzzle"],
        },
        "opus-echo": {
            title: "OPUS: Echo of Starsong",
            role: "Level Design",
            description: "",
            details: [
                "Level Design"
            ],
            tags: ["Adventure", "Narrative", "Puzzle"],
        },
        "rocket-prologue": {
            title: "Rocket of Whispers: Prologue",
            role: "Prototype",
            description: "",
            details: [
                "prototype"
            ],
            tags: ["Adventure"],
        },
        "realm-chronicle": {
            title: "Realm Chronicle Tactics",
            role: "Level Design · Numerical Design · Narrative Design",
            description: "",
            details: [
                "Level Design",
                "Numerical Design",
                "Narrative Design"
            ],
            tags: ["SRPG", "Tactics", "Mobile"],
        },
        "chrono-echo": {
            title: "Chrono Echo: 10s Rewind",
            role: "Solo Design & Prototype",
            description: "A stage-based 2D puzzle platformer where you have 10 seconds to reach the goal. Triggering a Rewind (or touching a trap with Rewind charges left) resets the clock while your past self replays its actions and freezes in place as a solid foothold or laser shield.",
            details: [
                "10-Second Goal Door Timer",
                "Solid Echo Obstacle & Foothold (Manual Rewind & Auto-Rewind on Trap Death)",
                "Spike & Raycast Laser Traps"
            ],
            tags: ["2D Platformer", "Time Loop", "Puzzle", "Web Playable"],
        },
    },
    zh: {
        "super-real-ai": {
            title: "Super Real AI",
            role: "遊戲設計",
            description: "",
            details: [
                "遊戲設計"
            ],
            tags: ["模擬", "AI", "反烏托邦", "敘事"],
        },
        "arie-moonprayer": {
            title: "月詠",
            role: "環境設計 · 謎題設計",
            description: "",
            details: [
                "環境設計",
                "謎題設計"
            ],
            tags: ["冒險", "敘事", "解謎"],
        },
        "opus-echo": {
            title: "OPUS:龍脈常歌",
            role: "關卡設計",
            description: "",
            details: [
                "關卡設計"
            ],
            tags: ["冒險", "敘事", "解謎"],
        },
        "rocket-prologue": {
            title: "靈魂之橋 前傳",
            role: "prototype",
            description: "",
            details: [
                "prototype"
            ],
            tags: ["冒險"],
        },
        "realm-chronicle": {
            title: "境界之詩 Tactics",
            role: "關卡設計 · 數值設計 · 劇情設計",
            description: "",
            details: [
                "關卡設計",
                "數值設計",
                "劇情設計"
            ],
            tags: ["SRPG", "戰棋", "Mobile"],
        },
        "chrono-echo": {
            title: "時空殘響 Chrono Echo",
            role: "獨立設計與開發",
            description: "關卡制 10 秒限時 2D 平台解謎。當發動回溯（或觸碰陷阱觸發死亡自動回溯）後，上一輪的自己會重現動作並在終點定格為實體——可作為立足踏板或幫下一輪的自己擋住致命死光。",
            details: [
                "目標門 10 秒倒數計時器",
                "回溯瞬間定格為四向實體（立足點與障礙物）＆ 死亡自動回溯",
                "致命尖刺與即時遮擋雷射陷阱"
            ],
            tags: ["2D平台解謎", "時間回溯", "原型", "網頁可玩"],
        },
    },
};

const buildGamesList = (locale: Locale): Game[] =>
    gamesBase.map((base) => ({ ...base, ...gamesText[locale][base.id] }));

export const dictionary = {
    en: {
        common: {
            back_home: '← Return HQ',
        },
        nav: {
            home: 'HQ',
            games: 'Projects',
            about: 'About',
        },
        home: {
            title: 'ULSOME',
            subtitle: '',
            description: 'Indie Game Development focused on elegant rules and deep reflection',
            cta_projects: 'Inspect Projects',
            cta_about: 'About',
        },
        about: {
            title: 'About',
            subtitle: 'Identification',
            name: 'Otis Chang',
            role: 'Game Designer & Systems Architect',
            experience: 'Level Design · Numerical Design',
            contact_title: 'Website',
            website: 'https://ulsome.com',
            intro: '',
        },
        projects: {
            title: 'Project Database',
            description: 'Selected projects and interactive prototypes.',
            categories: {
                past: 'Past Projects',
                developing: 'In Development',
                prototype: 'Prototypes',
            },
            contribution_label: 'DESIGN & CONTRIBUTION // ROLE & DETAILS',
            empty_category: 'NO RECORDS IN THIS ARCHIVE // AWAITING CALIBRATION',
            status_released: 'Operational',
            status_dev: 'In Calibration',
            play: 'Initialize',
            games_list: buildGamesList('en'),
        },
    },
    zh: {
        common: {
            back_home: '← 返回總部',
        },
        nav: {
            home: '總部',
            games: '專案庫',
            about: '關於',
        },
        home: {
            title: 'ULSOME',
            subtitle: '',
            description: '專注於極簡規則與深度思考的獨立遊戲開發',
            cta_projects: '檢視專案',
            cta_about: '關於',
        },
        about: {
            title: '關於',
            subtitle: '身份識別',
            name: 'Otis Chang',
            role: '遊戲設計師 & 系統架構師',
            experience: '關卡設計 數值設計',
            contact_title: '官方網站',
            website: 'https://ulsome.com',
            intro: '',
        },
        projects: {
            title: '專案資料庫',
            description: '參與製作的專案與獨立開發實驗。',
            categories: {
                past: '過去參與',
                developing: '正在開發',
                prototype: 'Prototype',
            },
            contribution_label: 'DESIGN & CONTRIBUTION // 負責與參與設計內容',
            empty_category: '目前尚無公開的原型紀錄 // AWAITING CALIBRATION',
            status_released: '運行中',
            status_dev: '校準中',
            play: '前往',
            games_list: buildGamesList('zh'),
        },
    },
};
