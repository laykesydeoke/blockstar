# BlockStar - Real-Time Quiz Games on Stacks Blockchain

A real-time, multiplayer quiz game platform built on the Stacks blockchain, inspired by Kahoot. Hosts create quiz games with STX prize pools that are automatically distributed to the top three winners upon game completion.

**I have knowledge of Blockchain and Stacks**

Built by Lekan (Laykesydeoke)

## Features

- **Real-Time Gameplay**: Live quiz games with Socket.io for instant updates
- **Blockchain Prizes**: Automatic STX prize distribution via smart contracts (50/30/20 split)
- **Wallet Integration**: Connect with Leather or Xverse wallets
- **QR Code Join**: Players can join games by scanning QR codes
- **Live Leaderboard**: Real-time score updates and rankings
- **Custom Questions**: Hosts can create custom quiz questions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, Radix UI
- **Icons**: Lucide React
- **Real-Time**: Socket.io 4.8
- **Blockchain**: Stacks (Nakamoto), Clarity 4
- **Wallet**: @stacks/connect 8.x
- **State Management**: Zustand 5
- **Form Handling**: React Hook Form + Zod

## Project Structure

```
stackquiz/
├── contracts/
│   └── stackquiz-game.clar          # Clarity 4 smart contract
├── server.ts                         # Custom Socket.io server
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx               # Root layout with providers
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   ├── ui/                      # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── progress.tsx
│   │   ├── game/                    # Game-specific components
│   │   │   ├── Timer.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── AnswerButtons.tsx
│   │   │   ├── QuestionDisplay.tsx
│   │   │   ├── WinnerReveal.tsx
│   │   │   └── PlayerList.tsx
│   │   ├── wallet/
│   │   │   └── ConnectWallet.tsx
│   │   └── qr/
│   │       └── GameQRCode.tsx
│   ├── hooks/
│   │   ├── useContract.ts           # Smart contract interactions
│   │   └── useSocket.ts             # Socket.io client
│   ├── providers/
│   │   ├── StacksProvider.tsx       # Wallet context
│   │   └── AppProviders.tsx         # Combined providers
│   ├── stores/
│   │   └── gameStore.ts             # Zustand game state
│   ├── types/
│   │   └── game.ts                  # TypeScript interfaces
│   └── lib/
│       └── utils.ts                 # Utility functions
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.server.json              # TypeScript config for server
├── .env.local                        # Environment variables
└── package.json
```

## Installation

### Prerequisites

- Node.js 20+ and npm
- A Stacks wallet (Leather or Xverse)
- Clarinet (for smart contract deployment)

### Setup

1. **Install Dependencies**

```bash
npm install
```

2. **Configure Environment**

The `.env.local` file has been created with default values:

```env
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
NEXT_PUBLIC_CONTRACT_NAME=stackquiz-game
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

3. **Deploy Smart Contract** (Optional for testing)

```bash
# Install Clarinet if not installed
# On macOS: brew install clarinet
# Or download from: https://github.com/hirosystems/clarinet

# Check contract syntax
clarinet check

# Deploy to testnet
clarinet deploy --testnet

# Update .env.local with your deployed contract address
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts the custom Socket.io server with hot-reload on http://localhost:3000

### Production Build

```bash
npm run build
npm run start
```

## What's Been Built

### ✅ Completed

1. **Core Infrastructure**
   - Next.js 15 project with TypeScript and Tailwind CSS
   - Custom Socket.io server for real-time communication
   - Stacks wallet integration with @stacks/connect 8.x
   - Environment configuration

2. **UI Components**
   - Base components: Button, Input, Card, Dialog, Progress
   - Game components: Timer, Leaderboard, AnswerButtons, QuestionDisplay, WinnerReveal, PlayerList
   - Wallet components: ConnectWallet button with connection flow
   - QR Code component for game joining

3. **State Management**
   - Zustand store for game state
   - Socket.io client hook for real-time events
   - React Context for wallet connection

