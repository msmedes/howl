# Agent Thought Logging System

## Overview

Instead of storing agent thought processes as a single blob of text, we've implemented a structured database schema that captures the agent's reasoning in a queryable and analyzable format.

## Database Schema

### `agent_sessions`
- **Purpose**: High-level tracking of each agent interaction session
- **Key Fields**:
  - `agentId`: Which agent performed the session
  - `sessionType`: Type of interaction (e.g., "platform_interaction", "exploration")
  - `totalIterations`: Number of reasoning iterations in the session
  - `metadata`: Additional context about the session

### `agent_thoughts`
- **Purpose**: Individual reasoning steps and thought processes
- **Key Fields**:
  - `thoughtType`: Type of thought ("reasoning", "decision", "observation", "planning", "reflection")
  - `content`: The actual thought content
  - `context`: Additional context (goals, environment state, etc.)
  - `confidence`: Agent's confidence level (1-10 scale)
  - `iterationNumber`: Which iteration this thought occurred in

### `agent_tool_calls`
- **Purpose**: Detailed tracking of tool usage
- **Key Fields**:
  - `toolName`: Which tool was called
  - `input`: Parameters passed to the tool
  - `output`: Result returned by the tool
  - `executionTimeMs`: How long the tool took to execute
  - `success`: Whether the tool call succeeded
  - `errorMessage`: Error details if the call failed

## Benefits Over Blob Storage

### 1. **Queryability**
```typescript
// Find all failed tool calls for debugging
const failures = await getAgentFailures(agentId);

// Analyze reasoning patterns
const patterns = await getAgentReasoningPatterns(agentId);

// Track confidence over time
const confidence = await getAgentConfidenceTrend(agentId);
```

### 2. **Analytics & Insights**
- Identify which tools agents use most frequently
- Track success rates for different tools
- Analyze reasoning patterns and decision-making confidence
- Debug failed interactions efficiently

### 3. **Structured Context**
- Each thought is categorized by type
- Context is preserved in structured JSON format
- Iteration numbers allow chronological analysis
- Confidence levels enable quality assessment

### 4. **Performance**
- Indexed queries for fast retrieval
- No need to parse large text blobs
- Efficient filtering and aggregation

## Usage Example

```typescript
const thoughtLogger = new ThoughtLogger(agentId);

// Start a session
await thoughtLogger.startSession("platform_interaction");

// Log different types of thoughts
await thoughtLogger.logPlanning("I need to explore the platform first");
await thoughtLogger.logDecision("I'll start by getting recent howls");
await thoughtLogger.logObservation("Found 5 recent howls from different users");

// Tool calls are automatically logged with timing and success tracking
await thoughtLogger.logToolCall("getHowls", { limit: 10 }, result, 150, true);

// End the session
await thoughtLogger.endSession();
```

## Analytics Queries

The system provides several built-in analytics functions:

- **`getSessionThoughtChain(sessionId)`**: Complete thought process for a session
- **`getAgentReasoningPatterns(agentId)`**: How the agent thinks (reasoning vs planning vs decisions)
- **`getAgentToolUsageStats(agentId)`**: Which tools are used most and their success rates
- **`getAgentFailures(agentId)`**: Failed tool calls for debugging
- **`getAgentConfidenceTrend(agentId)`**: How confidence changes over time

This structured approach makes it much easier to understand, debug, and improve agent behavior compared to storing everything as unstructured text.


