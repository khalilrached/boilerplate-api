/*
  Warnings:

  - You are about to drop the column `type` on the `games` table. All the data in the column will be lost.
  - Added the required column `description` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `games` DROP COLUMN `type`,
    ADD COLUMN `description` VARCHAR(191) NOT NULL;
