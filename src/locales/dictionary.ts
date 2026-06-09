export type Locale = 'en' | 'zh';

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
            cta_about: 'About',
        },
        about: {
            title: 'About',
            subtitle: 'Identification',
            name: 'Otis Chang',
            role: 'Game Designer & Systems Architect',
            experience: 'A systems architect specializing in core rules and mathematical design, deriving infinite complexity from minimal mechanics.',
            contact_title: 'Website',
            website: 'https://ulsome.com',
            intro: 'Guiding players through precise systems and puzzles to dissect challenges and reflect on self and reality.',
        },
        projects: {
            title: 'Project Database',
            description: 'Participated projects.',
            status_released: 'Operational',
            status_dev: 'In Calibration',
            play: 'Initialize',
            games_list: [
                {
                    id: "super-real-ai",
                    title: "Super Real AI",
                    description: "Game Design.",
                    links: [
                        { platform: 'steam', url: 'https://store.steampowered.com/app/4077630/Super_Real_AI/' }
                    ],
                    tags: ["Simulation", "AI", "Dystopian", "Narrative"],
                    status: "comming soon",
                    thumbnailGradient: "from-cyan-950 to-slate-900",
                },
                {
                    id: "arie moonprayer",
                    title: "ARIE: Moonprayer",
                    description: "Level Design.",
                    links: [
                        { platform: 'steam', url: 'https://store.steampowered.com/app/2476690/ARIE/' }
                    ],
                    tags: ["Adventure", "Narrative", "Puzzle"],
                    status: "comming soon",
                    thumbnailGradient: "from-gray-600 to-slate-900",
                },
                {
                    id: "opus-echo",
                    title: "OPUS: Echo of Starsong",
                    description: "Level Design.",
                    links: [
                        { platform: 'steam', url: 'https://store.steampowered.com/app/1504500/OPUS/' }
                    ],
                    tags: ["Adventure", "Narrative", "Puzzle"],
                    status: "Released",
                    thumbnailGradient: "from-indigo-500 to-cyan-900",
                },
                {
                    id: "rocket-prologue",
                    title: "Rocket of Whispers: Prologue",
                    description: "Prototyping",
                    links: [
                        { platform: 'steam', url: 'https://store.steampowered.com/app/910460/Rocket_of_Whispers_Prologue/' }
                    ],
                    tags: ["Adventure"],
                    status: "Released",
                    thumbnailGradient: "from-gray-600 to-slate-900",
                },
                {
                    id: "realm-chronicle",
                    title: "Realm Chronicle Tactics",
                    description: "Character Narrative & Level Design.",
                    links: [
                        { platform: 'android', url: 'https://play.google.com/store/apps/details?id=com.sheena3d.rc&pcampaignid=web_share' }
                    ],
                    tags: ["SRPG", "Tactics", "Mobile"],
                    status: "Released",
                    thumbnailGradient: "from-red-600 to-orange-900",
                }
            ]
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
            cta_about: '關於',
        },
        about: {
            title: '關於',
            subtitle: '身份識別',
            name: 'Otis Chang',
            role: '遊戲設計師 & 系統架構師',
            experience: '專注於底層機制設計與數值評估，以極簡規則衍生無限變化的系統架構師。',
            contact_title: '官方網站',
            website: 'https://ulsome.com',
            intro: '透過嚴謹的系統與挑戰，引導玩家在解構謎題後，進一步思索自身與世界的關係。',
        },
        projects: {
            title: '專案資料庫',
            description: '參與專案。',
            status_released: '運行中',
            status_dev: '校準中',
            play: '前往',
            games_list: [
                {
                    id: "super-real-ai",
                    title: "Super Real AI",
                    description: "遊戲設計",
                    links: [
                        { platform: 'steam', url: 'https://store.steampowered.com/app/4077630/Super_Real_AI/' }
                    ],
                    tags: ["模擬", "AI", "反烏托邦", "敘事"],
                    status: "comming soon",
                    thumbnailGradient: "from-cyan-950 to-slate-900",
                },
                {
                    id: "arie moonprayer",
                    title: "月詠",
                    description: "關卡設計",
                    links: [
                        { platform: 'steam', url: 'https://store.steampowered.com/app/2476690/ARIE/' }
                    ],
                    tags: ["冒險", "敘事", "解謎"],
                    status: "comming soon",
                    thumbnailGradient: "from-gray-600 to-slate-900",
                },
                {
                    id: "opus-echo",
                    title: "OPUS：龍脈常歌",
                    description: "關卡設計",
                    links: [
                        { platform: 'steam', url: 'https://store.steampowered.com/app/1504500/OPUS/' }
                    ],
                    tags: ["冒險", "敘事", "解謎"],
                    status: "Released",
                    thumbnailGradient: "from-indigo-500 to-cyan-900",
                },
                {
                    id: "rocket-prologue",
                    title: "靈魂之橋 前傳",
                    description: "原型製作",
                    links: [
                        { platform: 'steam', url: 'https://store.steampowered.com/app/910460/Rocket_of_Whispers_Prologue/' }
                    ],
                    tags: ["冒險"],
                    status: "Released",
                    thumbnailGradient: "from-gray-600 to-slate-900",
                },
                {
                    id: "realm-chronicle",
                    title: "境界之詩 Tactics",
                    description: "角色劇情 故事設計 關卡設計 數值設計",
                    links: [
                        { platform: 'android', url: 'https://play.google.com/store/apps/details?id=com.sheena3d.rc&pcampaignid=web_share' }
                    ],
                    tags: ["SRPG", "戰棋", "Mobile"],
                    status: "Released",
                    thumbnailGradient: "from-red-600 to-orange-900",
                }
            ]
        },
    },
};
