// Future Map — the store. One continuous record; every action writes here (spec 5).

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import {
  buildChallenge,
  buildProfileSummary,
  careersForStream,
  CATEGORY_LABEL,
  comparePaths,
  emptyProfile,
  INTEREST_STREAM_HINTS,
  INTERESTS,
  isDistress,
  NODE_BY_ID,
  STREAMS,
  classifyIntent,
  seedProvider,
  updateConviction,
} from '@engine/index'
import type {
  Category,
  DecisionNode,
  RecordEntry,
  RecordKind,
  Stage,
  StudentContext,
  TraitKey,
  Vector5,
} from '@engine/index'
import { TRAIT_KEYS } from '@engine/index'

import type {
  Chip,
  ChatMessage,
  Insight,
  Mode,
  NodeStatus,
  PlacedNode,
  RightTab,
} from './model'

let _c = 0
const uid = (p = 'id'): string => {
  try {
    return `${p}_${crypto.randomUUID()}`
  } catch {
    return `${p}_${Date.now().toString(36)}_${_c++}`
  }
}

// ─────────────────────────────────────────────────────────────────────────────

interface State {
  mode: Mode
  started: boolean
  ctx: StudentContext
  placed: Record<string, PlacedNode>
  dynamicNodes: Record<string, DecisionNode> // user-researched nodes (spec 4.2)
  chat: ChatMessage[]
  insights: Insight[]
  records: RecordEntry[]
  checklistDone: Record<string, number[]> // spec 4.18 — items marked done over time
  rightTab: RightTab
  selectedNodeId?: string
  activeChallengeId?: string
  exportMarkdown?: string
  exportOpen: boolean
  awaiting?: 'claim' | 'eligibility' | 'path' // system is waiting for a specific free-text reply

  // actions
  start: () => void
  resetAll: () => void
  setMode: (m: Mode) => void
  setRightTab: (t: RightTab) => void
  selectNode: (id?: string) => void

  pickInterest: (id: string) => void
  exploreStream: (id: string) => void
  exploreCareer: (id: string) => void
  resolveChallenge: (choice: 'confirm' | 'reconsider' | 'skip', reasoning?: string) => void

  excludeNode: (id: string) => void
  unexcludeNode: (id: string) => void
  setConstraint: (c: { budgetLakh?: number; maxYears?: number; percentage?: number; category?: Category }) => void

  handleChip: (chip: Chip) => void
  submitText: (text: string) => Promise<void>

  runOpportunities: (nodeId: string) => void
  runFreshness: (nodeId: string) => Promise<void>
  runEligibility: (nodeId: string) => Promise<void>
  runWorkaround: (nodeId: string) => Promise<void>
  runAid: (nodeId: string) => Promise<void>
  runDeadlines: (nodeId: string) => Promise<void>

  generateProfile: () => void
  closeExport: () => void
  toggleChecklist: (nodeId: string, idx: number) => void

  getNode: (id: string) => DecisionNode | undefined
}

// ── pure helpers ──────────────────────────────────────────────────────────────

function traitsFromChosen(ctx: StudentContext, getNode: (id: string) => DecisionNode | undefined) {
  const t: Record<TraitKey, number> = { analytical: 0, creative: 0, risk: 0, people: 0, structure: 0 }
  for (const id of [ctx.chosenStreamId, ctx.chosenPathId]) {
    if (!id) continue
    const node = getNode(id)
    if (!node) continue
    for (const k of TRAIT_KEYS) t[k] += (node.traitDelta as Vector5)[k] ?? 0
  }
  return t
}

export function confirmedStages(ctx: StudentContext): Stage[] {
  const s: Stage[] = []
  if (ctx.chosenStreamId) s.push(2)
  if (ctx.chosenPathId) s.push(3)
  return s
}

function rec(kind: RecordKind, title: string, extra?: Partial<RecordEntry>): RecordEntry {
  return { id: uid('rec'), kind, at: Date.now(), title, ...extra }
}

// ── chip builders ─────────────────────────────────────────────────────────────

