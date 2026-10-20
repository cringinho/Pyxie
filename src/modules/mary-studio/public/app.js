/**
 * Estúdio Visual da Mary - Frontend Application
 */

let appState = {
  guild: null,
  channels: [],
  roles: [],
  config: {},
  savedMessages: [],
  templates: [],
  editingRecordId: null,
  currentButtons: [],
};

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupFormListeners();
  setupColorPresets();
  setupVariableButtons();
  loadBootstrapData();

  document.getElementById('btnRefresh').addEventListener('click', loadBootstrapData);
  document.getElementById('btnLogout').addEventListener('click', handleLogout);
  document.getElementById('btnDisconnectAll').addEventListener('click', handleLogoutAll);
  document.getElementById('statusBadge').addEventListener('click', toggleStatus);
  document.getElementById('btnSubmitMessage').addEventListener('click', submitMessage);
  document.getElementById('btnCancelEdit').addEventListener('click', cancelEdit);
  document.getElementById('btnAddButton').addEventListener('click', addNewButton);
  document.getElementById('btnSaveProfile').addEventListener('click', saveProfile);
  document.getElementById('btnSaveModules').addEventListener('click', saveModules);
  document.getElementById('fileImage').addEventListener('change', (e) => handleFileUpload(e, 'inputImageUrl'));
  document.getElementById('fileThumbnail').addEventListener('change', (e) => handleFileUpload(e, 'inputThumbnailUrl'));
  document.getElementById('btnOpenCanvasTable').addEventListener('click', generateCanvasPriceTable);
});

async function apiFetch(url, options = {}) {
  const headers = options.headers || {};
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
    headers['X-Mary-CSRF'] = '1';
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
  }
  options.headers = headers;

  const res = await fetch(url, options);
  if (res.status === 401 || res.status === 403) {
    if (!url.includes('/api/mary/auth/')) {
      alert('Sessão expirada. Por favor, use /py-mary no Discord para entrar novamente.');
      window.location.replace('/mary');
    }
  }
  return res;
}

async function loadBootstrapData() {
  try {
    const res = await apiFetch('/api/mary/bootstrap');
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success) return;

    appState.guild = data.guild;
    appState.targetGuildId = data.targetGuildId || '1557399041443111025';
    appState.inviteUrl = data.inviteUrl || 'https://discord.com/oauth2/authorize?client_id=1543650200718155897&permissions=8&scope=bot%20applications.commands';
    appState.channels = data.channels || [];
    appState.roles = data.roles || [];
    appState.config = data.config || {};
    appState.savedMessages = data.savedMessages || [];
    appState.templates = data.templates || [];

    renderHeader();
    renderChannels();
    renderTemplates();
    renderSentMessages();
    renderModulesTab();
    renderSecurityTab(data);

    // Se veio parâmetro de edição na URL (?editMessageId=...)
    const urlParams = new URLSearchParams(window.location.search);
    const editMsgId = urlParams.get('editMessageId');
    if (editMsgId) {
      const target = appState.savedMessages.find((m) => m.messageId === editMsgId);
      if (target) {
        startEditing(target.recordId);
      }
    }
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}

