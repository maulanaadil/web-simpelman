-- DropForeignKey
ALTER TABLE `Deceased` DROP FOREIGN KEY `Deceased_graveyardId_fkey`;

-- AlterTable
ALTER TABLE `Deceased` MODIFY `graveyardId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Deceased` ADD CONSTRAINT `Deceased_graveyardId_fkey` FOREIGN KEY (`graveyardId`) REFERENCES `Graveyard`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
