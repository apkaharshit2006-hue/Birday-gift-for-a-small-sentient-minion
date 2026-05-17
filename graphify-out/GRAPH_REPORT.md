# Graph Report - .  (2026-04-29)

## Corpus Check
- Corpus is ~30,857 words - fits in a single context window. You may not need a graph.

## Summary
- 94 nodes · 119 edges · 10 communities detected
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]

## God Nodes (most connected - your core abstractions)
1. `DebugLogger` - 12 edges
2. `CoherenceMetricsEngine` - 11 edges
3. `parse()` - 9 edges
4. `inferActions()` - 7 edges
5. `launchApp()` - 5 edges
6. `executeActions()` - 4 edges
7. `isValidAction()` - 4 edges
8. `triggerAutonomousBehavior()` - 4 edges
9. `validate()` - 3 edges
10. `validateAction()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `parseResponse()` --calls--> `parse()`  [INFERRED]
  pet-ai.js → response-parser.js
- `inferActionsFromText()` --calls--> `inferActions()`  [INFERRED]
  pet-ai.js → action-inference-engine.js
- `inferActions()` --calls--> `getHints()`  [INFERRED]
  action-inference-engine.js → action-hint-system.js
- `inferActions()` --calls--> `matchKeywords()`  [INFERRED]
  action-inference-engine.js → action-hint-system.js
- `addEmotionActions()` --calls--> `isValidAction()`  [INFERRED]
  action-inference-engine.js → action-registry.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.21
Nodes (5): buildTrayMenu(), checkForGitUpdates(), createPetWindow(), launchApp(), startFullscreenDetection()

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (1): DebugLogger

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (1): CoherenceMetricsEngine

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (7): executeActions(), logExecution(), substituteAction(), validateAction(), getActions(), isValidAction(), buildSystemPrompt()

### Community 4 - "Community 4"
Cohesion: 0.27
Nodes (8): buildAutonomousPrompt(), callAI(), inferActionsFromFallback(), selectFallbackDialogue(), triggerAutonomousBehavior(), buildSystemPrompt(), inferActionsFromText(), parseResponse()

### Community 5 - "Community 5"
Cohesion: 0.36
Nodes (6): getHints(), matchKeywords(), addEmotionActions(), inferActions(), prioritizeActions(), getSignatureActions()

### Community 6 - "Community 6"
Cohesion: 0.48
Nodes (5): checkAccessibilityPermissions(), checkMacOSFullscreenAsync(), isAnyElectronWindowFullscreen(), isSystemInFullscreen(), isSystemInFullscreenAsync()

### Community 7 - "Community 7"
Cohesion: 0.52
Nodes (6): extractJSON(), filterActions(), getFallbackResponse(), normalizeEmotion(), parse(), validateStructure()

### Community 8 - "Community 8"
Cohesion: 0.53
Nodes (4): initAppSettings(), readAppSettings(), updateAppSettings(), writeAppSettings()

### Community 9 - "Community 9"
Cohesion: 0.6
Nodes (3): calculateCoherence(), detectMismatches(), validate()

## Knowledge Gaps
- **Thin community `Community 1`** (13 nodes): `debug-logger.js`, `DebugLogger`, `.clearLogs()`, `.constructor()`, `.exportLog()`, `.getLogs()`, `.getLogsByCharacter()`, `.getLogsByTimeRange()`, `.getLogsByType()`, `.logExecution()`, `.logParsedResponse()`, `.logRawResponse()`, `.logValidation()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 2`** (12 nodes): `coherence-metrics-engine.js`, `CoherenceMetricsEngine`, `.calculateMetrics()`, `.clearResponses()`, `.constructor()`, `.exportMetrics()`, `.getCoherenceScore()`, `.getResponseCount()`, `.getResponses()`, `.getResponsesByCharacter()`, `.getResponsesByType()`, `.recordResponse()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `inferActions()` connect `Community 5` to `Community 4`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `parse()` connect `Community 7` to `Community 8`, `Community 4`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `inferActionsFromFallback()` connect `Community 4` to `Community 5`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `parse()` (e.g. with `readAppSettings()` and `triggerAutonomousBehavior()`) actually correct?**
  _`parse()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `inferActions()` (e.g. with `inferActionsFromFallback()` and `inferActionsFromText()`) actually correct?**
  _`inferActions()` has 4 INFERRED edges - model-reasoned connections that need verification._