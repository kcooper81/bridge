import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "education",
  industry: "Education",
  headline: "Secure AI adoption for schools and universities",
  subtitle:
    "Give educators a managed prompt library with guardrails that protect student data — so your institution can embrace AI responsibly.",
  compliance: ["FERPA Protection", "Student Data Safety", "Audit Logging"],
  painPoints: [
    {
      title: "Faculty paste student data into AI tools",
      description:
        "Without guardrails, student names, grades, and IDs end up in AI tools with no oversight or audit trail.",
    },
    {
      title: "No standard AI curriculum templates",
      description:
        "Every educator builds prompts from scratch. Quality and approach vary wildly across departments and campuses.",
    },
    {
      title: "Zero visibility into institutional AI usage",
      description:
        "Administration has no idea how AI is being used across the institution — or what data is being shared.",
    },
  ],
  features: [
    {
      icon: "ShieldCheck",
      title: "Student Data Protection",
      description:
        "Scan every prompt for student PII — names, student IDs, grades, disciplinary records, and other FERPA-protected information — before it reaches an AI model.",
    },
    {
      icon: "FileText",
      title: "Curriculum Prompt Templates",
      description:
        "Pre-built prompt templates for lesson planning, assignment creation, grading rubrics, and student feedback. Standardize quality across every department.",
    },
    {
      icon: "ClipboardList",
      title: "Full Audit Log",
      description:
        "Every prompt, every user, every timestamp. Give administration a complete record of AI usage to support FERPA compliance reviews.",
    },
    {
      icon: "Users",
      title: "Department Management",
      description:
        "Organize prompts by department — humanities, STEM, administration — with role-based access so each group sees only what they need.",
    },
  ],
  mockupVariant: "vault",
  mockupItems: [
    { title: "Lesson Plan Generator", badge: "FERPA Safe", stat: "287 uses", iconColor: "green", subtitle: "K-12 · 4.8★" },
    { title: "Assignment Rubric Builder", badge: "FERPA Safe", stat: "198 uses", iconColor: "blue", subtitle: "Assessment · 4.7★", highlight: "shared" },
    { title: "Student Feedback Template", badge: "FERPA Safe", stat: "156 uses", iconColor: "green", subtitle: "Advisory" },
    { title: "Research Summary Prompt", badge: "FERPA Safe", stat: "134 uses", iconColor: "purple", subtitle: "Higher Ed · new", highlight: "new" },
  ],
  mockupUser: { name: "Prof. Chen", initials: "PC" },
  stats: [
    { value: "15+", label: "Built-in detection patterns" },
    { value: "3x", label: "Faster prompt reuse" },
    { value: "100%", label: "Interaction audit coverage" },
  ],
  faqs: [
    {
      question: "Can TeamPrompt help with FERPA compliance?",
      answer:
        "TeamPrompt's guardrails detect student personally identifiable information (PII) and block it before it reaches AI tools. All data is encrypted at rest and in transit. Our DLP features provide strong technical safeguards for educational institutions using AI.",
    },
    {
      question: "What student data does TeamPrompt detect?",
      answer:
        "Our detection engine scans for student names, student IDs, grades, Social Security numbers, dates of birth, disciplinary records, and other education-record identifiers. Custom patterns let you add institution-specific formats like internal student ID numbers.",
    },
    {
      question: "Can different departments have different guardrails?",
      answer:
        "Yes. Admins configure detection rules at the institution level and customize them per department. For example, the registrar's office might have stricter rules around transcript data while the English department has lighter restrictions.",
    },
    {
      question: "How does TeamPrompt support responsible AI in the classroom?",
      answer:
        "TeamPrompt provides approved prompt templates that guide appropriate AI use, quality guidelines that set standards for AI interactions, and guardrails that protect student data — giving institutions the framework for responsible AI adoption.",
    },
  ],
  cta: {
    headline: "Your educators are already using AI.",
    gradientText: "Make it safe.",
    subtitle: "Deploy TeamPrompt for your institution in under 5 minutes.",
  },
};
