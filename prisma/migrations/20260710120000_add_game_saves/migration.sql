CREATE TABLE "GameSave" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "gameId" UUID NOT NULL,
  "mode" TEXT NOT NULL DEFAULT 'classic',
  "runId" UUID,
  "state" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GameSave_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GameSave_userId_gameId_mode_key" ON "GameSave"("userId", "gameId", "mode");
CREATE INDEX "GameSave_gameId_updatedAt_idx" ON "GameSave"("gameId", "updatedAt" DESC);
CREATE INDEX "GameSave_runId_idx" ON "GameSave"("runId");

ALTER TABLE "GameSave"
  ADD CONSTRAINT "GameSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GameSave"
  ADD CONSTRAINT "GameSave_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GameSave"
  ADD CONSTRAINT "GameSave_runId_fkey" FOREIGN KEY ("runId") REFERENCES "GameRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