function interestChips(): Chip[] {
  return INTERESTS.map((i) => ({ label: i.label, value: `interest:${i.id}`, hint: i.subtitle, kind: 'interest' }))
}
function streamChips(hintIds: string[]): Chip[] {
  return STREAMS.map((s) => ({
    label: s.label,
    value: `stream:${s.id}`,
    hint: s.subtitle,
    kind: 'stream',
    highlight: hintIds.includes(s.id),
  }))
}
function careerChips(streamId: string): Chip[] {
  return careersForStream(streamId).map((c) => ({
    label: c.label,
    value: `career:${c.id}`,
    hint: c.subtitle,
    kind: 'career',
  }))
}
const POST_PATH_CHIPS: Chip[] = [
  { label: 'Check something you were told', value: 'action:prompt_claim', kind: 'action' },
  { label: "What's out there right now", value: 'action:opportunities', kind: 'action' },
  { label: 'Am I eligible?', value: 'action:prompt_eligibility', kind: 'action' },
  { label: 'What might change this?', value: 'action:freshness', kind: 'action' },
  { label: 'Give me my profile', value: 'action:export', kind: 'action' },
]

// ─────────────────────────────────────────────────────────────────────────────

export const useStore = create<State>()(
  persist(
    (set, get) => {
      // message helpers close over set/get
      const sys = (text: string, extra: Partial<ChatMessage> = {}) =>
        set((s) => ({ chat: [...s.chat, { id: uid('m'), role: 'system', at: Date.now(), text, ...extra }] }))
      const sysChips = (text: string, chips: Chip[]) =>
        set((s) => ({ chat: [...s.chat, { id: uid('m'), role: 'system', at: Date.now(), text, chips }] }))
      const user = (text: string) =>
        set((s) => ({ chat: [...s.chat, { id: uid('m'), role: 'user', at: Date.now(), text }] }))
      const tool = (name: string, rationale: string) =>
        set((s) => ({ chat: [...s.chat, { id: uid('m'), role: 'tool', at: Date.now(), tool: name, rationale }] }))
      const addInsight = (ins: Insight) => set((s) => ({ insights: [ins, ...s.insights], rightTab: 'insights' }))
      const addRecord = (r: RecordEntry) => set((s) => ({ records: [r, ...s.records] }))

      const getNode = (id: string) => get().dynamicNodes[id] ?? NODE_BY_ID[id]

      const place = (id: string, status: NodeStatus) =>
        set((s) => {
          const placed = { ...s.placed }
          // ensure parent stream is on the map so edges have an endpoint
          const node = s.dynamicNodes[id] ?? NODE_BY_ID[id]
          if (node?.parentId && !placed[node.parentId]) {
            placed[node.parentId] = { id: node.parentId, status: 'candidate', addedAt: Date.now() }
          }
          placed[id] = { id, status, addedAt: placed[id]?.addedAt ?? Date.now() }
          return { placed }
        })
      const setStatus = (id: string, status: NodeStatus) =>
        set((s) => (s.placed[id] ? { placed: { ...s.placed, [id]: { ...s.placed[id], status } } } : {}))

      const recomputeTraits = () =>
        set((s) => ({ ctx: { ...s.ctx, profile: { ...s.ctx.profile, traits: traitsFromChosen(s.ctx, getNode) } } }))

      const promptStreams = () => {
        const interestId = get().ctx.chosenInterestId
        const hints = interestId ? INTEREST_STREAM_HINTS[interestId] ?? [] : []
        sysChips(
          'After 10th this usually becomes a stream. Which do you want to look at? (The highlighted ones fit what you just told me — but look wherever you like.)',
          streamChips(hints),
        )
      }
      const promptCareers = (streamId: string) => {
        sysChips('That opens these directions after 12th. Which one pulls at you?', careerChips(streamId))
      }
      const promptPostPath = () => {
        sysChips('This is a real direction now. Want to pressure-test it, or take your profile and go?', POST_PATH_CHIPS)
      }

      const openChallenge = (node: DecisionNode) => {
        const { ctx } = get()
        const challenge = buildChallenge(node, ctx.profile, confirmedStages(ctx))
        const insId = uid('ins')
        set((s) => ({
          insights: [
            {
              id: insId,
              type: 'challenge',
              at: Date.now(),
              nodeId: node.id,
              title: `One question before you commit to ${node.label}`,
              resolved: false,
              stage: node.stage as 2 | 3,
              payload: challenge,
            },
            ...s.insights,
          ],
          activeChallengeId: insId,
          rightTab: 'insights',
          // keep the graph clear during a challenge — the pulsing node + card are the focus
          selectedNodeId: undefined,
        }))
        sys(
          challenge.mismatches.length
            ? `Before ${node.label} — I have to flag a tension first. It's on the right. →`
            : `Before ${node.label} — one honest question. It's waiting on the right. →`,
          { pointsTo: insId },
        )
      }

      return {
        mode: 'student',
        started: false,
        ctx: { profile: emptyProfile(), excluded: [] },
        placed: {},
        dynamicNodes: {},
        chat: [],
        insights: [],
        records: [],
        checklistDone: {},
        rightTab: 'insights',
        exportOpen: false,

        getNode,

        start: () => {
          if (get().started) return
          set({
            started: true,
            ctx: { profile: emptyProfile(), excluded: [] },
          })
          sys("Hi — I'm Future Map. 👋")
          sys("I won't tell you what to be. I'll help you decide with your eyes open — grounded in real numbers, and honest when something doesn't add up.")
          sys('Whatever you choose, you leave with one thing: a profile of yourself, built from how you decide. It fills in on the right as we go. →')
          sysChips('So, to start light: where does your head go when no one is grading you?', interestChips())
        },

        resetAll: () => {
          set({
            started: false,
            mode: get().mode,
            ctx: { profile: emptyProfile(), excluded: [] },
            placed: {},
            dynamicNodes: {},
            chat: [],
            insights: [],
            records: [],
            checklistDone: {},
            rightTab: 'insights',
            selectedNodeId: undefined,
            activeChallengeId: undefined,
            exportOpen: false,
            exportMarkdown: undefined,
            awaiting: undefined,
          })
          get().start()
        },

        setMode: (m) => {
          set({ mode: m })
          if (m === 'counsellor')
            sys(
              "Counsellor mode. I'll be more direct and efficient — you can drive this on the student's behalf, and everything still writes to the one shared profile.",
            )
          else sys("Student mode — back to a gentler pace.")
        },
        setRightTab: (t) => set({ rightTab: t }),
        selectNode: (id) => set({ selectedNodeId: id }),

        // ── Tier 1 ──
        pickInterest: (id) => {
          const node = NODE_BY_ID[id]
          if (!node) return
          const prev = get().ctx.chosenInterestId
          if (prev && prev !== id) setStatus(prev, 'candidate')
          place(id, 'confirmed')
          set((s) => ({ ctx: { ...s.ctx, chosenInterestId: id } }))
          user(node.label)
          addRecord(rec('note', `Interest signal: ${node.label}`, { nodeId: id }))
          sys(node.insight)
          promptStreams()
          set({ awaiting: undefined })
        },

        // ── Tier 2 ──
        exploreStream: (id) => {
          const node = NODE_BY_ID[id]
          if (!node) return
          place(id, 'confirmed' === get().placed[id]?.status ? 'confirmed' : 'candidate')
          user(`Let's look at ${node.label}`)
          openChallenge(node)
        },

        // ── Tier 3 ──
        exploreCareer: (id) => {
          const node = get().getNode(id)
          if (!node) return
          place(id, get().placed[id]?.status === 'confirmed' ? 'confirmed' : 'candidate')
          user(`Tell me about ${node.label}`)
          openChallenge(node)
        },

        resolveChallenge: (choice, reasoning) => {
          const st = get()
          const insId = st.activeChallengeId
          if (!insId) return
          const ins = st.insights.find((i) => i.id === insId)
          if (!ins || ins.type !== 'challenge') return
          const node = st.getNode(ins.nodeId!)!
          const contested = ins.payload.mismatches.length > 0
          const stage = node.stage

          // mark resolved
          set((s) => ({
            insights: s.insights.map((i) => (i.id === insId ? { ...i, resolved: true } : i)),
            activeChallengeId: undefined,
          }))

          if (choice === 'confirm') {
            setStatus(node.id, 'confirmed')
            set((s) => {
              const ctx = { ...s.ctx }
              if (stage === 2) {
                if (ctx.chosenStreamId && ctx.chosenStreamId !== node.id) {
                  // changing an earlier selection invalidates downstream (spec 4.1)
                  setStatus(ctx.chosenStreamId, 'candidate')
                  if (ctx.chosenPathId) {
                    setStatus(ctx.chosenPathId, 'candidate')
                    ctx.chosenPathId = undefined
                  }
                }
                ctx.chosenStreamId = node.id
              } else {
                if (ctx.chosenPathId && ctx.chosenPathId !== node.id) setStatus(ctx.chosenPathId, 'candidate')
                ctx.chosenPathId = node.id
                // make sure the parent stream reads as confirmed too
                if (node.parentId) {
                  ctx.chosenStreamId = node.parentId
                  setStatus(node.parentId, 'confirmed')
                }
              }
              ctx.profile = updateConviction(ctx.profile, 'confirm', contested)
              return { ctx }
            })
            recomputeTraits()
            addRecord(
              rec('confirm', `Committed: ${node.label}`, {
                nodeId: node.id,
                reasoning: reasoning?.trim() || undefined,
                detail: contested ? 'Confirmed despite a named mismatch — strong conviction signal.' : 'Confirmed.',
              }),
            )
            if (stage === 2) {
              sys(`Locked in: ${node.label}. Your profile just learned something real about you. →`)
              promptCareers(node.id)
            } else {
              sys(`${node.label} is a real direction now. Notice how the map and your profile shifted. →`)
              promptPostPath()
            }
          } else if (choice === 'reconsider') {
            setStatus(node.id, 'reconsidered')
            set((s) => {
              const ctx = { ...s.ctx }
              if (stage === 2 && ctx.chosenStreamId === node.id) {
                ctx.chosenStreamId = undefined
                if (ctx.chosenPathId) {
                  setStatus(ctx.chosenPathId, 'candidate')
                  ctx.chosenPathId = undefined
                }
              }
              if (stage === 3 && ctx.chosenPathId === node.id) ctx.chosenPathId = undefined
              ctx.profile = updateConviction(ctx.profile, 'reconsider', contested)
              return { ctx }
            })
            recomputeTraits()
            addRecord(
              rec('reconsider', `Reconsidered: ${node.label}`, {
                nodeId: node.id,
                detail: reasoning?.trim() || 'Backed out of the challenge — logged as signal, not failure.',
              }),
            )
            sys('Good. Backing out is data, not failure — I logged it, and it left no trait mark. Nothing is closed.')
            if (stage === 2) promptStreams()
            else if (get().ctx.chosenStreamId) promptCareers(get().ctx.chosenStreamId!)
          } else {
            addRecord(rec('skip', `Skipped the challenge on ${node.label}`, { nodeId: node.id }))
            sys("Skipped — no judgment, and it stays open. You can come back to it any time.")
            if (stage === 2) promptStreams()
            else if (get().ctx.chosenStreamId) promptCareers(get().ctx.chosenStreamId!)
          }
        },

        excludeNode: (id) => {
          const node = get().getNode(id)
          if (!node) return
          place(id, 'excluded')
          set((s) => ({
            ctx: { ...s.ctx, excluded: [...new Set([...s.ctx.excluded, id])] },
          }))
          addRecord(rec('exclude', `Set aside: ${node.label}`, { nodeId: id, detail: 'Deprioritised, never deleted — reversible.' }))
          sys(`${node.label} is set aside — dimmed on the map, never deleted. Say the word and it's back.`)
        },
        unexcludeNode: (id) => {
          setStatus(id, 'candidate')
          set((s) => ({ ctx: { ...s.ctx, excluded: s.ctx.excluded.filter((x) => x !== id) } }))
        },

        setConstraint: (c) => {
          set((s) => {
            const profile = { ...s.ctx.profile }
            const constraints = { ...profile.constraints }
            if (c.budgetLakh != null) constraints.budgetLakh = c.budgetLakh
            if (c.maxYears != null) constraints.maxYears = c.maxYears
            profile.constraints = constraints
            if (c.percentage != null) profile.percentage = c.percentage
            if (c.category != null) profile.category = c.category
            return { ctx: { ...s.ctx, profile } }
          })
          const parts: string[] = []
          if (c.budgetLakh != null) parts.push(`budget up to ₹${c.budgetLakh}L`)
          if (c.maxYears != null) parts.push(`earning within ${c.maxYears} years`)
          if (c.percentage != null) parts.push(`${c.percentage}%`)
          if (c.category != null && c.category !== 'unspecified')
            parts.push(`${CATEGORY_LABEL[c.category]} category (private, only for accurate cutoffs)`)
          addRecord(rec('constraint', `Set: ${parts.join(', ') || 'constraints'}`, { detail: 'An active filter on the map now.' }))
          sys(`Set — ${parts.join(', ')}. It's an active filter now: paths that don't fit will say so, and by how much.`)
          set({ awaiting: undefined })
        },

        // ── chips ──
        handleChip: (chip) => {
          const [kind, val] = chip.value.split(':')
          if (kind === 'interest') return get().pickInterest(val)
          if (kind === 'stream') return get().exploreStream(val)
          if (kind === 'career') return get().exploreCareer(val)
          if (kind === 'action') {
            const chosen = get().ctx.chosenPathId
            switch (val) {
              case 'prompt_claim':
                user('Check something I was told')
                sys('Go ahead — paste exactly what you heard, and who said it. A sentence or a whole paragraph, your call.')
                set({ awaiting: 'claim' })
                return
              case 'opportunities':
                if (chosen) return get().runOpportunities(chosen)
                sys('Pick a career direction first, then I can show you what’s live right now.')
                return
              case 'prompt_eligibility':
                if (get().ctx.profile.percentage != null && chosen) return void get().runEligibility(chosen)
                user('Am I eligible?')
                sys('What did you score in your latest board/exam? A percentage is enough. You can add your category too — it’s private, and it makes cutoffs accurate rather than assumed.')
                set({ awaiting: 'eligibility' })
                return
              case 'freshness':
                if (chosen) return void get().runFreshness(chosen)
                sys('Choose a path first and I’ll check whether anything about it has genuinely changed.')
                return
              case 'export':
                return get().generateProfile()
            }
          }
        },

        // ── free text → agent ──
        submitText: async (raw) => {
          const text = raw.trim()
          if (!text) return
          user(text)
          const awaiting = get().awaiting
          set({ awaiting: undefined })

          // If we explicitly asked for a claim, treat this as one.
          if (awaiting === 'claim') {
            return runClaim(text)
          }
          if (awaiting === 'eligibility') {
            const plan = classifyIntent(text)
            if (plan.intent.kind === 'constraint') get().setConstraint(plan.intent)
            const chosen = get().ctx.chosenPathId
            if (chosen && get().ctx.profile.percentage != null) await get().runEligibility(chosen)
            return
          }

          // Wellbeing/values signal comes FIRST — never route it through a data tool (spec 4.17).
          if (isDistress(text)) return runClaim(text, 'You')

          const plan = classifyIntent(text, get().selectedNodeId)
          if (plan.toolLabel !== 'none') tool(plan.toolLabel, plan.rationale)
          const i = plan.intent

          switch (i.kind) {
            case 'claim':
              return runClaim(i.claim, i.source)
            case 'constraint':
              return get().setConstraint(i)
            case 'research': {
              const res = await seedProvider.researchPath(i.name)
              if (res.confirmed && res.node) {
                const node = res.node
                if (node.userAdded) set((s) => ({ dynamicNodes: { ...s.dynamicNodes, [node.id]: node } }))
                place(node.id, get().placed[node.id]?.status ?? 'candidate')
                get().selectNode(node.id)
                addInsight({ id: uid('ins'), type: 'node', at: Date.now(), nodeId: node.id, title: node.label, payload: node })
                addRecord(rec('research', `Researched: ${node.label}`, { nodeId: node.id, detail: node.userAdded ? 'User-researched node.' : 'Opened from the curated map.' }))
                sys(`${res.note} Open it on the map when you’re ready to put it through the challenge — I won’t commit it for you.`)
              } else {
                addRecord(rec('research', `Couldn’t confirm: ${i.name}`, { detail: res.note }))
                sys(res.note)
              }
              return
            }
            case 'freshness':
              if (i.nodeId) return void get().runFreshness(i.nodeId)
              sys('Which path should I check for changes? Name it, or pick one on the map.')
              return
            case 'eligibility':
              if (get().ctx.profile.percentage == null) {
                sys('Tell me your latest percentage first (and category if you like — it’s private) and I’ll read eligibility accurately.')
                set({ awaiting: 'eligibility' })
                return
              }
              if (i.nodeId) return void get().runEligibility(i.nodeId)
              sys('Which path do you want the eligibility read for?')
              return
            case 'workaround':
              if (i.nodeId) return void get().runWorkaround(i.nodeId)
              sys('Which path do you want alternate routes for?')
              return
            case 'aid':
              if (i.nodeId) return void get().runAid(i.nodeId)
              sys('Which path should I look up scholarships and loan structures for?')
              return
            case 'deadlines':
              if (i.nodeId) return void get().runDeadlines(i.nodeId)
              sys('Which path’s dates do you want? Name it or pick it on the map.')
              return
            case 'compare': {
              const nodes = comparePaths(i.nodeIds).map((n) => get().getNode(n.id) ?? n)
              i.nodeIds.forEach((id) => place(id, get().placed[id]?.status ?? 'candidate'))
              addInsight({ id: uid('ins'), type: 'compare', at: Date.now(), title: `Comparing ${nodes.map((n) => n.label).join(' · ')}`, payload: nodes })
              addRecord(rec('note', `Compared: ${nodes.map((n) => n.label).join(' vs ')}`, { detail: 'Exploratory — nothing committed.' }))
              sys('Side by side on the right — cost, timeline, pay, fit. Purely exploratory; it commits nothing. →')
              return
            }
            default:
              sys("I can check a claim you heard, set a budget or timeline, research a path, compare two, or read eligibility. Try: “my uncle says there’s no money in design” or “my budget is 8 lakh”.")
          }

          async function runClaim(claim: string, source?: string) {
            const ctx = get().ctx
            // don't dress a wellbeing signal up as a data tool-call
            if (!isDistress(claim) && get().chat[get().chat.length - 1]?.role !== 'tool')
              tool('check_claim', 'Checking this against real data — and what it means for your path specifically.')
            const verdict = await seedProvider.checkClaim({ claim, source: source ?? 'Unattributed' }, ctx)
            addInsight({ id: uid('ins'), type: 'verdict', at: Date.now(), title: 'Signal check', claim, source: source ?? 'Unattributed', payload: verdict, nodeId: ctx.chosenPathId })
            addRecord(rec('claim', claim.length > 80 ? claim.slice(0, 77) + '…' : claim, { detail: verdict.impactNote, meta: { impact: verdict.impact, truth: verdict.truthVerdict } }))
            if (verdict.escalate) {
              sys("That's bigger than a fact I can check — I said more on the right, but the short version: please talk to a person you trust. →", { pointsTo: undefined })
            } else {
              const headline: Record<string, string> = {
                no_change: "Checked. Doesn't change your path — here's why. →",
                worth_reconsidering: 'Checked — and this one is worth reconsidering. →',
                partial_adjustment: 'Checked. It doesn’t sink your path, but it should shift the plan. →',
                not_applicable: 'Checked — it doesn’t really apply to you. →',
              }
              sys(headline[verdict.impact] ?? 'Checked. See the read on the right. →')
            }
          }
        },

        runOpportunities: (nodeId) => {
          const node = get().getNode(nodeId)
          if (!node) return
          addInsight({ id: uid('ins'), type: 'opportunity', at: Date.now(), nodeId, title: `What's live for ${node.label}`, payload: { node } })
          addRecord(rec('note', `Opened live opportunities for ${node.label}`, { nodeId }))
          sys('Real, current search — genuine deep-links into live listings, never cached data dressed up as current. On the right. →')
        },
        runFreshness: async (nodeId) => {
          const f = await seedProvider.checkFreshness(nodeId)
          const node = get().getNode(nodeId)
          addInsight({ id: uid('ins'), type: 'freshness', at: Date.now(), nodeId, title: `What might change ${node?.label ?? 'this'}`, payload: f })
          addRecord(rec('freshness', `Freshness check: ${node?.label ?? nodeId}`, { nodeId, detail: f.note }))
          sys(f.hasUpdate ? 'Something genuinely moved here — see the right. →' : 'Checked — nothing material has changed. I won’t pad it. →')
        },
        runEligibility: async (nodeId) => {
          const el = await seedProvider.checkEligibility(nodeId, get().ctx)
          const node = get().getNode(nodeId)
          addInsight({ id: uid('ins'), type: 'eligibility', at: Date.now(), nodeId, title: `Eligibility — ${node?.label ?? ''}`, payload: el })
          addRecord(rec('eligibility', `Eligibility: ${node?.label ?? nodeId}`, { nodeId, detail: el.gapNote }))
          sys('Read on the right — as “typically requires X, yours is Y, verify on the source”, never a closed door. →')
        },
        runWorkaround: async (nodeId) => {
          const w = await seedProvider.findWorkaround(nodeId, get().ctx)
          const node = get().getNode(nodeId)
          addInsight({ id: uid('ins'), type: 'workaround', at: Date.now(), nodeId, title: `Legitimate routes to ${node?.label ?? 'this'}`, payload: w })
          addRecord(rec('research', `Workaround research: ${node?.label ?? nodeId}`, { nodeId }))
          sys('Real, sanctioned alternate routes — never ways around a genuine requirement. →')
        },
        runAid: async (nodeId) => {
          const a = await seedProvider.checkFinancialAid(nodeId, get().ctx)
          const node = get().getNode(nodeId)
          addInsight({ id: uid('ins'), type: 'aid', at: Date.now(), nodeId, title: `Aid & funding for ${node?.label ?? 'this'}`, payload: a })
          addRecord(rec('research', `Financial-aid research: ${node?.label ?? nodeId}`, { nodeId }))
          sys('Factual scheme and loan-structure info — never a recommendation of a lender. →')
        },
        runDeadlines: async (nodeId) => {
          const d = await seedProvider.checkDeadlines(nodeId)
          const node = get().getNode(nodeId)
          addInsight({ id: uid('ins'), type: 'deadline', at: Date.now(), nodeId, title: `Timing for ${node?.label ?? 'this'}`, payload: d })
          addRecord(rec('note', `Deadline check: ${node?.label ?? nodeId}`, { nodeId }))
          sys('Indicative windows on the right — a heads-up, not a system of record. Verify on the official source. →')
        },

        generateProfile: () => {
          const { ctx, records } = get()
          const summary = buildProfileSummary(ctx, records, confirmedStages(ctx), Date.now())
          set({ exportMarkdown: summary.markdown, exportOpen: true, rightTab: 'profile' })
          addRecord(rec('note', 'Generated a profile snapshot', { detail: 'The guaranteed takeaway — dated and exportable.' }))
          sys('Here’s your profile — dated, and yours to keep whatever you decide next. →')
        },
        closeExport: () => set({ exportOpen: false }),
        toggleChecklist: (nodeId, idx) =>
          set((s) => {
            const cur = s.checklistDone[nodeId] ?? []
            const next = cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx]
            return { checklistDone: { ...s.checklistDone, [nodeId]: next } }
          }),
      }
    },
    {
      name: 'future-map:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        mode: s.mode,
        started: s.started,
        ctx: s.ctx,
        placed: s.placed,
        dynamicNodes: s.dynamicNodes,
        chat: s.chat,
        insights: s.insights,
        records: s.records,
        checklistDone: s.checklistDone,
        rightTab: s.rightTab,
        selectedNodeId: s.selectedNodeId,
        activeChallengeId: s.activeChallengeId,
      }),
    },
  ),
)
