#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Command } = require('commander');

function extractMermaidBlocks(markdownContent) {
  const mermaidBlocks = [];
  const mermaidRegex = /```(?:mermaid|Mermaid|MERMAID)\s*\r?\n([\s\S]*?)\r?\n```/gi;
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

async function convertMermaidToPng(mermaidContent, outputPath, options = {}) {
  const tempMmdFile = path.join(process.cwd(), `temp_${Date.now()}.mmd`);

  try {
    fs.writeFileSync(tempMmdFile, mermaidContent);

    const mmdc = path.join(process.cwd(), 'node_modules', '.bin', 'mmdc');

    // 添加圖片大小控制參數
    const width = options.width || 1920;
    const height = options.height || 1080;
    const scale = options.scale || 1;
    const backgroundColor = options.backgroundColor || 'white';

    const command = `"${mmdc}" -i "${tempMmdFile}" -o "${outputPath}" -w ${width} -H ${height} -s ${scale} -b ${backgroundColor}`;

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

      // 可以自定義圖片大小選項
      const imageOptions = {
        width: 1920,     // 寬度
        height: 1080,    // 高度
        scale: 1,        // 縮放比例
        backgroundColor: 'white'  // 背景色
      };

      convertMermaidToPng(block.content, outputPath, imageOptions);
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
  .option('-w, --width <number>', 'Image width', '1920')
  .option('-h, --height <number>', 'Image height', '1080')
  .option('-s, --scale <number>', 'Scale factor', '1')
  .option('-b, --background <color>', 'Background color', 'white')
  .action((markdownFile) => {
    processMarkdownFile(markdownFile);
  });

program.parse();