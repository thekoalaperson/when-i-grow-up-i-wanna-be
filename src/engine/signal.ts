// Future Map — signal check (spec 4.8, 6.5).
//
// A claim isn't just truth-checked; it's evaluated against the student's ACTUAL path,
// profile, and constraints. The decisive "does this change anything for you?" is the
// headline; the truth-check and sources are supporting detail.
//
// GROUNDING NOTE: in a live deployment `check_claim` runs against current, real search
// results, weighting primary/official sources over SEO'd secondary content (spec 4.8).
// This shipped build reasons over a curated, dated library of the claims this user base
// actually hears — the same verdict shape a live provider returns. Where a claim isn't
// in scope, it says so plainly rather than fabricating confidence. See grounding.ts.

import { NODE_BY_ID } from './seed'
import type { ClaimInput, ClaimVerdict, StudentContext, TruthVerdict } from './types'

interface ClaimEntry {
  id: string
  keywords: string[] // all-lowercase; matched loosely
  truthVerdict: TruthVerdict
  summary: string
  detail: string
  sources: { title: string; url: string; tier: 'primary' | 'secondary' }[]
  /** Path/stream ids this claim bears on. */
  affects: string[]
  /** Impact + note when the student's chosen path is in `affects`. */
  relevant: { impact: ClaimVerdict['impact']; note: (ctx: StudentContext) => string }
  /** Impact + note when it isn't. */
  tangential?: { impact: ClaimVerdict['impact']; note: (ctx: StudentContext) => string }
}

// Values / wellbeing signals — NOT claims to fact-check (spec 4.17). These get named
// plainly and routed to a human, never forced into a data-flavoured verdict.
const ESCALATION_CUES = [
  'disown',
  'hate me',
  'depressed',
  'depression',
  'anxious',
  'anxiety',
  'suicid',
  'kill myself',
  'end it',
  'worthless',
  'failure as a',
  'ashamed of me',
  'no one loves',
  'can’t go on',
  "can't go on",
  'give up on life',
  'hopeless',
]

/** True when the text is a wellbeing/values signal, not a fact to check (spec 4.17). */
export function isDistress(text: string): boolean {
  const t = normalise(text)
  return ESCALATION_CUES.some((c) => t.includes(normalise(c)))
}

