CREATE TABLE "Game" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "displayName" TEXT,
  "currentVersion" TEXT NOT NULL DEFAULT '1.0.0',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GameRun" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" TEXT,
  "gameId" UUID NOT NULL,
  "mode" TEXT NOT NULL DEFAULT 'classic',
  "score" INTEGER NOT NULL DEFAULT 0,
  "maxTile" INTEGER,
  "movesCount" INTEGER NOT NULL DEFAULT 0,
  "durationMs" INTEGER NOT NULL DEFAULT 0,
  "seed" TEXT,
  "moveSequence" JSONB,
  "finalBoard" JSONB,
  "metadata" JSONB,
  "gameVersion" TEXT NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "suspicious" BOOLEAN NOT NULL DEFAULT false,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GameRun_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");
CREATE INDEX "GameRun_gameId_mode_score_idx" ON "GameRun"("gameId", "mode", "score" DESC);
CREATE INDEX "GameRun_userId_gameId_createdAt_idx" ON "GameRun"("userId", "gameId", "createdAt" DESC);
CREATE INDEX "GameRun_finishedAt_idx" ON "GameRun"("finishedAt" DESC);
CREATE INDEX "GameRun_verified_idx" ON "GameRun"("verified");
CREATE INDEX "GameRun_suspicious_idx" ON "GameRun"("suspicious");

ALTER TABLE "GameRun"
  ADD CONSTRAINT "GameRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GameRun"
  ADD CONSTRAINT "GameRun_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GameRun"
  ADD CONSTRAINT "GameRun_score_check" CHECK ("score" >= 0);

ALTER TABLE "GameRun"
  ADD CONSTRAINT "GameRun_movesCount_check" CHECK ("movesCount" >= 0);

ALTER TABLE "GameRun"
  ADD CONSTRAINT "GameRun_durationMs_check" CHECK ("durationMs" >= 0);

INSERT INTO "Game" ("slug", "name", "displayName", "currentVersion", "isActive")
VALUES ('2048', '2048', '2048 / NUMBER COLLISION', '1.0.0', true)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "displayName" = EXCLUDED."displayName",
  "currentVersion" = EXCLUDED."currentVersion",
  "isActive" = EXCLUDED."isActive";
