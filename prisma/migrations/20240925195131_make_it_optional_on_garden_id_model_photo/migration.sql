-- DropForeignKey
ALTER TABLE `Photo` DROP FOREIGN KEY `Photo_gardenId_fkey`;

-- DropForeignKey
ALTER TABLE `Photo` DROP FOREIGN KEY `Photo_graveyardId_fkey`;

-- AlterTable
ALTER TABLE `Photo` MODIFY `gardenId` VARCHAR(191) NULL,
    MODIFY `graveyardId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_gardenId_fkey` FOREIGN KEY (`gardenId`) REFERENCES `Garden`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_graveyardId_fkey` FOREIGN KEY (`graveyardId`) REFERENCES `Graveyard`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
