# Agent Architecture

This document summarizes the conversational agents that power the Morphic Answer Engine UI and explains how they interact inside the default workflow.

## Workflow Entry Point

- **Server action**: `lib/actions/workflow.tsx`
- **High-level flow**:
  1. Spin up UI placeholders (spinner, streaming values).
  2. (Optionally) run the `taskManager` agent to decide whether to gather more user detail; currently the invocation is commented out so the workflow always proceeds.
  3. Route the request to the answering agent (`steelmakingExpert` for now; researcher variants are scaffolded).
  4. Stream the answer back into UI state and append any tool outputs.
  5. Post-answer, call `querySuggestor` to propose follow-up searches and render the follow-up panel.

## Agents

### Task Manager — `lib/agents/task-manager.tsx`
- **Purpose**: Choose the next action (`proceed` vs. `inquire`) based on the conversation history.
- **Model**: `getModel()` from `lib/utils`, typically OpenAI/Gemini/Anthropic/Ollama backed by environment configuration.
- **Output Schema**: `nextActionSchema` (`lib/schema/next-action.tsx`).
- **Notes**: Logging is minimal; errors fall back to `null`. The workflow currently bypasses this agent but keeping it documented helps when re-enabling the gating logic.

### Inquire — `lib/agents/inquire.tsx`
- **Purpose**: Stream a structured follow-up question to the UI when more context is needed.
- **Model**: `getModel()`.
- **UI Integration**: Streams partial inquiry objects to `<Copilot>` while the LLM populates `question`, `options`, and optional free-form input metadata defined in `lib/schema/inquiry.tsx`.
- **Language Handling**: Mirrors the user's language in human-readable fields while forcing option `value` fields to stay English.

### Researcher — `lib/agents/researcher.tsx`
- **Purpose**: Primary general-purpose answering agent that can call search/retrieval tools.
- **Model**: `getModel()` with streaming via `streamText`.
- **Tools**: `getTools()` from `lib/agents/tools` (search, retrieve, optional video search). Tool wiring is presently commented out pending activation; `toolResults` are still propagated for future use.
- **UI**: Streams text into `<AnswerSection>`; reacts differently depending on whether tool calls occur.
- **Variant**: `researcherWithOllama` uses `generateText` for Ollama-hosted models and fully enables tool usage.

### Steelmaking Expert — `lib/agents/steelmaking-expert.tsx`
- **Purpose**: Domain-specialized responder combining conversation history with vector-store retrieval.
- **Model**: Hardcodes `ChatOpenAI` (`gpt-4o-mini`, `temperature: 0.3`).
- **Context Strategy**:
  - Converts Vercel AI `CoreMessage`s into LangChain messages (`convertToLangchainBaseMessage`).
  - Normalizes human messages to raw strings, injects a steelmaking-specific system prompt, and formats the latest user turn with retrieved context snippets from `vectorstore.asRetriever(10)`.
- **UI**: Streams text via `<AnswerSection>` and `createStreamableValue`.
- **Fallback**: Returns a generic error message on failure and logs to console.

### Query Suggestor — `lib/agents/query-suggestor.tsx`
- **Purpose**: Generate three follow-up queries after an answer is delivered.
- **Model**: `getModel()` with `streamObject` to incrementally render `<SearchRelated>` suggestions defined by `lib/schema/related.tsx`.
- **Input**: Only the latest user message is forwarded (role-forced to `user`) to keep prompts focused.

### Helper Utilities — `lib/agents/helper-function.ts`
- **convertToLangchainBaseMessage** bridges Vercel AI message objects with LangChain classes, including tool-call handling.

## Tooling Layer — `lib/agents/tools`
- **`searchTool`**: Wraps Tavily, Exa, or self-hosted SearXNG search. Streams UI updates through `<SearchSection>`. Requires respective API keys (`TAVILY_API_KEY`, `EXA_API_KEY`, `SEARXNG_API_URL`).
- **`retrieveTool`**: Fetches article content via Jina Reader (preferred) or Tavily Extract; renders `<RetrieveSection>`.
- **`videoSearchTool`**: Optional YouTube search via Serper (`SERPER_API_KEY`).
- **Activation**: `getTools` conditionally registers `videoSearch` when the API key is available. `researcher` is primed to enable tools once the workflow uncomments the relevant code.

## Environment & Configuration Highlights

- `getModel()` automatically selects between Ollama, Google Gemini, Anthropic Claude, Azure OpenAI, Groq, or OpenAI chat endpoints based on available env vars.
- The workflow currently routes all answers through `steelmakingExpert`; switching back to the generic researcher only requires swapping the function call inside `lib/actions/workflow.tsx`.
- Retrieval for the steelmaking expert depends on `vectorstore` from `app/api/file/vector-store` (not yet documented here; extend this file once storage backends stabilize).

## Next Steps

- Decide when to re-enable `taskManager` and `inquire` for adaptive questioning.
- Document tool authentication requirements in `.env.example` (if not already covered elsewhere).
- Expand this file as new agents or domain experts are introduced.
