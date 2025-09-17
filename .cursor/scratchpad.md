# Onchain Tip Jar / Creator Support Widget

## Background and Motivation

Building an Onchain Tip Jar / Creator Support Widget using Base Account SDK. This is a small page where users can log in and send USDC tips to a creator with the following key features:

- **Auth**: "Sign in with Base to start tipping"
- **Base Pay**: One-tap to send a tip
- **Sub Accounts**: Separate a "Tips" account for recurring contributions
- **Spend Permissions**: Set a daily cap for tips

The goal is to create a simple UI with basically a single button and a slider for spend limits, demonstrating the power of Base Account's features.

## Key Challenges and Analysis

### Technical Architecture Decisions
1. **Base Account Integration**: Need to integrate `@base-org/account` SDK for authentication and wallet functionality
   - Use `createBaseAccountSDK` as the primary entry point
   - Configure with Base chain (chain ID: 8453) and appropriate app metadata
   - Implement EIP-1193 provider for wallet interactions

2. **USDC Token Handling**: Need to handle USDC token transfers on Base chain
   - USDC contract address on Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
   - Use viem for contract interactions (ERC-20 standard)
   - Implement balance checking and transfer functionality

3. **Sub Account Management**: Create and manage a separate "Tips" sub-account
   - Use `sdk.subAccount.create()` for creating dedicated tip account
   - Implement owner account management with `toOwnerAccount` function
   - Handle sub-account state and switching between main and tip accounts

4. **Spend Permissions**: Implement daily spending caps for tips
   - Use `requestSpendPermission` for setting daily limits
   - Implement permission management with `fetchPermissions` and `getPermissionStatus`
   - Create UI controls for setting and adjusting daily caps

5. **UI/UX Design**: Create a clean, simple interface with tip button and spend limit slider
   - Minimalist design focusing on core functionality
   - Responsive layout for mobile and desktop
   - Clear visual feedback for transaction states
   - Intuitive tip amount selection (preset amounts + custom)

6. **State Management**: Handle authentication state, account balance, and transaction status
   - React state management for user authentication status
   - Real-time balance updates
   - Transaction status tracking (pending, success, error)
   - Error handling and user feedback

### Technical Stack Decisions
- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS (already configured)
- **Blockchain**: Base Account SDK + viem for contract interactions
- **State Management**: React hooks (useState, useEffect, useContext)
- **Wallet Integration**: EIP-1193 provider from Base Account SDK

## High-level Task Breakdown

### Phase 1: Project Setup and Dependencies
- [ ] **Task 1.1**: Install Base Account SDK and viem dependencies
  - Success Criteria: `@base-org/account` and `viem` packages installed
- [ ] **Task 1.2**: Set up TypeScript types and interfaces
  - Success Criteria: Type definitions for Base Account, USDC, and app state
- [ ] **Task 1.3**: Configure environment variables and constants
  - Success Criteria: USDC contract address, Base chain config, app metadata

### Phase 2: Base Account Integration
- [ ] **Task 2.1**: Create Base Account SDK instance and context
  - Success Criteria: SDK instance created with proper configuration
- [ ] **Task 2.2**: Implement authentication flow ("Sign in with Base")
  - Success Criteria: Users can connect wallet and authenticate
- [ ] **Task 2.3**: Set up provider for wallet interactions
  - Success Criteria: EIP-1193 provider working with wallet

### Phase 3: Sub Account Management
- [ ] **Task 3.1**: Implement sub-account creation for "Tips"
  - Success Criteria: Can create dedicated tip sub-account
- [ ] **Task 3.2**: Add owner account management
  - Success Criteria: Owner account function properly configured
- [ ] **Task 3.3**: Handle sub-account state and switching
  - Success Criteria: Can switch between main and tip accounts

### Phase 4: USDC Integration
- [ ] **Task 4.1**: Set up USDC token contract interaction
  - Success Criteria: USDC contract properly configured with viem
- [ ] **Task 4.2**: Implement balance checking
  - Success Criteria: Can fetch and display USDC balance
- [ ] **Task 4.3**: Add USDC transfer functionality
  - Success Criteria: Can send USDC tips to creator address

### Phase 5: Spend Permissions
- [ ] **Task 5.1**: Implement daily spending cap functionality
  - Success Criteria: Can set and enforce daily spending limits
- [ ] **Task 5.2**: Add spend permission management
  - Success Criteria: Can create, fetch, and manage spend permissions
- [ ] **Task 5.3**: Create UI for setting daily limits
  - Success Criteria: Slider/input for setting daily tip limits

### Phase 6: UI Implementation
- [ ] **Task 6.1**: Create tip jar interface layout
  - Success Criteria: Clean, responsive tip jar UI
- [ ] **Task 6.2**: Add tip amount input/selection
  - Success Criteria: Preset amounts + custom input for tips