const LIBRARY: ClaimEntry[] = [
  {
    id: 'eng_saturated',
    keywords: ['engineering', 'saturat', 'no jobs', 'oversupply', 'too many engineers', 'no scope'],
    truthVerdict: 'partly_true',
    summary:
      'True at the bottom of the field, false at the top. India produces far more engineering graduates than the market absorbs — but that glut is concentrated in the long tail of colleges. Top institutes and in-demand branches (CSE, core specialisations) still place well.',
    detail:
      'The oversupply is real in aggregate: a large share of graduates from lower-tier colleges are underemployed. But this is a college-and-branch story, not a "engineering is dead" story. The gap between a top-40 institute and a random private college is enormous and widening. The honest reframing is: engineering isn’t saturated, the bottom of it is.',
    sources: [
      { title: 'AICTE — approved institutions & intake data', url: 'https://www.aicte-india.org/', tier: 'primary' },
      { title: 'NIRF — engineering rankings & placement data', url: 'https://www.nirfindia.org/', tier: 'primary' },
    ],
    affects: ['c_engineering', 's_pcm', 'c_analytics'],
    relevant: {
      impact: 'partial_adjustment',
      note: (ctx) =>
        `It doesn’t sink ${nodeLabel(ctx.chosenPathId)} as a field, but it should sharpen the question from "engineering?" to "which institute band?" — that’s where your actual outcome is decided.`,
    },
    tangential: {
      impact: 'no_change',
      note: () =>
        'This is about engineering; it doesn’t touch your current path. The one transferable lesson: in any crowded field, the institution tier does the heavy lifting.',
    },
  },
  {
    id: 'humanities_no_money',
    keywords: ['humanities', 'arts', 'no money', 'no scope', 'no future', 'useless degree', 'waste'],
    truthVerdict: 'misleading',
    summary:
      'A stream-level claim about path-level realities. Some humanities paths (law from a top NLU, civil services, economics from a strong school) out-earn a median engineer; others (early journalism, a plain B.A.) genuinely pay modestly at the start. "Humanities = no money" collapses that range into a falsehood.',
    detail:
      'The evidence points to spread, not a floor. The stream doesn’t determine income — the specific path and college do, exactly as they do in science and commerce. The claim usually carries family anxiety more than data; the useful move is to name the specific path and check its specific numbers.',
    sources: [
      { title: 'CLAT / NLU placement disclosures', url: 'https://consortiumofnlus.ac.in/', tier: 'primary' },
      { title: 'UPSC — recruitment & pay (7th CPC)', url: 'https://upsc.gov.in/', tier: 'primary' },
    ],
    affects: ['s_hum', 'c_law', 'c_civil_services', 'c_psychology', 'c_journalism', 'c_economics'],
    relevant: {
      impact: 'no_change',
      note: (ctx) =>
        `As a blanket claim it doesn’t hold against ${nodeLabel(ctx.chosenPathId)} specifically — but it’s worth having the real numbers ready for whoever said it, because this is the claim most likely to be used to talk you out of it.`,
    },
    tangential: {
      impact: 'not_applicable',
      note: () =>
        'This is about the humanities stream and doesn’t bear on your current path. Flagging it mainly because it’s the most common unexamined claim in this whole space.',
    },
  },
  {
    id: 'ai_replaces_coders',
    keywords: ['ai will replace', 'ai replacing', 'coders', 'programmers', 'software has no future', 'cse dead', 'coding dead'],
    truthVerdict: 'partly_true',
    summary:
      'Directionally real, wildly overstated. AI is genuinely pressuring rote, entry-level coding and raising the bar for what a junior needs to bring. It is not eliminating demand for engineers who can design systems, judge trade-offs, and work with the tools rather than compete with them.',
    detail:
      'The measured shift is in the nature of the work and the entry bar, not the existence of the field. The people most exposed are those whose only skill was producing boilerplate; the people least exposed are those who can architect and adapt. Treat it as "raise your ceiling," not "abandon ship."',
    sources: [
      { title: 'NASSCOM — India tech industry & talent reports', url: 'https://nasscom.in/', tier: 'primary' },
    ],
    affects: ['c_engineering', 's_pcm', 'c_analytics', 'i_data'],
    relevant: {
      impact: 'partial_adjustment',
      note: (ctx) =>
        `It doesn’t close ${nodeLabel(ctx.chosenPathId)}, but it changes what "good enough" means: plan to build real projects and judgment, not just clear coursework. The floor is rising.`,
    },
    tangential: {
      impact: 'no_change',
      note: () => 'This is a software-industry claim and doesn’t touch your current path.',
    },
  },
  {
    id: 'mbbs_rich',
    keywords: ['doctor', 'mbbs', 'rich', 'guaranteed', 'lot of money', 'good money', 'settled'],
    truthVerdict: 'partly_true',
    summary:
      'Eventually, for many — but not soon, and not without a long second climb. MBBS is ~6.5 years to a first real paycheck, the intern stipend is modest, and most doctors now need a PG seat (itself fiercely competitive) before the income matches the reputation.',
    detail:
      'The endpoint can be genuinely high, especially for specialists. The claim goes wrong on timeline and certainty: it hides the ~6.5-year runway, the PG bottleneck, and the fact that ~93% of NEET aspirants never get an MBBS seat at all. "Doctors are rich" is a statement about year 12 of the journey told as if it’s year 1.',
    sources: [
      { title: 'NEET-UG — NTA (official)', url: 'https://neet.nta.nic.in/', tier: 'primary' },
      { title: 'NMC — medical education norms', url: 'https://www.nmc.org.in/', tier: 'primary' },
    ],
    affects: ['c_medicine', 's_pcb'],
    relevant: {
      impact: 'worth_reconsidering',
      note: (ctx) =>
        `If "guaranteed money" is a load-bearing reason for ${nodeLabel(ctx.chosenPathId)}, it’s worth re-examining — the money is real but late and conditional on a PG seat, not the degree alone.`,
    },
    tangential: {
      impact: 'no_change',
      note: () => 'This is about medicine and doesn’t touch your current path.',
    },
  },
  {
    id: 'ca_easy',
    keywords: ['ca', 'chartered', 'easy', 'anyone can', 'simple', 'just study'],
    truthVerdict: 'misleading',
    summary:
      'The opposite of easy. CA is one of the cheapest high-return qualifications in India precisely because the exams filter hard — the Final pass rate is often under 20% per attempt, and most people take several years and multiple attempts including articleship.',
    detail:
      'Whoever called it easy is usually pointing at the low fees, not the exams. The low cost is real; the difficulty is what makes the qualification worth something. Plan for it as a multi-year, multi-attempt commitment, not a quick certificate.',
    sources: [
      { title: 'ICAI — exams & pass percentages', url: 'https://www.icai.org/', tier: 'primary' },
    ],
    affects: ['c_ca', 's_com_m'],
    relevant: {
      impact: 'partial_adjustment',
      note: (ctx) =>
        `Doesn’t change whether ${nodeLabel(ctx.chosenPathId)} is worth it — it very much can be — but it should reset your plan to "years and multiple attempts," so you’re not blindsided if the first one doesn’t clear.`,
    },
    tangential: {
      impact: 'no_change',
      note: () => 'This is about CA and doesn’t touch your current path.',
    },
  },
  {
    id: 'govt_only_safe',
    keywords: ['government job', 'govt job', 'sarkari', 'upsc', 'civil services', 'only safe', 'secure', 'stable'],
    truthVerdict: 'misleading',
    summary:
      'Secure if you get it — and that "if" is the whole story. UPSC selects roughly 0.1–0.2% of aspirants, after years of full-time prep most people give up several years to. The security is real; the odds and the opportunity cost usually go unmentioned.',
    detail:
      'This is a survivorship claim: it describes the small number who cleared, not the large number who spent their early twenties trying and didn’t. Security is a genuine draw, but it should be weighed against the hit-rate and the years — and it demands a real plan B.',
    sources: [
      { title: 'UPSC — annual report & selection data', url: 'https://upsc.gov.in/', tier: 'primary' },
    ],
    affects: ['c_civil_services', 's_hum'],
    relevant: {
      impact: 'worth_reconsidering',
      note: (ctx) =>
        `If security is the main reason for ${nodeLabel(ctx.chosenPathId)}, weigh it against a ~0.1–0.2% hit-rate and years of prep. Worth doing — with a concrete plan B, not instead of one.`,
    },
    tangential: {
      impact: 'no_change',
      note: () => 'This is about civil services and doesn’t touch your current path.',
    },
  },
  {
    id: 'design_no_scope',
    keywords: ['design', 'drawing', 'no scope', 'not a real career', 'no money', 'hobby'],
    truthVerdict: 'misleading',
    summary:
      'Out of date and category-blind. Product/UX design is one of the better-paid creative careers in India today (top firms ₹12–20L+), and it’s skill-and-portfolio gated, not "just drawing." The claim usually pictures design as it was two decades ago.',
    detail:
      'The reframe: design pay is bimodal and portfolio-driven. The bottom is crowded and modest; the top is genuinely well paid. "No scope" describes someone without a portfolio, not the field.',
    sources: [
      { title: 'UCEED / NID — programmes & outcomes', url: 'https://www.uceed.iitb.ac.in/', tier: 'primary' },
    ],
    affects: ['c_design', 'i_make'],
    relevant: {
      impact: 'no_change',
      note: (ctx) =>
        `Doesn’t undercut ${nodeLabel(ctx.chosenPathId)} — but it does underline that your portfolio, not the claim, decides which end of the pay range you land in.`,
    },
    tangential: {
      impact: 'not_applicable',
      note: () => 'This is about design and doesn’t touch your current path.',
    },
  },
  {
    id: 'coaching_required',
    keywords: ['coaching', 'kota', 'allen', 'byju', 'must join', 'cannot crack', 'need coaching', 'without coaching'],
    truthVerdict: 'misleading',
    summary:
      'This is coaching-marketing wearing the clothes of advice. Coaching can help, but "you cannot crack it without us" is a sales claim, not a finding — every year students clear JEE/NEET on self-study and cheaper online resources. It’s exactly the kind of high-confidence claim worth checking against the underlying data.',
    detail:
      'The primary data (toppers’ own accounts, NTA’s own free resources) contradicts the necessity framing. Coaching buys structure and peer pressure, which some students need and others don’t — but it is not a gate, and the ₹1.5–3L price tag deserves scrutiny before it’s treated as mandatory.',
    sources: [
      { title: 'NTA — official free prep resources', url: 'https://nta.ac.in/', tier: 'primary' },
    ],
    affects: ['s_pcm', 's_pcb', 'c_engineering', 'c_medicine'],
    relevant: {
      impact: 'partial_adjustment',
      note: () =>
        'Treat the "must have coaching" line as a budget question, not a fact. It may still be worth it for you — but as a choice, not a requirement, and weighed against your constraints.',
    },
    tangential: {
      impact: 'no_change',
      note: () => 'This is about entrance coaching and doesn’t bear on your current path.',
    },
  },
  {
    id: 'commerce_needs_maths',
    keywords: ['commerce', 'without maths', 'no maths', 'no scope', 'need maths'],
    truthVerdict: 'partly_true',
    summary:
      'Half-right. Dropping Maths does close the easy CA track, most analytics, and economics honours at strong colleges. It does not close law, management, digital marketing, company secretaryship, or B.Com itself. "No scope without Maths" overstates a real but bounded trade-off.',
    detail:
      'The accurate version names what’s lost (quantitative finance/analytics ease) and what remains (law, management, CS, marketing). Whether that trade is right depends on which of those you actually want — which is the real question hiding under the claim.',
    sources: [
      { title: 'ICAI / ICSI — eligibility routes', url: 'https://www.icai.org/', tier: 'primary' },
    ],
    affects: ['s_com', 'c_bcom', 'c_bba', 'c_digital_marketing', 'c_law'],
    relevant: {
      impact: 'no_change',
      note: (ctx) =>
        `${nodeLabel(ctx.chosenPathId)} doesn’t require Maths, so the claim doesn’t threaten it — just be clear-eyed that dropping Maths does close some quantitative paths for good.`,
    },
    tangential: {
      impact: 'no_change',
      note: () => 'This is about the commerce-without-Maths trade-off and doesn’t touch your current path.',
    },
  },
  {
    id: 'abroad_always_better',
    keywords: ['abroad', 'foreign', 'us', 'uk', 'canada', 'australia', 'always better', 'guaranteed', 'settle abroad', 'onsite'],
    truthVerdict: 'misleading',
    summary:
      'Sometimes transformative, sometimes a very expensive mistake — and the claim erases the difference. Studying abroad can pay off enormously or leave a family with debt and no visa pathway, depending on field, cost, and immigration policy that shifts year to year.',
    detail:
      'The honest read is conditional: return on a foreign degree depends heavily on the specific programme’s cost, the field’s demand in that country, and post-study work/visa rules that change with each government. "Always better" hides all three variables — which are exactly the ones that decide whether it’s worth ₹40L–1cr+.',
    sources: [
      { title: 'Ministry of External Affairs — study-abroad advisories', url: 'https://www.mea.gov.in/', tier: 'primary' },
    ],
    affects: [],
    relevant: {
      impact: 'partial_adjustment',
      note: () => 'Treat this as a cost-and-visa question specific to one programme, never a blanket upgrade. The numbers, not the aspiration, decide it.',
    },
    tangential: {
      impact: 'partial_adjustment',
      note: () =>
        'It doesn’t map onto one path, but if going abroad is in the mix, judge each programme on its own cost and visa reality — not on "abroad is better."',
    },
  },
  {
    id: 'psychology_no_jobs',
    keywords: ['psychology', 'psychologist', 'no jobs', 'no scope', 'no future'],
    truthVerdict: 'partly_true',
    summary:
      'True for a bachelor’s alone, false for the field. Psychology with only a B.A. does struggle — but the field is growing, and a master’s (plus licensing for clinical work) opens genuine, in-demand roles in clinical, counselling, organisational, and research settings.',
    detail:
      'The claim is really "psychology-with-just-a-bachelor’s has thin options," which is fair. Extended to the field it’s wrong: demand for mental-health and organisational-psychology professionals is rising. The fix is the master’s, which this path assumes anyway.',
    sources: [
      { title: 'Rehabilitation Council of India — recognised programmes', url: 'https://rehabcouncil.nic.in/', tier: 'primary' },
    ],
    affects: ['c_psychology', 's_hum'],
    relevant: {
      impact: 'no_change',
      note: (ctx) =>
        `Doesn’t threaten ${nodeLabel(ctx.chosenPathId)} as long as your plan already includes a master’s — which it needs to. If your plan stops at a bachelor’s, the claim has a point.`,
    },
    tangential: {
      impact: 'no_change',
      note: () => 'This is about psychology and doesn’t touch your current path.',
    },
  },
]

