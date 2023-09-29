/*
  Warnings:

  - You are about to drop the column `editeur` on the `games` table. All the data in the column will be lost.
  - Added the required column `editor` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `games` DROP COLUMN `editeur`,
    ADD COLUMN `editor` VARCHAR(191) NOT NULL;
