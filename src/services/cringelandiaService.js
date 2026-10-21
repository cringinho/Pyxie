const fs = require('node:fs');
const path = require('node:path');

const IMPACT_FILE = path.join(__dirname, '..', '..', 'data', 'cringelandiaImpact.json');

// Base inicial honrando o histórico de acolhimentos da comunidade
const BASE_HELPED_COUNT = 1420;

let impactData = {
  helpedCount: BASE_HELPED_COUNT,
  lastUpdated: new Date().toISOString(),
};

function safeAtomicWrite(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    console.error('[cringelandiaService] Erro ao gravar cringelandiaImpact.json:', err.message);
  }
}

function loadImpactData() {
  try {
    if (fs.existsSync(IMPACT_FILE)) {
      const raw = fs.readFileSync(IMPACT_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.helpedCount === 'number') {
        impactData = {
          helpedCount: Math.max(BASE_HELPED_COUNT, parsed.helpedCount),
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };
      }
    } else {
      safeAtomicWrite(IMPACT_FILE, impactData);
    }
  } catch (err) {
    console.warn('[cringelandiaService] Falha ao ler cringelandiaImpact.json:', err.message);
  }
}

loadImpactData();

// Rate limiting de cliques por IP (máximo 1 clique a cada 5 segundos por IP)
const ipClickCooldowns = new Map();

/**
 * Incrementa o contador de pessoas ajudadas
 * @param {string} ip
 * @returns {{ success: boolean, count: number }}
 */
function trackHelpClick(ip = '127.0.0.1') {
  const now = Date.now();
  const lastClick = ipClickCooldowns.get(ip) || 0;
  if (now - lastClick < 5000) {
    return { success: false, rateLimited: true, count: impactData.helpedCount };
  }
  ipClickCooldowns.set(ip, now);

  impactData.helpedCount += 1;
  impactData.lastUpdated = new Date().toISOString();
  safeAtomicWrite(IMPACT_FILE, impactData);

  return { success: true, count: impactData.helpedCount };
}

function getImpactCount() {
  return impactData.helpedCount;
}

/**
 * Diretório completo das 27 UFs do Brasil para emissão da CIPTEA (Lei 13.977/2020)
 */
