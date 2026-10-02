# ShopNET Movies — Architecture

## Architecture principle
Build a modular platform with a provider abstraction layer so AI vendors can be changed without rewriting the application.

## High-level flow

Web / Mobile / Admin
        |
        v
API Gateway / Backend
        |
        +--> Auth & RBAC
        +--> Projects / Users
        +--> Billing / Credits
        +--> Social Accounts
        +--> Notifications
        +--> Admin
        |
        v
AI Gateway
        |
        +--> LLM / Script Provider
        +--> Image Provider
        +--> Text-to-Video Provider
        +--> Image-to-Video Provider
        +--> Voice Provider
        +--> Translation Provider
        +--> Caption Provider
        +--> Gemini Omni Flash
        |
        v
Job Queue / Workers
        |
        v
Media Storage / CDN

## AI Gateway
Every provider must implement a stable internal interface.

Example conceptual interfaces:
- generateText()
- generateImage()
- generateVideo()
- generateVideoFromImage()
- editVideo()
- extendVideo()
- generateSpeech()
- translate()
- generateCaptions()

Provider-specific request/response formats must stay inside adapter modules.

## Background processing
Long-running generation must not block HTTP requests. Use jobs with:
- queued
- running
- completed
- failed
- cancelled
- retrying

## Provider fallback
The application should support primary and fallback providers where commercially and technically sensible.

## Cost accounting
Every generation job should record:
- provider
- model
- operation
- input/output characteristics
- provider request ID when available
- estimated provider cost
- actual provider cost where available
- user credits consumed
- timestamps
- status

## Security boundaries
Secrets must never be committed to source control. Use environment/secret management.

## Social integrations
Use OAuth and provider-specific adapters. Never store third-party passwords.

## Payment
Use a payment abstraction so the business is not permanently coupled to one gateway.

## Deployment
Production architecture must be finalized only after provider and infrastructure decisions are approved.