function nodeLabel(id?: string): string {
  return id ? NODE_BY_ID[id]?.label ?? 'your path' : 'your path'
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[’]/g, "'")
}

function scoreEntry(text: string, entry: ClaimEntry): number {
  const t = normalise(text)
  let score = 0
  for (const k of entry.keywords) {
    if (t.includes(normalise(k))) score += k.includes(' ') ? 2 : 1
  }
  return score
}

export function checkClaim(input: ClaimInput, ctx: StudentContext): ClaimVerdict {
  const text = normalise(input.claim)

  // 1) Values / wellbeing first — never force a data verdict (spec 4.17).
  if (ESCALATION_CUES.some((c) => text.includes(normalise(c)))) {
    return {
      truthVerdict: 'not_a_claim',
      impact: 'not_applicable',
      impactNote:
        'This isn’t a fact I can check for you — and I don’t want to hand you a data-flavoured answer to something that isn’t about data.',
      summary:
        'What you’ve shared sounds less like a claim to verify and more like something heavy you’re carrying. That’s real, and it deserves a person, not a verdict.',
      detail:
        'Please talk to someone you trust — a counsellor, a teacher, a family member you feel safe with. In India you can reach the Tele-MANAS helpline at 14416 (or 1-800-891-4416), free and confidential, any time. This tool can help you think clearly about paths and numbers; it can’t and shouldn’t stand in for that support.',
      sources: [
        { title: 'Tele-MANAS — national mental-health helpline (Govt. of India)', url: 'https://telemanas.mohfw.gov.in/', tier: 'primary' },
      ],
      escalate: true,
    }
  }

  // 2) Best-matching known claim.
  let best: ClaimEntry | null = null
  let bestScore = 0
  for (const entry of LIBRARY) {
    const s = scoreEntry(text, entry)
    if (s > bestScore) {
      bestScore = s
      best = entry
    }
  }

  if (best && bestScore >= 2) {
    const chosen = ctx.chosenPathId
    const relevant =
      !!chosen &&
      (best.affects.includes(chosen) ||
        best.affects.includes(NODE_BY_ID[chosen]?.parentId ?? ''))
    const branch = relevant ? best.relevant : best.tangential ?? best.relevant
    return {
      truthVerdict: best.truthVerdict,
      impact: branch.impact,
      impactNote: branch.note(ctx),
      summary: best.summary,
      detail: best.detail,
      sources: best.sources,
    }
  }

  // 3) Out of the seeded scope — say so honestly (spec: never fabricate confidence).
  return {
    truthVerdict: 'unverifiable',
    impact: ctx.chosenPathId ? 'no_change' : 'not_applicable',
    impactNote: ctx.chosenPathId
      ? `I can’t responsibly verify this one against current data from here, so I won’t pretend it changes anything about ${nodeLabel(
          ctx.chosenPathId,
        )}. Take it to the official source below before you let it weigh on the decision.`
      : 'I can’t verify this one from here — and I won’t manufacture a verdict. Check it against a primary source before it carries any weight.',
    summary:
      'This claim is outside what I can currently ground against real data. Rather than guess, I’m flagging it as unverified — a confident-sounding answer here would be worse than an honest "not checked."',
    detail:
      'A live grounding pass would search current, primary sources for exactly this claim and weight official data over marketing. Until then, treat it as unconfirmed: find who benefits from you believing it, and check it against the primary source for the exam body, government data, or institutional report it touches.',
    sources: [
      { title: 'National Career Service (Govt. of India)', url: 'https://www.ncs.gov.in/', tier: 'primary' },
    ],
  }
}
