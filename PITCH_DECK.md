# BlockStar - Pitch Deck
## Stacks Buidl Battle #2 | DoraHacks Submission
### Built by Lekan (laykesydeoke)

---

## SLIDE 1: TITLE

**BlockStar: Real-Time Blockchain Quiz Games on Stacks**

*"I have knowledge of Blockchain and Stacks"*

A Web3 educational platform where hosts create live quiz sessions, stake STX as prize pools, and the top 3 winners receive automatic on-chain payouts via a Clarity smart contract.

Built for **Let Africa Build**

---

## SLIDE 2: THE PROBLEM

### Blockchain Education Is Broken

1. **Passive learning fails.** Documentation, YouTube tutorials, and slide decks produce passive learners. Active recall through quizzing is proven to be far more effective for retention -- but the blockchain space has zero purpose-built tools for it.

2. **Existing platforms ignore Web3.** Kahoot (9B+ cumulative participants, $1.7B valuation) has no wallet integration, no on-chain rewards, and no alignment with blockchain ecosystems. When a hackathon workshop teaches Stacks/Clarity, they use a tool that has zero relationship to the technology being taught.

3. **Incentive misalignment.** In traditional quiz platforms, prizes are gift cards and swag. If you are teaching blockchain, the prizes should be cryptocurrency -- distributed transparently, trustlessly, and on-chain.

4. **No on-chain proof.** When someone completes a blockchain quiz today, there is no verifiable record. No escrow. No trustless distribution. No transparency about who earned what.

5. **Africa's Web3 developer community needs native tooling.** The "Let Africa Build" movement is growing, and educational infrastructure that is itself blockchain-native is essential for authentic developer onboarding.

---

## SLIDE 3: THE SOLUTION

### BlockStar = Kahoot + Stacks Blockchain

- **Hosts** create quiz sessions and lock STX into a Clarity smart contract as the prize pool
- **Players** connect Stacks wallets (Leather / Xverse), join via QR code or session ID, compete in real-time
- **Winners** receive STX prizes automatically via smart contract: **50% first, 30% second, 20% third**
- **Everything is live** -- questions broadcast simultaneously, answers timestamped server-side, scoring based on accuracy + speed

This is not a concept. This is a **working, deployable application** with a Clarity smart contract, a Socket.io real-time server, and a full Next.js frontend with 6 distinct page types.

---

## SLIDE 4: DEMO FLOW

### How It Works (5-minute walkthrough)

**Step 1: Connect & Create** (Host)
- Connect Leather/Xverse wallet on landing page
- Create quiz session: title, STX prize pool (min 1 STX), questions (min 3) with 4 options each
- On submit: Clarity contract call locks STX on-chain -> redirect to host dashboard

**Step 2: Join & Register** (Players)
- Scan QR code or enter session ID
- Connect wallet + choose nickname
- On-chain registration via `register-player` contract call (immutable participation record)
- Join real-time Socket.io room

**Step 3: Live Gameplay**
- Host clicks "Start" -> questions broadcast to all devices simultaneously
- Players see answer buttons (A/B/C/D) with synchronized countdown timer
- Scoring: 1000 base + up to 500 speed bonus per correct answer
- Real-time leaderboard updates after each question

**Step 4: Prize Distribution**
- Game ends -> staggered winner reveal animation (3rd -> 2nd -> 1st)
- Host clicks "Distribute Rewards Now"
- `finalize-game` contract call distributes STX directly to winner wallets
- Transaction verified on Hiro Explorer

---

## SLIDE 5: TECHNICAL ARCHITECTURE

```
+-------------------------------------------+
|          CLIENT LAYER (Next.js 15)        |
|  Host Dashboard  |  Player Mobile         |
|  Display Screen  |  Game Creation         |
|  Join Flow       |  Landing Page          |
+------------------+------------------------+
                   |
+------------------+------------------------+
|     REAL-TIME LAYER (Socket.io 4.8)       |
|  Server-timestamped answer scoring        |
|  Observer pattern (host != player)        |
|  12 socket events for full game lifecycle |
|  Anti-cheat: all timing server-side       |
+------------------+------------------------+
                   |
+------------------+------------------------+
|   BLOCKCHAIN LAYER (Stacks / Clarity)     |
|  Prize pool escrow via stx-transfer?      |
|  On-chain player registration             |
|  Automated 50/30/20 prize distribution    |
|  Cancel/refund safety mechanisms          |
+-------------------------------------------+
```

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.0 |
| UI | React + Tailwind CSS + Radix UI | 19.x / 4.x |
| Real-Time | Socket.io | 4.8.1 |
| State | Zustand | 5.0.9 |
| Forms | React Hook Form + Zod | latest |
| Smart Contract | Clarity (Stacks) | 3+ |
| Wallet | @stacks/connect + @stacks/transactions | 7.x |
| QR Codes | qrcode.react | latest |
| Icons | Lucide React | 0.562.0 |