function renderHeader() {
  const infoText = document.getElementById('guildInfoText');
  const banner = document.getElementById('guildInviteBanner');
  const bannerGuildId = document.getElementById('bannerGuildId');
  const btnInvite = document.getElementById('btnInviteBot');

  if (appState.guild) {
    infoText.textContent = `Servidor: ${appState.guild.name}`;
    if (banner) banner.style.display = 'none';
  } else {
    const inviteUrl = appState.inviteUrl || 'https://discord.com/oauth2/authorize?client_id=1543650200718155897&permissions=8&scope=bot%20applications.commands';
    infoText.innerHTML = `Servidor: <span style="color: #f59e0b;">Aguardando Convite</span> (<a href="${inviteUrl}" target="_blank" style="color: #ec4899; text-decoration: underline;">Convidar Pyxie</a>)`;
    if (banner) {
      banner.style.display = 'block';
      if (bannerGuildId) bannerGuildId.textContent = appState.targetGuildId || '1557399041443111025';
      if (btnInvite) btnInvite.href = inviteUrl;
    }
  }

  const dot = document.getElementById('statusDot');
  const label = document.getElementById('statusLabel');
  const status = appState.config.statusLoja || 'online';

  if (status === 'online') {
    dot.textContent = '🟢';
    label.textContent = 'Loja Online';
  } else if (status === 'fila') {
    dot.textContent = '🟡';
    label.textContent = 'Atendimento em Fila';
  } else {
    dot.textContent = '🔴';
    label.textContent = 'Loja Fechada';
  }

  document.getElementById('selectStoreStatus').value = status;
}

function renderChannels() {
  const select = document.getElementById('selectChannel');
  if (!appState.guild || !appState.channels || appState.channels.length === 0) {
    select.innerHTML = '<option value="">⚠️ Pyxie não está no servidor ou não há canais (convide o bot primeiro)</option>';
    return;
  }
  select.innerHTML = '<option value="">Selecione um canal...</option>';
  appState.channels.forEach((ch) => {
    const opt = document.createElement('option');
    opt.value = ch.id;
    opt.textContent = `#${ch.name}`;
    select.appendChild(opt);
  });
}

function setupTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

function setupFormListeners() {
  const inputs = ['inputContent', 'inputTitle', 'inputDescription', 'inputImageUrl', 'inputThumbnailUrl', 'inputFooterText', 'inputColor'];
  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        if (id === 'inputColor') {
          document.getElementById('inputColorHex').value = el.value;
        }
        updateDiscordPreview();
      });
    }
  });

  document.getElementById('inputColorHex').addEventListener('input', (e) => {
    const val = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      document.getElementById('inputColor').value = val;
      updateDiscordPreview();
    }
  });
}

function setupColorPresets() {
  document.querySelectorAll('.color-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      const color = dot.dataset.color;
      document.getElementById('inputColor').value = color;
      document.getElementById('inputColorHex').value = color;
      updateDiscordPreview();
    });
  });
}

function setupVariableButtons() {
  document.querySelectorAll('.var-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const varTag = btn.dataset.var;
      const descArea = document.getElementById('inputDescription');
      descArea.value += ` ${varTag}`;
      updateDiscordPreview();
    });
  });
}

// --- PREVIEW REAL EM TEMPO REAL ---
function updateDiscordPreview() {
  const content = document.getElementById('inputContent').value;
  const title = document.getElementById('inputTitle').value;
  const desc = document.getElementById('inputDescription').value;
  const color = document.getElementById('inputColor').value;
  const image = document.getElementById('inputImageUrl').value;
  const footer = document.getElementById('inputFooterText').value;

  const prevContent = document.getElementById('prevContentText');
  prevContent.textContent = resolveLocalVars(content);
  prevContent.style.display = content ? 'block' : 'none';

  const embedCard = document.getElementById('prevEmbedCard');
  embedCard.style.borderLeftColor = color || '#ec4899';

  const prevTitle = document.getElementById('prevEmbedTitle');
  prevTitle.textContent = resolveLocalVars(title);
  prevTitle.style.display = title ? 'block' : 'none';

  const prevDesc = document.getElementById('prevEmbedDesc');
  prevDesc.textContent = resolveLocalVars(desc);
  prevDesc.style.display = desc ? 'block' : 'none';

  const prevImg = document.getElementById('prevEmbedImage');
  if (image) {
    prevImg.src = image;
    prevImg.style.display = 'block';
  } else {
    prevImg.style.display = 'none';
  }

  const prevFooter = document.getElementById('prevEmbedFooter');
  const prevFooterText = document.getElementById('prevFooterText');
  if (footer) {
    prevFooterText.textContent = resolveLocalVars(footer);
    prevFooter.style.display = 'flex';
  } else {
    prevFooter.style.display = 'none';
  }

  // Render Botões no Preview
  const btnRow = document.getElementById('prevButtonsRow');
  btnRow.innerHTML = '';
  appState.currentButtons.forEach((b) => {
    const btn = document.createElement('button');
    btn.className = `discord-btn discord-btn-${(b.style || 'primary').toLowerCase()}`;
    let label = (b.label || 'Botão').trim();
    const emoji = (b.emoji || '').trim();
    if (emoji && label.startsWith(emoji)) {
      while (label.startsWith(emoji)) {
        label = label.slice(emoji.length).trim();
      }
    }
    btn.textContent = `${emoji ? emoji + ' ' : ''}${label}`;
    btn.onclick = () => {
      if (b.actionType === 'image_response') {
        alert(`🖼️ [Preview de Resposta]\nTexto: ${b.responseText || 'Sem texto'}\nImagem: ${b.responseImageUrl || 'Sem imagem'}`);
      } else if (b.actionType === 'calculator') {
        alert('🧮 [Preview] Abrirá a Calculadora de Taxa do Roblox (30%).');
      } else if (b.actionType === 'ticket') {
        alert('🎫 [Preview] Abrirá uma sala privada de atendimento para o comprador.');
      }
    };
    btnRow.appendChild(btn);
  });
}

