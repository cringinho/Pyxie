import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db, sqlite } from './index.js';
import { users, wordNodes, coupleSettings } from './schema.js';
import { eq } from 'drizzle-orm';

export async function runSeed() {
  console.log('🌱 [Seed] Iniciando população do banco SQLite Nosso Universo...');

  const now = new Date().toISOString();
  const lehPass = process.env.LEH_PASSWORD || 'cringinho123';
  const maryPass = process.env.MARY_PASSWORD || 'maricota123';

  const lehHash = await bcrypt.hash(lehPass, 10);
  const maryHash = await bcrypt.hash(maryPass, 10);

  // 1. Usuários Principais
  const initialUsers = [
    {
      username: 'leh',
      displayName: 'Leandro (Cringe-san)',
      nickname: 'Cringinho',
      passwordHash: lehHash,
      avatarUrl: null,
      bannerColor: '#8B5CF6',
      bio: 'Protagonista & Psicólogo do SUS oficial da Mary',
      moodStatus: 'Apaixonado pela Maricota',
      theme: 'cyber-goth',
      updatedAt: now
    },
    {
      username: 'mary',
      displayName: 'Mary ₊˚⊹♡',
      nickname: 'Maricota',
      passwordHash: maryHash,
      avatarUrl: null,
      bannerColor: '#38BDF8',
      bio: 'Unicórnio com glitter, música e arte',
      moodStatus: 'Brilhando com glitter e amor',
      theme: 'dark-romantic',
      updatedAt: now
    }
  ];

  for (const u of initialUsers) {
    const existing = db.select().from(users).where(eq(users.username, u.username)).get();
    if (!existing) {
      db.insert(users).values(u).run();
      console.log(`  👤 Usuário '${u.username}' criado com sucesso.`);
    } else {
      // Atualiza senha/metadados caso tenham mudado no .env
      db.update(users)
        .set({
          passwordHash: u.passwordHash,
          displayName: u.displayName,
          nickname: u.nickname,
          bio: existing.bio || u.bio,
          theme: existing.theme || u.theme,
          updatedAt: now
        })
        .where(eq(users.username, u.username))
        .run();
      console.log(`  👤 Usuário '${u.username}' já existia (credenciais sincronizadas).`);
    }
  }

  // 2. Grafo de Palavras Afetivas Iniciais
  const initialWords = [
    { word: 'Cringinho', meaning: 'O boy cringe, programador e fofo', color: '#8B5CF6', iconName: 'Sparkles' },
    { word: 'Maricota', meaning: 'A princesinha gótica-fofa, rainha do universo', color: '#EC4899', iconName: 'Heart' },
    { word: 'Besties', meaning: 'Melhores amigos para toda a eternidade', color: '#F43F5E', iconName: 'Star' },
    { word: 'Promessa de Dedinho', meaning: 'Pacto inquebrável de lealdade e carinho', color: '#A855F7', iconName: 'Handshake' },
    { word: 'Boleta Rodante', meaning: 'A lendária bolinha de fofura em movimento', color: '#F59E0B', iconName: 'Cat' },
    { word: 'Kuromi', meaning: 'Estética dark cute, travessa e leal', color: '#9333EA', iconName: 'Skull' },
    { word: 'Cinnamoroll', meaning: 'Nuvinha doce, dócil e protetora', color: '#38BDF8', iconName: 'Cloud' },
    { word: 'Meu Amor', meaning: 'Sentimento maior que o universo observável', color: '#E11D48', iconName: 'HeartPulse' },
    { word: 'Protagonistas', meaning: 'Donos do enredo da própria história de amor', color: '#10B981', iconName: 'Crown' }
  ];

  const lehUser = db.select().from(users).where(eq(users.username, 'leh')).get();

  for (const item of initialWords) {
    const normalized = item.word.trim().toLowerCase();
    const existing = db.select().from(wordNodes).where(eq(wordNodes.normalizedWord, normalized)).get();
    if (!existing) {
      db.insert(wordNodes).values({
        word: item.word,
        normalizedWord: normalized,
        meaningOrNote: item.meaning,
        color: item.color,
        iconName: item.iconName,
        createdBy: lehUser ? lehUser.id : null,
        isCustom: 1,
        createdAt: now
      }).run();
      console.log(`  ✨ Palavra do grafo cadastrada: '${item.word}'`);
    }
  }

  // 3. Configurações Globais do Casal
  const existingSettings = db.select().from(coupleSettings).get();
  if (!existingSettings) {
    db.insert(coupleSettings).values({
      anniversaryDate: '2026-01-30',
      specialDatesJson: JSON.stringify([
        { title: 'Nosso Primeiro Encontro', date: '2026-01-30', icon: 'Heart' }
      ]),
      pushSubscriptionsJson: JSON.stringify([])
    }).run();
    console.log('  💍 Configurações do Casal inicializadas (Aniversário: 2026-01-30).');
  }

  console.log('🎉 [Seed] Banco SQLite populado com 100% de sucesso!');
}

// Execução direta via CLI (node server/db/seed.js)
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ [Seed] Falha na execução:', err);
      process.exit(1);
    });
}
