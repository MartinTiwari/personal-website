// ============================================================
//  ALL CV CONTENT LIVES HERE. Edit this file, nothing else.
//  Lines marked  <!-- EDIT ME -->  are placeholders to replace.
// ============================================================

export const CONTENT = {
  name: 'Martin Tiwari',
  email: 'martintiwari0@gmail.com',
  photo: 'assets/martin.jpg',

  socials: {
    github: 'https://github.com/YOUR-GITHUB',      // <!-- EDIT ME -->
    linkedin: 'https://linkedin.com/in/YOUR-LINKEDIN', // <!-- EDIT ME -->
  },

  about: {
    title: 'START — CHARACTER SELECT',
    idCard: [
      ['NAME', 'MARTIN TIWARI'],
      ['CLASS', 'DEVELOPER'],
      ['ALIGNMENT', 'CHAOTIC CURIOUS'],
      ['GUILD', 'B.Sc. COMPUTER SCIENCE'], // <!-- EDIT ME: your uni/college -->
      ['SPAWN POINT', 'EARTH, PROBABLY'],  // <!-- EDIT ME: your city -->
    ],
    bio: [
      // <!-- EDIT ME: 2–3 punchy lines about you -->
      `CS student. Builder of things slightly too ambitious for my current XP level — which is exactly how XP works.`,
      `Currently obsessed with: the web as a game engine, making computers do charming things, and shipping instead of planning to ship.`,
      `Projects: loading… you're looking at the first one.`,
    ],
  },

  // level: 0–100 (honest!), learning: true → pulses "UNLOCKING…"
  skills: {
    title: 'SKILL TREE',
    branches: [
      { name: 'LANGUAGES', items: [
        { name: 'JavaScript', level: 62 },            // <!-- EDIT ME -->
        { name: 'Python',     level: 55 },            // <!-- EDIT ME -->
        { name: 'C',          level: 40 },            // <!-- EDIT ME -->
      ]},
      { name: 'WEB', items: [
        { name: 'HTML / CSS', level: 70 },            // <!-- EDIT ME -->
        { name: 'Three.js',   level: 35 },            // <!-- EDIT ME -->
      ]},
      { name: 'TOOLS', items: [
        { name: 'Git & GitHub', level: 50 },          // <!-- EDIT ME -->
        { name: 'Linux',        level: 38 },          // <!-- EDIT ME -->
      ]},
      { name: 'CURRENTLY LEARNING', items: [
        { name: 'React',   level: 20, learning: true }, // <!-- EDIT ME -->
        { name: 'Node.js', level: 18, learning: true }, // <!-- EDIT ME -->
      ]},
    ],
  },

  quests: {
    title: 'QUEST LOG',
    items: [
      { tag: 'MAIN QUEST', main: true, status: 'IN PROGRESS',
        name: 'B.Sc. Computer Science',
        desc: 'Multi-year campaign. Boss fights every semester. Party members acquired along the way.' }, // <!-- EDIT ME: uni + years -->
      { tag: 'SIDE QUEST', status: 'COMPLETE',
        name: 'Self-taught web development',
        desc: 'Learned HTML, CSS and JS from the open internet. Tutorial hell: escaped.' }, // <!-- EDIT ME -->
      { tag: 'SIDE QUEST', status: 'COMPLETE',
        name: 'First hackathon',
        desc: 'Survived 24 hours on caffeine and false confidence. Would repeat.' }, // <!-- EDIT ME -->
      { tag: 'SIDE QUEST', status: 'IN PROGRESS',
        name: 'Ship real projects',
        desc: 'Step 1 was this website. Steps 2 through n: in the DLC pipeline below.' },
    ],
  },

  projects: {
    title: 'CONSTRUCTION SITE',
    flagship: {
      name: 'MARTIN.EXE — this website',
      desc: `A playable CV. Low-poly island built in code (zero texture files, zero 3D model downloads), vanilla Three.js + vanilla JS, custom character controller, terminal mode, and a full text-adventure fallback. You are standing in the first project.`,
    },
    dlc: [
      { name: 'PROJECT: ???', hint: 'unannounced DLC — in development' },   // <!-- EDIT ME -->
      { name: 'PROJECT: ???', hint: 'wishlisting opens soon' },             // <!-- EDIT ME -->
    ],
  },

  contact: {
    title: 'LAUNCH PAD',
    blurb: `Recruiting for your party? I'm accepting quest invites — internships, collabs, or just saying hi.`,
  },

  boot: [
    ['initializing human', 'OK'],
    ['downloading caffeine', '100%'],
    ['installing sleep', 'FAILED'],
    ['mounting /dev/ambition', 'OK'],
    ['loading world', 'OK'],
  ],
};
