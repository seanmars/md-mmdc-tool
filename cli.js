#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Command } = require('commander');

function extractMermaidBlocks(markdownContent) {
  const mermaidBlocks = [];
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
  let match;
  let index = 0;

  while ((match = mermaidRegex.exec(markdownContent)) !== null) {
    mermaidBlocks.push({
      index: index++,
      content: match[1].trim()
    });
  }

  return mermaidBlocks;
}

async function convertMermaidToPng(mermaidContent, outputPath) {
  const tempMmdFile = path.join(process.cwd(), `temp_${Date.now()}.mmd`);
  
  try {
    fs.writeFileSync(tempMmdFile, mermaidContent);
    
    const mmdc = path.join(process.cwd(), 'node_modules', '.bin', 'mmdc');
    const command = `"${mmdc}" -i "${tempMmdFile}" -o "${outputPath}"`;
    
    execSync(command, { stdio: 'inherit' });
    console.log(`Generated: ${outputPath}`);
  } catch (error) {
    console.error(`Error converting diagram: ${error.message}`);
  } finally {
    if (fs.existsSync(tempMmdFile)) {
      fs.unlinkSync(tempMmdFile);
    }
  }
}

function processMarkdownFile(markdownFile) {
  if (!fs.existsSync(markdownFile)) {
    console.error(`Error: File '${markdownFile}' does not exist.`);
    process.exit(1);
  }

  try {
    const markdownContent = fs.readFileSync(markdownFile, 'utf8');
    const mermaidBlocks = extractMermaidBlocks(markdownContent);
    
    if (mermaidBlocks.length === 0) {
      console.log('No Mermaid diagrams found in the markdown file.');
      return;
    }

    console.log(`Found ${mermaidBlocks.length} Mermaid diagram(s)`);
    
    const baseFileName = path.basename(markdownFile, path.extname(markdownFile));
    const outputDir = path.dirname(markdownFile);
    
    mermaidBlocks.forEach((block) => {
      const outputFileName = `${baseFileName}_mermaid_${block.index}.png`;
      const outputPath = path.join(outputDir, outputFileName);
      convertMermaidToPng(block.content, outputPath);
    });
    
  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
    process.exit(1);
  }
}

const program = new Command();

program
  .name('md-mmdc-tool')
  .description('Extract and convert Mermaid diagrams from Markdown files to PNG images')
  .version('1.0.0')
  .argument('<markdown-file>', 'Path to the Markdown file to process')
  .action((markdownFile) => {
    processMarkdownFile(markdownFile);
  });

program.parse();