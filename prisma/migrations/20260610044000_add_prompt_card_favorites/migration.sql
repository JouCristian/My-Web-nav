CREATE TABLE "PromptCardFavorite" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "cardId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PromptCardFavorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromptCardFavorite_userId_cardId_key" ON "PromptCardFavorite"("userId", "cardId");
CREATE INDEX "PromptCardFavorite_userId_createdAt_idx" ON "PromptCardFavorite"("userId", "createdAt");
CREATE INDEX "PromptCardFavorite_cardId_idx" ON "PromptCardFavorite"("cardId");

ALTER TABLE "PromptCardFavorite"
  ADD CONSTRAINT "PromptCardFavorite_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PromptCardFavorite"
  ADD CONSTRAINT "PromptCardFavorite_cardId_fkey"
  FOREIGN KEY ("cardId") REFERENCES "PromptCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
