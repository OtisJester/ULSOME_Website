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
    {
        id: "grid-hanoi",
        status: "Released",
        links: [
            { platform: 'web', url: '/games/grid-hanoi' }
        ],
        thumbnailGradient: "from-violet-600 to-slate-900",
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
        "grid-hanoi": {
            title: "Grid Hanoi: Spatial Leap",
            description: "A bipartite-grid Hanoi puzzle — disks leap over smaller neighbors to reach spatial targets.",
            tags: ["Puzzle", "Prototype", "Web"],
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
        "grid-hanoi": {
            title: "矩陣河內塔：空間躍遷",
            description: "棋盤化河內塔解謎，圓盤可躍過較小鄰居抵達目標格。",
            tags: ["解謎", "原型", "網頁"],
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
            experience: 'Specializing in core rules and mathematical design, deriving complexity from minimal mechanics.',
            contact_title: 'Website',
            website: 'https://ulsome.com',
            intro: 'Dissect challenges and reflect on self and reality.',
        },
        projects: {
            title: 'Project Database',
            description: 'Selected projects I have worked on.',
            status_released: 'Operational',
            status_dev: 'In Calibration',
            play: 'Initialize',
            games_list: buildGamesList('en'),
        },
        gridHanoi: {
            title: 'Grid Hanoi: Spatial Leap',
            subtitle: 'Bipartite Grid Hanoi Puzzle',
            concept: [
                'A Hanoi tower puzzle unfolded onto a grid. Disks scattered across the board must be restacked, largest to smallest, on designated target cells.',
                'Movement is bipartite: a disk steps one cell at a time, horizontally or vertically — never diagonally. But when the next cell holds a smaller disk, the current disk can leap over it, landing one cell further, as long as the landing cell is empty or holds a larger disk.',
                'That single leap rule turns a linear puzzle into a spatial one: solving now means reading the whole board, not just one tower.',
            ],
            rules_title: 'Core Rules',
            rules: [
                'Size limit: a larger disk can never rest on a smaller one.',
                'Grid movement: disks move exactly one cell per step, along a row or column.',
                'Spatial leap: a smaller neighboring disk can be jumped over to the next cell beyond it.',
            ],
            play_cta: 'Play Now',
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
            experience: '專注於底層機制設計，以極簡規則衍生變化的系統架構師。',
            contact_title: '官方網站',
            website: 'https://ulsome.com',
            intro: '解構謎題後，進一步思索自身與世界的關係。',
        },
        projects: {
            title: '專案資料庫',
            description: '參與製作的專案。',
            status_released: '運行中',
            status_dev: '校準中',
            play: '前往',
            games_list: buildGamesList('zh'),
        },
        gridHanoi: {
            title: '矩陣河內塔：空間躍遷',
            subtitle: '棋盤化二分移動河內塔解謎',
            concept: [
                '將河內塔攤開在棋盤上：散落各處的圓盤，必須依大小順序重新堆疊到指定的目標格。',
                '移動規則採二分制——圓盤每次只能沿橫向或縱向移動一格，不能斜走。但當前進方向的鄰格恰好停著比自己小的圓盤時，可以直接躍過它，落到再往前一格，前提是落點必須是空格，或停著比自己大的圓盤。',
                '這條躍遷規則讓原本線性的河內塔問題變成了空間問題——破解的關鍵不再是單一塔柱，而是整張棋盤的佈局。',
            ],
            rules_title: '核心規則',
            rules: [
                '大小限制：大圓盤絕對不能疊在小圓盤上面。',
                '網格移動：圓盤每次只能沿橫向或縱向移動一格。',
                '空間躍遷：可以跳過相鄰的較小圓盤，落到它後面一格。',
            ],
            play_cta: '開始遊戲',
        },
    },
};