---

## SLIDE 6: STACKS INTEGRATION DEPTH

### This is not a Web2 app with a "Connect Wallet" button bolted on.

### 6a. Clarity Smart Contract (`stackquiz-game.clar`)

**Data Maps:**
- `games` -- host principal, total-prize, pre-calculated first/second/third splits, status, player-count, created-at block height
- `players` -- maps `{game-id, player}` to `{nickname, registered-at}` -- on-chain proof of participation
- `winners` -- maps `{game-id}` to `{first, second, third, distributed}` -- immutable winner record

**Public Functions:**

| Function | What It Does |
|----------|-------------|
| `create-game(game-id, total-prize)` | Host locks STX via `stx-transfer?`. Min 1 STX. Prize split pre-calculated at creation. |
| `register-player(game-id, nickname)` | Player registers on-chain. Verifies game exists, status is "waiting", not already registered. |
| `finalize-game(game-id, first, second, third)` | Host-only. Verifies all 3 winners are registered. Executes 3 `as-contract stx-transfer?` calls. |
| `cancel-game(game-id)` | Host-only. Refunds entire prize pool. Only works in "waiting" status. |

**Prize Calculation (on-chain):**
```clarity
(define-private (calculate-prizes (total uint))
  {
    first: (/ (* total u50) u100),
    second: (/ (* total u30) u100),
    third: (/ (* total u20) u100)
  })
```

**Clarity Security Properties:**
- No reentrancy (Clarity is not Turing-complete)
- Host-only authorization: `(asserts! (is-eq tx-sender (get host game)) err-not-host)`
- Double-finalization prevented via status check
- Winner validation: all 3 must be registered players
- Minimum prize enforced: `(asserts! (>= total-prize u1000000) err-insufficient-funds)`

### 6b. Wallet Integration

- Full `@stacks/connect` integration with `UserSession` management
- Network-aware address resolution (testnet/mainnet)
- Support for Leather and Xverse wallets
- Persistent session with auto-reconnect

### 6c. Contract Interaction Layer (`useContract.ts`)

Every contract function wrapped with `openContractCall`:
- `createGame()` -- STX to microSTX conversion, `stringAsciiCV` + `uintCV` args
- `registerPlayer()` -- On-chain player registration
- `finalizeGame()` -- `principalCV` for winner addresses
- `cancelGame()` + `emergencyRefund()` -- Safety flows
- Read-only functions via `fetchCallReadOnlyFunction` with `cvToJSON`

---

## SLIDE 7: KEY FEATURES

### Three Optimized Interfaces

**Host Dashboard** (`/host/[gameId]`)
- QR code for instant join
- Real-time player count via Socket.io
- Start/Cancel/Emergency controls
- "Open Display Screen" for projectors

**Player View** (`/play/[gameId]`)
- Mobile-optimized answer buttons
- Synchronized countdown timer (server-timestamped)
- Single-answer lock-in (anti-cheat)
- Score display and leaderboard

**Display Screen** (`/display/[gameId]`)
- Large-screen projector view
- Full-screen questions with timer
- Live leaderboard between questions
- Staggered winner reveal (3rd at 1s, 2nd at 3s, 1st at 5s with scale animation)
- "Distribute Rewards Now" button triggers on-chain payout

### Real-Time Scoring Engine

```
Points = 1000 (base) + up to 500 (speed bonus)
Speed Bonus = floor(500 * (timeRemaining / totalTime))
```
- Max 1500 points/question (instant correct answer)
- Min 1000 points/question (correct at last second)
- All timing server-side (anti-cheat)

### Anti-Cheat Measures
- Server-side answer timestamping (`game.questionStartTime = Date.now()`)
- Server-side answer validation against `question.correctIndex`
- Observer/player separation (hosts cannot score)
- Auto-progression when all real players have answered

---

## SLIDE 8: ECOSYSTEM IMPACT

### Why BlockStar Matters for Stacks

