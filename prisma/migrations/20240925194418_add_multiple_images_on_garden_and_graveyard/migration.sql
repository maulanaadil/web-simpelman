/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Garden` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Graveyard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Garden` DROP COLUMN `imageUrl`;

-- AlterTable
ALTER TABLE `Graveyard` DROP COLUMN `imageUrl`;

-- CreateTable
CREATE TABLE `Photo` (
    `id` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `gardenId` VARCHAR(191) NOT NULL,
    `graveyardId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    FULLTEXT INDEX `Photo_imageUrl_idx`(`imageUrl`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_gardenId_fkey` FOREIGN KEY (`gardenId`) REFERENCES `Garden`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_graveyardId_fkey` FOREIGN KEY (`graveyardId`) REFERENCES `Graveyard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
