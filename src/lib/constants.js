// TeamPrompt Constants

export const SUPABASE_URL = 'https://vafybxyxmpehrpqbztrc.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZnlieHl4bXBlaHJwcWJ6dHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzU3NjcsImV4cCI6MjA4NjQxMTc2N30.W6OiQtVpqzyueOQq6HE7_qNOTDOQgTig215zSgXYHAs';

export const STORAGE_KEYS = {
  PROJECTS: 'contextiq_projects',
  ACTIVITY_LOG: 'contextiq_activity_log',
  SETTINGS: 'contextiq_settings',
  ACTIVE_PROJECT: 'contextiq_active_project',
  ONBOARDING_COMPLETE: 'contextiq_onboarding_complete',
  TAB_TIME_TRACKING: 'contextiq_tab_time',
  AI_CONVERSATIONS: 'contextiq_ai_conversations',
  WORKSPACE_PROFILES: 'contextiq_workspace_profiles',
  ACTIVE_WORKSPACE: 'contextiq_active_workspace',
  PINNED_PROJECTS: 'contextiq_pinned_projects',
  FAVORITES: 'contextiq_favorites',
  DAILY_STATS: 'contextiq_daily_stats',
  // Prompt Manager
  PROMPTS: 'contextiq_prompts',
  PROMPT_FOLDERS: 'contextiq_prompt_folders',
  PROMPT_DEPARTMENTS: 'contextiq_prompt_departments',
  PROMPT_ANALYTICS: 'contextiq_prompt_analytics',
  PROMPT_STARTER_INSTALLED: 'contextiq_prompt_starter_installed',
  // Web App
  WEB_APP_URL: 'contextiq_web_app_url',
  // Team & Organization
  ORG: 'contextiq_org',
  TEAMS: 'contextiq_teams',
  MEMBERS: 'contextiq_members',
  COLLECTIONS: 'contextiq_collections',
  STANDARDS: 'contextiq_standards',
  // Theme
  THEME: 'teamprompt_theme',
};

export const AI_TOOL_PATTERNS = [
  { pattern: /chat\.openai\.com|chatgpt\.com/, name: 'ChatGPT', icon: 'chatgpt' },
  { pattern: /gemini\.google\.com/, name: 'Gemini', icon: 'gemini' },
  { pattern: /claude\.ai/, name: 'Claude', icon: 'claude' },
  { pattern: /perplexity\.ai/, name: 'Perplexity', icon: 'perplexity' },
  { pattern: /copilot\.microsoft\.com/, name: 'Copilot', icon: 'copilot' },
  { pattern: /poe\.com/, name: 'Poe', icon: 'poe' },
  { pattern: /chat\.deepseek\.com/, name: 'DeepSeek', icon: 'deepseek' },
  { pattern: /grok\.com/, name: 'Grok', icon: 'grok' },
  { pattern: /chat\.mistral\.ai/, name: 'Mistral', icon: 'mistral' },
  { pattern: /huggingface\.co\/chat/, name: 'HuggingChat', icon: 'huggingchat' },
  { pattern: /pi\.ai/, name: 'Pi', icon: 'pi' },
  { pattern: /coral\.cohere\.com/, name: 'Cohere', icon: 'cohere' },
  { pattern: /you\.com/, name: 'You.com', icon: 'youcom' },
  { pattern: /meta\.ai/, name: 'Meta AI', icon: 'metaai' },
  { pattern: /phind\.com/, name: 'Phind', icon: 'phind' },
  { pattern: /notion\.so/, name: 'Notion AI', icon: 'notion' },
];

export const DOMAIN_CATEGORIES = {
  development: [
    'github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com',
    'developer.mozilla.org', 'npmjs.com', 'docs.rs', 'pkg.go.dev',
    'pypi.org', 'crates.io', 'hub.docker.com', 'vercel.com',
    'netlify.com', 'heroku.com', 'aws.amazon.com', 'console.cloud.google.com',
  ],
  design: [
    'figma.com', 'dribbble.com', 'behance.net', 'canva.com',
    'sketch.com', 'adobe.com', 'coolors.co', 'fontawesome.com',
  ],
  communication: [
    'mail.google.com', 'outlook.live.com', 'slack.com', 'discord.com',
    'teams.microsoft.com', 'zoom.us',
  ],
  productivity: [
    'notion.so', 'docs.google.com', 'sheets.google.com', 'slides.google.com',
    'airtable.com', 'trello.com', 'asana.com', 'linear.app',
    'jira.atlassian.com', 'clickup.com', 'monday.com',
  ],
  research: [
    'scholar.google.com', 'arxiv.org', 'wikipedia.org', 'medium.com',
    'substack.com',
  ],
  marketing: [
    'analytics.google.com', 'ads.google.com', 'business.facebook.com',
    'mailchimp.com', 'hubspot.com', 'semrush.com',
  ],
};

export const DEFAULT_SETTINGS = {
  trackingEnabled: true,
  localOnly: false,
  captureUrls: true,
  captureTitles: true,
  capturePageContent: true,
  autoInferProjects: true,
  aiInjectionMode: 'manual', // 'manual' | 'auto'
  maxActivityItems: 2000,
  inactivityThresholdMs: 5 * 60 * 1000, // 5 minutes
  clusteringIntervalMs: 60 * 1000, // 1 minute
  excludedDomains: [],
  showDashboard: true,
  showTimeline: true,
  webAppUrl: 'https://teamprompt.app', // TeamPrompt web app URL
};

export const WORKSPACE_PRESETS = {
  development: {
    name: 'Development',
    icon: 'code',
    color: '#60a5fa',
    focusDomains: ['github.com', 'gitlab.com', 'stackoverflow.com', 'npmjs.com', 'developer.mozilla.org'],
    contextTemplate: 'technical',
  },
  research: {
    name: 'Research',
    icon: 'search',
    color: '#fb923c',
    focusDomains: ['scholar.google.com', 'arxiv.org', 'wikipedia.org', 'medium.com'],
    contextTemplate: 'research',
  },
  design: {
    name: 'Design',
    icon: 'palette',
    color: '#c084fc',
    focusDomains: ['figma.com', 'dribbble.com', 'behance.net', 'canva.com'],
    contextTemplate: 'creative',
  },
  planning: {
    name: 'Planning',
    icon: 'clipboard',
    color: '#fbbf24',
    focusDomains: ['notion.so', 'linear.app', 'jira.atlassian.com', 'trello.com'],
    contextTemplate: 'planning',
  },
};

export const ALARM_NAMES = {
  CLUSTERING: 'contextiq_clustering',
  CLEANUP: 'contextiq_cleanup',
  TIME_TRACKING: 'contextiq_time_tracking',
};

export const MAX_PROJECT_ITEMS = 100;
export const MAX_PROJECTS = 50;
export const MAX_ACTIVITY_LOG = 2000;
