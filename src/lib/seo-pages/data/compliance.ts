import type { SeoPageData } from "../types";

export const compliancePages: SeoPageData[] = [
  {
    slug: "hipaa-ai-compliance",
    category: "compliance",
    meta: {
      title: "HIPAA AI Compliance — Protect PHI in AI Tools | TeamPrompt",
      description:
        "Ensure HIPAA compliance when healthcare teams use AI tools. TeamPrompt provides PHI detection, audit logging, and technical safeguards required by the HIPAA Security Rule.",
      keywords: ["HIPAA AI compliance", "HIPAA AI tools", "PHI protection AI", "healthcare AI compliance", "HIPAA Security Rule AI"],
    },
    hero: {
      headline: "HIPAA compliance for AI tool usage",
      subtitle:
        "Healthcare organizations adopting AI tools must ensure that protected health information never reaches unauthorized third parties. TeamPrompt provides the technical safeguards HIPAA requires — PHI detection, access controls, and comprehensive audit logging — for every AI interaction.",
      badges: ["HIPAA-ready", "PHI detection", "Audit logging"],
    },
    features: {
      sectionLabel: "HIPAA Safeguards",
      heading: "Technical safeguards for HIPAA AI compliance",
      items: [
        { icon: "Shield", title: "PHI detection engine", description: "Automatically detects all 18 HIPAA-defined identifiers including patient names, dates of service, medical record numbers, and health plan IDs before they reach AI tools." },
        { icon: "Lock", title: "Access control enforcement", description: "Role-based access controls ensure only authorized personnel can access AI prompts containing clinical workflows. HIPAA requires the minimum necessary standard for PHI access." },
        { icon: "FileText", title: "Audit trail generation", description: "Every AI interaction is logged with user identity, timestamp, data types detected, and action taken — satisfying HIPAA's audit control requirements under §164.312(b)." },
        { icon: "ShieldAlert", title: "Breach prevention", description: "By blocking PHI before it reaches AI providers, TeamPrompt prevents the unauthorized disclosure that would trigger HIPAA breach notification requirements." },
        { icon: "Users", title: "Workforce training reinforcement", description: "Real-time DLP feedback teaches healthcare staff which data types cannot be shared with AI, reinforcing HIPAA training through practical experience." },
        { icon: "BarChart3", title: "Compliance dashboard", description: "Purpose-built HIPAA compliance dashboard showing PHI detection events, policy compliance rates, and audit-ready reports for HHS OCR examinations." },
      ],
    },
    benefits: {
      heading: "Why healthcare organizations use TeamPrompt for HIPAA",
      items: [
        "Detect all 18 HIPAA-defined PHI identifiers before they reach AI tools",
        "Generate audit trails required by the HIPAA Security Rule §164.312(b)",
        "Prevent breaches that trigger notification requirements and penalties up to $1.5M",
        "Enforce minimum necessary access standards for AI-related clinical workflows",
        "Reinforce workforce training with real-time DLP feedback on PHI handling",
        "Produce audit-ready compliance reports for HHS Office for Civil Rights reviews",
      ],
    },
    stats: [
      { value: "18", label: "PHI identifiers detected" },
      { value: "$1.5M", label: "Max penalty per category" },
      { value: "4", label: "HIPAA detection rules" },
    ],
    faqs: [
      { question: "Does TeamPrompt make us fully HIPAA-compliant?", answer: "TeamPrompt provides critical technical safeguards for AI tool usage, including PHI detection, access controls, and audit logging. Full HIPAA compliance also requires administrative safeguards, physical safeguards, policies, and training. TeamPrompt is an essential component of your overall compliance program." },
      { question: "Do we need a BAA with TeamPrompt?", answer: "TeamPrompt processes DLP scanning locally in the browser. PHI is detected and blocked before leaving the device, meaning TeamPrompt's servers never receive PHI. Consult your compliance team about whether a BAA is needed for your specific deployment model." },
      { question: "How does this address the HIPAA Security Rule?", answer: "TeamPrompt addresses multiple HIPAA Security Rule requirements: access controls (§164.312(a)), audit controls (§164.312(b)), integrity controls (§164.312(c)), and transmission security (§164.312(e)) as they apply to AI tool usage." },
    ],
    cta: {
      headline: "Achieve HIPAA compliance",
      gradientText: "for AI tool usage.",
      subtitle: "Technical safeguards for healthcare AI. Deploy in minutes.",
    },
  },
  {
    slug: "soc2-ai-compliance",
    category: "compliance",
    meta: {
      title: "SOC 2 AI Compliance — Secure AI Tool Usage | TeamPrompt",
      description:
        "Meet SOC 2 Trust Service Criteria for AI tool usage. TeamPrompt provides security controls, monitoring, and audit evidence for SOC 2 Type I and Type II examinations.",
      keywords: ["SOC 2 AI compliance", "SOC 2 AI tools", "SOC 2 Trust Service Criteria", "SOC 2 audit AI", "SOC 2 Type II AI"],
    },
    hero: {
      headline: "SOC 2 compliance for AI tool usage",
      subtitle:
        "SOC 2 auditors are increasingly asking about AI tool controls. TeamPrompt provides the security monitoring, access controls, and audit evidence you need to demonstrate that AI tool usage meets SOC 2 Trust Service Criteria.",
      badges: ["SOC 2 Type II", "Trust Service Criteria", "Audit evidence"],
    },
    features: {
      sectionLabel: "SOC 2 Controls",
      heading: "SOC 2 controls for AI tool governance",
      items: [
        { icon: "Shield", title: "CC6 — Logical access controls", description: "Role-based access controls restrict AI tool usage and DLP policies by department and role, satisfying SOC 2's logical access security requirements." },
        { icon: "Eye", title: "CC7 — System monitoring", description: "Continuous monitoring of AI tool interactions with real-time DLP scanning provides evidence of ongoing system operation monitoring required by CC7." },
        { icon: "Lock", title: "CC6.1 — Data protection", description: "DLP scanning prevents confidential and restricted data from reaching external AI providers, satisfying data protection requirements." },
        { icon: "BarChart3", title: "CC4 — Monitoring activities", description: "Dashboards and automated reports track DLP policy effectiveness, user compliance rates, and security events for ongoing monitoring evidence." },
        { icon: "FileText", title: "Audit evidence generation", description: "Pre-formatted SOC 2 evidence packages document DLP policies, configuration, event logs, and control effectiveness for auditor review." },
        { icon: "Users", title: "CC1 — Control environment", description: "Documented AI usage policies, DLP configurations, and enforcement evidence demonstrate a strong control environment for AI tool governance." },
      ],
    },
    benefits: {
      heading: "Why SOC 2-audited companies use TeamPrompt",
      items: [
        "Satisfy SOC 2 Trust Service Criteria for AI tool access and data protection",
        "Generate audit evidence packages that reduce SOC 2 preparation time",
        "Demonstrate continuous monitoring of AI tool interactions and data flows",
        "Provide role-based access controls that auditors expect for SaaS data handling",
        "Document DLP policy configuration and enforcement for control environment evidence",
        "Address emerging auditor questions about AI tool governance proactively",
      ],
    },
    stats: [
      { value: "5+", label: "SOC 2 criteria addressed" },
      { value: "Auto", label: "Evidence generation" },
      { value: "Continuous", label: "Monitoring" },
    ],
    faqs: [
      { question: "Which SOC 2 Trust Service Criteria does TeamPrompt address?", answer: "TeamPrompt helps address CC1 (Control Environment), CC4 (Monitoring Activities), CC6 (Logical and Physical Access Controls), CC7 (System Operations), and CC9 (Risk Mitigation) as they apply to AI tool usage and data handling." },
      { question: "Does TeamPrompt generate SOC 2 audit evidence?", answer: "Yes. TeamPrompt generates pre-formatted evidence packages including DLP policy documentation, configuration screenshots, event logs, and control effectiveness metrics designed for SOC 2 auditor review." },
      { question: "Is TeamPrompt itself SOC 2 compliant?", answer: "TeamPrompt processes DLP scanning locally in the browser, minimizing the data that reaches our servers. Contact our team for our current SOC 2 compliance status and security documentation." },
    ],
    cta: {
      headline: "Pass your SOC 2 audit",
      gradientText: "with AI controls in place.",
      subtitle: "SOC 2-ready AI governance. Get started free.",
    },
  },
  {
    slug: "gdpr-ai-compliance",
    category: "compliance",
    meta: {
      title: "GDPR AI Compliance — Protect Personal Data in AI Tools | TeamPrompt",
      description:
        "Ensure GDPR compliance when teams use AI tools. TeamPrompt prevents personal data from reaching AI providers, supporting data minimization, purpose limitation, and DPIA requirements.",
      keywords: ["GDPR AI compliance", "GDPR AI tools", "personal data AI protection", "GDPR data minimization AI", "DPIA AI tools"],
    },
    hero: {
      headline: "GDPR compliance for AI tool usage",
      subtitle:
        "Under GDPR, submitting personal data to AI providers constitutes data processing that requires a lawful basis, data minimization, and appropriate technical measures. TeamPrompt provides the technical controls to keep personal data out of AI tools and demonstrate GDPR compliance.",
      badges: ["GDPR-ready", "Data minimization", "DPIA support"],
    },
    features: {
      sectionLabel: "GDPR Controls",
      heading: "Technical measures for GDPR AI compliance",
      items: [
        { icon: "Shield", title: "Personal data detection", description: "Identifies EU personal data categories — names, email addresses, national IDs, location data, and biometric identifiers — before they reach AI tools." },
        { icon: "Lock", title: "Data minimization enforcement", description: "Automatically enforces GDPR's data minimization principle by blocking unnecessary personal data from AI prompt submissions." },
        { icon: "UserX", title: "Special category data protection", description: "Detects GDPR Article 9 special categories including health data, racial/ethnic origin, political opinions, and biometric data with heightened scanning." },
        { icon: "FileText", title: "DPIA evidence documentation", description: "Generates documentation for Data Protection Impact Assessments, showing what technical measures are in place to protect personal data in AI workflows." },
        { icon: "Globe", title: "Cross-border transfer controls", description: "Prevents personal data from reaching AI providers in jurisdictions without adequate GDPR data protection, supporting transfer restriction requirements." },
        { icon: "BarChart3", title: "Data processing records", description: "Maintains records of processing activities related to AI tool usage, satisfying GDPR Article 30 requirements for documentation." },
      ],
    },
    benefits: {
      heading: "Why EU organizations use TeamPrompt for GDPR compliance",
      items: [
        "Enforce data minimization by blocking unnecessary personal data in AI prompts",
        "Detect all GDPR personal data categories including special category data",
        "Generate DPIA documentation for AI tool risk assessments",
        "Maintain Article 30 records of AI-related data processing activities",
        "Prevent cross-border personal data transfers through AI tool submissions",
        "Demonstrate appropriate technical measures for supervisory authority inquiries",
      ],
    },
    stats: [
      { value: "€20M", label: "Max GDPR penalty" },
      { value: "5", label: "GDPR detection rules" },
      { value: "Art. 30", label: "Record keeping" },
    ],
    faqs: [
      { question: "Does submitting data to AI tools require GDPR compliance?", answer: "Yes. Under GDPR, submitting personal data to an AI provider constitutes data processing. You need a lawful basis (Article 6), must comply with data minimization (Article 5), and may need a DPIA (Article 35) depending on the scale and nature of processing." },
      { question: "How does TeamPrompt support DPIAs?", answer: "TeamPrompt generates documentation showing what personal data types are detected, how often they appear in AI prompts, and what technical measures prevent their submission. This evidence supports the DPIA requirement for AI tool deployments." },
      { question: "Does this help with data subject access requests?", answer: "TeamPrompt prevents personal data from reaching AI providers, which means there is no personal data at the AI provider to include in a DSAR response. Prevention is the most effective DSAR compliance strategy for AI tool usage." },
    ],
    cta: {
      headline: "Achieve GDPR compliance",
      gradientText: "for AI tool usage.",
      subtitle: "Technical measures for EU data protection. Deploy in minutes.",
    },
  },
  {
    slug: "ccpa-ai-compliance",
    category: "compliance",
    meta: {
      title: "CCPA AI Compliance — Protect Consumer Data in AI Tools | TeamPrompt",
      description:
        "Ensure CCPA and CPRA compliance when teams use AI tools. TeamPrompt prevents California consumer personal information from reaching AI providers.",
      keywords: ["CCPA AI compliance", "CPRA AI tools", "California privacy AI", "consumer data protection AI", "CCPA personal information AI"],
    },
    hero: {
      headline: "CCPA compliance for AI tool usage",
      subtitle:
        "The California Consumer Privacy Act requires businesses to protect personal information and disclose its use. TeamPrompt prevents California consumer data from reaching AI providers — eliminating a disclosure obligation and protecting consumer privacy rights.",
      badges: ["CCPA-ready", "CPRA-compliant", "Consumer data DLP"],
    },
    features: {
      sectionLabel: "CCPA Controls",
      heading: "How TeamPrompt supports CCPA AI compliance",
      items: [
        { icon: "Shield", title: "Personal information detection", description: "Identifies CCPA-defined personal information categories including identifiers, commercial data, internet activity, geolocation, and professional information in AI prompts." },
        { icon: "Lock", title: "Sensitive personal information scanning", description: "Detects CPRA's sensitive personal information categories — SSNs, financial data, precise geolocation, race, health data, and biometrics — with heightened protection." },
        { icon: "UserX", title: "Consumer identity protection", description: "Blocks consumer names, email addresses, account numbers, and other direct identifiers from being submitted to AI tools for processing." },
        { icon: "Scale", title: "Purpose limitation support", description: "DLP policies ensure personal information is not processed for purposes beyond what was disclosed to consumers, supporting CCPA purpose limitation requirements." },
        { icon: "FileText", title: "Disclosure documentation", description: "Audit logs document that personal information was prevented from reaching AI providers, supporting your CCPA privacy policy disclosures." },
        { icon: "BarChart3", title: "Privacy program reporting", description: "Dashboards show personal information detection rates and compliance metrics for privacy program governance and California AG inquiries." },
      ],
    },
    benefits: {
      heading: "Why California businesses use TeamPrompt for CCPA",
      items: [
        "Prevent consumer personal information from reaching AI providers",
        "Detect CPRA sensitive personal information categories automatically",
        "Eliminate AI-related disclosure obligations by blocking data at the source",
        "Support purpose limitation by controlling AI data processing",
        "Generate documentation for California Attorney General inquiries",
        "Protect consumer privacy rights without restricting AI tool access",
      ],
    },
    stats: [
      { value: "$7,500", label: "Per-violation penalty" },
      { value: "11", label: "PI categories detected" },
      { value: "31", label: "Total available detection rules" },
    ],
    faqs: [
      { question: "Does CCPA apply to AI tool usage?", answer: "Yes. If your team submits California consumers' personal information to AI tools, this constitutes a sale or sharing of personal information under CCPA/CPRA, triggering disclosure requirements and potentially opt-out rights." },
      { question: "How does this address CPRA sensitive PI?", answer: "TeamPrompt specifically detects CPRA's sensitive personal information categories including SSNs, financial account details, precise geolocation, racial/ethnic origin, health information, and biometric data." },
      { question: "Does this help with consumer deletion requests?", answer: "By preventing personal information from reaching AI providers, TeamPrompt eliminates the need to track and delete consumer data from AI provider systems — the most effective compliance strategy." },
    ],
    cta: {
      headline: "Meet CCPA requirements",
      gradientText: "for AI tool usage.",
      subtitle: "Protect California consumer data. Deploy in minutes.",
    },
  },
  {
    slug: "nist-ai-framework",
    category: "compliance",
    meta: {
      title: "NIST AI Risk Management Framework Compliance | TeamPrompt",
      description:
        "Align AI tool usage with the NIST AI Risk Management Framework. TeamPrompt provides governance, risk measurement, and monitoring controls for responsible AI adoption.",
      keywords: ["NIST AI RMF", "NIST AI framework", "AI risk management", "NIST AI compliance", "responsible AI governance"],
    },
    hero: {
      headline: "Align with the NIST AI Risk Management Framework",
      subtitle:
        "The NIST AI RMF provides a structured approach to managing AI risks. TeamPrompt maps directly to the framework's Govern, Map, Measure, and Manage functions — giving your organization concrete controls for responsible AI tool governance.",
      badges: ["NIST AI RMF", "Risk management", "AI governance"],
    },
    features: {
      sectionLabel: "NIST AI RMF",
      heading: "TeamPrompt's NIST AI RMF alignment",
      items: [
        { icon: "Building2", title: "GOVERN — AI governance structure", description: "TeamPrompt provides the policy infrastructure for AI governance: DLP policies, role-based controls, and enforcement mechanisms that establish organizational AI oversight." },
        { icon: "Globe", title: "MAP — Risk identification", description: "DLP analytics identify where AI-related data risks exist across your organization, mapping the threat landscape for sensitive data exposure through AI tools." },
        { icon: "BarChart3", title: "MEASURE — Risk quantification", description: "Usage analytics and DLP event data provide measurable risk metrics — blocked leak attempts, data types at risk, and team compliance rates." },
        { icon: "Shield", title: "MANAGE — Risk mitigation", description: "Active DLP scanning, policy enforcement, and real-time blocking provide concrete risk mitigation controls for AI-related data exposure." },
        { icon: "FileText", title: "Documentation and evidence", description: "Comprehensive logs and reports document your AI risk management program for internal governance reviews and external assessments." },
        { icon: "Users", title: "Stakeholder communication", description: "Dashboards and reports enable clear communication of AI risk posture to executive leadership, board members, and regulatory bodies." },
      ],
    },
    benefits: {
      heading: "Why organizations align with NIST AI RMF using TeamPrompt",
      items: [
        "Map directly to NIST AI RMF Govern, Map, Measure, and Manage functions",
        "Establish measurable AI governance controls with concrete enforcement",
        "Quantify AI-related data risks with usage analytics and DLP metrics",
        "Document risk management activities for governance reviews",
        "Communicate AI risk posture to leadership with executive dashboards",
        "Build a foundation for responsible AI that satisfies emerging regulations",
      ],
    },
    stats: [
      { value: "4", label: "RMF functions addressed" },
      { value: "Measurable", label: "Risk metrics" },
      { value: "Documented", label: "Governance evidence" },
    ],
    faqs: [
      { question: "Is the NIST AI RMF mandatory?", answer: "The NIST AI RMF is voluntary for most organizations, but it is increasingly referenced in procurement requirements, regulatory guidance, and industry standards. Federal agencies are required to follow it under Executive Order 14110." },
      { question: "How does TeamPrompt map to NIST AI RMF functions?", answer: "TeamPrompt addresses GOVERN through policy management, MAP through risk identification analytics, MEASURE through quantified risk metrics, and MANAGE through active DLP controls and enforcement." },
      { question: "Does this satisfy federal AI requirements?", answer: "TeamPrompt provides controls aligned with NIST AI RMF, which is the foundation for federal AI governance. Specific federal agency requirements vary, so consult your compliance team for agency-specific guidance." },
    ],
    cta: {
      headline: "Align with NIST AI RMF",
      gradientText: "using concrete controls.",
      subtitle: "Responsible AI governance with measurable outcomes.",
    },
  },
  {
    slug: "eu-ai-act-compliance",
    category: "compliance",
    meta: {
      title: "EU AI Act Compliance — AI Governance Controls | TeamPrompt",
      description:
        "Prepare for EU AI Act requirements with TeamPrompt. Implement risk management, transparency, human oversight, and data governance controls for AI tool usage.",
      keywords: ["EU AI Act compliance", "EU AI Act requirements", "AI Act governance", "EU AI regulation", "AI Act risk management"],
    },
    hero: {
      headline: "Prepare for EU AI Act compliance",
      subtitle:
        "The EU AI Act introduces mandatory requirements for AI system transparency, risk management, and human oversight. TeamPrompt helps organizations implement practical controls for AI tool usage that align with the Act's requirements — before enforcement begins.",
      badges: ["EU AI Act", "Risk-based approach", "Transparency controls"],
    },
    features: {
      sectionLabel: "AI Act Controls",
      heading: "How TeamPrompt supports EU AI Act compliance",
      items: [
        { icon: "Scale", title: "Risk-based classification support", description: "TeamPrompt's DLP policies can be configured by risk level, applying stricter controls to AI interactions involving high-risk data categories as defined by the AI Act." },
        { icon: "Eye", title: "Transparency and logging", description: "Comprehensive audit logs document every AI interaction, providing the transparency records that the AI Act requires for AI system operation." },
        { icon: "Users", title: "Human oversight controls", description: "DLP blocking and review workflows ensure human oversight of AI interactions involving sensitive data, satisfying the Act's human-in-the-loop requirements." },
        { icon: "Shield", title: "Data governance measures", description: "DLP scanning ensures that data submitted to AI tools meets quality and appropriateness standards, supporting the Act's data governance requirements." },
        { icon: "FileText", title: "Compliance documentation", description: "Generate documentation showing your AI governance controls, risk management processes, and technical measures for regulatory submissions." },
        { icon: "BarChart3", title: "Ongoing monitoring", description: "Continuous monitoring of AI tool usage provides the post-deployment monitoring that the AI Act requires for deployed AI systems." },
      ],
    },
    benefits: {
      heading: "Why organizations prepare for the EU AI Act with TeamPrompt",
      items: [
        "Implement risk-based controls before EU AI Act enforcement deadlines",
        "Establish transparency through comprehensive AI interaction logging",
        "Ensure human oversight for AI interactions involving sensitive data",
        "Support data governance requirements with DLP quality controls",
        "Generate compliance documentation for regulatory submissions",
        "Build AI governance infrastructure that meets emerging global standards",
      ],
    },
    stats: [
      { value: "€35M", label: "Max AI Act penalty" },
      { value: "Risk-based", label: "Control framework" },
      { value: "Continuous", label: "Monitoring" },
    ],
    faqs: [
      { question: "When does the EU AI Act take effect?", answer: "The EU AI Act entered into force in August 2024, with requirements phasing in over 6-36 months. Organizations should begin implementing controls now to meet upcoming enforcement deadlines." },
      { question: "Does the AI Act apply to companies using AI tools?", answer: "Yes. The AI Act applies to deployers of AI systems, not just developers. Organizations using AI tools like ChatGPT, Claude, and Copilot are considered deployers and must comply with applicable requirements." },
      { question: "How does TeamPrompt help with the AI Act's risk classification?", answer: "TeamPrompt enables risk-based DLP policies that apply different control levels based on data sensitivity and use case. This supports the AI Act's requirement for proportionate risk management measures." },
    ],
    cta: {
      headline: "Get ready for",
      gradientText: "the EU AI Act.",
      subtitle: "Implement AI governance controls before enforcement begins.",
    },
  },
  {
    slug: "iso-42001-compliance",
    category: "compliance",
    meta: {
      title: "ISO 42001 AI Management System Compliance | TeamPrompt",
      description:
        "Implement ISO 42001 AI management system controls with TeamPrompt. Establish AI governance, risk treatment, and operational controls for responsible AI use.",
      keywords: ["ISO 42001 compliance", "AI management system", "ISO 42001 AI", "AI governance ISO", "responsible AI ISO"],
    },
    hero: {
      headline: "ISO 42001 compliance for AI management",
      subtitle:
        "ISO 42001 is the world's first international standard for AI management systems. TeamPrompt provides operational controls that map directly to ISO 42001's requirements for AI governance, risk treatment, and responsible AI usage across your organization.",
      badges: ["ISO 42001", "AI management system", "Operational controls"],
    },
    features: {
      sectionLabel: "ISO 42001",
      heading: "TeamPrompt controls for ISO 42001 compliance",
      items: [
        { icon: "Building2", title: "AI governance framework", description: "TeamPrompt provides the policy management, role-based controls, and organizational structure needed to establish an AI management system aligned with ISO 42001." },
        { icon: "Shield", title: "Risk treatment controls", description: "DLP policies and enforcement mechanisms serve as risk treatment controls for data exposure risks identified in your ISO 42001 risk assessment." },
        { icon: "BarChart3", title: "Performance evaluation", description: "Analytics and reporting provide the performance metrics and monitoring data required for ISO 42001's evaluation and improvement cycle." },
        { icon: "FileText", title: "Documented information", description: "Comprehensive logs, policy documentation, and audit trails satisfy ISO 42001's requirements for maintaining documented information about your AI management system." },
        { icon: "Users", title: "Competence and awareness", description: "Real-time DLP feedback builds AI risk awareness across your organization, supporting ISO 42001's competence and awareness requirements." },
        { icon: "Eye", title: "Operational planning and control", description: "DLP scanning provides the operational controls required to manage AI-related risks during day-to-day AI tool usage across the organization." },
      ],
    },
    benefits: {
      heading: "Why organizations pursuing ISO 42001 choose TeamPrompt",
      items: [
        "Map TeamPrompt controls directly to ISO 42001 clause requirements",
        "Establish operational controls for AI risk treatment",
        "Generate documented information required by the standard",
        "Build performance evaluation metrics for continuous improvement",
        "Support competence and awareness through real-time DLP feedback",
        "Demonstrate responsible AI governance for certification audits",
      ],
    },
    stats: [
      { value: "ISO 42001", label: "Standard alignment" },
      { value: "Full", label: "AIMS support" },
      { value: "Continuous", label: "Improvement cycle" },
    ],
    faqs: [
      { question: "What is ISO 42001?", answer: "ISO 42001 is the first international standard for AI management systems (AIMS). Published in December 2023, it provides a framework for responsible AI governance including risk management, operational controls, and continuous improvement." },
      { question: "Is ISO 42001 certification mandatory?", answer: "ISO 42001 certification is voluntary. However, it is increasingly requested by enterprise customers, regulators, and partners as evidence of responsible AI governance." },
      { question: "How does TeamPrompt map to ISO 42001 clauses?", answer: "TeamPrompt maps to clauses on context of the organization (Clause 4), leadership (Clause 5), planning (Clause 6), support (Clause 7), operation (Clause 8), performance evaluation (Clause 9), and improvement (Clause 10)." },
    ],
    cta: {
      headline: "Build your AI management system",
      gradientText: "with ISO 42001.",
      subtitle: "Operational controls for AI governance. Get started today.",
    },
  },
  {
    slug: "iso-27001-ai",
    category: "compliance",
    meta: {
      title: "ISO 27001 AI Security Controls | TeamPrompt",
      description:
        "Extend your ISO 27001 ISMS to cover AI tool usage. TeamPrompt provides information security controls for AI-related data processing, access management, and monitoring.",
      keywords: ["ISO 27001 AI", "ISMS AI controls", "ISO 27001 AI security", "information security AI tools", "ISO 27001 Annex A AI"],
    },
    hero: {
      headline: "Extend ISO 27001 to cover AI tool usage",
      subtitle:
        "Your ISO 27001 Information Security Management System must address AI tool risks. TeamPrompt provides the technical controls — access management, data protection, and monitoring — that extend your ISMS to cover AI-related data processing.",
      badges: ["ISO 27001", "ISMS extension", "Annex A controls"],
    },
    features: {
      sectionLabel: "ISO 27001",
      heading: "Annex A controls for AI tool security",
      items: [
        { icon: "Lock", title: "A.8 — Asset management", description: "TeamPrompt helps classify and protect information assets that interact with AI tools, ensuring appropriate handling based on data classification levels." },
        { icon: "Users", title: "A.9 — Access control", description: "Role-based access controls restrict AI tool usage and DLP policies by role, satisfying ISO 27001's access management requirements." },
        { icon: "Shield", title: "A.10 — Cryptography and data protection", description: "DLP scanning prevents sensitive data from being transmitted to AI providers without appropriate protection, supporting data-in-transit security controls." },
        { icon: "Eye", title: "A.12 — Operations security", description: "Continuous monitoring, logging, and event management for AI interactions satisfy operational security requirements." },
        { icon: "BarChart3", title: "A.18 — Compliance monitoring", description: "Regular compliance reports and audit evidence support ISO 27001's requirement for monitoring and reviewing information security compliance." },
        { icon: "FileText", title: "Statement of Applicability", description: "Documentation showing how TeamPrompt controls address AI-related risks supports your Statement of Applicability and risk treatment plan." },
      ],
    },
    benefits: {
      heading: "Why ISO 27001-certified organizations use TeamPrompt",
      items: [
        "Extend your ISMS to cover AI tool data processing without starting from scratch",
        "Map TeamPrompt controls to relevant Annex A requirements",
        "Generate evidence for surveillance and recertification audits",
        "Address AI-related risks in your Statement of Applicability",
        "Maintain continuous monitoring for AI-related security events",
        "Demonstrate that AI tool adoption does not compromise your ISO 27001 certification",
      ],
    },
    stats: [
      { value: "6+", label: "Annex A domains addressed" },
      { value: "Continuous", label: "Security monitoring" },
      { value: "Audit-ready", label: "Evidence packages" },
    ],
    faqs: [
      { question: "Does AI tool usage need to be in our ISMS scope?", answer: "If your team uses AI tools to process information within your ISMS scope, then yes — AI tool usage should be addressed in your risk assessment and treated with appropriate controls." },
      { question: "Will our auditor ask about AI tools?", answer: "Increasingly, yes. ISO 27001 auditors are asking about AI tool controls as part of surveillance and recertification audits. Having documented controls demonstrates proactive risk management." },
      { question: "How does this affect our existing certification?", answer: "Adding AI controls strengthens your ISMS. TeamPrompt helps you address a new risk area without disrupting your existing control framework or certification status." },
    ],
    cta: {
      headline: "Extend your ISMS",
      gradientText: "to cover AI tools.",
      subtitle: "ISO 27001-aligned AI security controls. Deploy today.",
    },
  },
  {
    slug: "fedramp-ai-compliance",
    category: "compliance",
    meta: {
      title: "FedRAMP AI Compliance — Federal AI Tool Security | TeamPrompt",
      description:
        "Support FedRAMP compliance for AI tool usage in federal agencies. TeamPrompt provides NIST 800-53 aligned controls for data protection, access management, and continuous monitoring.",
      keywords: ["FedRAMP AI compliance", "federal AI security", "NIST 800-53 AI", "government AI tools", "FedRAMP authorized AI"],
    },
    hero: {
      headline: "FedRAMP-aligned controls for AI tool usage",
      subtitle:
        "Federal agencies and FedRAMP-authorized providers must ensure AI tool usage complies with NIST 800-53 controls. TeamPrompt provides data protection, access management, and continuous monitoring capabilities that align with FedRAMP security requirements.",
      badges: ["FedRAMP-aligned", "NIST 800-53", "Federal-ready"],
    },
    features: {
      sectionLabel: "FedRAMP Controls",
      heading: "NIST 800-53 controls for federal AI usage",
      items: [
        { icon: "Shield", title: "SC — System and communications protection", description: "DLP scanning provides boundary protection for data transmitted to AI tools, preventing controlled unclassified information from reaching unauthorized cloud services." },
        { icon: "Lock", title: "AC — Access control", description: "Role-based access controls and policy enforcement satisfy NIST 800-53 access control requirements for AI tool usage." },
        { icon: "Eye", title: "AU — Audit and accountability", description: "Comprehensive audit logging captures every AI interaction with timestamp, user, action, and outcome for accountability requirements." },
        { icon: "BarChart3", title: "CA — Continuous monitoring", description: "Real-time DLP monitoring and analytics provide the continuous assessment and authorization monitoring that FedRAMP requires." },
        { icon: "FileText", title: "RA — Risk assessment support", description: "DLP analytics and incident data support risk assessments for AI tool usage, identifying threats and vulnerabilities in data handling." },
        { icon: "Building2", title: "PM — Program management", description: "Centralized policy management and governance dashboards support the information security program management requirements." },
      ],
    },
    benefits: {
      heading: "Why federal teams use TeamPrompt for AI governance",
      items: [
        "Align AI tool controls with NIST 800-53 security control families",
        "Prevent CUI and controlled data from reaching unauthorized AI services",
        "Generate audit records required by FedRAMP continuous monitoring",
        "Support Authorization to Operate (ATO) documentation for AI tool usage",
        "Provide risk assessment data for AI-related security analysis",
        "Enable federal workers to use AI tools safely within security boundaries",
      ],
    },
    stats: [
      { value: "6+", label: "NIST 800-53 families" },
      { value: "Continuous", label: "Monitoring" },
      { value: "ATO", label: "Documentation support" },
    ],
    faqs: [
      { question: "Is TeamPrompt FedRAMP authorized?", answer: "Contact our team for current FedRAMP authorization status and deployment options for federal environments. TeamPrompt's architecture supports federal security requirements through browser-level processing." },
      { question: "Does this prevent CUI exposure through AI tools?", answer: "Yes. TeamPrompt detects CUI markers and controlled data categories before they reach AI tools, preventing unauthorized disclosure of controlled unclassified information." },
      { question: "How does this support the ATO process?", answer: "TeamPrompt provides documentation of security controls, risk assessment data, and continuous monitoring evidence that supports the ATO package for AI tool usage within federal systems." },
    ],
    cta: {
      headline: "Federal-grade AI security",
      gradientText: "for government teams.",
      subtitle: "NIST 800-53 aligned controls. Contact us for federal deployment.",
    },
  },
  {
    slug: "pci-dss-ai-compliance",
    category: "compliance",
    meta: {
      title: "PCI DSS AI Compliance — Protect Cardholder Data in AI | TeamPrompt",
      description:
        "Maintain PCI DSS compliance when teams use AI tools. TeamPrompt detects and blocks credit card numbers, account data, and cardholder information before they reach AI providers.",
      keywords: ["PCI DSS AI compliance", "PCI compliance AI tools", "cardholder data AI protection", "PCI DSS AI security", "payment card data AI"],
    },
    hero: {
      headline: "PCI DSS compliance for AI tool usage",
      subtitle:
        "PCI DSS requires that cardholder data is never transmitted to unauthorized systems. TeamPrompt detects credit card numbers, account data, and authentication values in every AI prompt — ensuring cardholder data never reaches AI providers.",
      badges: ["PCI DSS", "Cardholder data DLP", "QSA-ready"],
    },
    features: {
      sectionLabel: "PCI DSS",
      heading: "PCI DSS controls for AI data protection",
      items: [
        { icon: "Shield", title: "Req 3 — Stored data protection", description: "TeamPrompt prevents cardholder data from being stored at AI providers by blocking it before transmission, supporting Requirement 3's stored data protection controls." },
        { icon: "Lock", title: "Req 4 — Transmission encryption", description: "DLP scanning prevents cardholder data from being transmitted to AI providers entirely, which is stronger than encryption — no data, no risk." },
        { icon: "Eye", title: "Req 10 — Logging and monitoring", description: "Every DLP event involving cardholder data is logged with full context, satisfying Requirement 10's logging and monitoring requirements." },
        { icon: "Users", title: "Req 7 — Access restriction", description: "Role-based DLP policies restrict which personnel can interact with AI tools in ways that could involve cardholder data." },
        { icon: "ShieldCheck", title: "Luhn validation", description: "Credit card detection uses Luhn checksum validation to identify real card numbers while minimizing false positives from random digit sequences." },
        { icon: "BarChart3", title: "QSA audit evidence", description: "Pre-formatted PCI DSS evidence packages document DLP controls, configuration, and event history for Qualified Security Assessor review." },
      ],
    },
    benefits: {
      heading: "Why PCI-compliant organizations use TeamPrompt",
      items: [
        "Block cardholder data before it reaches any AI provider",
        "Detect primary account numbers with Luhn validation for accuracy",
        "Satisfy PCI DSS Requirements 3, 4, 7, and 10 for AI tool usage",
        "Generate evidence packages for QSA assessments and SAQ documentation",
        "Prevent PCI scope expansion by keeping cardholder data out of AI tools",
        "Enable payment-handling teams to use AI safely for non-PCI tasks",
      ],
    },
    stats: [
      { value: "5", label: "PCI-DSS detection rules" },
      { value: "Luhn", label: "Validated" },
      { value: "QSA-ready", label: "Evidence" },
    ],
    faqs: [
      { question: "Does AI tool usage affect our PCI DSS scope?", answer: "If cardholder data reaches an AI provider, that provider could be considered in scope for PCI DSS. TeamPrompt prevents this by blocking cardholder data before transmission, keeping AI tools out of your PCI scope." },
      { question: "Which PCI DSS requirements does TeamPrompt address?", answer: "TeamPrompt primarily supports Requirements 3 (stored data protection), 4 (transmission security), 7 (access restriction), and 10 (logging and monitoring) as they apply to AI tool usage." },
      { question: "Does the QSA need to assess our AI tool usage?", answer: "If AI tools process or store cardholder data, yes. TeamPrompt prevents this scenario, which is the simplest path to keeping AI tools out of your PCI assessment scope." },
    ],
    cta: {
      headline: "Keep cardholder data",
      gradientText: "out of AI tools.",
      subtitle: "PCI DSS compliance for AI. Deploy in minutes.",
    },
  },
  {
    slug: "cmmc-ai-compliance",
    category: "compliance",
    meta: {
      title: "CMMC AI Compliance — Defense Contractor AI Security | TeamPrompt",
      description:
        "Support CMMC compliance for defense contractors using AI tools. TeamPrompt provides CUI protection, access controls, and audit logging aligned with CMMC practices.",
      keywords: ["CMMC AI compliance", "defense contractor AI", "CUI protection AI tools", "CMMC Level 2 AI", "DoD AI security"],
    },
    hero: {
      headline: "CMMC compliance for AI tool usage",
      subtitle:
        "Defense contractors handling Controlled Unclassified Information must meet CMMC requirements for every system that processes CUI — including AI tools. TeamPrompt prevents CUI from reaching unauthorized AI services and provides the audit evidence CMMC assessors require.",
      badges: ["CMMC-aligned", "CUI protection", "Defense-ready"],
    },
    features: {
      sectionLabel: "CMMC Practices",
      heading: "CMMC-aligned controls for AI usage",
      items: [
        { icon: "Shield", title: "SC — System and communications", description: "DLP scanning provides boundary protection that prevents CUI from being transmitted to unauthorized AI services outside your CMMC boundary." },
        { icon: "Lock", title: "AC — Access control", description: "Role-based policies restrict AI tool usage and DLP configurations, supporting CMMC access control practices for CUI handling." },
        { icon: "Eye", title: "AU — Audit and accountability", description: "Comprehensive logging of all AI interactions provides the audit trail that CMMC assessors require for accountability practices." },
        { icon: "FileText", title: "MP — Media protection", description: "Preventing CUI from reaching AI tool servers supports media protection by ensuring CUI is not stored on unauthorized external systems." },
        { icon: "Users", title: "AT — Awareness and training", description: "Real-time DLP feedback educates defense contractor employees about CUI handling requirements when using AI tools." },
        { icon: "BarChart3", title: "Assessment evidence", description: "Generate documentation packages for CMMC Level 2 assessments showing CUI protection controls for AI tool usage." },
      ],
    },
    benefits: {
      heading: "Why defense contractors use TeamPrompt",
      items: [
        "Prevent CUI from reaching unauthorized AI services outside the CMMC boundary",
        "Align AI controls with CMMC Level 2 practices for NIST 800-171 requirements",
        "Generate audit evidence for CMMC third-party assessments",
        "Educate contractor employees about CUI handling through real-time DLP feedback",
        "Maintain CMMC compliance while enabling productive AI tool usage",
        "Support the SSP and POA&M documentation for AI-related controls",
      ],
    },
    stats: [
      { value: "CMMC L2", label: "Practice alignment" },
      { value: "CUI", label: "Protected" },
      { value: "C3PAO", label: "Assessment-ready" },
    ],
    faqs: [
      { question: "Does AI tool usage need to be in our CMMC scope?", answer: "If employees use AI tools to process or discuss CUI, those interactions fall within your CMMC boundary. TeamPrompt prevents CUI from reaching AI tools, which is the simplest way to manage AI within your CMMC scope." },
      { question: "Which CMMC level does TeamPrompt support?", answer: "TeamPrompt provides controls aligned with CMMC Level 2 practices, which correspond to NIST SP 800-171 requirements. These controls also support Level 3 requirements for enhanced security." },
      { question: "How does this affect our SSP?", answer: "TeamPrompt provides documented controls that can be referenced in your System Security Plan for AI tool usage. Our documentation includes SSP-ready descriptions of each control and its implementation." },
    ],
    cta: {
      headline: "Protect CUI",
      gradientText: "from AI exposure.",
      subtitle: "CMMC-aligned AI controls for defense contractors.",
    },
  },
  {
    slug: "ferpa-ai-compliance",
    category: "compliance",
    meta: {
      title: "FERPA AI Compliance — Protect Student Records in AI | TeamPrompt",
      description:
        "Ensure FERPA compliance when education teams use AI tools. TeamPrompt prevents student education records and personally identifiable information from reaching AI providers.",
      keywords: ["FERPA AI compliance", "student data AI protection", "education AI security", "FERPA AI tools", "student records AI"],
    },
    hero: {
      headline: "FERPA compliance for AI tool usage in education",
      subtitle:
        "FERPA protects student education records from unauthorized disclosure. When teachers, administrators, and staff use AI tools, TeamPrompt ensures that student names, grades, disciplinary records, and other education records never reach AI providers.",
      badges: ["FERPA-ready", "Student data DLP", "Education-focused"],
    },
    features: {
      sectionLabel: "FERPA Protection",
      heading: "How TeamPrompt protects student records",
      items: [
        { icon: "Shield", title: "Education record detection", description: "Identifies student names, grades, enrollment data, disciplinary records, and other education records defined under FERPA before they reach AI tools." },
        { icon: "UserX", title: "Student PII scanning", description: "Detects student Social Security numbers, student IDs, dates of birth, and other PII that could identify individual students." },
        { icon: "Lock", title: "Directory information controls", description: "Even directory information can be protected if parents or students have opted out. TeamPrompt supports configurable policies for directory information handling." },
        { icon: "Users", title: "Role-based education policies", description: "Apply different DLP policies to teachers, administrators, counselors, and support staff based on their FERPA-defined access to student records." },
        { icon: "Eye", title: "Classroom AI monitoring", description: "Monitor how AI tools are used in educational contexts, ensuring student data protection while enabling innovative teaching practices." },
        { icon: "BarChart3", title: "FERPA compliance reporting", description: "Generate reports documenting student record protection for FERPA compliance reviews and Department of Education inquiries." },
      ],
    },
    benefits: {
      heading: "Why education institutions use TeamPrompt for FERPA",
      items: [
        "Prevent student education records from reaching AI providers",
        "Detect student PII including names, grades, and disciplinary information",
        "Apply role-based policies matching FERPA access requirements",
        "Enable safe AI tool adoption in education without FERPA violations",
        "Generate compliance documentation for Department of Education reviews",
        "Protect student privacy while supporting innovative teaching practices",
      ],
    },
    stats: [
      { value: "19", label: "Compliance frameworks" },
      { value: "Role-based", label: "Access policies" },
      { value: "FERPA", label: "Compliant reporting" },
    ],
    faqs: [
      { question: "Does FERPA apply to AI tool usage in schools?", answer: "Yes. Disclosing student education records to AI providers without consent constitutes an unauthorized disclosure under FERPA. TeamPrompt prevents this by blocking student data before it reaches AI tools." },
      { question: "Can teachers still use AI for lesson planning?", answer: "Absolutely. TeamPrompt only blocks prompts containing actual student data. Teachers can use AI freely for lesson planning, content creation, and professional development without restriction." },
      { question: "Does this cover higher education institutions?", answer: "Yes. FERPA applies to all educational institutions receiving federal funding, including K-12 schools, colleges, and universities. TeamPrompt's policies can be configured for any educational setting." },
    ],
    cta: {
      headline: "Protect student records",
      gradientText: "from AI exposure.",
      subtitle: "FERPA-ready AI controls for education. Deploy in minutes.",
    },
  },
  {
    slug: "glba-ai-compliance",
    category: "compliance",
    meta: {
      title: "GLBA AI Compliance — Protect Financial Consumer Data | TeamPrompt",
      description:
        "Ensure GLBA compliance when financial institutions use AI tools. TeamPrompt prevents nonpublic personal information from reaching AI providers.",
      keywords: ["GLBA AI compliance", "Gramm-Leach-Bliley AI", "financial privacy AI", "NPI protection AI tools", "GLBA Safeguards Rule AI"],
    },
    hero: {
      headline: "GLBA compliance for AI tool usage",
      subtitle:
        "The Gramm-Leach-Bliley Act requires financial institutions to protect nonpublic personal information. TeamPrompt prevents NPI — account numbers, balances, transaction histories, and customer financial profiles — from reaching AI tools.",
      badges: ["GLBA-ready", "NPI protection", "Safeguards Rule"],
    },
    features: {
      sectionLabel: "GLBA Controls",
      heading: "How TeamPrompt supports GLBA AI compliance",
      items: [
        { icon: "Shield", title: "NPI detection", description: "Identifies nonpublic personal information including account numbers, balances, transaction records, and customer financial data before it reaches AI tools." },
        { icon: "Lock", title: "Safeguards Rule controls", description: "DLP scanning provides the technical safeguards required by the GLBA Safeguards Rule to protect NPI from unauthorized access and disclosure." },
        { icon: "Users", title: "Access restriction enforcement", description: "Role-based policies restrict which financial institution employees can use AI tools with data that might contain NPI." },
        { icon: "Eye", title: "Third-party sharing prevention", description: "Prevents NPI from being shared with AI providers as unauthorized third parties, maintaining compliance with GLBA's sharing restrictions." },
        { icon: "FileText", title: "Safeguards documentation", description: "Generate documentation for GLBA Safeguards Rule compliance showing your technical measures for protecting NPI in AI workflows." },
        { icon: "BarChart3", title: "Financial examiner reporting", description: "Pre-formatted reports for federal and state financial examiner reviews documenting NPI protection controls." },
      ],
    },
    benefits: {
      heading: "Why financial institutions use TeamPrompt for GLBA",
      items: [
        "Detect and block NPI before it reaches AI providers",
        "Satisfy GLBA Safeguards Rule requirements for technical controls",
        "Prevent unauthorized third-party NPI sharing through AI tools",
        "Generate documentation for federal and state financial examinations",
        "Enable financial services teams to use AI safely for non-NPI tasks",
        "Complement existing GLBA compliance programs with AI-specific controls",
      ],
    },
    stats: [
      { value: "40+", label: "Detection rules" },
      { value: "Safeguards", label: "Rule compliant" },
      { value: "Examiner", label: "Ready reports" },
    ],
    faqs: [
      { question: "What is NPI under GLBA?", answer: "Nonpublic personal information includes any financial information about a consumer that is not publicly available — account numbers, income, Social Security numbers, transaction histories, and information from consumer reports." },
      { question: "Does the Safeguards Rule require AI-specific controls?", answer: "The FTC's updated Safeguards Rule requires financial institutions to protect customer information in all systems, which includes AI tools. TeamPrompt provides the technical safeguards to meet this requirement." },
      { question: "How does this affect our financial examination?", answer: "Having documented AI data protection controls demonstrates proactive compliance with GLBA. TeamPrompt generates examiner-ready reports showing your NPI protection measures for AI tool usage." },
    ],
    cta: {
      headline: "Protect financial data",
      gradientText: "from AI exposure.",
      subtitle: "GLBA-compliant AI controls. Deploy in minutes.",
    },
  },
  {
    slug: "sec-ai-regulations",
    category: "compliance",
    meta: {
      title: "SEC AI Regulations Compliance | TeamPrompt",
      description:
        "Meet SEC requirements for AI tool governance in financial firms. TeamPrompt prevents MNPI, trading data, and client information from reaching AI providers.",
      keywords: ["SEC AI regulations", "SEC AI compliance", "MNPI protection AI", "securities AI governance", "SEC AI risk management"],
    },
    hero: {
      headline: "SEC compliance for AI tool usage",
      subtitle:
        "The SEC is intensifying scrutiny of AI tool usage in financial services. TeamPrompt prevents material non-public information, trading strategies, and client data from reaching AI providers — addressing the SEC's concerns about AI-related risks.",
      badges: ["SEC-ready", "MNPI protection", "Reg compliance"],
    },
    features: {
      sectionLabel: "SEC Controls",
      heading: "How TeamPrompt supports SEC AI compliance",
      items: [
        { icon: "Shield", title: "MNPI detection", description: "Identifies material non-public information including earnings data, merger details, and trading positions before they are submitted to AI tools." },
        { icon: "Lock", title: "Client data protection", description: "Prevents client portfolio details, account information, and investment strategies from reaching AI providers without authorization." },
        { icon: "Scale", title: "Reg S-P compliance", description: "DLP scanning supports Regulation S-P requirements for protecting customer financial information from unauthorized disclosure to third parties." },
        { icon: "Eye", title: "Trading data safeguards", description: "Detects trading algorithms, position data, and execution strategies that could provide unfair market advantages if disclosed." },
        { icon: "FileText", title: "Examination evidence", description: "Generate documentation for SEC examinations showing AI governance controls, data protection measures, and compliance monitoring." },
        { icon: "BarChart3", title: "Compliance monitoring", description: "Real-time monitoring of AI tool usage provides the ongoing oversight that SEC examiners expect for technology risk management." },
      ],
    },
    benefits: {
      heading: "Why financial firms use TeamPrompt for SEC compliance",
      items: [
        "Prevent MNPI from reaching AI tools where it could cause insider trading risk",
        "Block client data and portfolio details from unauthorized AI processing",
        "Support Regulation S-P and Regulation S-ID requirements",
        "Generate evidence for SEC examinations and OCIE reviews",
        "Demonstrate proactive AI risk management to regulators",
        "Enable financial professionals to use AI tools within compliance boundaries",
      ],
    },
    stats: [
      { value: "16", label: "Smart detection patterns" },
      { value: "Real-time", label: "Compliance monitoring" },
      { value: "SEC", label: "Exam-ready" },
    ],
    faqs: [
      { question: "Is the SEC regulating AI tool usage?", answer: "The SEC has issued guidance and enforcement actions related to AI usage in financial services. Firms must ensure AI tools do not facilitate insider trading, compromise client data, or create systemic risks." },
      { question: "Does AI usage create insider trading risk?", answer: "Yes. If MNPI is submitted to AI tools, it could be accessed by the AI provider or inadvertently disclosed, creating potential insider trading liability. TeamPrompt blocks MNPI before it reaches AI tools." },
      { question: "How does this support SEC examinations?", answer: "TeamPrompt generates documentation showing AI governance controls, MNPI protection measures, and monitoring activities that address SEC examination priorities for technology risk management." },
    ],
    cta: {
      headline: "Meet SEC expectations",
      gradientText: "for AI governance.",
      subtitle: "Protect MNPI and client data from AI exposure.",
    },
  },
  {
    slug: "finra-ai-compliance",
    category: "compliance",
    meta: {
      title: "FINRA AI Compliance — Broker-Dealer AI Governance | TeamPrompt",
      description:
        "Meet FINRA requirements for AI tool usage in broker-dealer firms. TeamPrompt provides supervisory controls, data protection, and record-keeping for AI interactions.",
      keywords: ["FINRA AI compliance", "broker-dealer AI", "FINRA AI governance", "FINRA supervisory controls AI", "securities firm AI"],
    },
    hero: {
      headline: "FINRA compliance for AI tool usage",
      subtitle:
        "FINRA expects broker-dealer firms to maintain supervisory controls over all communication channels — including AI tools. TeamPrompt provides the supervision, data protection, and record-keeping controls that FINRA examiners expect for AI governance.",
      badges: ["FINRA-ready", "Supervisory controls", "Record-keeping"],
    },
    features: {
      sectionLabel: "FINRA Controls",
      heading: "How TeamPrompt supports FINRA AI compliance",
      items: [
        { icon: "Eye", title: "Supervisory review capabilities", description: "Audit logs and analytics provide the supervisory oversight that FINRA requires for all communication channels, including AI tool interactions." },
        { icon: "Shield", title: "Customer data protection", description: "Prevents customer account information, portfolio details, and personal data from being submitted to AI tools without authorization." },
        { icon: "FileText", title: "Books and records compliance", description: "Comprehensive logging of AI interactions supports FINRA's books and records requirements under Rules 3110 and 4511." },
        { icon: "Lock", title: "Suitability data safeguards", description: "Protects customer suitability information, risk profiles, and investment objectives from reaching AI providers." },
        { icon: "Users", title: "Representative oversight", description: "Monitor and control AI tool usage by registered representatives, ensuring supervisory compliance with FINRA Rule 3110." },
        { icon: "BarChart3", title: "FINRA examination support", description: "Generate documentation and evidence packages for FINRA routine examinations and cause examinations related to technology governance." },
      ],
    },
    benefits: {
      heading: "Why broker-dealer firms use TeamPrompt",
      items: [
        "Provide supervisory controls for AI tool usage that FINRA examiners expect",
        "Protect customer data from unauthorized disclosure through AI tools",
        "Maintain books and records compliance for AI-related communications",
        "Safeguard suitability information and customer risk profiles",
        "Monitor registered representative AI usage with supervisory dashboards",
        "Generate evidence packages for FINRA routine and cause examinations",
      ],
    },
    stats: [
      { value: "Rule 3110", label: "Supervisory compliance" },
      { value: "5", label: "AI tools supported" },
      { value: "FINRA", label: "Exam-ready" },
    ],
    faqs: [
      { question: "Does FINRA regulate AI tool usage?", answer: "FINRA expects broker-dealers to supervise all communication channels and technology systems, which includes AI tools. Firms must have supervisory procedures that address AI-related risks to customer data and market integrity." },
      { question: "Do AI interactions need to be retained?", answer: "FINRA's books and records requirements may apply to AI interactions that constitute business communications. TeamPrompt's logging provides the record-keeping capability to support these requirements." },
      { question: "How does this affect our WSPs?", answer: "Your Written Supervisory Procedures should address AI tool usage. TeamPrompt provides the technical controls that enforce your WSP requirements for AI governance, data protection, and supervisory oversight." },
    ],
    cta: {
      headline: "Meet FINRA requirements",
      gradientText: "for AI governance.",
      subtitle: "Supervisory controls for broker-dealer AI usage.",
    },
  },
  {
    slug: "itar-ai-compliance",
    category: "compliance",
    meta: {
      title: "ITAR AI Compliance — Protect Defense Data in AI Tools | TeamPrompt",
      description:
        "Prevent ITAR-controlled technical data from reaching AI tools. TeamPrompt detects defense-related information and blocks unauthorized exports through AI providers.",
      keywords: ["ITAR AI compliance", "defense data AI protection", "ITAR technical data AI", "export control AI tools", "ITAR compliance AI"],
    },
    hero: {
      headline: "ITAR compliance for AI tool usage",
      subtitle:
        "Submitting ITAR-controlled technical data to a commercial AI provider constitutes an unauthorized export under the International Traffic in Arms Regulations. TeamPrompt prevents defense articles and technical data from reaching AI tools — avoiding violations that carry criminal penalties.",
      badges: ["ITAR-ready", "Export control", "Defense data DLP"],
    },
    features: {
      sectionLabel: "ITAR Controls",
      heading: "How TeamPrompt prevents ITAR violations",
      items: [
        { icon: "ShieldAlert", title: "Technical data detection", description: "Identifies ITAR-controlled technical data including defense specifications, engineering drawings, and manufacturing processes before they reach AI tools." },
        { icon: "Lock", title: "Export prevention", description: "Blocks the unauthorized export of defense articles and technical data by preventing their submission to AI providers operated by foreign-owned or multinational companies." },
        { icon: "Shield", title: "USML category awareness", description: "Configurable rules for U.S. Munitions List categories enable specific protection for the defense articles most relevant to your organization." },
        { icon: "Eye", title: "Classification marker detection", description: "Detects ITAR markings, distribution statements, and export control notices on content being submitted to AI tools." },
        { icon: "FileText", title: "Compliance documentation", description: "Generate documentation showing your ITAR compliance controls for AI tool usage, supporting DDTC registration and compliance program requirements." },
        { icon: "BarChart3", title: "Export control analytics", description: "Track ITAR-related DLP events to identify workflows and personnel that require additional export control training." },
      ],
    },
    benefits: {
      heading: "Why defense companies use TeamPrompt for ITAR",
      items: [
        "Prevent unauthorized exports of technical data through AI tool submissions",
        "Detect ITAR markings and classification notices on submitted content",
        "Block defense specifications and manufacturing data from reaching AI providers",
        "Generate compliance documentation for DDTC and DSS reviews",
        "Identify personnel who need additional ITAR training based on DLP events",
        "Enable defense workers to use AI tools safely for non-controlled activities",
      ],
    },
    stats: [
      { value: "$1M+", label: "Criminal penalty risk" },
      { value: "< 2 min", label: "Setup time" },
      { value: "DDTC", label: "Compliance-ready" },
    ],
    faqs: [
      { question: "Is sharing ITAR data with ChatGPT an export?", answer: "Yes. Submitting ITAR-controlled technical data to a commercial AI provider like OpenAI, Google, or Anthropic likely constitutes an unauthorized export under ITAR, which carries both civil and criminal penalties." },
      { question: "Does this cover all USML categories?", answer: "TeamPrompt's rules are configurable for specific USML categories. Administrators can define detection rules based on the defense articles and technical data most relevant to their organization's ITAR compliance program." },
      { question: "What about AI tools hosted in the US?", answer: "Even US-hosted AI tools may have foreign national employees or foreign-owned parent companies, which can trigger deemed export concerns. TeamPrompt provides an additional safeguard regardless of where the AI tool is hosted." },
    ],
    cta: {
      headline: "Prevent ITAR violations",
      gradientText: "from AI tool usage.",
      subtitle: "Export control compliance for defense AI workflows.",
    },
  },
  {
    slug: "cjis-ai-compliance",
    category: "compliance",
    meta: {
      title: "CJIS AI Compliance — Protect Criminal Justice Data | TeamPrompt",
      description:
        "Ensure CJIS Security Policy compliance when law enforcement uses AI tools. TeamPrompt prevents criminal justice information from reaching unauthorized AI services.",
      keywords: ["CJIS AI compliance", "criminal justice data AI", "CJIS Security Policy AI", "law enforcement AI tools", "CJI protection AI"],
    },
    hero: {
      headline: "CJIS compliance for AI tool usage",
      subtitle:
        "The CJIS Security Policy requires that criminal justice information is only accessible to authorized personnel on authorized systems. TeamPrompt prevents CJI — criminal histories, arrest records, and investigative data — from reaching commercial AI tools.",
      badges: ["CJIS-ready", "CJI protection", "Law enforcement"],
    },
    features: {
      sectionLabel: "CJIS Controls",
      heading: "How TeamPrompt protects criminal justice information",
      items: [
        { icon: "Shield", title: "CJI detection", description: "Identifies criminal justice information including criminal history records, arrest data, case numbers, and investigative information before they reach AI tools." },
        { icon: "Lock", title: "Unauthorized access prevention", description: "Blocks CJI from reaching commercial AI services that are not authorized under your agency's CJIS Security Addendum." },
        { icon: "Users", title: "Personnel security controls", description: "Role-based policies ensure only CJIS-authorized personnel can interact with AI tools in ways that might involve criminal justice data." },
        { icon: "Eye", title: "NCIC data protection", description: "Detects National Crime Information Center data patterns including warrant information, missing person records, and vehicle identification data." },
        { icon: "FileText", title: "Audit trail for CJIS reviews", description: "Comprehensive logging satisfies CJIS Security Policy audit requirements, documenting every AI interaction with user identity and action taken." },
        { icon: "BarChart3", title: "Agency compliance dashboard", description: "Dashboard showing CJI protection metrics for agency heads, CJIS Systems Officers, and state CSA reviews." },
      ],
    },
    benefits: {
      heading: "Why law enforcement agencies use TeamPrompt",
      items: [
        "Prevent CJI from reaching unauthorized commercial AI services",
        "Detect criminal history records and investigative data in AI prompts",
        "Satisfy CJIS Security Policy audit and logging requirements",
        "Enforce personnel security controls for AI tool access",
        "Protect NCIC data from unauthorized disclosure through AI tools",
        "Enable officers and analysts to use AI safely for authorized purposes",
      ],
    },
    stats: [
      { value: "31", label: "Total available detection rules" },
      { value: "CJIS", label: "Policy-compliant" },
      { value: "< 2 min", label: "Setup time" },
    ],
    faqs: [
      { question: "Can law enforcement use AI tools under CJIS?", answer: "Law enforcement can use AI tools for tasks that do not involve CJI. TeamPrompt ensures that CJI is never submitted to unauthorized AI tools while allowing officers to use AI for non-CJI tasks like report writing and research." },
      { question: "Does the AI provider need a CJIS Security Addendum?", answer: "Any provider that accesses CJI must have a CJIS Security Addendum. TeamPrompt prevents CJI from reaching AI providers, eliminating the need for CSAs with AI tool vendors." },
      { question: "How does this affect FBI CJIS audits?", answer: "TeamPrompt generates audit-ready documentation showing CJI protection controls for AI tool usage. This evidence supports your agency's compliance during FBI CJIS Division audits and state CSA reviews." },
    ],
    cta: {
      headline: "Protect criminal justice data",
      gradientText: "from AI exposure.",
      subtitle: "CJIS-compliant AI controls for law enforcement.",
    },
  },
  {
    slug: "stateramp-ai-compliance",
    category: "compliance",
    meta: {
      title: "StateRAMP AI Compliance — State Government AI Security | TeamPrompt",
      description:
        "Support StateRAMP compliance for AI tool usage in state and local government. TeamPrompt provides data protection and monitoring controls aligned with StateRAMP requirements.",
      keywords: ["StateRAMP AI compliance", "state government AI security", "StateRAMP AI tools", "local government AI", "state cloud security AI"],
    },
    hero: {
      headline: "StateRAMP compliance for AI tool usage",
      subtitle:
        "State and local governments adopting AI tools must ensure data protection standards meet StateRAMP requirements. TeamPrompt provides the data protection, access controls, and continuous monitoring that StateRAMP mandates for cloud-connected services.",
      badges: ["StateRAMP-aligned", "State government", "Continuous monitoring"],
    },
    features: {
      sectionLabel: "StateRAMP",
      heading: "How TeamPrompt supports StateRAMP compliance",
      items: [
        { icon: "Shield", title: "Data protection controls", description: "DLP scanning prevents state government data — citizen records, case information, and agency data — from reaching unauthorized AI services." },
        { icon: "Lock", title: "Access management", description: "Role-based access controls align with StateRAMP's requirements for identity management and access restriction to government systems." },
        { icon: "Eye", title: "Continuous monitoring", description: "Real-time monitoring of AI interactions provides the ongoing security assessment that StateRAMP requires for authorized services." },
        { icon: "Building2", title: "Government data classification", description: "Configurable policies match state-specific data classification schemes, ensuring appropriate protection levels for different data categories." },
        { icon: "FileText", title: "Assessment documentation", description: "Generate documentation for StateRAMP assessments showing security controls, monitoring capabilities, and data protection measures." },
        { icon: "BarChart3", title: "Agency reporting", description: "Dashboards and reports for state agency CISOs and compliance officers showing AI usage patterns and data protection metrics." },
      ],
    },
    benefits: {
      heading: "Why state agencies use TeamPrompt for StateRAMP",
      items: [
        "Protect citizen data from reaching unauthorized AI services",
        "Satisfy StateRAMP continuous monitoring requirements for AI tool usage",
        "Match state-specific data classification with configurable DLP policies",
        "Generate assessment documentation for StateRAMP authorization",
        "Provide CISOs with visibility into agency AI tool usage",
        "Enable government workers to use AI tools within security boundaries",
      ],
    },
    stats: [
      { value: "StateRAMP", label: "Aligned controls" },
      { value: "Continuous", label: "Monitoring" },
      { value: "50", label: "States supported" },
    ],
    faqs: [
      { question: "What is StateRAMP?", answer: "StateRAMP is a standardized security assessment program for cloud services used by state and local governments. Similar to FedRAMP, it provides a consistent framework for evaluating cloud security." },
      { question: "Does StateRAMP cover AI tool usage?", answer: "StateRAMP covers cloud services used by state and local government. As AI tools are cloud services, their usage should comply with StateRAMP security requirements when processing government data." },
      { question: "How does this work across different states?", answer: "TeamPrompt supports configurable policies that can match different state data classification schemes and privacy requirements. Each agency can configure policies appropriate for their state's regulatory environment." },
    ],
    cta: {
      headline: "Meet StateRAMP requirements",
      gradientText: "for AI governance.",
      subtitle: "State government AI security. Deploy in minutes.",
    },
  },
  {
    slug: "hitrust-ai-compliance",
    category: "compliance",
    meta: {
      title: "HITRUST AI Compliance — Healthcare AI Certification | TeamPrompt",
      description:
        "Support HITRUST CSF certification for AI tool usage. TeamPrompt provides controls aligned with HITRUST's Common Security Framework for healthcare organizations using AI.",
      keywords: ["HITRUST AI compliance", "HITRUST CSF AI", "healthcare AI certification", "HITRUST AI tools", "HITRUST security controls AI"],
    },
    hero: {
      headline: "HITRUST CSF compliance for AI tool usage",
      subtitle:
        "HITRUST CSF certification requires comprehensive security controls across all systems handling sensitive data. TeamPrompt provides the technical controls that extend your HITRUST program to cover AI tool usage — preventing data exposure without adding certification complexity.",
      badges: ["HITRUST-aligned", "CSF controls", "Healthcare AI"],
    },
    features: {
      sectionLabel: "HITRUST CSF",
      heading: "HITRUST-aligned controls for AI tool governance",
      items: [
        { icon: "Shield", title: "01 — Information protection program", description: "TeamPrompt extends your information protection program to AI tool usage with DLP policies, data classification, and protection controls." },
        { icon: "Lock", title: "06 — Encryption and data protection", description: "DLP scanning prevents sensitive data from being transmitted to AI providers, supporting HITRUST encryption and data protection requirements." },
        { icon: "Users", title: "01.c — Access control", description: "Role-based access controls restrict AI tool usage and DLP configurations based on user roles and data access requirements." },
        { icon: "Eye", title: "09 — Operations management", description: "Continuous monitoring, logging, and event management for AI interactions satisfy HITRUST's operations management control objectives." },
        { icon: "FileText", title: "Assessment readiness", description: "Generate evidence packages for HITRUST assessments showing AI-specific security controls and their effectiveness." },
        { icon: "BarChart3", title: "Control maturity reporting", description: "Track DLP control effectiveness over time, supporting HITRUST's maturity-based scoring methodology for continuous improvement." },
      ],
    },
    benefits: {
      heading: "Why HITRUST-certified organizations use TeamPrompt",
      items: [
        "Extend HITRUST CSF controls to cover AI tool usage without scope creep",
        "Map TeamPrompt controls to relevant HITRUST control objectives",
        "Generate assessment evidence packages for HITRUST assessors",
        "Demonstrate control maturity improvement with longitudinal metrics",
        "Protect PHI and sensitive data from AI exposure across healthcare teams",
        "Maintain HITRUST certification while enabling AI tool adoption",
      ],
    },
    stats: [
      { value: "HITRUST", label: "CSF alignment" },
      { value: "Maturity", label: "Based scoring" },
      { value: "Assessment", label: "Ready evidence" },
    ],
    faqs: [
      { question: "Does AI tool usage affect HITRUST certification?", answer: "If AI tools process or could receive data within your HITRUST scope, they should be addressed in your control framework. TeamPrompt helps you maintain certification by preventing data exposure through AI tools." },
      { question: "Which HITRUST control domains does TeamPrompt address?", answer: "TeamPrompt maps to control domains including Information Protection Program, Access Control, Encryption and Data Protection, Operations Management, and Audit Logging and Monitoring." },
      { question: "Does this support HITRUST r2 assessments?", answer: "Yes. TeamPrompt generates evidence that supports both HITRUST e1 and r2 assessments, with documentation appropriate for the rigor level of your certification." },
    ],
    cta: {
      headline: "Maintain HITRUST certification",
      gradientText: "with AI controls.",
      subtitle: "Healthcare AI governance for HITRUST compliance.",
    },
  },
  {
    slug: "pipeda-ai-compliance",
    category: "compliance",
    meta: {
      title: "PIPEDA AI Compliance — Canadian Privacy Law for AI | TeamPrompt",
      description:
        "Ensure PIPEDA compliance when Canadian teams use AI tools. TeamPrompt prevents personal information from reaching AI providers, supporting Canada's privacy requirements.",
      keywords: ["PIPEDA AI compliance", "Canadian privacy AI", "PIPEDA AI tools", "Canada personal information AI", "PIPEDA data protection AI"],
    },
    hero: {
      headline: "PIPEDA compliance for AI tool usage",
      subtitle:
        "Canada's Personal Information Protection and Electronic Documents Act requires organizations to protect personal information and limit its use to disclosed purposes. TeamPrompt prevents personal information from reaching AI providers — satisfying PIPEDA's core privacy principles.",
      badges: ["PIPEDA-ready", "Canadian privacy", "PI protection"],
    },
    features: {
      sectionLabel: "PIPEDA Controls",
      heading: "How TeamPrompt supports PIPEDA AI compliance",
      items: [
        { icon: "Shield", title: "Personal information detection", description: "Identifies Canadian personal information including names, SINs, health card numbers, driver's license numbers, and financial account details before they reach AI tools." },
        { icon: "Lock", title: "Purpose limitation enforcement", description: "DLP policies ensure personal information is not processed by AI tools beyond the purposes for which consent was obtained, supporting PIPEDA Principle 2." },
        { icon: "UserX", title: "Consent boundary protection", description: "Prevents personal information from being submitted to AI providers that were not identified in your privacy policy or consent processes." },
        { icon: "Globe", title: "Cross-border transfer controls", description: "Prevents personal information from being transferred to AI providers in jurisdictions that may not provide adequate privacy protection under PIPEDA." },
        { icon: "FileText", title: "Privacy impact evidence", description: "Generate documentation for Privacy Impact Assessments showing how AI tool usage is controlled to protect personal information." },
        { icon: "BarChart3", title: "OPC inquiry support", description: "Comprehensive audit trails and reports support responses to Office of the Privacy Commissioner inquiries about AI data handling." },
      ],
    },
    benefits: {
      heading: "Why Canadian organizations use TeamPrompt for PIPEDA",
      items: [
        "Detect Canadian personal information formats including SINs and health cards",
        "Enforce purpose limitation by controlling AI data processing",
        "Prevent cross-border transfers of PI to unauthorized AI providers",
        "Generate Privacy Impact Assessment documentation for AI deployments",
        "Maintain audit trails for Privacy Commissioner inquiry responses",
        "Enable teams to use AI tools while respecting Canadian privacy rights",
      ],
    },
    stats: [
      { value: "2-click", label: "From sidebar to AI tool" },
      { value: "Canadian", label: "Format support" },
      { value: "19", label: "Compliance frameworks" },
    ],
    faqs: [
      { question: "Does PIPEDA apply to AI tool usage?", answer: "Yes. Submitting personal information to an AI provider constitutes a use and potential disclosure of personal information under PIPEDA. Organizations must ensure this use is consistent with their stated purposes and consent processes." },
      { question: "Does TeamPrompt detect Canadian ID formats?", answer: "Yes. TeamPrompt detects Canadian Social Insurance Numbers (SINs), provincial health card numbers, driver's license numbers, and other Canadian-specific personal information formats." },
      { question: "How does this affect provincial privacy laws?", answer: "TeamPrompt supports PIPEDA requirements, which also satisfy similar requirements under substantially similar provincial privacy laws in Alberta, British Columbia, and Quebec." },
    ],
    cta: {
      headline: "Protect personal information",
      gradientText: "under PIPEDA.",
      subtitle: "Canadian privacy compliance for AI. Deploy in minutes.",
    },
  },
];
