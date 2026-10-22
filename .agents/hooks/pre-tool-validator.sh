#!/usr/bin/env bash
# ==============================================================================
# Pyxie - Guardrail PreToolUse do agente (Antigravity)
# Lê o payload JSON da chamada de ferramenta via stdin e responde em stdout com
# { "allow_tool": true } ou { "allow_tool": false, "deny_reason": "..." }.
# Sempre termina com código 0 para não derrubar o runtime do agente.
# ==============================================================================

input_json=$(cat)

# 1. Extrair arquivo alvo e conteúdo proposto (jq -> node -> fallback bruto)
if command -v jq >/dev/null 2>&1; then
  target_file=$(printf '%s' "$input_json" | jq -r '.toolCall.args.TargetFile // empty' 2>/dev/null)
  code_content=$(printf '%s' "$input_json" | jq -r '(.toolCall.args.CodeContent // .toolCall.args.ReplacementContent // (.toolCall.args.ReplacementChunks | tostring)) // empty' 2>/dev/null)
elif command -v node >/dev/null 2>&1; then
  target_file=$(printf '%s' "$input_json" | node -e '
    let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
      try { process.stdout.write(String(JSON.parse(s).toolCall.args.TargetFile || "")); } catch (e) {}
    });')
  code_content=$(printf '%s' "$input_json" | node -e '
    let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
      try {
        const a = JSON.parse(s).toolCall.args || {};
        const c = a.CodeContent || a.ReplacementContent || (a.ReplacementChunks ? JSON.stringify(a.ReplacementChunks) : "");
        process.stdout.write(String(c));
      } catch (e) {}
    });')
else
  target_file=$(printf '%s' "$input_json" | grep -oE '"TargetFile"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n 1 | cut -d'"' -f4)
  code_content="$input_json"
fi

# Normaliza separadores do Windows (E:\botMelody\src\...) para comparação
target_norm="${target_file//\\//}"

deny() {
  printf '{\n  "allow_tool": false,\n  "deny_reason": "%s"\n}\n' "$1"
  exit 0
}

# 2. Regra 1: arquivos NOVOS do núcleo global não podem nascer com nome de tenant em texto exibido.
#    Constantes de infraestrutura (CRINGELANDIA_GUILD_ID, sem acento) continuam permitidas,
#    assim como arquivos existentes, cringelandiaService.js e o módulo mary-studio.
if [[ "$target_norm" == *"/src/commands/"* || "$target_norm" == *"/src/services/"* || "$target_norm" == *"/src/utils/"* || "$target_norm" == *"/src/modules/"* ]] \
  && [[ "$target_norm" != *"/src/modules/mary-studio/"* && "$target_norm" != *"cringelandiaService"* ]] \
  && [[ -n "$target_file" && ! -e "$target_file" ]]; then
  if printf '%s' "$code_content" | grep -qiE "cringelândia|lojinha da mary|est[uú]dio da mary"; then
    deny "VIOLACAO DE ARQUITETURA MULTI-TENANT: novos arquivos do nucleo global nao podem exibir 'Cringelandia' ou 'Mary'. Use guild?.name ?? 'Pyxie', isole em src/modules/mary-studio/ ou src/services/cringelandiaService.js, ou roteie por CRINGELANDIA_GUILD_ID."
  fi
fi

# 3. Regra 2: proibir mocks, placeholders e TODOs no código de produção
if [[ "$target_norm" == *"/src/"* || "$target_norm" == *"/public/"* || "$target_norm" == *"/client/src/"* || "$target_norm" == *"/server.js" || "$target_norm" == *"/index.js" ]] \
  && [[ "$target_norm" != *"/tests/"* ]]; then
  if printf '%s' "$code_content" | grep -qE "mockData|MOCK_DATA|placeholderData|TODO:[[:space:]]*implement|FIXME:[[:space:]]*connect"; then
    deny "VIOLACAO DA POLITICA ZERO-MOCK: proibido gravar dados simulados (mockData/placeholderData) ou implementacoes incompletas (TODO: implement). Conecte ao PostgreSQL via Drizzle (src/database/) ou aos arquivos atomicos em data/."
  fi
fi

# 4. Regra 3: Components V2 não aceita content/embeds no mesmo payload
if printf '%s' "$code_content" | grep -q "IsComponentsV2"; then
  if printf '%s' "$code_content" | grep -qE "embeds[[:space:]]*:|content[[:space:]]*:"; then
    deny "ERRO DE API DISCORD COMPONENTS V2: com MessageFlags.IsComponentsV2 os campos content e embeds sao rejeitados. Use TextDisplayBuilder e ContainerBuilder dentro de components."
  fi
fi

# 5. Tudo certo
printf '{\n  "allow_tool": true\n}\n'
exit 0
