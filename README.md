# QVAC Offline Translator

An original English → Spanish translator using QVAC SDK 0.19.1 and the Bergamot translation model.

## Requirements
- Node.js 22+
- npm 10+
- A machine/runtime supported by QVAC's native inference worker

## Install
```bash
npm install
```

## Run
```bash
npm start
```
Open port 3000.

The first translation request loads the model. Later requests reuse the loaded model.

## QVAC usage
This project calls `loadModel()` and `translate()` from `@qvac/sdk` 0.19.1.
Inference is performed locally through QVAC. No cloud AI API or API key is used.

## Bounty checklist
- QVAC SDK 0.19.1 declared dependency
- `loadModel()` called
- `translate()` called
- On-device inference
- Public GitHub repository
- Apache-2.0 license
- README with install/run/SDK version
- At least 3 meaningful commits authored by the submitter
- Original code, not a fork or near-copy of QVAC examples

## Demo
app translating English text to Spanish and capture the successful local inference result.

## Runtime note
If a Codespace/container reports a native QVAC worker `SIGBUS`, that is a runtime compatibility problem; use a QVAC-supported machine/runtime for the final demo.
