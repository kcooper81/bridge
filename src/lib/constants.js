// ContextIQ Constants

export const STORAGE_KEYS = {
  PROJECTS: 'contextiq_projects',
  ACTIVITY_LOG: 'contextiq_activity_log',
  SETTINGS: 'contextiq_settings',
  ACTIVE_PROJECT: 'contextiq_active_project',
  ONBOARDING_COMPLETE: 'contextiq_onboarding_complete',
  TAB_TIME_TRACKING: 'contextiq_tab_time',
  AI_CONVERSATIONS: 'contextiq_ai_conversations',
};

export const AI_TOOL_PATTERNS = [
  { pattern: /chat\.openai\.com|chatgpt\.com/, name: 'ChatGPT', icon: 'chatgpt' },
  { pattern: /gemini\.google\.com/, name: 'Gemini', icon: 'gemini' },
  { pattern: /claude\.ai/, name: 'Claude', icon: 'claude' },
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
  localOnly: true,
  captureUrls: true,
  captureTitles: true,
  capturePageContent: true,
  autoInferProjects: true,
  aiInjectionMode: 'manual', // 'manual' | 'auto'
  maxActivityItems: 2000,
  inactivityThresholdMs: 5 * 60 * 1000, // 5 minutes
  clusteringIntervalMs: 60 * 1000, // 1 minute
  excludedDomains: [],
};

export const ALARM_NAMES = {
  CLUSTERING: 'contextiq_clustering',
  CLEANUP: 'contextiq_cleanup',
  TIME_TRACKING: 'contextiq_time_tracking',
};

export const MAX_PROJECT_ITEMS = 100;
export const MAX_PROJECTS = 50;
export const MAX_ACTIVITY_LOG = 2000;