function resolveLocalVars(text) {
  if (!text) return '';
  const estoque = (Number(appState.config.estoqueRobux) || 25000).toLocaleString('pt-BR') + ' R$';
  const preco = 'R$ ' + (Number(appState.config.preco1k) || 37.0).toFixed(2).replace('.', ',');
  let status = '🟢 Online';
  if (appState.config.statusLoja === 'fila') status = '🟡 Fila';
  if (appState.config.statusLoja === 'offline') status = '🔴 Fechada';

  return text
    .replace(/\{estoque\}/gi, estoque)
    .replace(/\{preco_1k\}/gi, preco)
    .replace(/\{status_loja\}/gi, status);
}

// --- CONSTRUTOR DE BOTÕES ---
function addNewButton() {
  const btn = {
    id: `btn_${Date.now()}`,
    label: 'Novo Botão',
    emoji: '✨',
    style: 'Primary',
    actionType: 'image_response',
    responseEphemeral: true,
    responseText: '',
    responseImageUrl: '',
    subButtons: [],
  };
  appState.currentButtons.push(btn);
  renderButtonsList();
  updateDiscordPreview();
}

function renderButtonsList() {
  const container = document.getElementById('buttonsList');
  if (appState.currentButtons.length === 0) {
    container.innerHTML = '<p style="font-size: 13px; color: var(--text-muted);">Nenhum botão adicionado ainda. Clique em "Novo Botão" acima.</p>';
    return;
  }

  container.innerHTML = '';
  appState.currentButtons.forEach((b, index) => {
    let cleanLabel = (b.label || '').trim();
    const cleanEmoji = (b.emoji || '').trim();
    if (cleanEmoji && cleanLabel.startsWith(cleanEmoji)) {
      while (cleanLabel.startsWith(cleanEmoji)) {
        cleanLabel = cleanLabel.slice(cleanEmoji.length).trim();
      }
      b.label = cleanLabel;
    }
    const item = document.createElement('div');
    item.className = 'btn-builder-item';
    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong>Botão #${index + 1}</strong>
        <button class="btn-secondary" style="color:#ef4444; padding:2px 8px; font-size:11px;" onclick="removeButton(${index})">Remover</button>
      </div>
      <div style="display:grid; grid-template-columns: 80px 1fr 140px; gap:8px; margin-bottom:8px;">
        <input type="text" class="form-control" value="${b.emoji || ''}" placeholder="Emoji" oninput="updateButtonProp(${index}, 'emoji', this.value)">
        <input type="text" class="form-control" value="${b.label || ''}" placeholder="Texto do Botão" oninput="updateButtonProp(${index}, 'label', this.value)">
        <select class="form-control" onchange="updateButtonProp(${index}, 'style', this.value)">
          <option value="Primary" ${b.style === 'Primary' ? 'selected' : ''}>Azul</option>
          <option value="Secondary" ${b.style === 'Secondary' ? 'selected' : ''}>Cinza</option>
          <option value="Success" ${b.style === 'Success' ? 'selected' : ''}>Verde</option>
          <option value="Danger" ${b.style === 'Danger' ? 'selected' : ''}>Vermelho</option>
        </select>
      </div>
      <div class="form-group" style="margin-bottom:8px;">
        <label class="form-label">O que acontece ao clicar?</label>
        <select class="form-control" onchange="updateButtonProp(${index}, 'actionType', this.value)">
          <option value="image_response" ${b.actionType === 'image_response' ? 'selected' : ''}>🖼️ Mostrar Imagem / Card Explicativo</option>
          <option value="calculator" ${b.actionType === 'calculator' ? 'selected' : ''}>🧮 Abrir Calculadora de 30%</option>
          <option value="ticket" ${b.actionType === 'ticket' ? 'selected' : ''}>🎫 Abrir Ticket de Compra</option>
          <option value="roblox_check" ${b.actionType === 'roblox_check' ? 'selected' : ''}>🔍 Conferir Nick do Roblox</option>
        </select>
      </div>
      ${b.actionType === 'image_response' ? `
        <div class="form-group" style="margin-bottom:6px;">
          <input type="text" class="form-control" placeholder="Mensagem explicativa ao tocar no botão..." value="${b.responseText || ''}" oninput="updateButtonProp(${index}, 'responseText', this.value)">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <input type="text" class="form-control" placeholder="URL da imagem (print tutorial ou tabela)..." value="${b.responseImageUrl || ''}" oninput="updateButtonProp(${index}, 'responseImageUrl', this.value)">
        </div>
      ` : ''}
    `;
    container.appendChild(item);
  });
}

window.removeButton = function(index) {
  appState.currentButtons.splice(index, 1);
  renderButtonsList();
  updateDiscordPreview();
};

window.updateButtonProp = function(index, prop, value) {
  appState.currentButtons[index][prop] = value;
  renderButtonsList();
  updateDiscordPreview();
};

// --- ENVIO E EDIÇÃO DE MENSAGENS ---
async function submitMessage() {
  const channelId = document.getElementById('selectChannel').value;
  if (!channelId) {
    alert('Por favor, selecione um canal do servidor onde enviar a mensagem.');
    return;
  }

  const payload = {
    content: document.getElementById('inputContent').value,
    embed: {
      title: document.getElementById('inputTitle').value,
      description: document.getElementById('inputDescription').value,
      color: document.getElementById('inputColor').value,
      imageUrl: document.getElementById('inputImageUrl').value,
      thumbnailUrl: document.getElementById('inputThumbnailUrl').value,
      footerText: document.getElementById('inputFooterText').value,
      showTimestamp: true,
      fields: [],
    },
    buttons: appState.currentButtons,
  };

  const btnSubmit = document.getElementById('btnSubmitMessage');
  btnSubmit.disabled = true;
  btnSubmit.textContent = '⏳ Processando envio...';

  try {
    let res;
    if (appState.editingRecordId) {
      res = await apiFetch(`/api/mary/messages/${appState.editingRecordId}`, {
        method: 'PUT',
        body: JSON.stringify({ messageData: payload }),
      });
    } else {
      res = await apiFetch('/api/mary/messages/send', {
        method: 'POST',
        body: JSON.stringify({ channelId, messageData: payload }),
      });
    }

    const data = await res.json();
    if (data.success) {
      alert(appState.editingRecordId ? '✅ Mensagem editada com sucesso no Discord!' : '🚀 Mensagem enviada para o Discord!');
      cancelEdit();
      loadBootstrapData();
    } else {
      alert('❌ Erro: ' + (data.error || 'Falha ao enviar.'));
    }
  } catch (e) {
    alert('Erro de conexão ao enviar mensagem.');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = appState.editingRecordId ? '💾 Salvar Alterações no Discord' : '🚀 Enviar Mensagem para o Discord';
  }
}

function startEditing(recordId) {
  const record = appState.savedMessages.find((m) => m.recordId === recordId);
  if (!record) return;

  appState.editingRecordId = recordId;
  document.getElementById('editModeBanner').style.display = 'block';
  document.getElementById('selectChannel').value = record.channelId;
  document.getElementById('selectChannel').disabled = true;

  document.getElementById('inputContent').value = record.content || '';
  if (record.embed) {
    document.getElementById('inputTitle').value = record.embed.title || '';
    document.getElementById('inputDescription').value = record.embed.description || '';
    document.getElementById('inputColor').value = record.embed.color || '#ec4899';
    document.getElementById('inputColorHex').value = record.embed.color || '#ec4899';
    document.getElementById('inputImageUrl').value = record.embed.imageUrl || '';
    document.getElementById('inputThumbnailUrl').value = record.embed.thumbnailUrl || '';
    document.getElementById('inputFooterText').value = record.embed.footerText || '';
  }

  appState.currentButtons = record.buttons ? JSON.parse(JSON.stringify(record.buttons)) : [];
  renderButtonsList();
  updateDiscordPreview();

  document.querySelector('.nav-tab[data-tab="tab-builder"]').click();
  document.getElementById('btnSubmitMessage').textContent = '💾 Salvar Alterações no Discord';
}

function cancelEdit() {
  appState.editingRecordId = null;
  document.getElementById('editModeBanner').style.display = 'none';
  document.getElementById('selectChannel').disabled = false;
  document.getElementById('btnSubmitMessage').textContent = '🚀 Enviar Mensagem para o Discord';
}

// --- MODELOS PRONTOS ---
function renderTemplates() {
  const container = document.getElementById('templatesGrid');
  container.innerHTML = '';
  appState.templates.forEach((tpl) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.margin = '0';
    card.innerHTML = `
      <h3 style="font-size:15px; margin-bottom:8px; color:#fff;">${tpl.name}</h3>
      <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">${tpl.description}</p>
      <button class="btn-secondary" style="width:100%; border-color:var(--accent-pink); color:#fff;" onclick="useTemplate('${tpl.id}')">
        ✨ Usar Este Modelo
      </button>
    `;
    container.appendChild(card);
  });
}

window.useTemplate = function(tplId) {
  const tpl = appState.templates.find((t) => t.id === tplId);
  if (!tpl) return;

  cancelEdit();
  document.getElementById('inputContent').value = tpl.data.content || '';
  if (tpl.data.embed) {
    document.getElementById('inputTitle').value = tpl.data.embed.title || '';
    document.getElementById('inputDescription').value = tpl.data.embed.description || '';
    document.getElementById('inputColor').value = tpl.data.embed.color || '#ec4899';
    document.getElementById('inputColorHex').value = tpl.data.embed.color || '#ec4899';
    document.getElementById('inputImageUrl').value = tpl.data.embed.imageUrl || '';
    document.getElementById('inputThumbnailUrl').value = tpl.data.embed.thumbnailUrl || '';
    document.getElementById('inputFooterText').value = tpl.data.embed.footerText || '';
  }

  appState.currentButtons = tpl.data.buttons ? JSON.parse(JSON.stringify(tpl.data.buttons)) : [];
  renderButtonsList();
  updateDiscordPreview();

  document.querySelector('.nav-tab[data-tab="tab-builder"]').click();
  alert(`✨ Modelo "${tpl.name}" carregado com sucesso!`);
};

// --- MENSAGENS ENVIADAS ---
function renderSentMessages() {
  const container = document.getElementById('sentMessagesList');
  if (appState.savedMessages.length === 0) {
    container.innerHTML = '<p style="font-size:14px; color:var(--text-muted);">Nenhuma mensagem enviada por aqui ainda.</p>';
    return;
  }

  container.innerHTML = '';
  appState.savedMessages.forEach((msg) => {
    const item = document.createElement('div');
    item.className = 'card';
    item.style.marginBottom = '12px';
    const dateStr = new Date(msg.createdAt).toLocaleString('pt-BR');
    const hasUndo = Array.isArray(msg.versions) && msg.versions.length > 0;

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <strong>#${msg.channelName || msg.channelId}</strong> • <span style="font-size:12px; color:var(--text-muted);">${dateStr}</span>
          <p style="font-size:13.5px; color:#fff; margin-top:4px;">${msg.embed?.title || msg.content || 'Mensagem sem título'}</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn-secondary" style="border-color:var(--accent-purple);" onclick="startEditing('${msg.recordId}')">✏️ Editar</button>
          ${hasUndo ? `<button class="btn-secondary" style="border-color:#f59e0b; color:#f59e0b;" onclick="undoMessage('${msg.recordId}')">↩️ Desfazer</button>` : ''}
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}

window.undoMessage = async function(recordId) {
  if (!confirm('Deseja realmente desfazer a última edição e restaurar a versão anterior desta mensagem no Discord?')) return;
  try {
    const res = await apiFetch(`/api/mary/messages/${recordId}/undo`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      alert('↩️ Versão anterior restaurada com sucesso no Discord!');
      loadBootstrapData();
    } else {
      alert('❌ Erro: ' + (data.error || 'Não foi possível desfazer.'));
    }
  } catch (e) {
    alert('Erro ao processar reversão.');
  }
};

// --- UPLOAD DE IMAGEM ---
async function handleFileUpload(e, targetInputId) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const res = await apiFetch('/api/mary/upload', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          fileBase64: reader.result,
        }),
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById(targetInputId).value = data.url;
        updateDiscordPreview();
        alert('✅ Imagem enviada com sucesso!');
      } else {
        alert('❌ Erro ao enviar: ' + (data.error || 'Falha no upload.'));
      }
    } catch (_) {
      alert('Erro de conexão no upload.');
    }
  };
  reader.readAsDataURL(file);
}

// --- GERADOR CANVAS DE TABELA DE PREÇOS ---
function generateCanvasPriceTable() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');

  // Fundo gradiente moderno
  const grad = ctx.createLinearGradient(0, 0, 800, 450);
  grad.addColorStop(0, '#141418');
  grad.addColorStop(1, '#2b1b3d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 450);

  // Borda neon
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 760, 410);

  // Título
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎀 TABELA DE PREÇOS • MARY STORE 🎀', 400, 70);

  ctx.fillStyle = '#a855f7';
  ctx.font = '16px Inter, sans-serif';
  ctx.fillText('Taxa de 30% do Roblox inclusa • Entrega garantida via Gamepass', 400, 100);

  // Pacotes
  const packages = [
    { robux: '100 R$', price: 'R$ 4,50' },
    { robux: '250 R$', price: 'R$ 10,00' },
    { robux: '500 R$', price: 'R$ 19,00' },
    { robux: '1.000 R$', price: 'R$ 37,00' },
    { robux: '2.000 R$', price: 'R$ 72,00' },
    { robux: '5.000 R$', price: 'R$ 175,00' },
  ];

  ctx.textAlign = 'left';
  packages.forEach((pkg, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i % 3;
    const x = col === 0 ? 60 : 430;
    const y = 160 + row * 80;

    // Card do pacote
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(x, y - 25, 310, 60);

    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText(`💎 ${pkg.robux}`, x + 16, y + 12);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(pkg.price, x + 295, y + 12);
    ctx.textAlign = 'left';
  });

  const base64 = canvas.toDataURL('image/png');
  document.getElementById('inputImageUrl').value = base64;
  updateDiscordPreview();
  alert('🎨 Imagem da Tabela de Preços gerada com sucesso e anexada no preview!');
}

// --- PERFIL E MÓDULOS ---
async function saveProfile() {
  const nick = document.getElementById('inputLocalNick').value;
  const statusLoja = document.getElementById('selectStoreStatus').value;

  try {
    const res = await apiFetch('/api/mary/bot-profile', {
      method: 'PATCH',
      body: JSON.stringify({ nick, statusLoja }),
    });
    const data = await res.json();
    if (data.success) {
      alert('✅ Perfil local salvo com sucesso!');
      loadBootstrapData();
    }
  } catch (_) {
    alert('Erro ao salvar perfil.');
  }
}

function renderModulesTab() {
  const cfg = appState.config || {};
  const flags = cfg.featureFlags || {};

  document.getElementById('flagStock').checked = Boolean(flags.stockModule);
  document.getElementById('flagPix').checked = Boolean(flags.pixModule);
  document.getElementById('flagTicket').checked = Boolean(flags.ticketModule);
  document.getElementById('flagReview').checked = Boolean(flags.reviewModule);
  document.getElementById('flagSticky').checked = Boolean(flags.stickyModule);
  document.getElementById('flagAntiLink').checked = Boolean(flags.antiLinkModule);

  document.getElementById('inputModEstoque').value = cfg.estoqueRobux || 25000;
  document.getElementById('inputModPreco').value = cfg.preco1k || 37.0;
  document.getElementById('inputModPixKey').value = cfg.pixKey || '';
}

async function saveModules() {
  const payload = {
    estoqueRobux: parseInt(document.getElementById('inputModEstoque').value, 10) || 0,
    preco1k: parseFloat(document.getElementById('inputModPreco').value) || 37.0,
    pixKey: document.getElementById('inputModPixKey').value.trim(),
    featureFlags: {
      stockModule: document.getElementById('flagStock').checked,
      pixModule: document.getElementById('flagPix').checked,
      ticketModule: document.getElementById('flagTicket').checked,
      reviewModule: document.getElementById('flagReview').checked,
      stickyModule: document.getElementById('flagSticky').checked,
      antiLinkModule: document.getElementById('flagAntiLink').checked,
    },
  };

  try {
    const res = await apiFetch('/api/mary/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      alert('✅ Configurações salvas!');
      loadBootstrapData();
    }
  } catch (_) {
    alert('Erro ao salvar módulos.');
  }
}

async function toggleStatus() {
  const current = appState.config.statusLoja || 'online';
  let next = 'fila';
  if (current === 'fila') next = 'offline';
  else if (current === 'offline') next = 'online';

  await apiFetch('/api/mary/settings', {
    method: 'PATCH',
    body: JSON.stringify({ statusLoja: next }),
  });
  loadBootstrapData();
}

// --- SEGURANÇA ---
function renderSecurityTab(data) {
  document.getElementById('activeSessionsVal').textContent = data.activeSessionsCount || 1;
  const list = document.getElementById('auditLogsList');
  list.innerHTML = '';
  (data.auditLogs || []).slice(0, 10).forEach((l) => {
    const item = document.createElement('div');
    item.style.padding = '6px 0';
    item.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
    const d = new Date(l.timestamp).toLocaleString('pt-BR');
    item.textContent = `[${d}] ${l.event} • IP: ${l.ip || 'Local'} • Aparelho: ${(l.userAgent || 'N/A').slice(0, 50)}`;
    list.appendChild(item);
  });
}

async function handleLogout() {
  await handleLogoutAll();
}

async function handleLogoutAll() {
  if (!confirm('Deseja desconectar todos os aparelhos conectados ao Estúdio?')) return;
  await apiFetch('/api/mary/auth/logout-all', { method: 'POST' });
  window.location.replace('/mary');
}

