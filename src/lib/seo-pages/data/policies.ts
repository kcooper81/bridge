import type { SeoPageData } from "../types";

export const policyPages: SeoPageData[] = [
  {
    slug: "ai-acceptable-use-policy-template",
    category: "policy",
    meta: {
      title: "AI Acceptable Use Policy Template | TeamPrompt",
      description:
        "Download a ready-to-use AI acceptable use policy template. Define what employees can and cannot do with AI tools, with enforcement through TeamPrompt's DLP and governance controls.",
      keywords: ["AI acceptable use policy", "AI use policy template", "employee AI policy", "AI acceptable use", "AI workplace policy"],
    },
    hero: {
      headline: "AI acceptable use policy template for your organization",
      subtitle:
        "Every organization needs clear rules for how employees use AI tools. This template covers permitted uses, prohibited activities, data handling requirements, and accountability — all enforceable through TeamPrompt's governance and DLP controls.",
      badges: ["Ready-to-use", "Customizable", "Enforceable"],
    },
    features: {
      sectionLabel: "Policy Sections",
      heading: "What this AI acceptable use policy covers",
      items: [
        { icon: "ClipboardList", title: "Permitted AI uses", description: "Defines which AI tools are approved, what tasks they can be used for, and the boundaries of acceptable AI-assisted work across different departments and roles." },
        { icon: "ShieldAlert", title: "Prohibited activities", description: "Lists specific prohibited activities including sharing confidential data, relying on AI for regulated decisions, and submitting customer information without authorization." },
        { icon: "Lock", title: "Data handling requirements", description: "Specifies which data categories are never allowed in AI prompts, how to handle AI outputs containing sensitive information, and data retention policies." },
        { icon: "Users", title: "Roles and accountability", description: "Defines who is responsible for AI governance — from individual employees to department heads to the IT security team — with clear escalation paths." },
        { icon: "Eye", title: "Monitoring and enforcement", description: "Explains how TeamPrompt monitors AI usage, what happens when policy violations are detected, and the progressive enforcement approach." },
        { icon: "BookOpen", title: "Training requirements", description: "Outlines mandatory AI training requirements, recertification schedules, and how employees acknowledge understanding of the policy." },
      ],
    },
    benefits: {
      heading: "Why you need an AI acceptable use policy",
      items: [
        "Set clear expectations for AI tool usage across every department",
        "Reduce data leak risk by defining prohibited data categories explicitly",
        "Establish accountability with defined roles and escalation paths",
        "Support compliance requirements by documenting AI governance measures",
        "Enforce policy automatically through TeamPrompt's DLP and monitoring",
        "Provide a defensible position for legal, regulatory, and audit inquiries",
      ],
    },
    stats: [
      { value: "31", label: "Total available detection rules" },
      { value: "1 hour", label: "To customize" },
      { value: "Auto", label: "Enforcement via TeamPrompt" },
    ],
    faqs: [
      { question: "Can I customize this template for my industry?", answer: "Yes. The template is designed to be customized for any industry. Add industry-specific prohibited data types, regulatory references, and department-specific guidelines to match your organization's needs." },
      { question: "How do I enforce this policy?", answer: "TeamPrompt enforces data handling requirements through DLP scanning, monitors AI tool usage through the browser extension, and generates compliance reports. The policy is not just documentation — it is backed by technical controls." },
      { question: "Should this cover personal AI tool use?", answer: "The template includes guidance on personal AI tool usage during work hours and on company devices. You should adapt this section based on your organization's stance on personal tool usage." },
    ],
    cta: {
      headline: "Establish clear AI rules",
      gradientText: "with an enforceable policy.",
      subtitle: "Template included. Enforcement built in.",
    },
  },
  {
    slug: "ai-data-handling-policy-template",
    category: "policy",
    meta: {
      title: "AI Data Handling Policy Template | TeamPrompt",
      description:
        "Define how your organization handles data in AI workflows. This template covers data classification, DLP rules, retention, and incident response for AI tool usage.",
      keywords: ["AI data handling policy", "AI data policy template", "data classification AI", "AI data governance", "AI data protection policy"],
    },
    hero: {
      headline: "AI data handling policy template",
      subtitle:
        "Data is the core risk in AI tool usage. This policy template defines how your organization classifies data for AI interactions, what DLP rules apply, how AI outputs are retained, and what happens when sensitive data is detected in an AI prompt.",
      badges: ["Data classification", "DLP rules", "Retention policies"],
    },
    features: {
      sectionLabel: "Policy Sections",
      heading: "What this data handling policy covers",
      items: [
        { icon: "Archive", title: "Data classification for AI", description: "Defines data classification tiers — public, internal, confidential, restricted — and specifies which tiers are permitted in AI prompts and which are blocked." },
        { icon: "Shield", title: "DLP rule definitions", description: "Documents the specific DLP rules enforced by TeamPrompt including data patterns, blocking thresholds, and exception processes." },
        { icon: "Lock", title: "Data minimization procedures", description: "Establishes procedures for minimizing data in AI prompts — redacting identifiers, using synthetic data, and anonymizing before submission." },
        { icon: "FileText", title: "AI output handling", description: "Specifies how AI-generated outputs should be handled, stored, reviewed, and retained — especially when outputs may contain or reference sensitive data." },
        { icon: "ShieldAlert", title: "Incident response for data leaks", description: "Defines the response process when DLP scanning detects a data exposure attempt, including escalation procedures, documentation, and corrective actions." },
        { icon: "BarChart3", title: "Monitoring and reporting", description: "Establishes reporting requirements for data handling metrics including DLP event frequency, data categories detected, and policy compliance rates." },
      ],
    },
    benefits: {
      heading: "Why a data handling policy is essential for AI",
      items: [
        "Define clear data classification rules specific to AI tool interactions",
        "Document DLP rules so employees understand why prompts are blocked",
        "Establish data minimization procedures that reduce exposure risk",
        "Specify AI output handling to prevent downstream data leaks",
        "Create incident response processes for data exposure attempts",
        "Generate compliance evidence for auditors and regulators",
      ],
    },
    stats: [
      { value: "4 tiers", label: "Data classification" },
      { value: "Custom", label: "DLP rules" },
      { value: "Complete", label: "Incident response" },
    ],
    faqs: [
      { question: "How does data classification work with AI tools?", answer: "The policy defines which data classification tiers are allowed in AI prompts. For example, public data may be freely used, internal data with caution, confidential data with restrictions, and restricted data never." },
      { question: "What is data minimization for AI?", answer: "Data minimization means using the least amount of sensitive data necessary in AI prompts. The policy provides procedures for redacting identifiers, using synthetic data, and anonymizing information before submission." },
      { question: "How does TeamPrompt enforce this policy?", answer: "TeamPrompt's DLP scanning enforces the data handling rules defined in this policy. When a prompt contains data from a restricted classification tier, it is blocked automatically with a clear explanation." },
    ],
    cta: {
      headline: "Govern your AI data",
      gradientText: "with clear handling rules.",
      subtitle: "Data handling policy with built-in enforcement.",
    },
  },
  {
    slug: "ai-vendor-assessment-template",
    category: "policy",
    meta: {
      title: "AI Vendor Assessment Template | TeamPrompt",
      description:
        "Evaluate AI tool vendors with this comprehensive assessment template. Cover security, privacy, data handling, compliance, and risk scoring for every AI vendor in your stack.",
      keywords: ["AI vendor assessment", "AI vendor evaluation", "AI tool assessment template", "AI vendor security review", "AI vendor risk assessment"],
    },
    hero: {
      headline: "AI vendor assessment template",
      subtitle:
        "Before adopting any AI tool, you need a structured evaluation of its security posture, data handling practices, and compliance alignment. This template provides a comprehensive framework for assessing AI vendors — from data retention policies to incident response capabilities.",
      badges: ["Vendor evaluation", "Risk scoring", "Compliance review"],
    },
    features: {
      sectionLabel: "Assessment Areas",
      heading: "What this vendor assessment covers",
      items: [
        { icon: "Shield", title: "Security posture evaluation", description: "Assess the vendor's security certifications, penetration testing, encryption standards, and infrastructure security with structured questions and scoring criteria." },
        { icon: "Lock", title: "Data handling and retention", description: "Evaluate how the vendor handles submitted data — training usage, retention periods, deletion processes, and data isolation between customers." },
        { icon: "Scale", title: "Compliance alignment", description: "Verify vendor compliance with relevant frameworks — SOC 2, HIPAA, GDPR, PCI DSS — and assess their ability to support your compliance requirements." },
        { icon: "Eye", title: "Privacy and transparency", description: "Assess the vendor's privacy practices including data processing disclosures, opt-out mechanisms, and transparency about AI model training on customer data." },
        { icon: "FileText", title: "Contractual protections", description: "Evaluate the vendor's data processing agreements, liability provisions, breach notification commitments, and sub-processor management." },
        { icon: "BarChart3", title: "Risk scoring methodology", description: "Score each vendor across security, privacy, compliance, and operational dimensions to make informed adoption decisions with quantified risk." },
      ],
    },
    benefits: {
      heading: "Why structured AI vendor assessment matters",
      items: [
        "Make informed adoption decisions with standardized evaluation criteria",
        "Identify security gaps before they become data breach risks",
        "Verify vendor compliance alignment with your regulatory requirements",
        "Document due diligence for audit and legal defensibility",
        "Compare AI vendors objectively using quantified risk scores",
        "Establish vendor management processes that scale with AI adoption",
      ],
    },
    stats: [
      { value: "50+", label: "Assessment questions" },
      { value: "6", label: "Evaluation dimensions" },
      { value: "Scored", label: "Risk methodology" },
    ],
    faqs: [
      { question: "Which AI vendors should I assess?", answer: "Assess every AI tool your organization uses or plans to use — including ChatGPT, Claude, Gemini, Copilot, Perplexity, and any industry-specific AI tools. Assess both official corporate tools and shadow AI tools employees use informally." },
      { question: "How often should vendor assessments be updated?", answer: "Re-assess AI vendors annually and whenever the vendor makes significant changes to their data handling practices, terms of service, or security certifications." },
      { question: "Does TeamPrompt complement vendor assessments?", answer: "Yes. Even after assessing and approving an AI vendor, TeamPrompt provides runtime DLP protection. Vendor assessment is a preventive control; TeamPrompt is a detective and corrective control that catches data leaks in real time." },
    ],
    cta: {
      headline: "Evaluate AI vendors",
      gradientText: "with confidence.",
      subtitle: "Structured assessment template. Download and customize.",
    },
  },
  {
    slug: "ai-incident-response-policy",
    category: "policy",
    meta: {
      title: "AI Incident Response Policy Template | TeamPrompt",
      description:
        "Prepare for AI-related security incidents. This template covers detection, containment, eradication, recovery, and lessons learned for AI data exposure and misuse events.",
      keywords: ["AI incident response", "AI security incident policy", "AI data breach response", "AI incident management", "AI security event response"],
    },
    hero: {
      headline: "AI incident response policy template",
      subtitle:
        "When sensitive data reaches an AI tool or AI-generated output causes harm, your team needs a clear response plan. This policy template covers the complete incident lifecycle — from detection through containment, investigation, remediation, and lessons learned.",
      badges: ["Incident lifecycle", "Response procedures", "Lessons learned"],
    },
    features: {
      sectionLabel: "Response Phases",
      heading: "What this incident response policy covers",
      items: [
        { icon: "ShieldAlert", title: "Detection and identification", description: "Defines how AI-related incidents are detected — through DLP alerts, user reports, and monitoring — and criteria for classifying incident severity levels." },
        { icon: "Shield", title: "Containment procedures", description: "Immediate containment steps including revoking AI tool access, preserving audit logs, and limiting further data exposure while investigation proceeds." },
        { icon: "Eye", title: "Investigation and analysis", description: "Structured investigation process covering what data was exposed, which AI tool was involved, who was affected, and the root cause of the incident." },
        { icon: "Lock", title: "Remediation and recovery", description: "Steps for remediating the incident including requesting data deletion from AI providers, rotating exposed credentials, and restoring normal operations." },
        { icon: "FileText", title: "Notification requirements", description: "Determines when regulatory notification is required, who needs to be informed, and timelines for breach notification under applicable regulations." },
        { icon: "BarChart3", title: "Post-incident review", description: "Structured post-incident review process for identifying root causes, implementing corrective actions, and updating policies to prevent recurrence." },
      ],
    },
    benefits: {
      heading: "Why AI incident response planning is critical",
      items: [
        "Reduce response time with pre-defined procedures and clear ownership",
        "Minimize damage through rapid containment and data exposure limitation",
        "Meet regulatory notification deadlines with pre-built notification workflows",
        "Preserve forensic evidence for legal proceedings and investigations",
        "Learn from incidents to continuously improve AI governance controls",
        "Demonstrate preparedness to regulators, auditors, and board members",
      ],
    },
    stats: [
      { value: "6", label: "Response phases covered" },
      { value: "<1hr", label: "Target containment time" },
      { value: "Complete", label: "Notification guidance" },
    ],
    faqs: [
      { question: "What qualifies as an AI-related incident?", answer: "An AI-related incident includes any unauthorized disclosure of sensitive data through AI tools, AI-generated outputs that contain confidential information, and AI system misuse that violates your acceptable use policy." },
      { question: "How does TeamPrompt help with incident response?", answer: "TeamPrompt's audit logs provide the forensic evidence needed for investigation — exactly what data was detected, which user was involved, which AI tool was targeted, and the timestamp. This accelerates the investigation phase significantly." },
      { question: "Should this be separate from our general incident response plan?", answer: "This AI-specific policy can be an appendix to your existing incident response plan. It provides the AI-specific procedures and decision trees that your general plan does not cover." },
    ],
    cta: {
      headline: "Be prepared for",
      gradientText: "AI security incidents.",
      subtitle: "Incident response policy template. Customize and deploy.",
    },
  },
  {
    slug: "ai-employee-training-policy",
    category: "policy",
    meta: {
      title: "AI Employee Training Policy Template | TeamPrompt",
      description:
        "Build an AI training program for your workforce. This template covers training requirements, curriculum, certification, and ongoing education for safe AI tool usage.",
      keywords: ["AI employee training policy", "AI training program", "AI workforce training", "employee AI education", "AI safety training"],
    },
    hero: {
      headline: "AI employee training policy template",
      subtitle:
        "Technical controls prevent data leaks, but training prevents the behavior that causes them. This policy template establishes a comprehensive AI training program — covering initial onboarding, role-specific training, certification requirements, and ongoing education.",
      badges: ["Training program", "Certification", "Ongoing education"],
    },
    features: {
      sectionLabel: "Training Program",
      heading: "What this training policy covers",
      items: [
        { icon: "BookOpen", title: "Core AI literacy curriculum", description: "Foundational training on how AI tools work, what data they process, why data protection matters, and the organization's AI acceptable use policy." },
        { icon: "Users", title: "Role-specific training modules", description: "Targeted training for different roles — developers learn about code protection, sales teams learn about customer data, HR learns about employee data in AI contexts." },
        { icon: "ShieldCheck", title: "Certification and assessment", description: "Knowledge assessments and certification requirements that employees must complete before gaining access to AI tools with organizational data." },
        { icon: "Eye", title: "Hands-on DLP training", description: "Practical exercises using TeamPrompt where employees experience DLP scanning firsthand, learning what triggers alerts and how to handle sensitive data correctly." },
        { icon: "ClipboardList", title: "Ongoing education requirements", description: "Annual recertification, quarterly awareness updates, and just-in-time training when new AI tools are adopted or policies change." },
        { icon: "BarChart3", title: "Training effectiveness measurement", description: "Metrics and KPIs for measuring training effectiveness including certification completion rates, DLP incident reduction, and knowledge assessment scores." },
      ],
    },
    benefits: {
      heading: "Why AI training is your most important control",
      items: [
        "Reduce data leak incidents by educating employees before mistakes happen",
        "Build AI literacy that helps teams use AI tools more effectively and safely",
        "Satisfy regulatory training requirements for HIPAA, GDPR, and PCI DSS",
        "Create role-specific awareness for the unique risks each team faces",
        "Measure training effectiveness with concrete metrics and KPIs",
        "Demonstrate workforce competence to auditors and regulators",
      ],
    },
    stats: [
      { value: "19", label: "Compliance frameworks" },
      { value: "Annual", label: "Recertification" },
      { value: "Role-based", label: "Training paths" },
    ],
    faqs: [
      { question: "How long should AI training take?", answer: "Core AI literacy training typically takes 30-45 minutes. Role-specific modules add 15-30 minutes per role. Annual recertification takes 15-20 minutes. The investment is minimal compared to the cost of a data breach." },
      { question: "Should training be mandatory?", answer: "Yes. The policy template establishes mandatory training with certification requirements before employees can access AI tools for work purposes. This creates accountability and provides compliance evidence." },
      { question: "How does TeamPrompt support the training program?", answer: "TeamPrompt reinforces training through real-time DLP feedback. When an employee's prompt is blocked, they learn immediately what they did wrong — creating a continuous learning loop that supplements formal training." },
    ],
    cta: {
      headline: "Train your team",
      gradientText: "to use AI safely.",
      subtitle: "Comprehensive training policy template. Customize and launch.",
    },
  },
  {
    slug: "enterprise-ai-governance-framework",
    category: "policy",
    meta: {
      title: "Enterprise AI Governance Framework Template | TeamPrompt",
      description:
        "Establish comprehensive AI governance for your enterprise. This framework covers strategy, risk management, policies, oversight, and measurement for responsible AI adoption.",
      keywords: ["AI governance framework", "enterprise AI governance", "AI governance template", "responsible AI framework", "AI governance strategy"],
    },
    hero: {
      headline: "Enterprise AI governance framework",
      subtitle:
        "AI governance is not just one policy — it is a comprehensive framework that covers strategy, risk management, policies, oversight structures, and measurement. This enterprise template provides the complete governance architecture your organization needs for responsible AI adoption at scale.",
      badges: ["Enterprise-grade", "Comprehensive", "Board-ready"],
    },
    features: {
      sectionLabel: "Framework Components",
      heading: "What this governance framework includes",
      items: [
        { icon: "Building2", title: "Governance structure", description: "Defines the AI governance committee, executive sponsor role, working group composition, and reporting lines for AI oversight at the enterprise level." },
        { icon: "Scale", title: "Risk management framework", description: "Establishes the AI risk assessment methodology, risk appetite definitions, and risk treatment processes aligned with your enterprise risk management program." },
        { icon: "ClipboardList", title: "Policy portfolio", description: "Maps all required AI policies — acceptable use, data handling, vendor assessment, incident response, training — and their relationships to each other." },
        { icon: "Eye", title: "Oversight and monitoring", description: "Defines ongoing monitoring requirements, KPIs, reporting cadences, and escalation criteria for the AI governance committee." },
        { icon: "Shield", title: "Technical control requirements", description: "Specifies the technical controls required for AI governance — DLP, access management, audit logging, and monitoring — and how TeamPrompt provides them." },
        { icon: "BarChart3", title: "Measurement and maturity", description: "Establishes a governance maturity model with measurable objectives, allowing the organization to assess and improve its AI governance over time." },
      ],
    },
    benefits: {
      heading: "Why enterprises need a formal AI governance framework",
      items: [
        "Establish board-level visibility and accountability for AI risks",
        "Create a comprehensive policy architecture that covers every AI risk area",
        "Align AI governance with existing enterprise risk management practices",
        "Define measurable objectives for governance maturity improvement",
        "Satisfy regulatory expectations for AI oversight and documentation",
        "Enable responsible AI adoption that scales with organizational growth",
      ],
    },
    stats: [
      { value: "6", label: "Framework components" },
      { value: "Board-level", label: "Reporting" },
      { value: "Maturity", label: "Model included" },
    ],
    faqs: [
      { question: "Who should own AI governance?", answer: "The framework recommends an AI governance committee with executive sponsorship, typically reporting to the CTO, CISO, or Chief Risk Officer. The committee includes representatives from IT, legal, compliance, HR, and business units." },
      { question: "How does this integrate with existing governance?", answer: "The AI governance framework is designed to integrate with your existing enterprise risk management, information security, and compliance programs — not replace them. It adds AI-specific governance within your established structures." },
      { question: "How long does it take to implement?", answer: "Initial framework setup typically takes 4-8 weeks. Start with the governance structure and highest-priority policies, then expand coverage over 6-12 months as your AI governance program matures." },
    ],
    cta: {
      headline: "Govern AI",
      gradientText: "at enterprise scale.",
      subtitle: "Complete governance framework. Customize for your organization.",
    },
  },
  {
    slug: "ai-procurement-checklist",
    category: "policy",
    meta: {
      title: "AI Procurement Checklist & Evaluation Guide | TeamPrompt",
      description:
        "Evaluate and procure AI tools with confidence. This checklist covers security, privacy, compliance, integration, and total cost of ownership for AI tool procurement.",
      keywords: ["AI procurement checklist", "AI tool evaluation", "AI procurement guide", "buy AI tools checklist", "AI tool selection criteria"],
    },
    hero: {
      headline: "AI procurement checklist for informed buying decisions",
      subtitle:
        "Procuring AI tools requires evaluating security, privacy, compliance, integration capabilities, and total cost of ownership. This checklist ensures your procurement team covers every critical factor before signing a contract with any AI vendor.",
      badges: ["Procurement-ready", "Complete checklist", "TCO analysis"],
    },
    features: {
      sectionLabel: "Evaluation Areas",
      heading: "What this procurement checklist covers",
      items: [
        { icon: "Shield", title: "Security evaluation", description: "Infrastructure security, data encryption, access controls, vulnerability management, and incident response capabilities of the AI vendor." },
        { icon: "Lock", title: "Privacy and data handling", description: "Data retention policies, training data usage, opt-out mechanisms, data deletion capabilities, and privacy certification status." },
        { icon: "Scale", title: "Compliance verification", description: "Regulatory compliance certifications, audit reports, data processing agreements, and ability to support your specific compliance requirements." },
        { icon: "Zap", title: "Integration and deployment", description: "API capabilities, browser extension support, SSO integration, SCIM provisioning, and compatibility with your existing technology stack." },
        { icon: "BarChart3", title: "Total cost of ownership", description: "License costs, implementation effort, training investment, ongoing management overhead, and hidden costs of AI tool adoption." },
        { icon: "Users", title: "Vendor viability assessment", description: "Financial stability, customer references, roadmap alignment, support quality, and long-term viability of the AI vendor." },
      ],
    },
    benefits: {
      heading: "Why structured AI procurement matters",
      items: [
        "Avoid security and privacy risks by evaluating vendors before adoption",
        "Compare AI tools objectively using standardized evaluation criteria",
        "Identify hidden costs and compliance gaps before signing contracts",
        "Document procurement due diligence for audit and legal purposes",
        "Accelerate procurement by providing a ready-to-use evaluation framework",
        "Ensure alignment between AI tool capabilities and organizational needs",
      ],
    },
    stats: [
      { value: "75+", label: "Checklist items" },
      { value: "6", label: "Evaluation areas" },
      { value: "TCO", label: "Analysis included" },
    ],
    faqs: [
      { question: "Should we evaluate shadow AI tools already in use?", answer: "Yes. Apply this checklist to AI tools employees are already using informally. Shadow AI is a significant risk, and structured evaluation may reveal security and compliance issues that require immediate attention." },
      { question: "How does TeamPrompt fit into AI procurement?", answer: "TeamPrompt provides the governance layer that all AI tools need — DLP scanning, usage monitoring, and compliance reporting. Include TeamPrompt in your AI procurement as the control platform that governs every AI tool you adopt." },
      { question: "Who should be involved in AI procurement decisions?", answer: "Include IT security, legal/compliance, procurement, the requesting business unit, and privacy stakeholders. Each brings critical perspective on security, contractual, financial, and operational requirements." },
    ],
    cta: {
      headline: "Procure AI tools",
      gradientText: "with confidence.",
      subtitle: "Complete procurement checklist. Make informed decisions.",
    },
  },
  {
    slug: "ai-risk-assessment-template",
    category: "policy",
    meta: {
      title: "AI Risk Assessment Template | TeamPrompt",
      description:
        "Assess AI-related risks systematically. This template provides a structured methodology for identifying, analyzing, and treating risks from AI tool usage across your organization.",
      keywords: ["AI risk assessment", "AI risk assessment template", "AI risk analysis", "AI risk management", "AI risk evaluation"],
    },
    hero: {
      headline: "AI risk assessment template",
      subtitle:
        "Effective AI governance starts with understanding your risks. This template provides a structured methodology for identifying AI-related threats, analyzing their likelihood and impact, evaluating existing controls, and selecting appropriate risk treatment strategies.",
      badges: ["Risk methodology", "Threat analysis", "Treatment plans"],
    },
    features: {
      sectionLabel: "Assessment Framework",
      heading: "What this risk assessment covers",
      items: [
        { icon: "ShieldAlert", title: "Threat identification", description: "Comprehensive catalog of AI-related threats including data leaks, compliance violations, IP exposure, bias risks, and dependency risks for systematic evaluation." },
        { icon: "BarChart3", title: "Likelihood and impact analysis", description: "Structured methodology for rating threat likelihood and business impact using a consistent scale, producing quantified risk scores for prioritization." },
        { icon: "Shield", title: "Existing control evaluation", description: "Framework for assessing the effectiveness of controls already in place — including TeamPrompt DLP, access controls, and policies — and identifying gaps." },
        { icon: "Scale", title: "Risk treatment strategies", description: "Decision framework for selecting risk treatment — accept, mitigate, transfer, or avoid — with specific treatment options for each identified AI risk." },
        { icon: "FileText", title: "Risk register template", description: "Pre-formatted risk register for tracking identified risks, their scores, treatment decisions, assigned owners, and review dates." },
        { icon: "Eye", title: "Ongoing risk monitoring", description: "Process for regularly reviewing and updating the risk assessment as AI usage evolves, new tools are adopted, and the threat landscape changes." },
      ],
    },
    benefits: {
      heading: "Why AI risk assessment is foundational",
      items: [
        "Identify risks you did not know existed in your AI tool usage",
        "Prioritize risk treatment based on quantified likelihood and impact",
        "Evaluate whether your current controls are sufficient or need enhancement",
        "Document risk decisions for regulatory compliance and audit evidence",
        "Create a risk register that drives your AI governance roadmap",
        "Satisfy risk assessment requirements under SOC 2, ISO 27001, and NIST",
      ],
    },
    stats: [
      { value: "25+", label: "AI threat categories" },
      { value: "Quantified", label: "Risk scoring" },
      { value: "Actionable", label: "Treatment plans" },
    ],
    faqs: [
      { question: "How often should we reassess AI risks?", answer: "Conduct a full risk assessment annually and trigger reassessments whenever you adopt new AI tools, experience an AI-related incident, or face new regulatory requirements. Quarterly reviews of the risk register are recommended." },
      { question: "Who should participate in the risk assessment?", answer: "Include IT security, legal, compliance, data privacy, business unit leaders, and AI power users. Each perspective adds critical insight about threats, impacts, and existing controls." },
      { question: "How does TeamPrompt reduce AI risk scores?", answer: "TeamPrompt directly mitigates data leak, compliance violation, and IP exposure risks through DLP scanning. When you add TeamPrompt as a control, the residual risk scores for these threats decrease based on its detection effectiveness." },
    ],
    cta: {
      headline: "Understand your AI risks",
      gradientText: "before they materialize.",
      subtitle: "Structured risk assessment. Start evaluating today.",
    },
  },
  {
    slug: "ai-model-evaluation-framework",
    category: "policy",
    meta: {
      title: "AI Model Evaluation Framework | TeamPrompt",
      description:
        "Evaluate AI models for enterprise use with this structured framework. Assess accuracy, safety, bias, security, and operational readiness before deploying any AI model.",
      keywords: ["AI model evaluation", "AI model assessment", "AI model framework", "evaluate AI models", "AI model selection"],
    },
    hero: {
      headline: "AI model evaluation framework for enterprise",
      subtitle:
        "Not all AI models are suitable for enterprise use. This framework provides structured evaluation criteria for assessing model accuracy, safety guardrails, bias characteristics, data security, and operational readiness — ensuring you select the right models for your organization.",
      badges: ["Model evaluation", "Safety assessment", "Enterprise-ready"],
    },
    features: {
      sectionLabel: "Evaluation Criteria",
      heading: "How to evaluate AI models systematically",
      items: [
        { icon: "BarChart3", title: "Accuracy and quality assessment", description: "Evaluate model output quality, accuracy for your use cases, hallucination rates, and consistency across diverse inputs relevant to your business domain." },
        { icon: "Shield", title: "Safety and guardrail evaluation", description: "Test the model's built-in safety measures including content filtering, refusal behaviors, and resistance to prompt injection and jailbreak attempts." },
        { icon: "Scale", title: "Bias and fairness testing", description: "Assess model outputs for demographic bias, stereotyping, and fairness across different populations relevant to your organization's use cases." },
        { icon: "Lock", title: "Data security analysis", description: "Evaluate how the model provider handles submitted data — training usage, retention, access controls, and data isolation between customers." },
        { icon: "Zap", title: "Operational readiness", description: "Assess model availability, latency, throughput, API stability, and SLA commitments to ensure the model meets your operational requirements." },
        { icon: "FileText", title: "Compliance and documentation", description: "Review model cards, transparency reports, compliance certifications, and documentation quality to ensure alignment with your governance requirements." },
      ],
    },
    benefits: {
      heading: "Why structured model evaluation prevents costly mistakes",
      items: [
        "Select models that actually perform well for your specific use cases",
        "Identify safety gaps before deploying models to your workforce",
        "Detect bias issues that could create legal and reputational risk",
        "Verify data security practices match your organization's requirements",
        "Ensure operational reliability for business-critical AI workflows",
        "Document model evaluation decisions for governance and audit evidence",
      ],
    },
    stats: [
      { value: "6", label: "Evaluation dimensions" },
      { value: "Quantified", label: "Scoring methodology" },
      { value: "Documented", label: "Decision rationale" },
    ],
    faqs: [
      { question: "Should we evaluate every AI model separately?", answer: "Yes. Each AI model has different strengths, weaknesses, and security characteristics. Evaluate ChatGPT, Claude, Gemini, and other models independently using the same framework for consistent comparison." },
      { question: "How does this relate to AI vendor assessment?", answer: "Model evaluation focuses on the AI model's capabilities and safety. Vendor assessment evaluates the company behind the model. Both are needed — a great model from an unreliable vendor is still a risk." },
      { question: "How does TeamPrompt complement model evaluation?", answer: "Even the best-evaluated model cannot prevent your team from submitting sensitive data. TeamPrompt provides the DLP layer that protects data regardless of which model your team uses, complementing model-level safety with organization-level controls." },
    ],
    cta: {
      headline: "Evaluate AI models",
      gradientText: "before deployment.",
      subtitle: "Structured evaluation framework. Make informed model decisions.",
    },
  },
  {
    slug: "ai-ethics-policy-template",
    category: "policy",
    meta: {
      title: "AI Ethics Policy Template | TeamPrompt",
      description:
        "Establish ethical AI guidelines for your organization. This template covers fairness, transparency, accountability, privacy, and human oversight principles for responsible AI use.",
      keywords: ["AI ethics policy", "AI ethics template", "responsible AI policy", "ethical AI guidelines", "AI ethics framework"],
    },
    hero: {
      headline: "AI ethics policy template for responsible use",
      subtitle:
        "An AI ethics policy sets the principles that guide how your organization develops, deploys, and uses AI tools. This template establishes ethical boundaries for fairness, transparency, accountability, privacy, and human oversight — turning values into enforceable guidelines.",
      badges: ["Ethics framework", "Principles-based", "Actionable guidelines"],
    },
    features: {
      sectionLabel: "Ethical Principles",
      heading: "What this ethics policy covers",
      items: [
        { icon: "Scale", title: "Fairness and non-discrimination", description: "Establishes requirements for evaluating AI outputs for bias, ensuring equitable treatment across demographics, and documenting fairness assessments." },
        { icon: "Eye", title: "Transparency and explainability", description: "Requires disclosure when AI is used in decision-making, documentation of AI's role in processes, and explanations for AI-influenced outcomes." },
        { icon: "Users", title: "Human oversight and accountability", description: "Defines where human review is required, who is accountable for AI-assisted decisions, and when AI outputs must be reviewed before action." },
        { icon: "Lock", title: "Privacy and data protection", description: "Establishes privacy principles for AI interactions including data minimization, purpose limitation, and consent requirements for personal data in AI workflows." },
        { icon: "ShieldCheck", title: "Safety and harm prevention", description: "Requires assessment of potential harms from AI usage, prohibits uses that could cause significant harm, and establishes safeguards for high-risk applications." },
        { icon: "BookOpen", title: "Continuous improvement", description: "Establishes processes for regularly reviewing and updating ethical guidelines as AI technology evolves and new ethical considerations emerge." },
      ],
    },
    benefits: {
      heading: "Why an AI ethics policy builds trust",
      items: [
        "Demonstrate responsible AI values to customers, partners, and regulators",
        "Prevent harmful AI use by establishing clear ethical boundaries",
        "Build employee confidence in using AI tools within defined guidelines",
        "Address fairness and bias proactively before they cause harm",
        "Satisfy emerging regulatory requirements for ethical AI governance",
        "Create accountability for AI-assisted decisions across the organization",
      ],
    },
    stats: [
      { value: "5", label: "Core principles" },
      { value: "Actionable", label: "Guidelines" },
      { value: "Board-approved", label: "Level of commitment" },
    ],
    faqs: [
      { question: "Is an AI ethics policy legally required?", answer: "While not universally required today, the EU AI Act, NIST AI RMF, and emerging regulations increasingly expect organizations to have ethical AI guidelines. An ethics policy also reduces legal and reputational risk from AI misuse." },
      { question: "How do ethics principles become enforceable?", answer: "The policy template converts abstract principles into concrete guidelines — specific prohibited uses, required review processes, documentation requirements, and escalation procedures. TeamPrompt enforces the data protection aspects through DLP controls." },
      { question: "Should this be a separate policy or part of a code of conduct?", answer: "A standalone AI ethics policy provides the depth and specificity needed for AI governance. Reference it from your code of conduct, but keep the detailed AI guidelines in a dedicated document that can be updated as AI evolves." },
    ],
    cta: {
      headline: "Build trust with",
      gradientText: "ethical AI guidelines.",
      subtitle: "Ethics policy template. Define your AI principles.",
    },
  },
];