4. **Smart Contract**
   - Clarity 4 contract with all required functions:
     - create-game: Lock prize pool
     - register-player: Player registration
     - finalize-game: Distribute prizes (50/30/20)
     - cancel-game: Refund host
     - Read-only functions for game data

5. **Blockchain Integration**
   - Contract interaction hooks for all contract functions
   - Transaction broadcasting
   - Read-only contract calls

6. **Landing Page**
   - Attractive hero section
   - Feature highlights
   - How it works section
   - Call-to-action buttons

### 🚧 Next Steps

To complete the application, you'll need to build the following pages:

1. **Game Creation Page** (`/create`)
   - Multi-step form for game setup
   - Question editor
   - Prize pool configuration
   - Smart contract transaction

2. **Host Control Page** (`/host/[gameId]`)
   - QR code display
   - Player lobby
   - Game controls
   - Prize distribution trigger

3. **Display Screen Page** (`/display/[gameId]`)
   - Large screen projection view
   - Question display
   - Leaderboard between questions
   - Winner reveal

4. **Join Game Page** (`/join` and `/join/[gameId]`)
   - Game code entry
   - Wallet connection
   - Nickname input
   - Player registration

5. **Player Game Page** (`/play/[gameId]`)
   - Mobile-optimized answer interface
   - Score display
   - Final results

## Package Versions (Stable & Current)

All packages are using stable, production-ready versions:

```json
{
  "next": "16.1.0",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "@stacks/connect": "8.2.4",
  "@stacks/transactions": "7.3.1",
  "@stacks/network": "7.3.1",
  "socket.io": "4.8.1",
  "socket.io-client": "4.8.1",
  "zustand": "5.0.9",
  "lucide-react": "0.562.0",
  "tailwindcss": "4.0.0",
  "typescript": "5.x"
}
```

## Development Tips

1. **Testing Locally**
   - Use testnet STX from the faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
   - Test with multiple browser windows for multi-player scenarios
   - Use browser dev tools to monitor Socket.io connections

2. **Smart Contract Development**
   - Test contract functions with Clarinet before deployment
   - Use read-only functions to verify game state
   - Monitor transactions on Stacks Explorer

3. **Socket.io Debugging**
   - Check browser console for connection status
   - Monitor network tab for WebSocket connections
   - Server logs show all socket events

## Deployment

### Frontend (Railway/Render recommended)

Railway or Render support persistent WebSocket connections needed for Socket.io:

```bash
# Railway
railway up

# Render
# Connect GitHub repo and set:
# - Build: npm run build
# - Start: npm run start
```

**Note**: Vercel does not support persistent Socket.io connections.

### Smart Contract

```bash
# Testnet
clarinet deploy --testnet

# Mainnet
clarinet deploy --mainnet
```

## Architecture

```
┌─────────────────────────────────────────┐
│         CLIENT LAYER                     │
│  - Host Dashboard                        │
│  - Player Mobile                         │
│  - Display Screen                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│      SERVER LAYER (Socket.io)           │
│  - Real-time game state                 │
│  - Question broadcasting                │
│  - Answer collection & scoring          │
│  - Leaderboard updates                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│    BLOCKCHAIN LAYER (Stacks)            │
│  - Prize pool escrow                    │
│  - Player registration                  │
│  - Automated distribution               │
└─────────────────────────────────────────┘
```

## Security Considerations

- All wallet connections verified through @stacks/connect
- Answers timestamped server-side to prevent cheating
- Prize pools locked in smart contracts
- Only host can finalize games
- Contract prevents reentrancy (Clarity design)

## Contributing

Refer to the detailed development guides for comprehensive implementation instructions.

## License

MIT

## Support

For issues and questions:
- Check the PRD document for design specifications
- Review the implementation guide for step-by-step instructions
- Test on Stacks testnet before mainnet deployment

---

**Built by Lekan (Laykesydeoke) with stable, production-ready packages on Next.js 15, Stacks, and Socket.io**
