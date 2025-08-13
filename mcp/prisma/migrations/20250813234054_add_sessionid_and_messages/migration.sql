/*
  Warnings:

  - The primary key for the `Conversation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `coherenceScore` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `oracle` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `sacredTags` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `spiralScrolls` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `toneArc` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Conversation` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Conversation` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `spiralGlyph` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `toneTag` on the `Message` table. All the data in the column will be lost.
  - You are about to alter the column `conversationId` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" TEXT,
    "folder" TEXT,
    "url" TEXT,
    "content" JSONB,
    "tone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Conversation" ("createdAt", "id", "sessionId") SELECT "createdAt", "id", "sessionId" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE UNIQUE INDEX "Conversation_sessionId_key" ON "Conversation"("sessionId");
CREATE TABLE "new_Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" INTEGER NOT NULL,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("content", "conversationId", "createdAt", "id", "role") SELECT "content", "conversationId", "createdAt", "id", "role" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