1. **User Onboarding Machine.** Every player who joins a BlockStar session has: installed Leather/Xverse, connected a wallet, signed a blockchain transaction, and received STX. One quiz session = one new Stacks user fully onboarded.

2. **Developer Education Tool.** Hackathon workshops, bootcamps, and university courses can create Stacks-specific quizzes with real STX rewards. "Learn about Clarity and earn STX" is far more compelling than "read the docs."

3. **Community Engagement Engine.** Stacks events, Twitter Spaces, meetups -- BlockStar creates recurring STX transactions and active wallet usage. Metrics that matter.

4. **Africa-First Vision.** Built for the Let Africa Build initiative, serving the growing demand for Web3 education infrastructure in Africa, where Stacks has significant community presence.

### Market Context
- Kahoot: 9B+ participants, $1.7B valuation
- Web3 education: $2B+ market
- **Zero blockchain-native Kahoot competitors exist in any ecosystem**
- BlockStar is the first quiz platform where prizes are escrowed and distributed via smart contract

---

## SLIDE 9: ROADMAP

### Phase 1 -- Current (Hackathon)
- Complete quiz lifecycle: create -> join -> play -> finish -> distribute
- Clarity smart contract with escrow, distribution, refund
- Real-time multiplayer via Socket.io with server-side anti-cheat
- Stacks wallet integration (Leather + Xverse)
- QR code join flow + display screen for projectors

### Phase 2 -- Near-Term
- Mainnet deployment
- NFT Achievement Badges (SIP-009) for quiz winners
- Community question bank API
- Tournament mode with bracket-style competitions
- Spectator mode for observers

### Phase 3 -- Medium-Term
- DAO governance for platform features
- Organization accounts (universities, hackathon organizers)
- Analytics dashboard for learner progress tracking
- `.btc` name integration for player identity
- Mobile app (React Native)

### Phase 4 -- Long-Term
- Cross-chain quiz protocol (multiple Bitcoin L2s)
- AI-powered question generation from Stacks docs and SIPs
- On-chain certification system
- Integration partnerships with existing Stacks dApps

---

## SLIDE 10: JUDGING CRITERIA ALIGNMENT

| Criteria | How BlockStar Delivers |
|----------|----------------------|
| **Innovation** | First blockchain-native Kahoot. No competitor in any ecosystem combines real-time multiplayer quizzing with on-chain prize escrow and smart contract distribution. |
| **Technical Implementation** | Clarity contract (4 public, 5 read-only functions, 3 data maps), Socket.io server with scoring engine, Next.js 15 frontend (6 page types), Zustand state, Zod validation, QR generation. |
| **Stacks Alignment** | `stx-transfer?` for escrow/distribution. Native `@stacks/connect` wallet. Network-aware. On-chain player registration. Immutable winner records. Hiro Explorer integration. |
| **User Experience** | 3 optimized interfaces (host, player mobile, display projector). QR join. Server-synced timers. Staggered winner animation. One-click prize distribution. |
| **Impact Potential** | Solves education retention. Creates STX transaction volume. Onboards new wallet users. Serves Let Africa Build. Reusable at every Stacks hackathon, meetup, workshop. |

---

## SLIDE 11: TEAM

**Lekan (laykesydeoke)**
- Full-stack blockchain developer
- "I have knowledge of Blockchain and Stacks"
- Built for the Let Africa Build initiative
- Solo builder: smart contract, backend, frontend, design

---

## SLIDE 12: CLOSING

### BlockStar transforms blockchain education from passive reading to active competition with real Bitcoin rewards.

Every component -- from the Clarity contract that escrows and distributes prizes, to the Socket.io server that timestamps answers, to the synchronized timer across all devices -- is purpose-built for one goal:

**Making blockchain learning competitive, transparent, and rewarding.**

The Stacks ecosystem needs tools that onboard *users*, not just developers. BlockStar turns every quiz session into a full Stacks transaction lifecycle: wallet connection, contract call, STX transfer, and on-chain verification.

Every player who participates becomes a Stacks user.

**Try it. Learn something. Earn Bitcoin.**

---

### Links
- **GitHub:** github.com/laykesydeoke/blockstar
- **Live Demo:** blockchainstar.vercel.app
- **Socket Server:** (Render deployment)
- **Contract:** Stacks Testnet

---
*Built by Lekan (laykesydeoke) for Stacks Buidl Battle #2*
