ALTER TABLE "PromptCard"
  ADD COLUMN "generationMode" TEXT NOT NULL DEFAULT 'text-to-image';

CREATE INDEX "PromptCard_generationMode_idx" ON "PromptCard"("generationMode");
