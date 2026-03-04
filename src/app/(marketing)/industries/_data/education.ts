import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "education",
  industry: "Education",
  headline: "Secure AI adoption for schools and universities",
  subtitle:
    "Give educators a managed prompt library with data protection that catches student data — so your institution can embrace AI responsibly.",
  compliance: ["FERPA Protection", "Student Data Safety", "Audit Logging"],
  painPoints: [
    {
      title: "Faculty paste student data into AI tools",
      description:
        "Without data protection, student names, grades, and IDs end up in AI tools with no oversight or audit trail.",
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
  ],
  mockupVariant: "vault",
  mockupItems: [
    { title: "Lesson Plan Generator", badge: "FERPA Safe", stat: "287 uses", iconColor: "green", subtitle: "K-12 · 4.8★" },
    { title: "Assignment Rubric Builder", badge: "FERPA Safe", stat: "198 uses", iconColor: "blue", subtitle: "Assessment · 4.7★", highlight: "shared" },
    { title: "Student Feedback Template", badge: "FERPA Safe", stat: "156 uses", iconColor: "green", subtitle: "Advisory" },
    { title: "Research Summary Prompt", badge: "FERPA Safe", stat: "134 uses", iconColor: "purple", subtitle: "Higher Ed · new", highlight: "new" },
  ],
  mockupUser: { name: "Prof. Chen", initials: "PC" },
  scenario: {
    title: "What this looks like in practice",
    persona: "Prof. Williams, biology department",
    setup:
      "Prof. Williams is creating study materials for next week's exam and pastes a student roster — names, student IDs, and current grades — into ChatGPT to help generate personalized study guides.",
    trigger:
      "TeamPrompt catches the FERPA-protected student PII patterns: the student IDs and the association of names with grades. The prompt is blocked before submission.",
    resolution:
      "Prof. Williams removes the student identifiers, asks ChatGPT for a generic study guide template instead, and personalizes each one manually. Student data never left the browser.",
  },
  stats: [
    { value: "31", label: "Total available detection rules" },
    { value: "2-click", label: "From sidebar to AI tool" },
    { value: "5", label: "AI tools protected" },
  ],
  faqs: [
    {
      question: "Can TeamPrompt help with FERPA compliance?",
      answer:
        "TeamPrompt's security rules detect student personally identifiable information (PII) and block it before it reaches AI tools. All data is encrypted at rest and in transit. Our DLP features provide strong technical safeguards for educational institutions using AI.",
    },
    {
      question: "What student data does TeamPrompt detect?",
      answer:
        "Our detection engine scans for student names, student IDs, grades, Social Security numbers, dates of birth, disciplinary records, and other education-record identifiers. Custom patterns let you add institution-specific formats like internal student ID numbers.",
    },
    {
      question: "Can different departments have different security rules?",
      answer:
        "Yes. Admins configure detection rules at the institution level and customize them per department. For example, the registrar's office might have stricter rules around transcript data while the English department has lighter restrictions.",
    },
    {
      question: "How does TeamPrompt support responsible AI in the classroom?",
      answer:
        "TeamPrompt provides approved prompt templates that guide appropriate AI use, quality guidelines that set standards for AI interactions, and security rules that protect student data — giving institutions the framework for responsible AI adoption.",
    },
  ],
  cta: {
    headline: "Student data stays in the classroom.",
    gradientText: "AI stays useful.",
    subtitle:
      "31 detection rules protect FERPA data from day one. Free plan starts at 25 prompts/month.",
  },
};
