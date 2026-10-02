# ShopNET Movies — Agent Rules

## Primary rule
The repository documents are the source of truth.

## Agent behavior
1. Read relevant docs before changing code.
2. Do not invent requirements.
3. Keep changes scoped to the current phase.
4. Explain architectural consequences before major changes.
5. Run relevant tests after changes.
6. Do not claim tests passed unless actually run.
7. Do not claim an API works unless actually tested.
8. Do not silently replace providers.
9. Do not silently change the database architecture.
10. Do not commit secrets.
11. Stop when a phase acceptance criterion is satisfied.
12. Produce a phase report.

## Model escalation
The agent may recommend a stronger model but must not claim that it has switched the Antigravity core reasoning model itself.

At a phase boundary:
- recommend model
- explain why
- stop
- wait for owner
- resume after owner confirms model selection.

## Human gates
Ask for approval before:
- production deployment
- destructive changes
- provider changes
- payment changes
- auth architecture changes
- large dependency changes
- major refactoring
- phase transition
