const path = require('node:path');

const EXTENSION_MAP = {
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.py': 'python',
  '.lua': 'lua',
  '.luau': 'luau',
  '.rs': 'rust',
  '.go': 'go',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.cs': 'csharp',
  '.rb': 'ruby',
  '.php': 'php',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown',
  '.sql': 'sql',
  '.sh': 'bash',
  '.bash': 'bash',
};

const GITHUB_BLOB_REGEX = /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/blob\/([a-zA-Z0-9_./-]+)(?:#L(\d+)(?:-L(\d+))?)?$/;

/**
 * Importa com segurança um trecho de código a partir de uma URL pública do GitHub.
 * Blindagem anti-SSRF: aceita somente URLs canônicas github.com e busca em raw.githubusercontent.com.
 */
async function importGitHubSnippet(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('invalid_github_url');
  }

  const cleanUrl = url.trim();
  const match = cleanUrl.match(GITHUB_BLOB_REGEX);
  if (!match) {
    throw new Error('invalid_github_blob_url');
  }

  const [, owner, repo, branchAndPath, lineStartStr, lineEndStr] = match;

  // Separa branch do caminho do arquivo
  // branchAndPath pode ser: "main/src/index.js" ou "feature/v2/src/app.py"
  // Para raw.githubusercontent.com, o formato é: /:owner/:repo/:branchAndPath
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branchAndPath}`;

  const lineStart = lineStartStr ? parseInt(lineStartStr, 10) : null;
  const lineEnd = lineEndStr ? parseInt(lineEndStr, 10) : lineStart;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  let response;
  try {
    response = await fetch(rawUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Pyxie-Hyperfokus-CodeImporter/1.0',
        Accept: 'text/plain',
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    throw new Error(`github_fetch_failed: ${err.message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`github_file_not_found (${response.status})`);
  }

  const rawText = await response.text();
  if (rawText.length > 500000) {
    throw new Error('github_file_too_large (max 500KB)');
  }

  const lines = rawText.split(/\r?\n/);
  let selectedLines = lines;

  if (lineStart !== null) {
    const startIdx = Math.max(0, lineStart - 1);
    const endIdx = lineEnd !== null ? Math.min(lines.length, lineEnd) : lines.length;
    selectedLines = lines.slice(startIdx, endIdx);
  }

  const snippetCode = selectedLines.join('\n');
  const ext = path.extname(branchAndPath).toLowerCase();
  const lang = EXTENSION_MAP[ext] || 'text';

  const lineIndicator = lineStart !== null
    ? (lineEnd && lineEnd !== lineStart ? `#L${lineStart}-L${lineEnd}` : `#L${lineStart}`)
    : '';

  const markdownSnippet = `\`\`\`${lang}
// [Código importado de github.com/${owner}/${repo}/blob/${branchAndPath}${lineIndicator}]
${snippetCode}
\`\`\`
> 🔗 *Fonte original com licença do autor:* [${owner}/${repo}/${branchAndPath}${lineIndicator}](${cleanUrl})
`;

  return {
    rawUrl,
    originalUrl: cleanUrl,
    repo: `${owner}/${repo}`,
    filePath: branchAndPath,
    language: lang,
    lineStart,
    lineEnd,
    totalLines: selectedLines.length,
    snippetCode,
    markdownSnippet,
  };
}

module.exports = {
  importGitHubSnippet,
  GITHUB_BLOB_REGEX,
};

