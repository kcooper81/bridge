import type { SeoPageData } from "../types";

export const glossaryPages: SeoPageData[] = [
  {
    slug: "what-is-prompt-management",
    category: "glossary",
    meta: {
      title: "What Is Prompt Management? Definition & Guide | TeamPrompt",
      description: "Learn what prompt management is, why it matters for teams using AI, and how TeamPrompt helps you organize, share, and govern prompts at scale.",
      keywords: ["prompt management definition", "what is prompt management", "prompt management explained", "AI prompt organization", "prompt management tool"],
    },
    hero: {
      headline: "What is prompt management?",
      subtitle: "Prompt management is the practice of organizing, storing, versioning, and governing the AI prompts your team creates and uses. It turns scattered, ad-hoc prompt writing into a structured system that scales with your organization.",
      badges: ["Definition", "Prompt ops", "Team AI"],
    },
    features: {
      sectionLabel: "Key Components",
      heading: "What makes up prompt management",
      items: [
        { icon: "Archive", title: "Centralized prompt storage", description: "A single repository where every prompt lives, replacing scattered documents, bookmarks, and Slack messages." },
        { icon: "GitBranch", title: "Version control", description: "Track every change to every prompt with full history, diffs, and the ability to roll back to any previous version." },
        { icon: "Users", title: "Team sharing and permissions", description: "Control who can view, edit, and publish prompts with role-based access and shared categories." },
        { icon: "Shield", title: "Security and DLP", description: "Scan outbound prompts for sensitive data like PII, API keys, and credentials before they reach any AI model." },
        { icon: "BarChart3", title: "Usage analytics", description: "Track which prompts are used, by whom, and how often to understand AI adoption across your organization." },
        { icon: "Zap", title: "Workflow integration", description: "Access prompts directly inside ChatGPT, Claude, Gemini, and other AI tools through browser extensions." },
      ],
    },
    benefits: {
      heading: "Why prompt management matters",
      items: [
        "Eliminate duplicated effort from team members writing the same prompts independently",
        "Ensure consistent AI output quality across your entire organization",
        "Protect sensitive data with automatic scanning before prompts reach AI models",
        "Accelerate onboarding by giving new hires access to proven prompt templates",
        "Build institutional AI knowledge that compounds over time",
        "Gain full visibility into how your organization uses AI tools",
      ],
    },
    faqs: [
      { question: "How is prompt management different from a shared doc?", answer: "A shared document lacks version control, search, permissions, DLP scanning, and direct integration with AI tools. Prompt management platforms like TeamPrompt provide all of these in a purpose-built system." },
      { question: "When should a team start managing prompts?", answer: "As soon as more than one person uses AI tools regularly. Even small teams quickly accumulate dozens of prompts that benefit from organization and sharing." },
      { question: "Does prompt management slow down AI usage?", answer: "No — it accelerates it. Instead of writing prompts from scratch, team members search a library of proven templates and insert them in one click." },
    ],
    cta: {
      headline: "Start managing prompts",
      gradientText: "the right way.",
      subtitle: "Free plan available. Set up in under 5 minutes.",
    },
  },
  {
    slug: "what-is-prompt-engineering",
    category: "glossary",
    meta: {
      title: "What Is Prompt Engineering? Definition & Guide | TeamPrompt",
      description: "Learn what prompt engineering is, techniques for writing effective AI prompts, and how TeamPrompt helps teams scale prompt engineering practices.",
      keywords: ["prompt engineering definition", "what is prompt engineering", "prompt engineering explained", "AI prompt writing", "prompt engineering techniques"],
    },
    hero: {
      headline: "What is prompt engineering?",
      subtitle: "Prompt engineering is the practice of designing and refining inputs to AI models to get the most accurate, useful, and consistent outputs. It combines technical skill with clear communication to guide AI behavior effectively.",
      badges: ["Definition", "AI skills", "Techniques"],
    },
    features: {
      sectionLabel: "Core Techniques",
      heading: "Key prompt engineering techniques",
      items: [
        { icon: "BookOpen", title: "Structured formatting", description: "Use clear sections like role, context, task, constraints, and output format to give AI models the information they need." },
        { icon: "FileText", title: "Few-shot examples", description: "Provide example inputs and outputs so the model understands the pattern and style you expect." },
        { icon: "GitBranch", title: "Iterative refinement", description: "Treat prompts as living documents that improve through testing, versioning, and data-driven optimization." },
        { icon: "Users", title: "Role assignment", description: "Tell the AI to adopt a specific persona or expertise to focus its responses on the right domain." },
        { icon: "ClipboardList", title: "Chain-of-thought", description: "Ask the model to reason step by step, improving accuracy on complex tasks like math and logic." },
        { icon: "Shield", title: "Guardrails and constraints", description: "Set boundaries on output length, format, tone, and content to keep responses safe and on-topic." },
      ],
    },
    benefits: {
      heading: "Why prompt engineering matters for teams",
      items: [
        "Well-engineered prompts produce dramatically better AI outputs than ad-hoc queries",
        "Structured techniques reduce variability and increase consistency across team members",
        "Templates let less experienced users benefit from expert-level prompt patterns",
        "Version-controlled prompts allow teams to iterate and improve systematically",
        "Shared best practices raise the entire organization's AI capability",
        "Measurable improvement in output quality through analytics and feedback loops",
      ],
    },
    faqs: [
      { question: "Do I need coding skills for prompt engineering?", answer: "No. Prompt engineering is primarily about clear communication and structured thinking. While technical knowledge helps for specialized use cases, anyone can learn effective prompt engineering techniques." },
      { question: "How does TeamPrompt help with prompt engineering?", answer: "TeamPrompt provides templates, version control, team sharing, and usage analytics so your prompt engineering efforts scale across the organization instead of staying siloed with individuals." },
      { question: "What is the difference between prompt engineering and prompt management?", answer: "Prompt engineering focuses on crafting effective prompts. Prompt management focuses on organizing, sharing, and governing those prompts at scale. TeamPrompt supports both." },
    ],
    cta: {
      headline: "Scale prompt engineering",
      gradientText: "across your team.",
      subtitle: "Share, version, and optimize prompts together. Start free.",
    },
  },
  {
    slug: "what-is-prompt-templates",
    category: "glossary",
    meta: {
      title: "What Are Prompt Templates? Definition & Guide | TeamPrompt",
      description: "Learn what prompt templates are, how they improve consistency and efficiency, and how TeamPrompt helps teams create and manage reusable prompt templates.",
      keywords: ["prompt templates definition", "what are prompt templates", "AI prompt templates", "reusable prompts", "prompt template variables"],
    },
    hero: {
      headline: "What are prompt templates?",
      subtitle: "Prompt templates are reusable prompt structures with dynamic variables that team members fill in before sending to an AI model. They standardize how your team interacts with AI while allowing customization for each use case.",
      badges: ["Definition", "Reusability", "Variables"],
    },
    features: {
      sectionLabel: "Template Features",
      heading: "What makes prompt templates powerful",
      items: [
        { icon: "FileText", title: "Dynamic variables", description: "Define placeholders like {{topic}}, {{audience}}, and {{tone}} that users fill in before sending the prompt to an AI model." },
        { icon: "Archive", title: "Template library", description: "Store all templates in a searchable library organized by category, team, or use case for instant access." },
        { icon: "Users", title: "Team-wide sharing", description: "Share templates across departments so everyone benefits from your best prompt patterns without duplicating work." },
        { icon: "GitBranch", title: "Version history", description: "Track changes to templates over time, see who modified what, and roll back to previous versions when needed." },
        { icon: "Zap", title: "One-click insertion", description: "Insert templates directly into ChatGPT, Claude, or any AI tool through the browser extension with a single click." },
        { icon: "BarChart3", title: "Usage tracking", description: "See which templates are used most frequently and by which teams to understand adoption and value." },
      ],
    },
    benefits: {
      heading: "Why teams use prompt templates",
      items: [
        "Eliminate repetitive prompt writing by reusing proven structures",
        "Ensure consistent AI output quality across all team members",
        "Reduce the learning curve for team members new to AI tools",
        "Maintain brand voice and standards through standardized prompts",
        "Save hours per week by turning one-off prompts into reusable templates",
        "Track which templates deliver the best results across your organization",
      ],
    },
    faqs: [
      { question: "How are templates different from regular prompts?", answer: "Templates include dynamic variables (placeholders) that users fill in before sending. A regular prompt is static text. Templates provide structure and consistency while allowing customization." },
      { question: "Can I create templates for different AI models?", answer: "Yes. TeamPrompt templates work with ChatGPT, Claude, Gemini, Copilot, and any AI tool supported by the browser extension. The same template can be used across models." },
      { question: "How many variables can a template have?", answer: "There is no practical limit. Use as many variables as needed to make the template flexible. Common templates have between two and six variables." },
    ],
    cta: {
      headline: "Build your template library",
      gradientText: "in minutes.",
      subtitle: "Create reusable prompt templates your whole team can use. Start free.",
    },
  },
  {
    slug: "what-is-prompt-library",
    category: "glossary",
    meta: {
      title: "What Is a Prompt Library? Definition & Guide | TeamPrompt",
      description: "Learn what a prompt library is, why every AI-using team needs one, and how TeamPrompt helps you build and manage a shared prompt library.",
      keywords: ["prompt library definition", "what is a prompt library", "AI prompt library", "shared prompt repository", "team prompt library"],
    },
    hero: {
      headline: "What is a prompt library?",
      subtitle: "A prompt library is a centralized, searchable collection of AI prompts that teams organize, share, and maintain together. It replaces scattered documents and bookmarks with a structured repository accessible directly inside AI tools.",
      badges: ["Definition", "Organization", "Team AI"],
    },
    features: {
      sectionLabel: "Library Features",
      heading: "What a prompt library includes",
      items: [
        { icon: "Archive", title: "Searchable repository", description: "Find any prompt instantly with full-text search, category filters, and tags instead of digging through documents and chat histories." },
        { icon: "Users", title: "Team organization", description: "Organize prompts by team, department, use case, or any taxonomy that fits your organization's workflow." },
        { icon: "BookOpen", title: "Rich prompt metadata", description: "Each prompt includes descriptions, usage notes, categories, and tags so team members understand when and how to use it." },
        { icon: "GitBranch", title: "Version tracking", description: "Every change is tracked with full history, so your library evolves without losing what came before." },
        { icon: "Shield", title: "Access controls", description: "Control who can view, create, edit, and delete prompts with role-based permissions at the team and category level." },
        { icon: "Globe", title: "Multi-platform access", description: "Access your library from any AI tool through the browser extension, or from the web dashboard for management and analytics." },
      ],
    },
    benefits: {
      heading: "Why teams need a prompt library",
      items: [
        "Stop losing great prompts in Slack threads, documents, and personal bookmarks",
        "Reduce duplicated effort across team members writing similar prompts",
        "Onboard new team members faster with ready-to-use, proven prompts",
        "Build institutional knowledge that grows more valuable over time",
        "Ensure consistency in how your organization interacts with AI tools",
        "Gain visibility into which prompts drive the most value",
      ],
    },
    faqs: [
      { question: "How is a prompt library different from a shared Google Doc?", answer: "A prompt library offers search, categories, version control, permissions, DLP scanning, usage analytics, and direct insertion into AI tools. A Google Doc offers none of these." },
      { question: "How do I get my team to actually use the library?", answer: "Make it accessible where they work. TeamPrompt's browser extension puts the library inside ChatGPT, Claude, and other tools so using it is faster than writing from scratch." },
      { question: "How many prompts should a library have to start?", answer: "Start with ten to twenty of your team's most-used prompts. Quality matters more than quantity. The library will grow naturally as team members contribute." },
    ],
    cta: {
      headline: "Build your prompt library",
      gradientText: "today.",
      subtitle: "Start with your best prompts and grow from there. Free plan available.",
    },
  },
  {
    slug: "what-is-prompt-chaining",
    category: "glossary",
    meta: {
      title: "What Is Prompt Chaining? Definition & Guide | TeamPrompt",
      description: "Learn what prompt chaining is, how it breaks complex tasks into sequential steps, and how TeamPrompt helps teams build and manage prompt chains.",
      keywords: ["prompt chaining definition", "what is prompt chaining", "sequential prompts", "multi-step prompts", "AI prompt chains"],
    },
    hero: {
      headline: "What is prompt chaining?",
      subtitle: "Prompt chaining is the technique of breaking a complex AI task into a sequence of smaller, focused prompts where the output of one step feeds into the next. It produces more accurate and reliable results than trying to accomplish everything in a single prompt.",
      badges: ["Definition", "Advanced technique", "Multi-step"],
    },
    features: {
      sectionLabel: "Chaining Concepts",
      heading: "How prompt chaining works",
      items: [
        { icon: "ArrowDownUp", title: "Sequential steps", description: "Break complex tasks into ordered steps where each prompt builds on the output of the previous one, creating a reliable pipeline." },
        { icon: "FileText", title: "Focused instructions", description: "Each step in the chain has a single, clear objective, making the AI more accurate than overloaded single prompts." },
        { icon: "ClipboardList", title: "Output formatting", description: "Define the output format of each step so it integrates cleanly as input for the next step in the chain." },
        { icon: "BookOpen", title: "Template chains", description: "Save entire chains as reusable templates that team members can execute step by step with consistent results." },
        { icon: "GitBranch", title: "Version each step", description: "Version control individual steps independently so you can optimize one part of the chain without affecting others." },
        { icon: "BarChart3", title: "Track chain performance", description: "Monitor which chains produce the best results and identify bottleneck steps that need improvement." },
      ],
    },
    benefits: {
      heading: "Why teams use prompt chaining",
      items: [
        "Dramatically improve accuracy on complex tasks that overwhelm single prompts",
        "Make sophisticated AI workflows accessible to less technical team members",
        "Debug and optimize individual steps without rebuilding the entire workflow",
        "Produce more consistent results by constraining each step's scope",
        "Reuse chain templates across similar use cases and team members",
        "Build complex AI capabilities incrementally rather than all at once",
      ],
    },
    faqs: [
      { question: "When should I use prompt chaining vs. a single prompt?", answer: "Use chaining when a task has multiple distinct stages, when accuracy matters more than speed, or when a single prompt produces inconsistent results. Common examples include research-then-write, analyze-then-summarize, and draft-then-review workflows." },
      { question: "Can I save prompt chains in TeamPrompt?", answer: "Yes. Save each step as a template in a shared category, ordered and documented so team members can follow the chain step by step with consistent results." },
      { question: "How many steps should a chain have?", answer: "Most effective chains have two to five steps. More steps add reliability but also add time. Start simple and add steps only when you see accuracy improvements." },
    ],
    cta: {
      headline: "Chain prompts together",
      gradientText: "for better results.",
      subtitle: "Build, share, and optimize prompt chains with your team. Start free.",
    },
  },
  {
    slug: "what-is-system-prompts",
    category: "glossary",
    meta: {
      title: "What Are System Prompts? Definition & Guide | TeamPrompt",
      description: "Learn what system prompts are, how they control AI behavior, and how TeamPrompt helps teams manage and standardize system prompts across AI tools.",
      keywords: ["system prompts definition", "what are system prompts", "AI system instructions", "system message AI", "system prompt management"],
    },
    hero: {
      headline: "What are system prompts?",
      subtitle: "System prompts are instructions provided to an AI model before the user's message that define the model's behavior, persona, constraints, and output format. They set the rules for how the AI responds throughout an entire conversation.",
      badges: ["Definition", "AI behavior", "Instructions"],
    },
    features: {
      sectionLabel: "System Prompt Elements",
      heading: "What system prompts control",
      items: [
        { icon: "Users", title: "Persona and role", description: "Define who the AI should act as — a technical writer, legal advisor, customer support agent, or any specialized role." },
        { icon: "ClipboardList", title: "Response format", description: "Specify output structure like bullet points, JSON, markdown tables, or any format your workflow requires." },
        { icon: "Shield", title: "Safety constraints", description: "Set boundaries on topics, tone, and content to keep AI responses appropriate for your organization." },
        { icon: "BookOpen", title: "Knowledge context", description: "Provide background information, terminology, and domain knowledge the AI should reference in every response." },
        { icon: "Scale", title: "Behavioral rules", description: "Define how the AI handles edge cases, uncertainty, and requests outside its defined scope." },
        { icon: "Lock", title: "Security boundaries", description: "Instruct the model to refuse certain types of requests or to never reveal its system prompt contents." },
      ],
    },
    benefits: {
      heading: "Why teams need standardized system prompts",
      items: [
        "Ensure consistent AI behavior across all team members using the same tool",
        "Enforce brand voice, terminology, and communication standards automatically",
        "Reduce prompt engineering effort by baking context into the system layer",
        "Improve safety by setting constraints that apply to every interaction",
        "Share optimized system prompts across departments for consistent experiences",
        "Version and iterate on system prompts as your requirements evolve",
      ],
    },
    faqs: [
      { question: "How is a system prompt different from a user prompt?", answer: "A system prompt sets the rules and context for the entire conversation. A user prompt is the specific question or task within that conversation. System prompts are like job descriptions; user prompts are like individual assignments." },
      { question: "Can I manage system prompts in TeamPrompt?", answer: "Yes. Store system prompts as templates in your library, version them, share them across teams, and insert them into AI tools through the browser extension." },
      { question: "Do all AI models support system prompts?", answer: "Most major models including GPT-4, Claude, and Gemini support system prompts. The exact implementation varies by model, but the concept is universal." },
    ],
    cta: {
      headline: "Standardize your AI",
      gradientText: "with system prompts.",
      subtitle: "Manage system prompts for your whole team. Start free.",
    },
  },
  {
    slug: "what-is-few-shot-prompting",
    category: "glossary",
    meta: {
      title: "What Is Few-Shot Prompting? Definition & Guide | TeamPrompt",
      description: "Learn what few-shot prompting is, how providing examples improves AI output quality, and how TeamPrompt helps teams share few-shot prompt templates.",
      keywords: ["few-shot prompting definition", "what is few-shot prompting", "few-shot learning", "prompt examples", "in-context learning"],
    },
    hero: {
      headline: "What is few-shot prompting?",
      subtitle: "Few-shot prompting is the technique of including a small number of example inputs and outputs in your prompt so the AI model learns the pattern, format, and style you expect. It dramatically improves output consistency without any model fine-tuning.",
      badges: ["Definition", "Technique", "Examples"],
    },
    features: {
      sectionLabel: "Few-Shot Techniques",
      heading: "How few-shot prompting works",
      items: [
        { icon: "BookOpen", title: "Example pairs", description: "Provide two to five input-output pairs that demonstrate the exact pattern, format, and quality you expect from the AI." },
        { icon: "FileText", title: "Format consistency", description: "Examples teach the model your desired output structure — whether JSON, markdown, bullet points, or any custom format." },
        { icon: "Eye", title: "Style matching", description: "Show the tone, vocabulary, and writing style you want by including examples that match your brand or team standards." },
        { icon: "ClipboardList", title: "Edge case handling", description: "Include examples of tricky inputs to show the model how to handle edge cases in your specific domain." },
        { icon: "Archive", title: "Template-ready examples", description: "Save few-shot templates in your library so team members get consistent results without crafting examples from scratch." },
        { icon: "BarChart3", title: "Quality benchmarking", description: "Use your examples as benchmarks to evaluate whether AI outputs meet the standard you demonstrated." },
      ],
    },
    benefits: {
      heading: "Why teams use few-shot prompting",
      items: [
        "Dramatically improve output consistency without fine-tuning or complex engineering",
        "Teach AI models your exact format, style, and quality expectations",
        "Reduce back-and-forth by getting the right output on the first try",
        "Share proven example sets across your team through prompt templates",
        "Handle domain-specific tasks by showing the model what good output looks like",
        "Scale expert-level prompt patterns to every team member through templates",
      ],
    },
    faqs: [
      { question: "How many examples should I include?", answer: "Two to five examples typically work best. More examples improve consistency but use more tokens. Start with three and adjust based on output quality." },
      { question: "What is the difference between few-shot and zero-shot prompting?", answer: "Zero-shot prompting provides no examples — just instructions. Few-shot prompting includes example pairs. Few-shot generally produces more consistent outputs, especially for format-specific tasks." },
      { question: "Can I save few-shot templates in TeamPrompt?", answer: "Yes. Save your best few-shot templates with example pairs and variables in TeamPrompt's library. Team members use them directly inside AI tools without recreating examples." },
    ],
    cta: {
      headline: "Share few-shot templates",
      gradientText: "across your team.",
      subtitle: "Build a library of proven few-shot prompts. Start free.",
    },
  },
  {
    slug: "what-is-zero-shot-prompting",
    category: "glossary",
    meta: {
      title: "What Is Zero-Shot Prompting? Definition & Guide | TeamPrompt",
      description: "Learn what zero-shot prompting is, when to use it vs. few-shot, and how TeamPrompt helps teams build effective zero-shot prompt templates.",
      keywords: ["zero-shot prompting definition", "what is zero-shot prompting", "zero-shot learning", "prompt without examples", "zero-shot AI"],
    },
    hero: {
      headline: "What is zero-shot prompting?",
      subtitle: "Zero-shot prompting is giving an AI model a task or question without providing any examples. The model relies entirely on its training data and your instructions to produce the output. It is the simplest and fastest prompting approach.",
      badges: ["Definition", "Technique", "Fundamentals"],
    },
    features: {
      sectionLabel: "Zero-Shot Essentials",
      heading: "How zero-shot prompting works",
      items: [
        { icon: "Zap", title: "Direct instructions", description: "Provide clear, specific instructions without examples. The model uses its training to understand and execute the task." },
        { icon: "FileText", title: "Clear task framing", description: "Define the task, expected format, and constraints explicitly since there are no examples to infer from." },
        { icon: "Users", title: "Role assignment", description: "Assign a role or persona to focus the model's knowledge on the right domain without needing examples." },
        { icon: "ClipboardList", title: "Constraint specification", description: "Set explicit boundaries on length, format, tone, and content to guide the output in the right direction." },
        { icon: "BookOpen", title: "Template standardization", description: "Create zero-shot templates with well-crafted instructions that team members can reuse for consistent results." },
        { icon: "BarChart3", title: "Performance monitoring", description: "Track which zero-shot prompts produce acceptable results and which need examples added to improve quality." },
      ],
    },
    benefits: {
      heading: "Why teams use zero-shot prompting",
      items: [
        "Fastest prompting approach — no time spent crafting examples",
        "Uses fewer tokens, reducing costs for high-volume use cases",
        "Works well for general tasks where the model has strong training data",
        "Easy to create templates that any team member can use immediately",
        "Good starting point before deciding if few-shot examples are needed",
        "Ideal for brainstorming, summarization, and other open-ended tasks",
      ],
    },
    faqs: [
      { question: "When should I use zero-shot vs. few-shot prompting?", answer: "Use zero-shot for general tasks, brainstorming, and summarization. Switch to few-shot when you need specific formats, domain-specific outputs, or higher consistency. Start zero-shot and add examples only when needed." },
      { question: "How do I improve zero-shot prompt quality?", answer: "Be specific about the task, format, and constraints. Assign a role, specify the audience, and define the output structure. TeamPrompt templates help standardize these elements." },
      { question: "Can zero-shot prompts be effective for complex tasks?", answer: "For very complex or domain-specific tasks, few-shot or chain-of-thought prompting typically outperforms zero-shot. Zero-shot works best for tasks the model encounters frequently in training data." },
    ],
    cta: {
      headline: "Build better zero-shot prompts",
      gradientText: "with your team.",
      subtitle: "Create and share zero-shot templates across your organization. Start free.",
    },
  },
  {
    slug: "what-is-prompt-injection",
    category: "glossary",
    meta: {
      title: "What Is Prompt Injection? Definition & Security Guide | TeamPrompt",
      description: "Learn what prompt injection is, how attackers exploit AI systems, and how TeamPrompt helps teams defend against prompt injection attacks.",
      keywords: ["prompt injection definition", "what is prompt injection", "AI security attack", "prompt injection prevention", "LLM security"],
    },
    hero: {
      headline: "What is prompt injection?",
      subtitle: "Prompt injection is a security attack where malicious input is crafted to override or manipulate an AI model's system instructions. Attackers use it to make AI systems ignore their guardrails, leak sensitive data, or produce harmful outputs.",
      badges: ["Definition", "Security", "AI attacks"],
    },
    features: {
      sectionLabel: "Attack Vectors",
      heading: "How prompt injection works",
      items: [
        { icon: "ShieldAlert", title: "Direct injection", description: "Attackers include instructions in their input that tell the model to ignore its system prompt and follow new instructions instead." },
        { icon: "Eye", title: "Indirect injection", description: "Malicious instructions are hidden in external content the AI processes, like web pages, documents, or emails." },
        { icon: "Lock", title: "System prompt extraction", description: "Attackers craft prompts designed to make the model reveal its hidden system instructions and configuration." },
        { icon: "UserX", title: "Jailbreaking", description: "Techniques that bypass safety guardrails by framing harmful requests in creative ways the model does not recognize as violations." },
        { icon: "Shield", title: "Input validation", description: "Scan and filter user inputs for known injection patterns before they reach the AI model." },
        { icon: "Scale", title: "Defense in depth", description: "Layer multiple defenses including input scanning, output filtering, and monitoring to catch injection attempts." },
      ],
    },
    benefits: {
      heading: "How to protect against prompt injection",
      items: [
        "Scan all prompts for known injection patterns before they reach AI models",
        "Implement input validation and sanitization as a standard practice",
        "Use DLP scanning to catch sensitive data extraction attempts",
        "Monitor prompt logs for unusual patterns that suggest injection attacks",
        "Educate team members about injection risks and safe prompting practices",
        "Use TeamPrompt's guardrails to add a security layer between users and AI models",
      ],
    },
    faqs: [
      { question: "Can prompt injection be fully prevented?", answer: "No single technique eliminates all prompt injection risk, but layered defenses dramatically reduce it. Input scanning, output monitoring, DLP, and user education together provide strong protection." },
      { question: "Does TeamPrompt protect against prompt injection?", answer: "TeamPrompt's DLP scanning catches sensitive data in prompts before they reach AI models, and its governance features help teams enforce safe prompting practices. It adds a security layer between your team and AI tools." },
      { question: "Is prompt injection only a risk for developers?", answer: "No. Any team using AI tools is potentially vulnerable, especially when AI processes external content like emails, documents, or web pages. Injection defense is an organizational concern." },
    ],
    cta: {
      headline: "Protect your team from",
      gradientText: "prompt injection.",
      subtitle: "Add DLP scanning and governance guardrails to your AI workflow. Start free.",
    },
  },
  {
    slug: "what-is-prompt-variables",
    category: "glossary",
    meta: {
      title: "What Are Prompt Variables? Definition & Guide | TeamPrompt",
      description: "Learn what prompt variables are, how they make templates reusable, and how TeamPrompt helps teams create and manage dynamic prompt templates with variables.",
      keywords: ["prompt variables definition", "what are prompt variables", "dynamic prompts", "template variables", "prompt placeholders"],
    },
    hero: {
      headline: "What are prompt variables?",
      subtitle: "Prompt variables are dynamic placeholders in a prompt template that users fill in before sending the prompt to an AI model. They turn static prompts into flexible, reusable templates — like {{topic}}, {{audience}}, or {{tone}}.",
      badges: ["Definition", "Templates", "Dynamic"],
    },
    features: {
      sectionLabel: "Variable Features",
      heading: "How prompt variables work",
      items: [
        { icon: "FileText", title: "Placeholder syntax", description: "Define variables using double curly braces like {{variable_name}}. Users see a form to fill in each variable before the prompt is sent." },
        { icon: "BookOpen", title: "Default values", description: "Set optional default values for variables so users can accept the default or customize as needed." },
        { icon: "ClipboardList", title: "Variable descriptions", description: "Add descriptions to each variable explaining what to enter, with examples to guide team members." },
        { icon: "Archive", title: "Template library", description: "Store variable-rich templates in your shared library so every team member can use them with their own inputs." },
        { icon: "Users", title: "Consistent yet flexible", description: "Variables provide structure and consistency while giving each user the flexibility to customize for their context." },
        { icon: "Zap", title: "One-click fill and insert", description: "Fill in variables through a simple form in the browser extension, then insert the completed prompt in one click." },
      ],
    },
    benefits: {
      heading: "Why teams use prompt variables",
      items: [
        "Turn your best one-off prompts into reusable templates anyone can use",
        "Ensure prompt structure consistency while allowing customization",
        "Reduce errors by guiding users to fill in the right information",
        "Save time by eliminating repetitive prompt rewriting",
        "Scale expert prompt patterns to every team member through templates",
        "Track which variable combinations produce the best results",
      ],
    },
    faqs: [
      { question: "What syntax does TeamPrompt use for variables?", answer: "TeamPrompt uses double curly braces: {{variable_name}}. When a user selects a template, they see a form with each variable as a field to fill in before inserting the prompt." },
      { question: "Can I have required and optional variables?", answer: "Yes. Set default values for optional variables and leave required variables blank. Users must fill in required variables before the prompt can be inserted." },
      { question: "How many variables can a template have?", answer: "There is no practical limit. Most effective templates use two to six variables. Too many variables can make templates complex, so aim for the right balance." },
    ],
    cta: {
      headline: "Create dynamic templates",
      gradientText: "with variables.",
      subtitle: "Build reusable prompt templates your team will love. Start free.",
    },
  },
];
