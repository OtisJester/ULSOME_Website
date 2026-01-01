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
            description: 'Indie Game Development',
            cta_projects: 'Inspect Projects',
            cta_about: 'About',
        },
        about: {
            title: 'About',
            subtitle: 'Identification',
            name: 'Otis Chang',
            role: 'Game Developer',
            experience: '10+ Years Game Development Experience',
            contact_title: 'Contact',
            email: 'otisjester@gmail.com',
            intro: 'Dedicated to crafting immersive game experiences with precision and passion.',
        },
        projects: {
            title: 'Project Database',
            description: 'Participated projects.',
            status_released: 'Operational',
            status_dev: 'In Calibration',
            play: 'Initialize',
            games_list: [
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
            description: '',
            cta_projects: '檢視專案',
            cta_about: '關於',
        },
        about: {
            title: '關於',
            subtitle: '身份識別',
            name: 'Otis Chang',
            role: '遊戲開發',
            experience: '10+ 年 遊戲開發經驗\n數值設計\n敘事設計\n關卡設計',
            contact_title: '聯絡方式',
            email: 'otisjester@gmail.com',
            intro: '致力於創作融合多樣要素與挑戰的策略遊戲。',
        },
        projects: {
            title: '專案資料庫',
            description: '參與專案。',
            status_released: '運行中',
            status_dev: '校準中',
            play: '前往',
            games_list: [
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
