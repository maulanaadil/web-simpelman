/*
  Warnings:

  - Made the column `userId` on table `Deceased` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Deceased` DROP FOREIGN KEY `Deceased_userId_fkey`;

-- AlterTable
ALTER TABLE `Deceased` MODIFY `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Deceased` ADD CONSTRAINT `Deceased_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
