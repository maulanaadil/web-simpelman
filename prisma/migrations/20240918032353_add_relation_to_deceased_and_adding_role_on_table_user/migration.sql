-- AlterTable
ALTER TABLE `Deceased` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user';

-- AddForeignKey
ALTER TABLE `Deceased` ADD CONSTRAINT `Deceased_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
