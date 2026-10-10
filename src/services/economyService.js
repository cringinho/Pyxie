const { db } = require('../database');
const { users } = require('../database/schema');
const { eq, sql } = require('drizzle-orm');

async function transferCoins(senderId, receiverId, amount) {
  if (amount <= 0 || !Number.isInteger(amount)) {
    throw new Error('QUANTIA_INVALIDA');
  }

  return await db.transaction(async (tx) => {
    const [sender] = await tx.select().from(users).where(eq(users.userId, senderId));
    if (!sender || sender.coins < amount) {
      throw new Error('SALDO_INSUFICIENTE');
    }

    await tx.update(users)
      .set({ coins: sql`${users.coins} - ${amount}` })
      .where(eq(users.userId, senderId));

    await tx.insert(users)
      .values({ userId: receiverId, coins: amount })
      .onConflictDoUpdate({
        target: users.userId,
        set: { coins: sql`${users.coins} + ${amount}` }
      });

    return { success: true, senderBalance: sender.coins - amount };
  });
}

async function getBalance(userId) {
  const [user] = await db.select().from(users).where(eq(users.userId, userId));
  if (!user) {
    await db.insert(users).values({ userId }).onConflictDoNothing();
    return { coins: 0, beans: 0 };
  }
  return { coins: user.coins, beans: user.beans };
}

module.exports = { transferCoins, getBalance };
