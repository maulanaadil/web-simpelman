-- DropForeignKey
ALTER TABLE `Deceased` DROP FOREIGN KEY `Deceased_userId_fkey`;

-- AlterTable
ALTER TABLE `Deceased` MODIFY `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Deceased` ADD CONSTRAINT `Deceased_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
