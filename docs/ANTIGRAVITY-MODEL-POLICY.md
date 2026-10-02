# Antigravity Model Policy — ShopNET Movies

## Current platform fact
Antigravity's core reasoning model is selected by the user from the model selector. The selected reasoning model is sticky within a conversation/turn behavior; changing it while an agent is running does not retroactively change that running execution.

Therefore the ShopNET agent must NOT assume it can automatically switch the core reasoning model.

## Required behavior
At the start of each major phase, the agent must state:
- Recommended model
- Alternative model
- Why
- Expected task complexity
- Whether a model upgrade is actually necessary

Then it must stop at the phase gate and wait for the owner to select the model and approve continuation.

## Recommended mapping
- Architecture / security / major refactoring: Gemini 3.1 Pro or Claude Opus 4.6 Thinking
- Complex debugging: Claude Sonnet 4.6 Thinking or Gemini 3.1 Pro
- Routine implementation: Gemini 3.8 Flash / 3.7 Flash
- Repetitive tests/documentation: Gemini Flash
- Independent second opinion: GPT-OSS-120B where useful

This is a recommendation, not a claim that one model always performs best.

## Model-switch protocol
When a stronger model is needed, output:

MODEL CHANGE REQUIRED

Current model:
[model]

Recommended model:
[model]

Reason:
[reason]

Expected benefit:
[benefit]

Risk of continuing with current model:
[risk]

STOP. Await owner confirmation.

After the owner changes the model, the owner should say:
"Model switched. Continue the approved phase."

## Never
- Pretend to switch models.
- Continue into the next phase without approval.
- Spend AI credits automatically for a major phase without owner authorization.