- [ ] **Task 6.3**: Implement spend limit slider
  - Success Criteria: Interactive slider for daily limit setting
- [ ] **Task 6.4**: Add transaction status indicators
  - Success Criteria: Loading, success, error states for transactions

### Phase 7: Testing and Polish
- [ ] **Task 7.1**: Test authentication flow
  - Success Criteria: Authentication works reliably
- [ ] **Task 7.2**: Test tip sending functionality
  - Success Criteria: Tips can be sent successfully
- [ ] **Task 7.3**: Test spend permissions
  - Success Criteria: Daily limits work as expected
- [ ] **Task 7.4**: Add error handling and loading states
  - Success Criteria: Graceful error handling and user feedback

## Project Status Board

### Completed ✅
- [x] **Task 1.1**: Install Base Account SDK and viem dependencies
  - ✅ `@base-org/account` v2.2.0 installed
  - ✅ `@base-org/account-ui` v1.0.1 installed
  - ⚠️ **Missing**: viem dependency still needed for contract interactions

### Ready to Start
- [ ] **Task 1.2**: Set up TypeScript types and interfaces  
- [ ] **Task 1.3**: Configure environment variables and constants

### Pending (Dependencies)
- [ ] **Task 2.1**: Create Base Account SDK instance and context
- [ ] **Task 2.2**: Implement authentication flow ("Sign in with Base")
- [ ] **Task 2.3**: Set up provider for wallet interactions
- [ ] **Task 3.1**: Implement sub-account creation for "Tips"
- [ ] **Task 3.2**: Add owner account management
- [ ] **Task 3.3**: Handle sub-account state and switching
- [ ] **Task 4.1**: Set up USDC token contract interaction
- [ ] **Task 4.2**: Implement balance checking
- [ ] **Task 4.3**: Add USDC transfer functionality
- [ ] **Task 5.1**: Implement daily spending cap functionality
- [ ] **Task 5.2**: Add spend permission management
- [ ] **Task 5.3**: Create UI for setting daily limits
- [ ] **Task 6.1**: Create tip jar interface layout
- [ ] **Task 6.2**: Add tip amount input/selection
- [ ] **Task 6.3**: Implement spend limit slider
- [ ] **Task 6.4**: Add transaction status indicators
- [ ] **Task 7.1**: Test authentication flow
- [ ] **Task 7.2**: Test tip sending functionality
- [ ] **Task 7.3**: Test spend permissions
- [ ] **Task 7.4**: Add error handling and loading states

## Current Status / Progress Tracking

**Current Phase**: Phase 1 - Project Setup (Partially Complete)
**Last Updated**: Codebase analysis completed

### Progress Summary
- ✅ **Base Account SDK**: Installed v2.2.0 + UI components v1.0.1
- ✅ **Project Structure**: Next.js 15 with TypeScript and Tailwind CSS ready
- ⚠️ **Missing Dependencies**: viem package needed for contract interactions
- ⚠️ **Code Implementation**: Still using default Next.js template

### Current Codebase Status
- **Dependencies**: Base Account SDK installed, but missing viem
- **Project Structure**: Standard Next.js 15 setup with TypeScript
- **UI Framework**: Tailwind CSS configured and ready
- **Current Page**: Default Next.js landing page (needs replacement)

### Key Implementation Insights
1. **Base Account SDK**: ✅ Ready to use `createBaseAccountSDK` with Base chain
2. **USDC Integration**: ⚠️ Need viem for contract interactions
3. **Sub Account Strategy**: Ready to implement with installed SDK
4. **Spend Permissions**: Ready to implement with installed SDK
5. **UI Focus**: Tailwind CSS ready for tip jar interface

### Next Steps
1. **Complete Task 1.1**: Install viem dependency
2. **Start Task 1.2**: Set up TypeScript types and interfaces
3. **Start Task 1.3**: Configure environment variables and constants

## Executor's Feedback or Assistance Requests

**Codebase Analysis Complete**: Repository is set up with Base Account SDK installed.

**Current Status**:
- ✅ Base Account SDK v2.2.0 + UI components v1.0.1 installed
- ✅ Next.js 15 + TypeScript + Tailwind CSS configured
- ⚠️ Missing viem dependency for contract interactions
- ⚠️ Still using default Next.js template (needs tip jar implementation)

**Ready for Next Phase**: 
1. Complete dependency installation (add viem)
2. Set up TypeScript types and interfaces
3. Configure environment variables and constants
4. Begin implementing the tip jar interface

**Recommendation**: Switch to Executor mode to complete Phase 1 setup and begin implementation.

## Lessons

- Include info useful for debugging in the program output
- Read the file before you try to edit it
- If there are vulnerabilities that appear in the terminal, run npm audit before proceeding
- Always ask before using the -force git command
