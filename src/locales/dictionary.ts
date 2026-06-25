export type Locale = 'en' | 'zh';

export type GamePlatform = 'steam' | 'android' | 'ios' | 'web';

export interface GameLink {
    platform: GamePlatform;
    url: string;
}

export type GameStatus = 'Released' | 'Coming Soon';

export interface Game {
    id: string;
    title: string;
    description: string;
    tags: string[];
    status: GameStatus;
    links: GameLink[];
    thumbnailGradient: string;
}

// Structural data shared by every locale — edit links/status/etc. once here.
const gamesBase: Omit<Game, 'title' | 'description' | 'tags'>[] = [
    {
        id: "super-real-ai",
        status: "Coming Soon",
        links: [
            { platform: 'steam', url: 'https://store.steampowered.com/app/4077630/Super_Real_AI/' }
        ],
        thumbnailGradient: "from-cyan-950 to-slate-900",
    },
    {
        id: "arie-moonprayer",
        status: "Coming Soon",
        links: [
            { platform: 'steam', url: 'https://store.steampowered.com/app/2476690/ARIE/' }
        ],
        thumbnailGradient: "from-gray-600 to-slate-900",
    },
    {
        id: "opus-echo",
        status: "Released",
        links: [
            { platform: 'steam', url: 'https://store.steampowered.com/app/1504500/OPUS/' }
        ],
        thumbnailGradient: "from-indigo-500 to-cyan-900",
    },
    {
        id: "rocket-prologue",
        status: "Released",
        links: [
            { platform: 'steam', url: 'https://store.steampowered.com/app/910460/Rocket_of_Whispers_Prologue/' }
        ],
        thumbnailGradient: "from-gray-600 to-slate-900",
    },
    {
        id: "realm-chronicle",
        status: "Released",
        links: [
            { platform: 'android', url: 'https://play.google.com/store/apps/details?id=com.sheena3d.rc&pcampaignid=web_share' }
        ],
        thumbnailGradient: "from-red-600 to-orange-900",
    },
];

interface GameText {
    title: string;
    description: string;
    tags: string[];
}

const gamesText: Record<Locale, Record<string, GameText>> = {
    en: {
        "super-real-ai": {
            title: "Super Real AI",
            description: "Game Design.",
            tags: ["Simulation", "AI", "Dystopian", "Narrative"],
        },
        "arie-moonprayer": {
            title: "ARIE: Moonprayer",
            description: "Level Design.",
            tags: ["Adventure", "Narrative", "Puzzle"],
        },
        "opus-echo": {
            title: "OPUS: Echo of Starsong",
            description: "Level Design.",
            tags: ["Adventure", "Narrative", "Puzzle"],
        },
        "rocket-prologue": {
            title: "Rocket of Whispers: Prologue",
            description: "Prototyping.",
            tags: ["Adventure"],
        },
        "realm-chronicle": {
            title: "Realm Chronicle Tactics",
            description: "Character Narrative, Story, Level & Systems Design.",
            tags: ["SRPG", "Tactics", "Mobile"],
        },
    },
    zh: {
        "super-real-ai": {
            title: "Super Real AI",
            description: "遊戲設計",
            tags: ["模擬", "AI", "反烏托邦", "敘事"],
        },
        "arie-moonprayer": {
            title: "月詠",
            description: "關卡設計",
            tags: ["冒險", "敘事", "解謎"],
        },
        "opus-echo": {
            title: "OPUS:龍脈常歌",
            description: "關卡設計",
            tags: ["冒險", "敘事", "解謎"],
        },
        "rocket-prologue": {
            title: "靈魂之橋 前傳",
            description: "原型製作",
            tags: ["冒險"],
        },
        "realm-chronicle": {
            title: "境界之詩 Tactics",
            description: "角色劇情、故事設計、關卡設計、數值設計",
            tags: ["SRPG", "戰棋", "Mobile"],
        },
    },
};

const buildGamesList = (locale: Locale): Game[] =>
    gamesBase.map((base) => ({ ...base, ...gamesText[locale][base.id] }));

export const dictionary = {
    en: {
        nav: {
            home: 'HQ',
            games: 'Projects',
            blog: 'Journal',
            about: 'About',
        },
        home: {
            title: 'ULSOME',
            subtitle: '',
            description: 'Indie Game Development focused on elegant rules and deep reflection',
            cta_projects: 'Inspect Projects',
            cta_blog: 'Journal',
            cta_about: 'About',
        },
        about: {
            title: 'About',
            subtitle: 'Identification',
            name: 'Otis Chang',
            role: 'Game Designer & Systems Architect',
            experience: 'Specializing in core rules and mathematical design, deriving complexity from minimal mechanics.',
            contact_title: 'Website',
            website: 'https://ulsome.com',
            intro: 'Dissect challenges and reflect on self and reality.',
        },
        blog: {
            title: 'Journal',
            description: 'Development logs and design notes.',
            back_home: '← Return HQ',
            back_to_list: '← Back to Journal',
            empty: 'No entries logged yet.',
            thanks: 'Thanks for reading!',
        },
        projects: {
            title: 'Project Database',
            description: 'Selected projects I have worked on.',
            status_released: 'Operational',
            status_dev: 'In Calibration',
            play: 'Initialize',
            games_list: buildGamesList('en'),
        },
    },
    zh: {
        nav: {
            home: '總部',
            games: '專案庫',
            blog: '日誌',
            about: '關於',
        },
        home: {
            title: 'ULSOME',
            subtitle: '',
            description: '專注於極簡規則與深度思考的獨立遊戲開發',
            cta_projects: '檢視專案',
            cta_blog: '日誌',
            cta_about: '關於',
        },
        about: {
            title: '關於',
            subtitle: '身份識別',
            name: 'Otis Chang',
            role: '遊戲設計師 & 系統架構師',
            experience: '專注於底層機制設計，以極簡規則衍生變化的系統架構師。',
            contact_title: '官方網站',
            website: 'https://ulsome.com',
            intro: '解構謎題後，進一步思索自身與世界的關係。',
        },
        blog: {
            title: '日誌',
            description: '開發日誌與設計筆記。',
            back_home: '← 返回總部',
            back_to_list: '← 返回日誌',
            empty: '尚無日誌紀錄。',
            thanks: '感謝閱讀！',
        },
        projects: {
            title: '專案資料庫',
            description: '參與製作的專案。',
            status_released: '運行中',
            status_dev: '校準中',
            play: '前往',
            games_list: buildGamesList('zh'),
        },
    },
};