const CIPTEA_STATES = [
  { uf: 'AC', state: 'Acre', organ: 'SEJDH / OCA', url: 'https://servicos.ac.gov.br', docs: 'Laudo com CID, RG/CPF, Comprovante Residência, Foto 3x4' },
  { uf: 'AL', state: 'Alagoas', organ: 'SEADES / Cidadão Alagoano', url: 'https://seades.al.gov.br', docs: 'Laudo médico, RG/CPF do titular e responsável, Foto 3x4' },
  { uf: 'AP', state: 'Amapá', organ: 'SEJUF / Fácil Amapá', url: 'https://servicos.ap.gov.br', docs: 'Laudo com CID F84, RG/CPF, Foto 3x4, Comprovante Residencial' },
  { uf: 'AM', state: 'Amazonas', organ: 'Sejusc Amazonas', url: 'https://www.sejusc.am.gov.br', docs: 'Laudo médico, RG/CPF, Comprovante de endereço, Tipo Sanguíneo' },
  { uf: 'BA', state: 'Bahia', organ: 'SJDH / SAC Digital', url: 'https://www.ba.gov.br', docs: 'Laudo médico com CRM/RQE, RG, CPF, Comprovante de Residência' },
  { uf: 'CE', state: 'Ceará', organ: 'SPS Ceará / Vapt Vupt', url: 'https://www.sps.ce.gov.br', docs: 'Laudo com CID, RG, CPF, Foto 3x4, Comprovante Residencial' },
  { uf: 'DF', state: 'Distrito Federal', organ: 'SEDES / DF Social', url: 'https://sedes.df.gov.br', docs: 'Laudo com CID, RG, CPF, Foto 3x4, Comprovante de endereço no DF' },
  { uf: 'ES', state: 'Espírito Santo', organ: 'SEADH Espírito Santo', url: 'https://seadh.es.gov.br', docs: 'Laudo com CID F84/6A02, RG/CPF, Foto 3x4, Comprovante ES' },
  { uf: 'GO', state: 'Goiás', organ: 'Secretaria de Desenvolvimento Social', url: 'https://goias.gov.br', docs: 'Laudo com CID, RG/CPF, Comprovante Goiás, Foto 3x4' },
  { uf: 'MA', state: 'Maranhão', organ: 'SEDES / Viva Procon', url: 'https://viva.procon.ma.gov.br', docs: 'Laudo com CID F84, RG, CPF, Comprovante de Residência' },
  { uf: 'MT', state: 'Mato Grosso', organ: 'SETASC Mato Grosso', url: 'https://www.setasc.mt.gov.br', docs: 'Laudo com CRM ativo, RG, CPF, Foto 3x4, Comprovante MT' },
  { uf: 'MS', state: 'Mato Grosso do Sul', organ: 'SEAD Mato Grosso do Sul', url: 'https://www.sead.ms.gov.br', docs: 'Laudo médico, RG, CPF, Comprovante Residência MS' },
  { uf: 'MG', state: 'Minas Gerais', organ: 'SEDESE / Portal Cidadão MG', url: 'https://social.mg.gov.br', docs: 'Laudo com CID-10/11, RG, CPF, Foto 3x4, Comprovante MG' },
  { uf: 'PA', state: 'Pará', organ: 'SEASTER Pará', url: 'https://www.seaster.pa.gov.br', docs: 'Laudo médico com CID, RG, CPF, Foto 3x4, Comprovante PA' },
  { uf: 'PB', state: 'Paraíba', organ: 'SEDH Paraíba', url: 'https://paraiba.pb.gov.br', docs: 'Laudo médico, RG, CPF, Foto 3x4, Comprovante Paraíba' },
  { uf: 'PR', state: 'Paraná', organ: 'SEJUF Paraná / CIPTEA Digital', url: 'https://www.justica.pr.gov.br', docs: 'Laudo com CID F84, RG/CPF, Comprovante Residência Paraná' },
  { uf: 'PE', state: 'Pernambuco', organ: 'SDSCJ Pernambuco', url: 'https://www.pe.gov.br', docs: 'Laudo médico com CRM, RG, CPF, Foto 3x4, Comprovante PE' },
  { uf: 'PI', state: 'Piauí', organ: 'SEID Piauí', url: 'https://www.sejid.pi.gov.br', docs: 'Laudo com CID, RG, CPF, Foto 3x4, Comprovante de Residência' },
  { uf: 'RJ', state: 'Rio de Janeiro', organ: 'Detran-RJ / SEASDH', url: 'https://www.detran.rj.gov.br', docs: 'Laudo com CID, RG, CPF, Foto 3x4, Comprovante Rio de Janeiro' },
  { uf: 'RN', state: 'Rio Grande do Norte', organ: 'SETHAS Rio Grande do Norte', url: 'https://www.sethas.rn.gov.br', docs: 'Laudo médico, RG, CPF, Foto 3x4, Comprovante Residência' },
  { uf: 'RS', state: 'Rio Grande do Sul', organ: 'FADERS / Governo RS', url: 'https://www.faders.rs.gov.br', docs: 'Laudo médico, RG, CPF, Foto 3x4, Comprovante Rio Grande do Sul' },
  { uf: 'RO', state: 'Rondônia', organ: 'SEAS Rondônia', url: 'https://rondonia.ro.gov.br', docs: 'Laudo com CID F84, RG, CPF, Foto 3x4, Comprovante RO' },
  { uf: 'RR', state: 'Roraima', organ: 'SETRABES Roraima', url: 'https://www.setrabes.rr.gov.br', docs: 'Laudo com CID, RG, CPF, Foto 3x4, Comprovante Roraima' },
  { uf: 'SC', state: 'Santa Catarina', organ: 'FCEE Santa Catarina', url: 'https://www.fcee.sc.gov.br', docs: 'Laudo médico, RG, CPF, Foto 3x4, Comprovante SC' },
  { uf: 'SP', state: 'São Paulo', organ: 'SEDPcD / Portal Ciptea SP', url: 'https://ciptea.sp.gov.br', docs: 'Laudo com CID F84/6A02, RG, CPF, Foto 3x4, Comprovante SP' },
  { uf: 'SE', state: 'Sergipe', organ: 'SEASC Sergipe', url: 'https://www.se.gov.br', docs: 'Laudo com CID, RG, CPF, Foto 3x4, Comprovante Sergipe' },
  { uf: 'TO', state: 'Tocantins', organ: 'SEDS Tocantins', url: 'https://www.to.gov.br', docs: 'Laudo médico com CID, RG, CPF, Foto 3x4, Comprovante Tocantins' },
];

module.exports = {
  getImpactCount,
  trackHelpClick,
  CIPTEA_STATES,
};

