# Lecture Prompts

This document lists the explicit prompts mentioned in lectures in `AWS Kiro Course Spec Driven Agentic AI Coding - 2026/`. Lectures with no prompts are omitted.

## Installing Amazon Kiro and Its Core AI Features

### Kiro Chat: Models, Context, and Autopilot
- `what is this file`
- `format this file`

### Autocomplete, Inline Fixes, and AI Commit Messages
- `explain this`

## Spec Driven Development with Kiro

### Optional: Creating a Vite and React Sample Project with Kiro
- `I want to create in this folder a Vite project`

### Hands-On: Spec-Driven Development for a New Feature
- `create a homepage for an events company. Make it very brief and basic. The requirements should not be longer than 100 lines.`
- `create a design for this events company homepage`
- `Yes, this is a new feature that I'm building` (answer to Kiro's clarifying question)

### Spec Mode vs Plan Mode: When to Use Each
- `I want to add routing, what options do I have?`
- `1` (follow-up selecting the first suggested option)

## Configuring Kiro Steering Files and Skills

### Steering Files: Project Steering Documentation
- `what tech is used in this project`

### Hands-On: Conditional and Manual Steering Files
- `complete this steering file to always rename constants with upper case`
- `format this file`
- `complete this steering file, add an indication that when generating function comments, they should be very brief and end with this function is awesome`
- `update this so it also includes information about function parameters. The comment should indicate if the parameter is required or not.`
- `I want jsdoc comments`
- `write comments to this file`

### Hands-On: Building Your First Kiro Skill
- `hello how awesome am I`
- Skill content: "a simple skill that will respond when the user enters the prompt hello how awesome am I", response text "you are extremely awesome", template text "hello you've triggered the hello name skill you are very awesome thank you for using the hello skill"

### Optional Hands-On: A Kiro Skill That Runs a Script
- `complete this skill to count all the components in this project`
- `write this script so it gets the Kiro payload and appends it to a file called payload.json. The file should be valid json.`
- `count components` (slash-invocation of the skill)

## Extending Kiro with MCP Servers and Powers

### Installing MCP Servers in Kiro with mcp.json
- `find listings in Paris for December`

### Optional: Installing the Official AWS MCP Server
- `use the AWS MCP. What is the latest version of Node.js supported by the AWS Lambda runtime?`

### Kiro Powers: Solving the MCP Context Problem
- `check the compliance of this project`

### Building a Custom Kiro Power with plugin.json
- `help me review this code`

## Custom Agents and Hooks in Kiro

### Custom Agents: Scoped Tools, Models, and Permissions
- `always answer like a bro` (instruction added to the agent definition)
- `start this project in dev mode`

### Hands-On: Building Kiro Agent Hooks
- `stop tool execution if the prompt contains the word month`
- `search for Airbnb listings in Paris next month`
- `write this script so it gets the Kiro payload and appends it to a file called payload.json. The file should be valid json.`
- `hello`
- `hello again`

## Kiro CLI: Running Kiro in the Terminal

### Using Kiro CLI: Slash Commands, MCP, and Agents
- `/context`
- `/model`
- `/mcp`
- `find some Airbnb listings in Paris next month`
