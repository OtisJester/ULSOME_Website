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
            description: "Game and systems design for a dystopian AI simulation title, crafting interaction rules, feedback loops, and systemic constraints that drive narrative tension.",
            details: [
                "Core Mechanics: Designed minimal yet expressive decision-making and state progression rules.",
                "Systemic Narrative: Aligned mechanical actions and metric shifts with world-building and character psychology."
            ],
            tags: ["Simulation", "AI", "Dystopian", "Narrative"],
        },
        "arie-moonprayer": {
            title: "ARIE: Moonprayer",
            role: "Level Design",
            description: "Spatial layout and puzzle sequence design, blending environmental guidance with emotional pacing so players intuit mechanics naturally as the journey unfolds.",
            details: [
                "Spatial Storytelling: Utilized composition and environmental cues to guide player movement.",
                "Puzzle Pacing: Balanced exploration, puzzle solving, and narrative beats."
            ],
            tags: ["Adventure", "Narrative", "Puzzle"],
        },
        "opus-echo": {
            title: "OPUS: Echo of Starsong",
            role: "Level Design",
            description: "Level design for asteroid ruin exploration and puzzle progression, ensuring mechanics resonated closely with the narrative and emotional arc.",
            details: [
                "Exploration & Puzzle Flow: Built atmospheric ruin layouts emphasizing discovery and immersion.",
                "Cross-Disciplinary Polish: Collaborated closely with narrative, art, and audio teams on interactive set-pieces."
            ],
            tags: ["Adventure", "Narrative", "Puzzle"],
        },
        "rocket-prologue": {
            title: "Rocket of Whispers: Prologue",
            role: "Prototyping",
            description: "Rapid gameplay and interaction prototyping during early production to validate core exploration pacing and tactile feel.",
            details: [
                "Rapid Iteration: Built playable greybox prototypes to test environmental interactions and story triggers."
            ],
            tags: ["Adventure"],
        },
        "realm-chronicle": {
            title: "Realm Chronicle Tactics",
            role: "Character Narrative · Story · Level & Systems Design",
            description: "Contributed across multiple design pillars for this tactical SRPG, covering main and character story writing, grid-based tactical stage design, and combat balance tuning.",
            details: [
                "Tactical Stage Design: Combined terrain elevation, elemental affinities, and custom win conditions for strategic depth.",
                "Narrative & Combat Synergy: Integrated character backstories directly into unique skill kits and stat archetypes."
            ],
            tags: ["SRPG", "Tactics", "Mobile"],
        },
        "chrono-echo": {
            title: "Chrono Echo: 10s Rewind",
            role: "Solo Design & Prototype",
            description: "A stage-based 2D puzzle platformer where you have 10 seconds to reach the goal. Triggering a Rewind resets the clock while your past self replays its exact actions and freezes in place — serving as a physical foothold or switch-holder for your next loop.",
            details: [
                "Self-Stepping Platforming: Jump and rewind in mid-air to freeze your past echo as a stepping stone or stack multiple echoes into a human ladder.",
                "Temporal Co-op Puzzles: Anchor echoes onto pressure plates to hold laser gates open while your current self sprints to the goal within 10 seconds."
            ],
            tags: ["2D Platformer", "Time Loop", "Puzzle", "Web Playable"],
        },
    },
    zh: {
        "super-real-ai": {
            title: "Super Real AI",
            role: "遊戲設計",
            description: "負責核心玩法架構與系統機制設計。在這個反烏托邦 AI 模擬遊戲中，規劃玩家與 AI 之間的互動規則、資源反饋迴路，以及透過系統限制引導出的敘事張力。",
            details: [
                "核心機制定義：建立極簡但具深度的決策與狀態演進規則。",
                "敘事與系統融合：讓每一次操作與數據變化直接反映世界觀與角色心理。"
            ],
            tags: ["模擬", "AI", "反烏托邦", "敘事"],
        },
        "arie-moonprayer": {
            title: "月詠",
            role: "關卡設計",
            description: "負責遊戲內的空間動線與解謎關卡設計，結合視覺引導與情緒節奏，讓玩家在探索過程中自然理解規則並推進劇情。",
            details: [
                "空間敘事與視角引導：運用場景構圖與光影變化提示互動線索。",
                "謎題節奏編排：平衡探索、解謎思考與劇情演出的體驗曲線。"
            ],
            tags: ["冒險", "敘事", "解謎"],
        },
        "opus-echo": {
            title: "OPUS:龍脈常歌",
            role: "關卡設計",
            description: "參與小行星與遺跡探索的關卡設計及解謎流程規劃，確保謎題機制緊密貼合劇本情感，維持流暢且具沉浸感的敘事體驗。",
            details: [
                "遺跡探索與解謎動線設計：強化探索未知領域的驚奇感與儀式感。",
                "跨職能協作：與編劇、美術、音效團隊密切配合，打磨演出與互動細節。"
            ],
            tags: ["冒險", "敘事", "解謎"],
        },
        "rocket-prologue": {
            title: "靈魂之橋 前傳",
            role: "原型製作",
            description: "負責前期玩法與互動機制的快速原型驗證（Prototyping），協助團隊在開發初期確立核心探索節奏與操作手感。",
            details: [
                "快速迭代驗證：建立可玩原型測試場景互動與敘事觸發流程。"
            ],
            tags: ["冒險"],
        },
        "realm-chronicle": {
            title: "境界之詩 Tactics",
            role: "角色劇情、故事設計、關卡設計、數值設計",
            description: "參與這款經典戰棋 SRPG 的多項核心設計工作，涵蓋主線與角色支線劇本撰寫、戰棋地形與敵我配置關卡設計，以及角色技能與戰鬥平衡數值調校。",
            details: [
                "戰棋關卡與 AI 行為配置：結合地形高低差、屬性相剋與特殊勝利條件創造策略深度。",
                "角色敘事與數值整合：讓每位夥伴的性格背景與專屬技能組、數值定位相輔相成。"
            ],
            tags: ["SRPG", "戰棋", "Mobile"],
        },
        "chrono-echo": {
            title: "時空殘響 Chrono Echo",
            role: "獨立設計與開發",
            description: "關卡制 10 秒限時 2D 平台解謎。當角色發動「時間回溯」後，關卡倒數重置回 10 秒，而上一輪的自己會化為幻影重現剛才的走位與跳躍並定格原地——讓現在的你能踩著過去的自己跳上高台，或與過去的自己合作解開機關。",
            details: [
                "過去之我即立足點：在半空跳躍最高點按下回溯，即可將幻影定格為空中踏板，甚至可疊加多輪幻影搭出通天人梯。",
                "跨時空雙人協作：共收錄 6 個循序漸進的解謎關卡，結合重量壓板與雷射閘門，支援 PC 鍵盤與手機觸控直接遊玩。"
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
