/*
  Warnings:

  - You are about to drop the column `allergies` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `specialNeeds` on the `Child` table. All the data in the column will be lost.
  - Added the required column `age` to the `Child` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Child" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "familyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Child_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Child" ("createdAt", "familyId", "firstName", "id", "lastName") SELECT "createdAt", "familyId", "firstName", "id", "lastName" FROM "Child";
DROP TABLE "Child";
ALTER TABLE "new_Child" RENAME TO "Child";
CREATE INDEX "Child_familyId_idx" ON "Child"("familyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
