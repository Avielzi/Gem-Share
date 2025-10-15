import { GemCategory } from '../types.ts';
import type { Gem } from '../types.ts';

// FIX: Replaced placeholder content with an array of starter Gem objects. This resolves module loading errors in other files and provides default data for new users.
export const starterGems: Omit<Gem, 'id' | 'integrity'>[] = [
  // --- Original 3 ---
  {
    name: { en: 'Social Media Post Idea Generator', he: 'מחולל רעיונות לפוסטים לרשתות חברתיות' },
    description: { en: 'Generates creative ideas for social media posts based on a topic and target audience.', he: 'מייצר רעיונות יצירתיים לפוסטים ברשתות חברתיות על בסיס נושא וקהל יעד.' },
    version: '1.0.0',
    category: GemCategory.MARKETING,
    icon: 'Megaphone',
    color: '#a855f7',
    tags: ['social media', 'content creation', 'marketing'],
    inputs: [
      { key: 'topic', label: { en: 'Topic', he: 'נושא' }, type: 'string', required: true },
      { key: 'audience', label: { en: 'Target Audience', he: 'קהל יעד' }, type: 'string', required: true }
    ],
    prompt: {
      enc: false,
      content: 'Generate 5 creative social media post ideas for the topic "{{topic}}". The target audience is {{audience}}. For each idea, provide a catchy headline and a brief description.'
    },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' },
  },
  {
    name: { en: 'Code Refactoring Assistant', he: 'עוזר לשיפור קוד' },
    description: { en: 'Analyzes a code snippet and suggests improvements for readability, performance, and best practices.', he: 'מנתח קטע קוד ומציע שיפורים לקריאות, ביצועים, ושיטות עבודה מומלצות.' },
    version: '1.1.0',
    category: GemCategory.CODE,
    icon: 'Code',
    color: '#3b82f6',
    tags: ['programming', 'code review', 'refactoring', 'development'],
    inputs: [
        { key: 'language', label: { en: 'Programming Language', he: 'שפת תכנות' }, type: 'string', required: true },
        { key: 'code_snippet', label: { en: 'Code Snippet', he: 'קטע קוד' }, type: 'textarea', required: true }
    ],
    prompt: {
        enc: false,
        content: 'Act as a senior software engineer. Analyze the following {{language}} code snippet and provide suggestions for refactoring. Focus on improving readability, performance, and adherence to best practices. Explain the reasoning behind each suggestion.\n\n```{{language}}\n{{code_snippet}}\n```'
    },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2023-01-02T00:00:00.000Z', updatedAt: '2023-01-02T00:00:00.000Z' },
  },
  {
    name: { en: 'Personalized Workout Plan', he: 'תוכנית אימונים אישית' },
    description: { en: 'Creates a weekly workout plan based on fitness goals, experience level, and available equipment.', he: 'יוצר תוכנית אימונים שבועית המבוססת על יעדי כושר, רמת ניסיון, וציוד זמין.' },
    version: '1.0.0',
    category: GemCategory.MISC,
    icon: 'Gamepad2',
    color: '#94a3b8',
    tags: ['fitness', 'health', 'workout', 'personal training'],
    inputs: [
        { key: 'goal', label: { en: 'Fitness Goal (e.g., build muscle, lose weight)', he: 'יעד כושר (לדוגמה, בניית שריר, ירידה במשקל)' }, type: 'string', required: true },
        { key: 'level', label: { en: 'Experience Level', he: 'רמת ניסיון' }, type: 'enum', options: ['Beginner', 'Intermediate', 'Advanced'], required: true },
        { key: 'equipment', label: { en: 'Available Equipment (e.g., dumbbells, resistance bands, none)', he: 'ציוד זמין (למשל, משקולות, גומיות התנגדות, ללא)' }, type: 'string', required: true }
    ],
    prompt: {
        enc: false,
        content: 'Create a 5-day weekly workout plan for a person with the following details:\n- Fitness Goal: {{goal}}\n- Experience Level: {{level}}\n- Available Equipment: {{equipment}}\n\nFor each day, provide a list of exercises with sets and reps. Include a warm-up and cool-down routine.'
    },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2023-01-03T00:00:00.000Z', updatedAt: '2023-01-03T00:00:00.000Z' },
  },
  // --- New Gems ---
  // Marketing (YouTube Focus)
  {
    name: { en: 'YouTube Title & Thumbnail Ideas', he: 'רעיונות לכותרת ותמונה ממוזערת ליוטיוב' },
    description: { en: 'Generates 5 catchy titles and creative thumbnail concepts for a YouTube video.', he: 'מייצר 5 כותרות קליטות וקונספטים יצירתיים לתמונות ממוזערות לסרטון יוטיוב.' },
    version: '1.0.0',
    category: GemCategory.MARKETING,
    icon: 'Film',
    color: '#a855f7',
    tags: ['youtube', 'video', 'content creation'],
    inputs: [{ key: 'video_topic', label: { en: 'Video Topic', he: 'נושא הסרטון' }, type: 'textarea', required: true }],
    prompt: { enc: false, content: 'Act as a YouTube growth expert. For a video about "{{video_topic}}", generate:\n1. 5 compelling, clickable YouTube titles.\n2. 3 creative and visually striking thumbnail ideas that would stand out.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
  },
  {
    name: { en: 'YouTube Script Hook Writer', he: 'כותב פתיח (Hook) לתסריט יוטיוב' },
    description: { en: 'Writes 3 powerful opening hooks to grab viewer attention in the first 15 seconds.', he: 'כותב 3 פתיחים עוצמתיים כדי למשוך את תשומת לב הצופים ב-15 השניות הראשונות.' },
    version: '1.0.0',
    category: GemCategory.MARKETING,
    icon: 'FileText',
    color: '#a855f7',
    tags: ['youtube', 'scriptwriting', 'copywriting'],
    inputs: [{ key: 'video_summary', label: { en: 'Brief Video Summary', he: 'סיכום קצר של הסרטון' }, type: 'textarea', required: true }],
    prompt: { enc: false, content: 'For a YouTube video summarized as "{{video_summary}}", write 3 different, highly engaging script hooks to be delivered in the first 15 seconds. Each hook should build curiosity and promise value.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-02T00:00:00.000Z', updatedAt: '2024-01-02T00:00:00.000Z' },
  },
  // Marketing (Product Photography)
  {
    name: { en: 'Imagen Brief for Product Photos', he: 'תקציר Imagen לצילום מוצרים' },
    description: { en: 'Creates a detailed prompt for generating professional product photos with AI.', he: 'יוצר פרומפט מפורט ליצירת תמונות מוצר מקצועיות באמצעות AI.' },
    version: '1.0.0',
    category: GemCategory.MARKETING,
    icon: 'Camera',
    color: '#a855f7',
    tags: ['photography', 'product', 'ai image', 'marketing'],
    inputs: [
      { key: 'product', label: { en: 'Product Name/Description', he: 'שם/תיאור המוצר' }, type: 'string', required: true },
      { key: 'background', label: { en: 'Background Style', he: 'סגנון רקע' }, type: 'string', required: true },
      { key: 'lighting', label: { en: 'Lighting Style', he: 'סגנון תאורה' }, type: 'string', required: true }
    ],
    prompt: { enc: false, content: 'Generate a detailed, professional photography prompt for an AI image generator like Imagen. The image should be a studio shot of: {{product}}. The background should be {{background}}. The lighting should be {{lighting}}. Include details like camera type, lens, and high-resolution quality.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-03T00:00:00.000Z', updatedAt: '2024-01-03T00:00:00.000Z' },
  },
  {
    name: { en: 'Mood Board Image Generator', he: 'יוצר תמונת אווירה' },
    description: { en: 'Generates an aesthetic image based on a concept for mood boards or inspiration.', he: 'מייצר תמונה אסתטית על בסיס קונספפט ללוחות השראה.' },
    version: '1.0.0',
    category: GemCategory.MARKETING,
    icon: 'Image',
    color: '#a855f7',
    tags: ['design', 'mood board', 'inspiration', 'image generation'],
    inputs: [{ key: 'concept', label: { en: 'Concept/Aesthetic', he: 'קונספט/אסתטיקה' }, type: 'textarea', required: true }],
    prompt: { enc: false, content: 'Aesthetic, high-quality photograph representing the concept of {{concept}}. Cinematic, detailed, editorial style.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: true },
    meta: { createdAt: '2024-01-04T00:00:00.000Z', updatedAt: '2024-01-04T00:00:00.000Z' },
  },
  // Music & AI Music
  {
    name: { en: 'AI Music Prompt Enhancer', he: 'משפר פרומפטים למוזיקת AI' },
    description: { en: 'Expands a simple idea into a detailed prompt for AI music generators like Suno/Udio.', he: 'מרחיב רעיון פשוט לפרומפט מפורט למחוללי מוזיקת AI כמו Suno/Udio.' },
    version: '1.0.0',
    category: GemCategory.MUSIC,
    icon: 'Music',
    color: '#ff914d',
    tags: ['music', 'ai music', 'suno', 'udio', 'prompt engineering'],
    inputs: [
      { key: 'genre', label: { en: 'Genre', he: 'ז\'אנר' }, type: 'string', required: true },
      { key: 'mood', label: { en: 'Mood', he: 'אווירה' }, type: 'string', required: true },
      { key: 'instruments', label: { en: 'Key Instruments', he: 'כלי נגינה מרכזיים' }, type: 'string', required: true }
    ],
    prompt: { enc: false, content: 'Expand the following into a rich, descriptive prompt for an AI music generator. The goal is a full song.\n\n- Genre: {{genre}}\n- Mood: {{mood}}\n- Instruments: {{instruments}}\n\nInclude details about song structure (intro, verse, chorus), tempo, vocal style (if any), and overall production quality.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-05T00:00:00.000Z', updatedAt: '2024-01-05T00:00:00.000Z' },
  },
  {
    name: { en: 'Song Lyric Idea Generator', he: 'מחולל רעיונות למילים לשירים' },
    description: { en: 'Brainstorms themes, metaphors, and opening lines for a song.', he: 'מייצר רעיונות לנושאים, מטאפורות, ושורות פתיחה לשיר.' },
    version: '1.0.0',
    category: GemCategory.MUSIC,
    icon: 'Feather',
    color: '#ff914d',
    tags: ['songwriting', 'lyrics', 'music', 'creative writing'],
    inputs: [{ key: 'topic', label: { en: 'Song Topic', he: 'נושא השיר' }, type: 'string', required: true }],
    prompt: { enc: false, content: 'I want to write a song about "{{topic}}". Generate the following to inspire me:\n1. Three core themes or messages.\n2. Three powerful metaphors or images related to the topic.\n3. Five potential opening lines for the first verse.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-06T00:00:00.000Z', updatedAt: '2024-01-06T00:00:00.000Z' },
  },
  // Sales
  {
    name: { en: 'Cold Email Follow-up Sequence', he: 'רצף מיילים למעקב (Follow-up)' },
    description: { en: 'Writes a 3-step email follow-up sequence for a sales prospect who hasn\'t responded.', he: 'כותב רצף של 3 מיילים למעקב עבור לקוח פוטנציאלי שלא הגיב.' },
    version: '1.0.0',
    category: GemCategory.SALES,
    icon: 'Mail',
    color: '#22c55e',
    tags: ['sales', 'email', 'copywriting', 'b2b'],
    inputs: [
      { key: 'product', label: { en: 'Product/Service', he: 'מוצר/שירות' }, type: 'string', required: true },
      { key: 'prospect_pain_point', label: { en: 'Prospect\'s Pain Point', he: 'נקודת הכאב של הלקוח' }, type: 'textarea', required: true }
    ],
    prompt: { enc: false, content: 'Write a 3-step cold email follow-up sequence for a prospect who has not responded to the initial email. The product is {{product}} which solves the pain point of {{prospect_pain_point}}. Each email should be concise, provide value, and have a clear call-to-action. Specify the recommended delay between each email.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-07T00:00:00.000Z', updatedAt: '2024-01-07T00:00:00.000Z' },
  },
  {
    name: { en: 'Objection Handling Script Writer', he: 'כותב תסריט לטיפול בהתנגדויות' },
    description: { en: 'Generates responses to common sales objections using a proven framework.', he: 'מייצר תשובות להתנגדויות מכירה נפוצות באמצעות מסגרת מוכחת.' },
    version: '1.0.0',
    category: GemCategory.SALES,
    icon: 'ShieldAlert',
    color: '#22c55e',
    tags: ['sales', 'script', 'negotiation'],
    inputs: [{ key: 'objection', label: { en: 'Common Objection (e.g., "It\'s too expensive")', he: 'התנגדות נפוצה (למשל, "זה יקר מדי")' }, type: 'string', required: true }],
    prompt: { enc: false, content: 'I am a salesperson and I frequently hear the objection: "{{objection}}". Using the "Acknowledge, Isolate, Reframe, Resolve" framework, write a script for how I should respond to this objection.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-08T00:00:00.000Z', updatedAt: '2024-01-08T00:00:00.000Z' },
  },
  // Code
  {
    name: { en: 'Regex Pattern Generator', he: 'מחולל ביטויי Regex' },
    description: { en: 'Creates a regular expression pattern based on a description of the text to match.', he: 'יוצר ביטוי רגולרי (regex) על בסיס תיאור של הטקסט התואם.' },
    version: '1.0.0',
    category: GemCategory.CODE,
    icon: 'SlidersHorizontal',
    color: '#3b82f6',
    tags: ['regex', 'programming', 'development', 'text processing'],
    inputs: [{ key: 'description', label: { en: 'Text to match (e.g., "a valid email address")', he: 'טקסט להתאמה (למשל, "כתובת אימייל תקינה")' }, type: 'textarea', required: true }],
    prompt: { enc: false, content: 'Generate a regular expression (regex) pattern that can be used to validate or find the following: {{description}}. Provide the pattern and a brief explanation of how it works.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-09T00:00:00.000Z', updatedAt: '2024-01-09T00:00:00.000Z' },
  },
  {
    name: { en: 'Unit Test Case Creator', he: 'יוצר מקרי בדיקה (Unit Tests)' },
    description: { en: 'Generates unit test cases for a given function, including edge cases.', he: 'מייצר מקרי בדיקה (unit tests) עבור פונקציה נתונה, כולל מקרי קצה.' },
    version: '1.0.0',
    category: GemCategory.CODE,
    icon: 'ClipboardCheck',
    color: '#3b82f6',
    tags: ['testing', 'qa', 'development', 'tdd'],
    inputs: [
      { key: 'language', label: { en: 'Language', he: 'שפה' }, type: 'string', required: true },
      { key: 'function_code', label: { en: 'Function Code', he: 'קוד הפונקציה' }, type: 'textarea', required: true }
    ],
    prompt: { enc: false, content: 'Act as a Quality Assurance Engineer. For the following {{language}} function, generate a list of unit test cases. Cover the happy path, edge cases, and potential error conditions.\n\n```{{language}}\n{{function_code}}\n```' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-10T00:00:00.000Z', updatedAt: '2024-01-10T00:00:00.000Z' },
  },
  // Misc
  {
    name: { en: 'Meeting Agenda Generator', he: 'מחולל סדר יום לפגישה' },
    description: { en: 'Creates a structured agenda for a meeting, including topics, timings, and goals.', he: 'יוצר סדר יום מובנה לפגישה, כולל נושאים, זמנים, ומטרות.' },
    version: '1.0.0',
    category: GemCategory.MISC,
    icon: 'Briefcase',
    color: '#94a3b8',
    tags: ['productivity', 'meetings', 'professional'],
    inputs: [
      { key: 'meeting_goal', label: { en: 'Primary Goal of the Meeting', he: 'מטרה מרכזית של הפגישה' }, type: 'textarea', required: true },
      { key: 'duration', label: { en: 'Duration (minutes)', he: 'משך (דקות)' }, type: 'number', required: true },
      { key: 'attendees', label: { en: 'Key Attendees', he: 'משתתפים מרכזיים' }, type: 'string', required: true }
    ],
    prompt: { enc: false, content: 'Create a professional meeting agenda with the following details:\n- Goal: {{meeting_goal}}\n- Duration: {{duration}} minutes\n- Attendees: {{attendees}}\n\nThe agenda should include timed sections, key discussion points for each section, and a clear objective for the meeting.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-11T00:00:00.000Z', updatedAt: '2024-01-11T00:00:00.000Z' },
  },
  {
    name: { en: 'Fictional Story Plot Generator', he: 'מחולל עלילות לסיפורים' },
    description: { en: 'Generates a basic story plot including a protagonist, conflict, and resolution.', he: 'מייצר עלילה בסיסית לסיפור, כולל גיבור, קונפליקט, ופתרון.' },
    version: '1.0.0',
    category: GemCategory.MISC,
    icon: 'BookOpen',
    color: '#94a3b8',
    tags: ['creative writing', 'storytelling', 'fiction'],
    inputs: [{ key: 'genre', label: { en: 'Genre (e.g., Sci-Fi, Fantasy, Mystery)', he: 'ז\'אנר (למשל, מד"ב, פנטזיה, מסתורין)' }, type: 'string', required: true }],
    prompt: { enc: false, content: 'Generate a 3-act story plot outline for a {{genre}} story. Include:\n- Act 1: Introduce the protagonist and the inciting incident.\n- Act 2: Describe the central conflict and rising action.\n- Act 3: Outline the climax and resolution.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-12T00:00:00.000Z', updatedAt: '2024-01-12T00:00:00.000Z' },
  },
  {
    name: { en: 'Brand Name Generator', he: 'מחולל שמות למותג' },
    description: { en: 'Brainstorms 10 potential brand names based on a product and key attributes.', he: 'מייצר 10 שמות פוטנציאליים למותג על בסיס מוצר ותכונות מרכזיות.' },
    version: '1.0.0',
    category: GemCategory.MARKETING,
    icon: 'Lightbulb',
    color: '#a855f7',
    tags: ['branding', 'marketing', 'naming'],
    inputs: [
      { key: 'product', label: { en: 'Product/Company Type', he: 'סוג המוצר/חברה' }, type: 'string', required: true },
      { key: 'keywords', label: { en: 'Keywords (e.g., fast, secure, eco-friendly)', he: 'מילות מפתח (למשל, מהיר, מאובטח, ידידותי לסביבה)' }, type: 'string', required: true }
    ],
    prompt: { enc: false, content: 'Generate 10 creative and memorable brand names for a {{product}}. The brand should convey the following attributes: {{keywords}}. Provide a mix of modern, classic, and abstract names.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-13T00:00:00.000Z', updatedAt: '2024-01-13T00:00:00.000Z' },
  },
  {
    name: { en: 'Cover Letter Assistant', he: 'עוזר לכתיבת מכתב מקדים' },
    description: { en: 'Writes a personalized paragraph for a cover letter based on a job description.', he: 'כותב פסקה מותאמת אישית למכתב מקדים על בסיס תיאור משרה.' },
    version: '1.0.0',
    category: GemCategory.MISC,
    icon: 'Briefcase',
    color: '#94a3b8',
    tags: ['job search', 'career', 'writing'],
    inputs: [
      { key: 'job_description', label: { en: 'Key requirements from job description', he: 'דרישות מפתח מתיאור המשרה' }, type: 'textarea', required: true },
      { key: 'my_skill', label: { en: 'My most relevant skill/experience', he: 'הניסיון/מיומנות הכי רלוונטיים שלי' }, type: 'textarea', required: true }
    ],
    prompt: { enc: false, content: 'Write a compelling paragraph for a cover letter. The paragraph should connect my experience in "{{my_skill}}" directly to the job requirement of "{{job_description}}". The tone should be professional and confident.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-14T00:00:00.000Z', updatedAt: '2024-01-14T00:00:00.000Z' },
  },
  {
    name: { en: 'YouTube SEO Optimizer', he: 'מטייב SEO ליוטיוב' },
    description: { en: 'Generates SEO-friendly tags and a description for a YouTube video.', he: 'מייצר תגיות וידידותיות ל-SEO ותיאור לסרטון יוטיוב.' },
    version: '1.0.0',
    category: GemCategory.MARKETING,
    icon: 'Globe',
    color: '#a855f7',
    tags: ['youtube', 'seo', 'marketing'],
    inputs: [
      { key: 'title', label: { en: 'Video Title', he: 'כותרת הסרטון' }, type: 'string', required: true },
      { key: 'summary', label: { en: 'Video Summary', he: 'סיכום הסרטון' }, type: 'textarea', required: true }
    ],
    prompt: { enc: false, content: 'Act as a YouTube SEO specialist. For a video titled "{{title}}" about "{{summary}}", provide:\n1. A list of 20-30 relevant and high-traffic tags (keywords).\n2. A well-structured, keyword-rich video description that includes timestamps and relevant links placeholders.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-15T00:00:00.000Z', updatedAt: '2024-01-15T00:00:00.000Z' },
  },
  {
    name: { en: 'Product Photo Shot List', he: 'רשימת צילומים למוצר' },
    description: { en: 'Creates a detailed shot list for a product photoshoot.', he: 'יוצר רשימת צילומים מפורטת לסשן צילומי מוצר.' },
    version: '1.0.0',
    category: GemCategory.MARKETING,
    icon: 'Camera',
    color: '#a855f7',
    tags: ['photography', 'product', 'ecommerce'],
    inputs: [{ key: 'product_type', label: { en: 'Type of Product', he: 'סוג המוצר' }, type: 'string', required: true }],
    prompt: { enc: false, content: 'Create a comprehensive shot list for a professional photoshoot of a {{product_type}}. The list should include standard e-commerce shots (white background, different angles), lifestyle shots (product in use), and detail shots (close-ups of features).' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-16T00:00:00.000Z', updatedAt: '2024-01-16T00:00:00.000Z' },
  },
  {
    name: { en: 'Chord Progression Suggester', he: 'מציע מהלכי אקורדים' },
    description: { en: 'Suggests common and creative chord progressions for a given key and mood.', he: 'מציע מהלכי אקורדים נפוצים ויצירתיים עבור סולם ואווירה נתונים.' },
    version: '1.0.0',
    category: GemCategory.MUSIC,
    icon: 'Music',
    color: '#ff914d',
    tags: ['music theory', 'songwriting', 'guitar', 'piano'],
    inputs: [
      { key: 'key', label: { en: 'Musical Key (e.g., C Major)', he: 'סולם מוזיקלי (למשל, דו מז\'ור)' }, type: 'string', required: true },
      { key: 'mood', label: { en: 'Mood (e.g., happy, sad, epic)', he: 'אווירה (למשל, שמח, עצוב, אפי)' }, type: 'string', required: true }
    ],
    prompt: { enc: false, content: 'I am writing a song in the key of {{key}} with a {{mood}} mood. Provide 3 different 4-chord progressions that would fit this style. Use standard chord notation (e.g., I-V-vi-IV).' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-17T00:00:00.000Z', updatedAt: '2024-01-17T00:00:00.000Z' },
  },
  {
    name: { en: 'LinkedIn Connection Request', he: 'התאמה אישית של בקשת קשר בלינקדאין' },
    description: { en: 'Writes a short, personalized message to include with a LinkedIn connection request.', he: 'כותב הודעה קצרה ומותאמת אישית לצירוף לבקשת קשר בלינקדאין.' },
    version: '1.0.0',
    category: GemCategory.SALES,
    icon: 'Briefcase',
    color: '#22c55e',
    tags: ['linkedin', 'networking', 'sales', 'career'],
    inputs: [
      { key: 'person_role', label: { en: 'Person\'s Role', he: 'תפקיד האדם' }, type: 'string', required: true },
      { key: 'common_interest', label: { en: 'Common Interest/Connection', he: 'עניין/קשר משותף' }, type: 'string', required: true }
    ],
    prompt: { enc: false, content: 'Write a concise and professional LinkedIn connection request message (under 300 characters). I want to connect with a {{person_role}}. The message should mention our shared interest in {{common_interest}}.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-18T00:00:00.000Z', updatedAt: '2024-01-18T00:00:00.000Z' },
  },
  {
    name: { en: 'API Documentation Writer', he: 'כותב תיעוד ל-API' },
    description: { en: 'Generates a documentation template for a new API endpoint.', he: 'מייצר תבנית תיעוד עבור נקודת קצה (endpoint) חדשה ב-API.' },
    version: '1.0.0',
    category: GemCategory.CODE,
    icon: 'FileText',
    color: '#3b82f6',
    tags: ['api', 'documentation', 'development', 'technical writing'],
    inputs: [
      { key: 'endpoint_path', label: { en: 'Endpoint Path (e.g., /users/{id})', he: 'נתיב ה-Endpoint (למשל, /users/{id})' }, type: 'string', required: true },
      { key: 'http_method', label: { en: 'HTTP Method', he: 'מתודת HTTP' }, type: 'enum', options: ['GET', 'POST', 'PUT', 'DELETE'], required: true },
      { key: 'purpose', label: { en: 'Purpose of the Endpoint', he: 'מטרת ה-Endpoint' }, type: 'textarea', required: true }
    ],
    prompt: { enc: false, content: 'Generate a markdown documentation snippet for the following API endpoint:\n- **Method**: `{{http_method}}`\n- **Path**: `{{endpoint_path}}`\n- **Description**: {{purpose}}\n\nInclude sections for Parameters (path, query, body), a sample successful response (200 OK), and a sample error response (e.g., 404 Not Found).' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-19T00:00:00.000Z', updatedAt: '2024-01-19T00:00:00.000Z' },
  },
  {
    name: { en: 'Travel Itinerary Planner', he: 'מתכנן מסלול טיול' },
    description: { en: 'Creates a day-by-day itinerary for a trip to a specified city.', he: 'יוצר מסלול יומי לטיול בעיר מסוימת.' },
    version: '1.0.0',
    category: GemCategory.MISC,
    icon: 'Globe',
    color: '#94a3b8',
    tags: ['travel', 'planning', 'lifestyle'],
    inputs: [
      { key: 'city', label: { en: 'City', he: 'עיר' }, type: 'string', required: true },
      { key: 'duration_days', label: { en: 'Duration (in days)', he: 'משך (בימים)' }, type: 'number', required: true },
      { key: 'interests', label: { en: 'Interests (e.g., museums, food, hiking)', he: 'תחומי עניין (למשל, מוזיאונים, אוכל, טיולים)' }, type: 'string', required: true }
    ],
    prompt: { enc: false, content: 'Create a {{duration_days}}-day travel itinerary for a trip to {{city}}. The traveler is interested in {{interests}}. For each day, suggest a morning, afternoon, and evening activity, including at least one food recommendation.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-20T00:00:00.000Z', updatedAt: '2024-01-20T00:00:00.000Z' },
  },
  {
    name: { en: 'Recipe from Ingredients', he: 'מתכון ממרכיבים' },
    description: { en: 'Generates a recipe based on a list of available ingredients.', he: 'יוצר מתכון על בסיס רשימת מרכיבים זמינים.' },
    version: '1.0.0',
    category: GemCategory.MISC,
    icon: 'Sparkles',
    color: '#94a3b8',
    tags: ['cooking', 'food', 'recipe'],
    inputs: [{ key: 'ingredients', label: { en: 'Available Ingredients (comma-separated)', he: 'מרכיבים זמינים (מופרדים בפסיק)' }, type: 'textarea', required: true }],
    prompt: { enc: false, content: 'I have the following ingredients: {{ingredients}}. Create a simple recipe I can make with them. Provide a name for the dish, a list of ingredients (including amounts if possible), and step-by-step instructions.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-21T00:00:00.000Z', updatedAt: '2024-01-21T00:00:00.000Z' },
  },
  {
    name: { en: 'Speech Writer Assistant', he: 'עוזר לכתיבת נאומים' },
    description: { en: 'Helps structure a speech with an opening, key points, and a closing statement.', he: 'עוזר לבנות נאום עם פתיחה, נקודות מרכזיות, ומשפט סיום.' },
    version: '1.0.0',
    category: GemCategory.MISC,
    icon: 'Feather',
    color: '#94a3b8',
    tags: ['public speaking', 'writing', 'communication'],
    inputs: [
      { key: 'topic', label: { en: 'Topic of the Speech', he: 'נושא הנאום' }, type: 'string', required: true },
      { key: 'main_message', label: { en: 'Main Message', he: 'המסר המרכזי' }, type: 'textarea', required: true }
    ],
    prompt: { enc: false, content: 'Create an outline for a speech on the topic of "{{topic}}". The core message to convey is "{{main_message}}". The outline should include:\n1. A powerful opening statement.\n2. Three key supporting points with brief explanations.\n3. A memorable closing statement.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-22T00:00:00.000Z', updatedAt: '2024-01-22T00:00:00.000Z' },
  },
  {
    name: { en: 'Blog Post Outline Creator', he: 'יוצר ראשי פרקים לפוסט בבלוג' },
    description: { en: 'Generates a structured outline for a blog post, including H2 and H3 headings.', he: 'מייצר ראשי פרקים מובנים לפוסט בבלוג, כולל כותרות H2 ו-H3.' },
    version: '1.0.0',
    category: GemCategory.MARKETING,
    icon: 'FileText',
    color: '#a855f7',
    tags: ['blogging', 'writing', 'seo', 'content marketing'],
    inputs: [{ key: 'topic', label: { en: 'Blog Post Topic', he: 'נושא הפוסט' }, type: 'string', required: true }],
    prompt: { enc: false, content: 'Create a detailed, SEO-friendly outline for a blog post about "{{topic}}". The outline should include a compelling introduction, several main sections with H2 headings, and relevant sub-points with H3 headings under each main section. Conclude with a summary section.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-23T00:00:00.000Z', updatedAt: '2024-01-23T00:00:00.000Z' },
  },
  {
    name: { en: 'A/B Test Idea Generator', he: 'מחולל רעיונות למבחני A/B' },
    description: { en: 'Suggests A/B testing ideas to improve a webpage or email campaign.', he: 'מציע רעיונות למבחני A/B לשיפור דף אינטרנט או קמפיין אימייל.' },
    version: '1.0.0',
    category: GemCategory.MARKETING,
    icon: 'GitMerge',
    color: '#a855f7',
    tags: ['a/b testing', 'cro', 'marketing', 'optimization'],
    inputs: [
      { key: 'element', label: { en: 'Page/Email Element to Test', he: 'אלמנט לבדיקה (דף/אימייל)' }, type: 'enum', options: ['Headline', 'Call-to-Action Button', 'Image', 'Email Subject Line'], required: true },
      { key: 'goal', label: { en: 'Conversion Goal (e.g., increase clicks)', he: 'יעד המרה (למשל, הגדלת קליקים)' }, type: 'string', required: true }
    ],
    prompt: { enc: false, content: 'I want to A/B test the {{element}} to achieve the goal of "{{goal}}". Generate 3 distinct hypotheses for A/B tests. For each hypothesis, describe the change for the variant (B) compared to the control (A).' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-24T00:00:00.000Z', updatedAt: '2024-01-24T00:00:00.000Z' },
  },
  {
    name: { en: 'Social Media Ad Copy', he: 'קופי למודעות ברשתות חברתיות' },
    description: { en: 'Writes short, persuasive ad copy for a product to be used on social media.', he: 'כותב קופי קצר ומשכנע למודעה עבור מוצר לשימוש ברשתות חברתיות.' },
    version: '1.0.0',
    category: GemCategory.SALES,
    icon: 'DollarSign',
    color: '#22c55e',
    tags: ['advertising', 'copywriting', 'social media', 'sales'],
    inputs: [
      { key: 'product', label: { en: 'Product Name', he: 'שם המוצר' }, type: 'string', required: true },
      { key: 'benefit', label: { en: 'Main Customer Benefit', he: 'התועלת המרכזית ללקוח' }, type: 'string', required: true }
    ],
    prompt: { enc: false, content: 'Write 3 short ad copy variations for a social media campaign promoting "{{product}}". Each variation should highlight the main benefit of "{{benefit}}" and include a strong call-to-action. The tone should be energetic and direct.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-25T00:00:00.000Z', updatedAt: '2024-01-25T00:00:00.000Z' },
  },
  {
    name: { en: 'Album/EP Concept Brainstormer', he: 'סיעור מוחות לקונספט אלבום/EP' },
    description: { en: 'Generates conceptual ideas for a music album or EP based on a theme.', he: 'מייצר רעיונות קונספטואליים לאלבום מוזיקה או EP על בסיס נושא.' },
    version: '1.0.0',
    category: GemCategory.MUSIC,
    icon: 'BookOpen',
    color: '#ff914d',
    tags: ['music', 'album', 'creative', 'branding'],
    inputs: [{ key: 'theme', label: { en: 'Central Theme', he: 'נושא מרכזי' }, type: 'string', required: true }],
    prompt: { enc: false, content: 'Brainstorm 3 different concepts for a music album or EP centered around the theme of "{{theme}}". For each concept, suggest a potential title, a visual aesthetic, and a short narrative or story that connects the songs.' },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-26T00:00:00.000Z', updatedAt: '2024-01-26T00:00:00.000Z' },
  },
  {
    name: { en: 'AI Image Prompt Generator', he: 'מחולל פרומפטים לתמונות AI' },
    description: { en: 'Generates a detailed, professional prompt for AI image models based on a simple description, style, and aspect ratio.', he: 'יוצר פרומפט מפורט ומקצועי למודלי תמונות AI על בסיס תיאור פשוט, סגנון ויחס רוחב-גובה.' },
    version: '1.0.0',
    category: GemCategory.MARKETING,
    icon: 'Image',
    color: '#a855f7',
    tags: ['image generation', 'ai', 'prompt engineering', 'imagen', 'midjourney', 'creative'],
    inputs: [
      { key: 'description', label: { en: 'Image Description', he: 'תיאור התמונה' }, type: 'textarea', required: true },
      { key: 'style', label: { en: 'Artistic Style (e.g., photorealistic, watercolor)', he: 'סגנון אמנותי (למשל, פוטוריאליסטי, צבעי מים)' }, type: 'string', required: true },
      { key: 'aspect_ratio', label: { en: 'Aspect Ratio', he: 'יחס רוחב-גובה' }, type: 'enum', options: ['1:1', '16:9', '9:16', '4:3', '3:4'], required: true },
      { key: 'elements', label: { en: 'Specific Elements to Include', he: 'אלמנטים ספציפיים לכלול' }, type: 'string', required: false },
      { key: 'negative_prompt', label: { en: 'Elements to Exclude (Negative Prompt)', he: 'אלמנטים לא לכלול (פרומפט שלילי)' }, type: 'string', required: false }
    ],
    prompt: {
      enc: false,
      content: `You are an expert prompt engineer for AI image generation models. Create a single, powerful, comma-separated prompt string.

Combine these elements:
1.  **Core Subject:** {{description}}
2.  **Specific Details:** {{elements}}
3.  **Style:** {{style}}
4.  **Booster Keywords:** masterpiece, high quality, detailed, cinematic lighting, 4k, ultra-realistic.

Structure the final prompt as a single line of text.
Append the aspect ratio like this: --ar {{aspect_ratio}}
If the user provides elements to exclude, append them like this: --no {{negative_prompt}}

Return ONLY the final prompt string. Do not include any other text or explanation.`
    },
    models: { text: 'gemini-2.5-flash', imageEnabled: false },
    meta: { createdAt: '2024-01-27T00:00:00.000Z', updatedAt: '2024-01-27T00:00:00.000Z' },
  }
];