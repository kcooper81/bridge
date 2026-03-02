import type { SeoPageData } from "../types";

export const templatePages: SeoPageData[] = [
  {
    slug: "email-prompt-templates",
    category: "template",
    meta: {
      title: "Email Writing Prompt Templates | TeamPrompt",
      description:
        "Ready-to-use email prompt templates for professional, sales, support, and internal communications. Dynamic {{variables}} let your team personalize every message while maintaining brand consistency.",
      keywords: ["email prompt templates", "AI email templates", "email writing prompts", "professional email templates", "sales email AI"],
    },
    hero: {
      headline: "Email templates that write themselves",
      subtitle:
        "Stop staring at blank email drafts. Use dynamic prompt templates with {{recipient_name}}, {{company}}, and {{context}} variables to generate polished emails in seconds — across sales, support, and internal comms.",
      badges: ["Professional emails", "Sales outreach", "Support replies"],
    },
    features: {
      sectionLabel: "Templates",
      heading: "Email templates for every scenario",
      items: [
        { icon: "BookOpen", title: "Professional email library", description: "Pre-built templates for introductions, follow-ups, proposals, and status updates. Each template uses {{variables}} so your team fills in the details and gets a polished draft instantly." },
        { icon: "Zap", title: "Sales outreach templates", description: "Cold outreach, follow-up sequences, and meeting requests with {{prospect_name}}, {{company}}, and {{value_prop}} variables. Consistent messaging across your sales team." },
        { icon: "Users", title: "Support response templates", description: "Templates for common support scenarios — bug reports, feature requests, billing questions. Variables like {{customer_name}} and {{issue_summary}} personalize every reply." },
        { icon: "Shield", title: "Compliance-safe messaging", description: "DLP scanning runs on every generated email before it leaves TeamPrompt. Sensitive data like account numbers or personal details are caught automatically." },
        { icon: "Globe", title: "Works in any AI tool", description: "Insert email templates into ChatGPT, Claude, Gemini, or Copilot via the browser extension. Draft emails wherever your team already works." },
        { icon: "BarChart3", title: "Track what works", description: "Usage analytics show which email templates your team uses most. Double down on templates that drive results and retire the ones gathering dust." },
      ],
    },
    benefits: {
      heading: "Why teams use email prompt templates",
      items: [
        "Cut email drafting time from 10 minutes to under 30 seconds",
        "Maintain consistent brand voice across every team member's outreach",
        "Onboard new sales reps with proven email sequences on day one",
        "Reduce support response times with pre-built reply templates",
        "Catch sensitive data before it ends up in customer-facing emails",
        "Track which email templates generate the best engagement",
      ],
    },
    stats: [
      { value: "90%", label: "Faster email drafting" },
      { value: "100%", label: "Brand consistency" },
      { value: "0", label: "Sensitive data leaks" },
    ],
    faqs: [
      { question: "What variables can I use in email templates?", answer: "Any text in double curly braces becomes a fill-in field — {{recipient_name}}, {{company}}, {{product}}, {{deadline}}, or anything else your template needs. There is no limit on the number of variables per template." },
      { question: "Can different teams have different email templates?", answer: "Yes. Templates are organized in categories with role-based permissions. Sales, support, and marketing can each maintain their own library while sharing company-wide templates." },
      { question: "Are generated emails scanned for sensitive data?", answer: "Yes. TeamPrompt's DLP guardrails scan the final prompt — after all variables are filled in — for sensitive data like account numbers, SSNs, and API keys before it is sent to any AI tool." },
      { question: "Do email templates work with my AI tool?", answer: "TeamPrompt works with ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity. Insert any email template directly into these tools via the browser extension." },
    ],
    cta: {
      headline: "Stop writing emails from scratch.",
      gradientText: "Template everything.",
      subtitle: "Free plan includes up to 25 templates. No credit card required.",
    },
  },
  {
    slug: "code-review-templates",
    category: "template",
    meta: {
      title: "Code Review Prompt Templates | TeamPrompt",
      description:
        "AI-powered code review prompt templates for security, performance, and readability. Standardize reviews with dynamic {{variables}} and share across your engineering team.",
      keywords: ["code review templates", "AI code review prompts", "code review checklist", "engineering prompt templates", "code quality AI"],
    },
    hero: {
      headline: "Code reviews, systematized",
      subtitle:
        "Prompt templates that guide AI through security checks, performance analysis, and readability scoring. Use {{language}}, {{file_path}}, and {{code_snippet}} variables to standardize reviews across your engineering team.",
      badges: ["Security review", "Performance audit", "Readability check"],
    },
    features: {
      sectionLabel: "Templates",
      heading: "Code review templates that catch what humans miss",
      items: [
        { icon: "ShieldCheck", title: "Security review templates", description: "Templates that prompt AI to scan for injection vulnerabilities, authentication flaws, and data exposure. Variables like {{language}} and {{framework}} tailor the review to your stack." },
        { icon: "Zap", title: "Performance analysis", description: "Templates for identifying N+1 queries, memory leaks, and algorithmic complexity issues. Fill in {{code_snippet}} and get actionable optimization suggestions." },
        { icon: "Eye", title: "Readability scoring", description: "Templates that evaluate naming conventions, function length, documentation quality, and cognitive complexity. Consistent feedback across every pull request." },
        { icon: "Braces", title: "Language-specific reviews", description: "Specialized templates for Python, TypeScript, Go, Rust, and more. The {{language}} variable loads context-appropriate review criteria automatically." },
        { icon: "GitBranch", title: "Version-controlled templates", description: "Track every change to your review templates with full version history. See diffs, restore previous versions, and maintain an audit trail of template evolution." },
        { icon: "Users", title: "Team-wide standards", description: "Share review templates across your engineering org so every developer follows the same quality bar. New engineers inherit your team's review expertise from day one." },
      ],
    },
    benefits: {
      heading: "Why engineering teams use code review templates",
      items: [
        "Catch security vulnerabilities that manual reviews consistently miss",
        "Standardize review quality across senior and junior engineers alike",
        "Reduce review turnaround time by guiding AI with structured prompts",
        "Onboard new developers with your team's established review standards",
        "Track which review templates catch the most issues over time",
        "Maintain language-specific review criteria without tribal knowledge",
      ],
    },
    stats: [
      { value: "3x", label: "More issues caught" },
      { value: "60%", label: "Faster reviews" },
      { value: "100%", label: "Review consistency" },
    ],
    faqs: [
      { question: "What programming languages are supported?", answer: "Templates work with any language. The {{language}} variable lets you specify Python, TypeScript, Go, Java, Rust, C#, or any other language, and the review criteria adjust accordingly." },
      { question: "Can I create custom review checklists?", answer: "Yes. Build templates with your own checklist items — coding standards, architectural patterns, testing requirements. Variables let reviewers fill in context-specific details for each review." },
      { question: "How do security review templates work?", answer: "Security templates prompt AI to check for common vulnerabilities — SQL injection, XSS, authentication bypass, sensitive data exposure, and more. Fill in {{language}}, {{framework}}, and {{code_snippet}} to get targeted results." },
      { question: "Can different teams have different review standards?", answer: "Yes. Each team can maintain its own review template library with category-based permissions. Frontend, backend, and infrastructure teams can each enforce their own standards." },
    ],
    cta: {
      headline: "Catch more bugs.",
      gradientText: "Ship better code.",
      subtitle: "Start with free code review templates. Set up in under 2 minutes.",
    },
  },
  {
    slug: "meeting-notes-templates",
    category: "template",
    meta: {
      title: "Meeting Notes Prompt Templates | TeamPrompt",
      description:
        "Prompt templates for summarizing meetings, extracting action items, and writing follow-up emails. Turn raw notes into structured summaries with {{variables}}.",
      keywords: ["meeting notes templates", "AI meeting summary", "action items extraction", "meeting follow-up templates", "meeting recap AI"],
    },
    hero: {
      headline: "Turn meetings into action",
      subtitle:
        "Prompt templates that transform raw meeting notes into structured summaries, clear action items, and follow-up emails. Use {{meeting_topic}}, {{attendees}}, and {{raw_notes}} variables to get organized output every time.",
      badges: ["Meeting summaries", "Action items", "Follow-up emails"],
    },
    features: {
      sectionLabel: "Templates",
      heading: "Meeting templates that save hours every week",
      items: [
        { icon: "BookOpen", title: "Summary templates", description: "Paste raw notes into {{raw_notes}} and get a structured summary with key decisions, discussion points, and outcomes. Works for standups, all-hands, and client calls alike." },
        { icon: "Zap", title: "Action item extraction", description: "Templates that pull action items from meeting notes and format them with owner, deadline, and priority. No more digging through notes to find who committed to what." },
        { icon: "Globe", title: "Follow-up email generator", description: "Templates that turn meeting summaries into professional follow-up emails. Variables like {{attendees}} and {{next_steps}} ensure nothing falls through the cracks." },
        { icon: "Users", title: "Team-specific formats", description: "Engineering standups, sales pipeline reviews, and executive briefings each get their own template format. Share across your team for consistent documentation." },
        { icon: "Archive", title: "Meeting type library", description: "Pre-built templates for one-on-ones, sprint retros, client calls, board meetings, and brainstorms. Each tailored to extract the right information from that meeting type." },
        { icon: "BarChart3", title: "Usage tracking", description: "See which meeting templates your team uses most frequently and identify gaps where new templates could save time." },
      ],
    },
    benefits: {
      heading: "Why teams use meeting notes templates",
      items: [
        "Transform 60 minutes of raw notes into a structured summary in seconds",
        "Never miss an action item with automated extraction and assignment",
        "Send professional follow-up emails within minutes of the meeting ending",
        "Standardize meeting documentation across departments and teams",
        "Onboard new team members with a library of meeting format templates",
        "Reduce the overhead of note-taking so participants stay engaged",
      ],
    },
    stats: [
      { value: "5 min", label: "Per meeting saved" },
      { value: "100%", label: "Action items captured" },
      { value: "0", label: "Missed follow-ups" },
    ],
    faqs: [
      { question: "What meeting types are covered?", answer: "TeamPrompt includes templates for daily standups, sprint retrospectives, one-on-ones, client calls, executive briefings, board meetings, brainstorm sessions, and project kickoffs. You can also create custom templates for any meeting format." },
      { question: "Can the template extract action items automatically?", answer: "Yes. Action item templates prompt AI to identify tasks, assign owners based on context, suggest deadlines, and format everything into a checklist. Fill in {{raw_notes}} and the template handles the rest." },
      { question: "How do follow-up email templates work?", answer: "After generating a meeting summary, use the follow-up template with {{attendees}}, {{key_decisions}}, and {{next_steps}} variables. The AI generates a professional email ready to send." },
    ],
    cta: {
      headline: "Never lose a meeting outcome.",
      gradientText: "Template your notes.",
      subtitle: "Free meeting templates included. Start capturing better notes today.",
    },
  },
  {
    slug: "report-writing-templates",
    category: "template",
    meta: {
      title: "Report Writing Prompt Templates | TeamPrompt",
      description:
        "AI prompt templates for generating status updates, executive summaries, and analysis reports. Dynamic {{variables}} ensure consistent structure across your entire organization.",
      keywords: ["report writing templates", "AI report generator", "status update templates", "executive summary prompts", "analysis report AI"],
    },
    hero: {
      headline: "Reports that write themselves",
      subtitle:
        "Prompt templates for status updates, executive summaries, and detailed analysis reports. Fill in {{project_name}}, {{time_period}}, and {{key_metrics}} and get a polished report draft every time.",
      badges: ["Status updates", "Executive summaries", "Analysis reports"],
    },
    features: {
      sectionLabel: "Templates",
      heading: "Report templates for every business need",
      items: [
        { icon: "BarChart3", title: "Status update templates", description: "Weekly and monthly status reports with {{project_name}}, {{completed_items}}, {{blockers}}, and {{next_steps}} variables. Same structure every time, no blank-page anxiety." },
        { icon: "Eye", title: "Executive summary templates", description: "Templates that distill complex information into concise executive summaries. Variables like {{audience}} and {{key_findings}} tailor the depth and tone." },
        { icon: "BookOpen", title: "Analysis report templates", description: "Deep-dive analysis templates with {{data_source}}, {{methodology}}, and {{findings}} variables. Structured sections for context, analysis, conclusions, and recommendations." },
        { icon: "Braces", title: "Dynamic formatting", description: "Template variables control not just content but structure — {{report_type}} can switch between bullet-point summaries and narrative formats depending on the audience." },
        { icon: "Users", title: "Departmental templates", description: "Finance, engineering, marketing, and operations each get tailored report templates. Share across your department so every report follows the same professional format." },
        { icon: "Shield", title: "Data-safe reporting", description: "DLP guardrails scan report prompts for sensitive financial data, customer PII, and confidential metrics before they reach AI tools." },
      ],
    },
    benefits: {
      heading: "Why teams use report writing templates",
      items: [
        "Cut report writing time from hours to minutes with structured templates",
        "Ensure every status update follows the same professional format",
        "Produce executive summaries that leadership actually reads",
        "Onboard new managers with report templates that match your standards",
        "Catch sensitive data before it leaks into AI-generated reports",
        "Track which report templates drive the most usage across teams",
      ],
    },
    stats: [
      { value: "80%", label: "Faster report writing" },
      { value: "100%", label: "Format consistency" },
      { value: "0", label: "Formatting rework" },
    ],
    faqs: [
      { question: "What types of reports can I template?", answer: "Any report with a repeatable structure — weekly status updates, monthly business reviews, quarterly OKR reports, executive summaries, incident post-mortems, competitive analyses, and more. If you write it regularly, you can template it." },
      { question: "Can I customize the report structure?", answer: "Yes. Every template is fully editable. Add sections, change the order, modify variables, and adjust the tone. Your team controls the structure completely." },
      { question: "Are financial figures protected by DLP?", answer: "Yes. TeamPrompt's DLP guardrails scan for sensitive financial data, account numbers, revenue figures, and confidential metrics before the prompt reaches any AI tool." },
      { question: "Can different teams have different report formats?", answer: "Absolutely. Each department can maintain its own report template library with separate categories and permissions. Engineering uses sprint report templates while finance uses monthly close templates." },
    ],
    cta: {
      headline: "Stop dreading report day.",
      gradientText: "Template it all.",
      subtitle: "Free report templates included. Set up in under 2 minutes.",
    },
  },
  {
    slug: "social-media-templates",
    category: "template",
    meta: {
      title: "Social Media Prompt Templates | TeamPrompt",
      description:
        "AI prompt templates for creating LinkedIn posts, Twitter/X threads, Instagram captions, and social content. Dynamic {{variables}} keep your brand voice consistent across platforms.",
      keywords: ["social media templates", "AI social media prompts", "LinkedIn post templates", "Twitter prompt templates", "social content AI"],
    },
    hero: {
      headline: "Social content on autopilot",
      subtitle:
        "Prompt templates for LinkedIn, Twitter/X, and Instagram that keep your brand voice consistent. Use {{topic}}, {{platform}}, and {{tone}} variables to generate on-brand content in seconds.",
      badges: ["LinkedIn posts", "Twitter/X threads", "Instagram captions"],
    },
    features: {
      sectionLabel: "Templates",
      heading: "Social media templates for every platform",
      items: [
        { icon: "Globe", title: "Platform-specific templates", description: "Dedicated templates for LinkedIn thought leadership, Twitter/X threads, Instagram captions, and more. Each template respects platform character limits and formatting conventions." },
        { icon: "Braces", title: "Brand voice variables", description: "Variables like {{tone}}, {{brand_voice}}, and {{target_audience}} ensure every post sounds like your brand. Switch from professional to casual with a single variable change." },
        { icon: "BookOpen", title: "Content type library", description: "Templates for announcements, thought leadership, product launches, event recaps, hiring posts, and engagement content. Pre-built structures for every social scenario." },
        { icon: "Zap", title: "Batch content creation", description: "Generate a week's worth of social content in one sitting. Templates with {{topic}} and {{angle}} variables let you produce multiple variations quickly." },
        { icon: "Users", title: "Team-wide brand consistency", description: "Share templates across your marketing, sales, and executive teams. Everyone posts on-brand content without needing a style guide open in another tab." },
        { icon: "BarChart3", title: "Track popular templates", description: "See which social templates your team uses most. Identify content types that drive the most engagement and double down on what works." },
      ],
    },
    benefits: {
      heading: "Why marketing teams use social media templates",
      items: [
        "Generate platform-ready content in seconds instead of brainstorming for hours",
        "Maintain consistent brand voice across every team member's social posts",
        "Scale content creation without scaling your social media team",
        "Empower sales reps and executives to post on-brand content effortlessly",
        "Reduce the feedback loop between content creation and approval",
        "Build a reusable library of proven content formats and structures",
      ],
    },
    stats: [
      { value: "10x", label: "Faster content creation" },
      { value: "100%", label: "Brand consistency" },
      { value: "5+", label: "Platforms supported" },
    ],
    faqs: [
      { question: "Which social platforms are covered?", answer: "TeamPrompt includes templates optimized for LinkedIn, Twitter/X, Instagram, Facebook, and general social content. Each template accounts for platform-specific formatting, character limits, and audience expectations." },
      { question: "Can I enforce brand voice across my team?", answer: "Yes. Templates with {{brand_voice}} and {{tone}} variables standardize how your team writes on social media. Share templates across your organization so every post reflects your brand guidelines." },
      { question: "How do I create content for multiple platforms at once?", answer: "Use a multi-platform template with a {{platform}} variable. Fill in your topic once, then switch the platform variable to generate tailored versions for LinkedIn, Twitter/X, and Instagram from the same core message." },
      { question: "Can non-marketers use these templates?", answer: "Absolutely. That is the whole point. Sales reps, executives, and engineers can use social templates to post professional, on-brand content without any marketing expertise." },
    ],
    cta: {
      headline: "Social content that sounds like you.",
      gradientText: "Every single time.",
      subtitle: "Free plan includes up to 25 social templates. Start posting today.",
    },
  },
  {
    slug: "customer-response-templates",
    category: "template",
    meta: {
      title: "Customer Response Prompt Templates | TeamPrompt",
      description:
        "AI prompt templates for customer support replies — tickets, complaints, feature requests, and escalations. Dynamic {{variables}} personalize every response while maintaining quality.",
      keywords: ["customer response templates", "support reply templates", "AI customer service prompts", "complaint response templates", "ticket reply AI"],
    },
    hero: {
      headline: "Customer replies, perfected",
      subtitle:
        "Prompt templates for support tickets, complaints, feature requests, and escalations. Variables like {{customer_name}}, {{issue_description}}, and {{resolution}} ensure every reply is personal, professional, and fast.",
      badges: ["Support tickets", "Complaint handling", "Feature requests"],
    },
    features: {
      sectionLabel: "Templates",
      heading: "Customer response templates for every situation",
      items: [
        { icon: "Zap", title: "Ticket response templates", description: "Pre-built templates for common support scenarios — password resets, billing inquiries, product questions. Fill in {{customer_name}} and {{issue_summary}} for an instant, personalized reply." },
        { icon: "ShieldAlert", title: "Complaint handling templates", description: "Empathetic, structured templates for frustrated customers. Variables like {{issue_description}} and {{resolution_steps}} guide AI toward de-escalation and resolution." },
        { icon: "BookOpen", title: "Feature request responses", description: "Templates that acknowledge feature requests professionally, set expectations, and offer alternatives. {{feature_requested}} and {{current_workaround}} variables keep replies relevant." },
        { icon: "Key", title: "Escalation templates", description: "Templates for escalating issues internally and updating customers on escalation status. {{priority_level}} and {{escalation_reason}} variables ensure the right context reaches the right team." },
        { icon: "Users", title: "Team-wide consistency", description: "Every support agent uses the same templates with the same tone and structure. New agents produce senior-quality responses from their first day." },
        { icon: "Shield", title: "Data-safe responses", description: "DLP scanning catches customer PII, account numbers, and internal data before it accidentally appears in outbound replies." },
      ],
    },
    benefits: {
      heading: "Why support teams use response templates",
      items: [
        "Cut average response time by 70% with pre-built reply templates",
        "Maintain professional tone and empathy across every support agent",
        "Onboard new support reps with proven response templates from day one",
        "Handle complaints consistently with de-escalation-focused templates",
        "Prevent sensitive customer data from leaking into AI-generated replies",
        "Track which response templates resolve issues fastest",
      ],
    },
    stats: [
      { value: "70%", label: "Faster response time" },
      { value: "100%", label: "Reply consistency" },
      { value: "0", label: "Data leaks" },
    ],
    faqs: [
      { question: "Can I customize the tone of customer responses?", answer: "Yes. Templates include a {{tone}} variable that can be set to empathetic, professional, casual, or any other style. Your team lead can set default tones per template category." },
      { question: "How do complaint handling templates work?", answer: "Complaint templates are structured with acknowledgment, empathy, explanation, and resolution sections. Fill in {{issue_description}} and {{resolution_steps}} and the AI generates a response that follows your de-escalation playbook." },
      { question: "Are customer details protected?", answer: "Yes. DLP guardrails automatically scan every generated response for customer PII, account numbers, and internal data before it reaches any AI tool. Sensitive information is caught and flagged." },
      { question: "Can different support tiers have different templates?", answer: "Yes. Organize templates by tier — Tier 1 gets quick-resolution templates while Tier 2 and Tier 3 get deeper troubleshooting and escalation templates. Permissions control which tiers see which templates." },
    ],
    cta: {
      headline: "Faster, better customer replies.",
      gradientText: "Every single time.",
      subtitle: "Free plan includes support templates. Set up in 2 minutes.",
    },
  },
  {
    slug: "data-analysis-templates",
    category: "template",
    meta: {
      title: "Data Analysis Prompt Templates | TeamPrompt",
      description:
        "AI prompt templates for data analysis — SQL query generation, data interpretation, visualization suggestions, and insight extraction. Dynamic {{variables}} for any dataset.",
      keywords: ["data analysis templates", "AI SQL templates", "data interpretation prompts", "data visualization AI", "analytics prompt templates"],
    },
    hero: {
      headline: "Data analysis, templated",
      subtitle:
        "Prompt templates for SQL query generation, data interpretation, visualization recommendations, and insight extraction. Use {{dataset}}, {{question}}, and {{schema}} variables to get structured analysis from any AI tool.",
      badges: ["SQL generation", "Data interpretation", "Visualization"],
    },
    features: {
      sectionLabel: "Templates",
      heading: "Data analysis templates for every workflow",
      items: [
        { icon: "Braces", title: "SQL query templates", description: "Templates that generate SQL queries from natural language. Variables like {{table_name}}, {{schema}}, and {{question}} produce optimized queries for your specific database structure." },
        { icon: "BarChart3", title: "Data interpretation templates", description: "Templates for analyzing trends, outliers, and patterns. Fill in {{dataset_description}} and {{key_metrics}} and get a structured interpretation with context and next steps." },
        { icon: "Eye", title: "Visualization recommendation", description: "Templates that suggest the best chart types, axes, and groupings for your data. {{data_type}} and {{audience}} variables tailor recommendations to your use case." },
        { icon: "BookOpen", title: "Insight extraction", description: "Templates that prompt AI to identify key takeaways, anomalies, and trends in your data. {{raw_data}} and {{business_context}} variables provide the framing for meaningful insights." },
        { icon: "Shield", title: "Data-safe analysis", description: "DLP guardrails catch sensitive data — customer PII, financial records, and proprietary metrics — before your data reaches any AI tool for analysis." },
        { icon: "Users", title: "Shared analysis standards", description: "Share data analysis templates across your analytics team so everyone uses consistent methodology, formatting, and interpretation frameworks." },
      ],
    },
    benefits: {
      heading: "Why data teams use analysis templates",
      items: [
        "Generate complex SQL queries in seconds instead of writing them from scratch",
        "Standardize data interpretation methodology across your analytics team",
        "Get visualization recommendations tailored to your data and audience",
        "Extract meaningful insights faster with structured analysis prompts",
        "Protect sensitive data with automatic DLP scanning on every analysis prompt",
        "Onboard junior analysts with senior-level analysis template libraries",
      ],
    },
    stats: [
      { value: "5x", label: "Faster query writing" },
      { value: "100%", label: "Methodology consistency" },
      { value: "0", label: "Data exposure risk" },
    ],
    faqs: [
      { question: "What databases do SQL templates support?", answer: "SQL templates work with any database. The {{database_type}} variable lets you specify PostgreSQL, MySQL, BigQuery, Snowflake, Redshift, or any other SQL dialect, and the generated queries use the correct syntax." },
      { question: "Can I use templates with my own schema?", answer: "Yes. Paste your table schema into the {{schema}} variable and the template generates queries that reference your actual tables and columns. No generic guessing." },
      { question: "How do visualization templates work?", answer: "Fill in {{data_type}}, {{dimensions}}, and {{audience}} and the template prompts AI to recommend specific chart types, axis configurations, color schemes, and tool-specific implementation steps." },
      { question: "Is my data protected?", answer: "Yes. DLP guardrails scan every analysis prompt before it reaches any AI tool. Customer PII, financial records, and proprietary data patterns are automatically detected and flagged." },
    ],
    cta: {
      headline: "Analyze data faster.",
      gradientText: "Template your workflows.",
      subtitle: "Free data analysis templates included. Start querying smarter today.",
    },
  },
  {
    slug: "project-planning-templates",
    category: "template",
    meta: {
      title: "Project Planning Prompt Templates | TeamPrompt",
      description:
        "AI prompt templates for project plans, timelines, risk assessments, and stakeholder communications. Dynamic {{variables}} adapt to any project scope and methodology.",
      keywords: ["project planning templates", "AI project management prompts", "project timeline templates", "risk assessment prompts", "stakeholder communication templates"],
    },
    hero: {
      headline: "Plan projects in minutes, not days",
      subtitle:
        "Prompt templates for project plans, timelines, risk assessments, and stakeholder comms. Use {{project_name}}, {{scope}}, and {{methodology}} variables to generate comprehensive project documentation instantly.",
      badges: ["Project plans", "Risk assessment", "Stakeholder comms"],
    },
    features: {
      sectionLabel: "Templates",
      heading: "Project planning templates for every phase",
      items: [
        { icon: "BookOpen", title: "Project plan templates", description: "Comprehensive templates that generate project plans with milestones, deliverables, and resource allocations. Variables like {{scope}}, {{team_size}}, and {{timeline}} adapt the plan to your reality." },
        { icon: "ShieldAlert", title: "Risk assessment templates", description: "Templates that identify, categorize, and prioritize project risks. {{project_type}} and {{constraints}} variables ensure the risk analysis is relevant to your specific situation." },
        { icon: "Users", title: "Stakeholder communication", description: "Templates for project kickoff emails, status updates, and escalation notices. {{stakeholder_group}} and {{project_status}} variables tailor the message to each audience." },
        { icon: "Zap", title: "Sprint planning templates", description: "Agile-ready templates for sprint goals, user stories, and capacity planning. {{team_velocity}} and {{sprint_duration}} variables produce realistic sprint plans." },
        { icon: "GitBranch", title: "Timeline generation", description: "Templates that produce Gantt-chart-ready timelines from project requirements. {{start_date}}, {{milestones}}, and {{dependencies}} variables create accurate schedules." },
        { icon: "Archive", title: "Post-mortem templates", description: "Structured templates for project retrospectives and incident post-mortems. {{what_happened}}, {{impact}}, and {{lessons_learned}} variables ensure thorough documentation." },
      ],
    },
    benefits: {
      heading: "Why project managers use planning templates",
      items: [
        "Generate comprehensive project plans in minutes instead of hours",
        "Identify risks systematically with structured assessment templates",
        "Communicate with stakeholders using consistent, professional formats",
        "Standardize sprint planning across Scrum teams organization-wide",
        "Onboard new PMs with proven planning template libraries",
        "Maintain a reusable library of project documentation templates",
      ],
    },
    stats: [
      { value: "75%", label: "Faster planning" },
      { value: "100%", label: "Risk coverage" },
      { value: "0", label: "Missed stakeholder updates" },
    ],
    faqs: [
      { question: "What project methodologies are supported?", answer: "Templates are available for Agile, Scrum, Kanban, Waterfall, and hybrid methodologies. The {{methodology}} variable adjusts the plan structure, terminology, and deliverables to match your team's approach." },
      { question: "Can I generate timelines from templates?", answer: "Yes. Timeline templates take {{start_date}}, {{milestones}}, and {{dependencies}} as inputs and generate structured timelines with phases, deadlines, and dependency chains that can be imported into project management tools." },
      { question: "How do risk assessment templates work?", answer: "Fill in {{project_type}}, {{constraints}}, and {{known_risks}} and the template prompts AI to identify additional risks, assess probability and impact, and suggest mitigation strategies for each." },
      { question: "Can I share planning templates across teams?", answer: "Yes. Share templates across your PMO so every project manager follows the same planning standards. Category-based permissions let different teams maintain their own specialized templates." },
    ],
    cta: {
      headline: "Plan better projects.",
      gradientText: "Ship on time.",
      subtitle: "Free project planning templates included. No credit card required.",
    },
  },
  {
    slug: "interview-prep-templates",
    category: "template",
    meta: {
      title: "Interview Prep Prompt Templates | TeamPrompt",
      description:
        "AI prompt templates for interview questions, evaluation criteria, candidate scoring rubrics, and debrief summaries. Standardize your hiring process with dynamic {{variables}}.",
      keywords: ["interview prep templates", "AI interview questions", "candidate evaluation templates", "hiring prompt templates", "interview scoring rubric"],
    },
    hero: {
      headline: "Interviews that hire the right people",
      subtitle:
        "Prompt templates for generating interview questions, evaluation criteria, scoring rubrics, and debrief summaries. Use {{role}}, {{level}}, and {{competencies}} variables to build a structured, fair hiring process.",
      badges: ["Interview questions", "Scoring rubrics", "Debrief summaries"],
    },
    features: {
      sectionLabel: "Templates",
      heading: "Interview templates for every stage of hiring",
      items: [
        { icon: "BookOpen", title: "Question generation templates", description: "Templates that generate role-specific interview questions. {{role}}, {{level}}, and {{competencies}} variables produce behavioral, technical, and situational questions tailored to your open position." },
        { icon: "BarChart3", title: "Scoring rubric templates", description: "Templates that create structured evaluation criteria with clear scoring guidelines. {{competency}} and {{level_expectations}} variables ensure interviewers grade consistently." },
        { icon: "Users", title: "Panel interview templates", description: "Templates for distributing questions across panel members so no competency is missed and no question is duplicated. {{panel_members}} and {{focus_areas}} variables coordinate the panel." },
        { icon: "Eye", title: "Debrief summary templates", description: "Templates for compiling interviewer feedback into a structured hiring decision document. {{candidate_name}} and {{interview_feedback}} variables produce a clear recommendation." },
        { icon: "Shield", title: "Bias-aware design", description: "Templates built with structured evaluation criteria to reduce unconscious bias. Consistent rubrics ensure candidates are assessed on the same dimensions." },
        { icon: "Key", title: "Role-specific libraries", description: "Pre-built template sets for engineering, product, design, sales, and operations roles. Each set includes questions, rubrics, and evaluation criteria calibrated to industry standards." },
      ],
    },
    benefits: {
      heading: "Why hiring teams use interview templates",
      items: [
        "Generate role-specific interview questions in seconds instead of starting from scratch",
        "Ensure every candidate is evaluated against the same structured criteria",
        "Reduce interviewer bias with consistent scoring rubrics and evaluation frameworks",
        "Coordinate panel interviews so every competency is covered without duplication",
        "Produce structured debrief summaries that drive faster, fairer hiring decisions",
        "Build a reusable library of interview content organized by role and level",
      ],
    },
    stats: [
      { value: "50%", label: "Faster interview prep" },
      { value: "100%", label: "Rubric consistency" },
      { value: "0", label: "Missed competencies" },
    ],
    faqs: [
      { question: "Can I generate questions for any role?", answer: "Yes. Fill in {{role}}, {{level}}, and {{competencies}} and the template generates tailored interview questions. Works for engineering, product, design, sales, marketing, operations, and any other function." },
      { question: "How do scoring rubrics work?", answer: "Rubric templates define clear scoring criteria for each competency — what a 1, 2, 3, 4, and 5 look like. Interviewers score against these criteria so every candidate is evaluated fairly and consistently." },
      { question: "Are these templates designed to reduce bias?", answer: "Yes. Structured interviews with consistent rubrics are proven to reduce unconscious bias compared to unstructured conversations. Templates ensure every interviewer assesses the same dimensions with the same criteria." },
      { question: "Can I share templates across my recruiting team?", answer: "Yes. Share interview templates across your hiring team with category-based permissions. Recruiters, hiring managers, and interviewers each see the templates relevant to their role in the process." },
    ],
    cta: {
      headline: "Hire better people.",
      gradientText: "Interview with structure.",
      subtitle: "Free interview templates included. Set up your first rubric in minutes.",
    },
  },
  {
    slug: "documentation-templates",
    category: "template",
    meta: {
      title: "Documentation Prompt Templates | TeamPrompt",
      description:
        "AI prompt templates for technical documentation, API docs, user guides, and READMEs. Dynamic {{variables}} adapt to any project, language, or framework.",
      keywords: ["documentation templates", "AI documentation prompts", "API documentation templates", "technical writing prompts", "README generator AI"],
    },
    hero: {
      headline: "Documentation nobody dreads writing",
      subtitle:
        "Prompt templates for technical docs, API references, user guides, and READMEs. Use {{project_name}}, {{language}}, and {{audience}} variables to generate clear, comprehensive documentation from any AI tool.",
      badges: ["Technical docs", "API references", "User guides"],
    },
    features: {
      sectionLabel: "Templates",
      heading: "Documentation templates for every project",
      items: [
        { icon: "BookOpen", title: "Technical doc templates", description: "Templates for architecture overviews, system design documents, and implementation guides. Variables like {{system_name}}, {{components}}, and {{tech_stack}} generate docs that match your actual infrastructure." },
        { icon: "Braces", title: "API documentation templates", description: "Templates that generate endpoint references, request/response examples, and authentication guides. {{endpoint}}, {{method}}, and {{parameters}} variables produce consistent API docs across your entire surface." },
        { icon: "Users", title: "User guide templates", description: "Templates for onboarding guides, feature walkthroughs, and troubleshooting docs. {{feature_name}} and {{user_type}} variables tailor the language and depth to your audience." },
        { icon: "Archive", title: "README templates", description: "Project README templates with {{project_name}}, {{description}}, {{installation_steps}}, and {{usage_examples}} variables. Generate comprehensive READMEs that follow open-source best practices." },
        { icon: "GitBranch", title: "Changelog templates", description: "Templates for release notes and changelogs. {{version}}, {{changes}}, and {{breaking_changes}} variables produce clear, consistent release documentation." },
        { icon: "Shield", title: "Sensitive data protection", description: "DLP guardrails scan documentation prompts for API keys, credentials, internal URLs, and proprietary architecture details before they reach AI tools." },
      ],
    },
    benefits: {
      heading: "Why teams use documentation templates",
      items: [
        "Generate comprehensive documentation in minutes instead of postponing it indefinitely",
        "Maintain consistent doc structure and formatting across your entire codebase",
        "Produce API documentation that developers actually want to read",
        "Onboard new contributors with professional READMEs and setup guides",
        "Catch API keys and credentials before they leak into AI-generated documentation",
        "Build a reusable library of documentation templates organized by doc type",
      ],
    },
    stats: [
      { value: "10x", label: "Faster doc writing" },
      { value: "100%", label: "Format consistency" },
      { value: "0", label: "Credential leaks" },
    ],
    faqs: [
      { question: "What types of documentation can I template?", answer: "Any documentation with a repeatable structure — technical architecture docs, API references, user guides, READMEs, changelogs, onboarding guides, runbooks, and incident response procedures. If you write it more than once, template it." },
      { question: "How do API documentation templates work?", answer: "Fill in {{endpoint}}, {{method}}, {{parameters}}, and {{response_schema}} and the template generates a complete endpoint reference with descriptions, examples, error codes, and authentication requirements." },
      { question: "Can I generate READMEs for existing projects?", answer: "Yes. Paste your project context into {{description}}, {{tech_stack}}, and {{installation_steps}} variables and the template generates a comprehensive README following open-source conventions — badges, table of contents, contributing guidelines, and license info." },
      { question: "Are credentials protected in documentation prompts?", answer: "Yes. DLP guardrails automatically scan for API keys, database connection strings, internal URLs, and other credentials before your documentation prompt reaches any AI tool." },
    ],
    cta: {
      headline: "Write docs people actually read.",
      gradientText: "Template the hard parts.",
      subtitle: "Free documentation templates included. No more blank-page anxiety.",
    },
  },
];
