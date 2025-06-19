# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Node.js CLI tool called `md-mmdc-tool` that extracts Mermaid diagrams from Markdown files and converts them to PNG images using the Mermaid CLI.

## Package Management
- Uses `pnpm` as the package manager (version 10.12.1)
- Run `pnpm install` to install dependencies
- Run `pnpm run <script>` to execute package scripts

## Dependencies
- `@mermaid-js/mermaid-cli`: Used to convert Mermaid diagrams to PNG format

## CLI Usage
The tool provides a command-line interface accessible via:
- `node cli.js <markdown-file>` (development)
- `md-mmdc-tool <markdown-file>` (after installation)

## Core Functionality
- Parses Markdown files to extract Mermaid code blocks (```mermaid)
- Converts each diagram to PNG using the mermaid-cli
- Outputs PNG files in the same directory as the input file
- Names output files as `<filename>_mermaid_<index>.png`

## Architecture
- `cli.js`: Main CLI script with argument parsing, Markdown processing, and Mermaid conversion
- Uses regex pattern matching to extract Mermaid blocks from Markdown content
- Creates temporary `.mmd` files for conversion, then cleans them up