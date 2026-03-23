import type {
  FindingsTheme,
  InterviewQuestion,
  ResearchProject,
} from '../types/research'

export const seedProject: ResearchProject = {
  title: 'Peer-to-peer accommodation and platform trust',
  researchQuestion: '',
  subQuestions: [],
  aims: [
    'Map decision pathways from discovery to booking.',
    'Relate interview narratives to platform governance themes.',
  ],
}

export const seedInterviewQuestions: InterviewQuestion[] = [
  {
    id: 'q1',
    section: 'Opening questions',
    orderIndex: 0,
    questionText:
      'Could you walk me through how you usually find and book short stays when you travel for work or leisure?',
    rationale:
      'Establishes a concrete baseline narrative before diving into platforms vs informal channels.',
    learningGoal:
      'Identify default habits, tools, and vocabulary the participant uses for discovery and booking.',
    notes: 'Probe for examples from the last 2–3 trips.',
    theme: 'Journey',
    audienceType: 'all',
    priority: 'high',
    status: 'ready',
  },
  {
    id: 'q2',
    section: 'Current booking behaviour',
    orderIndex: 0,
    questionText:
      'Tell me about a time a booking did not go as expected. What happened next?',
    rationale:
      'Elicits risk and recovery stories that reveal trust assumptions.',
    learningGoal:
      'Surface how participants mitigate problems and who they hold responsible.',
    notes: '',
    theme: 'Risk',
    audienceType: 'guests',
    priority: 'high',
    status: 'draft',
  },
  {
    id: 'q3',
    section: 'Networks',
    orderIndex: 0,
    questionText:
      'When someone recommends a place informally, what do you need to know before you commit?',
    rationale:
      'Connects social proof and weak ties to commitment decisions.',
    learningGoal:
      'Capture criteria for “good enough” trust outside formal listings.',
    notes: 'Contrast with Airbnb-style listing cues.',
    theme: 'Networks',
    audienceType: 'all',
    priority: 'medium',
    status: 'draft',
  },
  {
    id: 'q4',
    section: 'Awareness of platforms',
    orderIndex: 0,
    questionText:
      'Which platforms come to mind for short lets, and how do you compare them?',
    rationale:
      'Maps mental models of marketplace choice and differentiation.',
    learningGoal:
      'Understand perceived strengths/weaknesses and category boundaries.',
    notes: '',
    theme: 'Platforms',
    audienceType: 'all',
    priority: 'medium',
    status: 'draft',
  },
  {
    id: 'q5',
    section: 'Trust & risk',
    orderIndex: 0,
    questionText:
      'What would make you hesitate to book through a given channel?',
    rationale:
      'Directly targets friction and trust heuristics for analysis.',
    learningGoal:
      'List recurring hesitation themes to compare across participants.',
    notes: '',
    theme: 'Trust',
    audienceType: 'all',
    priority: 'high',
    status: 'draft',
  },
  {
    id: 'q6',
    section: 'Closing reflections',
    orderIndex: 0,
    questionText:
      'Is there anything important we have not covered about how you choose where to stay?',
    rationale:
      'Opens space for emergent themes and participant-led priorities.',
    learningGoal:
      'Capture additional constructs the interview guide may have missed.',
    notes: '',
    theme: 'Meta',
    audienceType: 'all',
    priority: 'low',
    status: 'draft',
  },
]

export const seedFindingsThemes: FindingsTheme[] = [
  {
    id: 'f1',
    title: 'Discovery pathways',
    description:
      'How participants move from intent to a shortlist of options.',
    possibleEvidence:
      'Sequences of search, referrals, repeat bookings; role of screenshots and DMs.',
    linkedInterviewQuestionIds: ['q1', 'q4'],
    notes: 'Likely early empirical chapter.',
    essayStructure:
      '§1 narrative journey diagram → §2 comparison of platform vs informal discovery.',
  },
  {
    id: 'f2',
    title: 'Trust heuristics',
    description:
      'Rules of thumb used when information is incomplete or informal.',
    possibleEvidence:
      'Stories of hesitation, recovery, and who is blamed when things fail.',
    linkedInterviewQuestionIds: ['q2', 'q5'],
    notes: 'Cross-cut with governance literature in discussion.',
    essayStructure:
      'Thematic section with sub-headings: verification, recourse, reputation.',
  },
  {
    id: 'f3',
    title: 'Informal networks',
    description:
      'The function of weak ties and recommendations in booking decisions.',
    possibleEvidence:
      'Quotes on what “counts” as a recommendation; thresholds to commit.',
    linkedInterviewQuestionIds: ['q3'],
    notes: '',
    essayStructure: 'Bridge between literature on social capital and findings.',
  },
]
