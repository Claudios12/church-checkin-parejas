-- AlterTable: add documentId to Parent
ALTER TABLE "Parent" ADD COLUMN "documentId" TEXT;

-- CreateIndex
CREATE INDEX "Parent_documentId_idx" ON "Parent"("documentId");
