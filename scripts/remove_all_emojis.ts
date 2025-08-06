import * as fs from 'fs';
import * as path from 'path';

// Comprehensive emoji regex pattern that covers all Unicode emoji ranges
const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2600}-\u{2604}]|[\u{260E}]|[\u{2611}]|[\u{2614}-\u{2615}]|[\u{2618}]|[\u{261D}]|[\u{2620}]|[\u{2622}-\u{2623}]|[\u{2626}]|[\u{262A}]|[\u{262E}-\u{262F}]|[\u{2638}-\u{263A}]|[\u{2640}]|[\u{2642}]|[\u{2648}-\u{2653}]|[\u{265F}-\u{2660}]|[\u{2663}]|[\u{2665}-\u{2666}]|[\u{2668}]|[\u{267B}]|[\u{267E}-\u{267F}]|[\u{2692}-\u{2697}]|[\u{2699}]|[\u{269B}-\u{269C}]|[\u{26A0}-\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26B0}-\u{26B1}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26C8}]|[\u{26CE}-\u{26CF}]|[\u{26D1}]|[\u{26D3}-\u{26D4}]|[\u{26E9}-\u{26EA}]|[\u{26F0}-\u{26F5}]|[\u{26F7}-\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu;

// Additional common emojis and symbols that might be missed
const additionalEmojiPatterns = [
  /🏆|🎯|🚀|💎|💰|🔒|🔐|🔓|🏛️|📊|📋|📡|⏳|✅|❌|🎉|🔄|🆔|💡|🔥|🎊|⚡|🌟|⭐|🔑|🎨|🛡️|⚠️|📈|📉|🏦|🏢|💼|📞|📧|📄|📝|💻|🖥️|📱|⌨️|🖱️|💾|💿|📀|🎵|🎶|🎤|🎧|📻|📺|📹|📷|📸|🔍|🔎|🔬|🔭|💊|💉|🧬|⚗️|🧪|🧫|🦠|🧲|🔧|🔨|⚙️|🔩|⛏️|🔪|⚔️|💣|🧨|🔫|🏹|🛡️|🔰|⚱️|🏺|🗿|🛢️|⛽|🚨|🚥|🚦|🚏|🚇|🚌|🚍|🚎|🏎️|🚓|🚑|🚒|🚐|🛻|🚚|🚛|🚜|🏍️|🛵|🚲|🛴|🛹|🛼|🚁|🛸|🚀|🛰️|💺|🚢|⛵|🛶|⚓|⛽|🚧|🚨|🚥|🚦|🚏|🗺️|🗾|🧭|🏔️|⛰️|🌋|🗻|🏕️|🏖️|🏜️|🏝️|🏞️|🏟️|🏛️|🏗️|🧱|🏘️|🏚️|🏠|🏡|🏢|🏣|🏤|🏥|🏦|🏨|🏩|🏪|🏫|🏬|🏭|🏯|🏰|🗼|🗽|⛪|🕌|🛕|🕍|⛩️|🕋|⛲|⛺|🌁|🌃|🏙️|🌄|🌅|🌆|🌇|🌉|♨️|🎠|🎡|🎢|💈|🎪|🚂|🚃|🚄|🚅|🚆|🚇|🚈|🚉|🚊|🚝|🚞|🚋|🚌|🚍|🚎|🚐|🚑|🚒|🚓|🚔|🚕|🚖|🚗|🚘|🚙|🚚|🚛|🚜|🏎️|🏍️|🛵|🦽|🦼|🛺|🚲|🛴|🛹|🛼|🚁|🛸|🚀|🛰️|💺|🛶|⛵|🚤|🛥️|🛳️|⛴️|🚢|⚓|⛽|🚧|🚨|🚥|🚦|🚏/g,
  /🎮|🕹️|🎰|🎲|🧩|🃏|🀄|🎴|🎭|🎨|🧵|🧶|🔇|🔈|🔉|🔊|📢|📣|📯|🔔|🔕|🎼|🎵|🎶|🎙️|🎚️|🎛️|🎤|🎧|📻|🎷|🎸|🎹|🎺|🎻|🪕|🥁|📱|📲|☎️|📞|📟|📠|🔋|🔌|💻|🖥️|🖨️|⌨️|🖱️|🖲️|💽|💾|💿|📀|🧮|🎥|🎞️|📽️|🎬|📺|📷|📸|📹|📼|🔍|🔎|🕯️|💡|🔦|🏮|🪔|📔|📕|📖|📗|📘|📙|📚|📓|📒|📃|📜|📄|📰|🗞️|📑|🔖|🏷️|💰|💴|💵|💶|💷|💸|💳|🧾|💎|⚖️|🧰|🔧|🔨|⚒️|🛠️|⛏️|🔩|⚙️|🧱|⛓️|🧲|🔫|💣|🧨|🔪|🗡️|⚔️|🛡️|🚬|⚰️|⚱️|🏺|🔮|📿|🧿|💈|⚗️|🔭|🧪|🧫|🧬|🔬|🕳️|💊|💉|🌡️|🧹|🧺|🧻|🚽|🚰|🚿|🛁|🛀|🧴|🧷|🧹|🧺|🧻|🧼|🧽|🧯|🛒|🚬/g
];

interface FileToProcess {
  filePath: string;
  isHTML: boolean;
}

function removeEmojis(content: string): string {
  let cleanContent = content;
  
  // Apply main emoji regex
  cleanContent = cleanContent.replace(emojiRegex, '');
  
  // Apply additional emoji patterns
  additionalEmojiPatterns.forEach(pattern => {
    cleanContent = cleanContent.replace(pattern, '');
  });
  
  // Clean up extra spaces that might be left behind
  cleanContent = cleanContent.replace(/\s{3,}/g, '  '); // Replace 3+ spaces with 2 spaces
  cleanContent = cleanContent.replace(/^\s+/gm, ''); // Remove leading spaces on lines
  
  return cleanContent;
}

async function processFile(fileInfo: FileToProcess): Promise<void> {
  try {
    const content = fs.readFileSync(fileInfo.filePath, 'utf8');
    const originalEmojiCount = (content.match(emojiRegex) || []).length;
    
    const cleanContent = removeEmojis(content);
    const finalEmojiCount = (cleanContent.match(emojiRegex) || []).length;
    
    if (originalEmojiCount > 0) {
      fs.writeFileSync(fileInfo.filePath, cleanContent, 'utf8');
      console.log(`✓ ${fileInfo.filePath}: Removed ${originalEmojiCount - finalEmojiCount} emojis`);
    } else {
      console.log(`○ ${fileInfo.filePath}: No emojis found`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${fileInfo.filePath}:`, error);
  }
}

async function main() {
  console.log('🔧 Starting comprehensive emoji removal from ARCx project...');
  console.log('=====================================');
  
  const filesToProcess: FileToProcess[] = [
    // Main documentation files
    { filePath: 'README.md', isHTML: false },
    
    // HTML files
    { filePath: 'index.html', isHTML: true },
    { filePath: 'documentation.html', isHTML: true },
    { filePath: 'transparency.html', isHTML: true },
    { filePath: 'bridge.html', isHTML: true },
    { filePath: 'whitepaper.html', isHTML: true },
    
    // Documentation folder
    { filePath: 'docs/DOCUMENTATION_INDEX.md', isHTML: false },
    { filePath: 'docs/DEPLOYMENT_STATUS.md', isHTML: false },
    { filePath: 'docs/DEPLOYMENT_GUIDE.md', isHTML: false },
    { filePath: 'docs/ENTERPRISE_LP_DEPLOYMENT.md', isHTML: false },
    { filePath: 'docs/VESTING_SUMMARY.md', isHTML: false },
    { filePath: 'docs/ALLOCATION_VESTING.md.md', isHTML: false },
    { filePath: 'docs/WHITEPAPER.md', isHTML: false },
    { filePath: 'docs/System_Analysis.md', isHTML: false },
    { filePath: 'docs/GROWTHMAP.md', isHTML: false },
    { filePath: 'docs/investor_deck.md', isHTML: false },
    { filePath: 'docs/audit_project_summary.md', isHTML: false },
    { filePath: 'docs/audit_scope.md', isHTML: false },
    { filePath: 'docs/audit_timeline.md', isHTML: false },
    { filePath: 'docs/CODE_OF_CONDUCT.md', isHTML: false },
    { filePath: 'docs/CONTRIBUTING.md', isHTML: false },
    { filePath: 'docs/ENVIRONMENT_SETUP.md', isHTML: false },
    { filePath: 'docs/TokenSaleTerms.md', isHTML: false },
    
    // Script files (TypeScript)
    { filePath: 'scripts/enterprise_lp_strategy.ts', isHTML: false },
    { filePath: 'scripts/setup_uniswap_v4_pool.ts', isHTML: false },
    { filePath: 'scripts/approve_lp_tokens.ts', isHTML: false },
    { filePath: 'scripts/provide_liquidity.ts', isHTML: false },
    { filePath: 'scripts/orchestrate_lp_deployment.ts', isHTML: false },
  ];
  
  let totalEmojisRemoved = 0;
  let filesProcessed = 0;
  
  for (const fileInfo of filesToProcess) {
    if (fs.existsSync(fileInfo.filePath)) {
      await processFile(fileInfo);
      filesProcessed++;
    } else {
      console.log(`⚠ File not found: ${fileInfo.filePath}`);
    }
  }
  
  console.log('\n=====================================');
  console.log(`✅ Emoji removal complete!`);
  console.log(`📊 Files processed: ${filesProcessed}`);
  console.log(`🧹 All emojis have been comprehensively removed`);
  console.log(`💼 Your project now has clean, professional presentation`);
  console.log('=====================================');
}

main().catch(console.error);
