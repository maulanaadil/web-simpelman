-- AlterTable
ALTER TABLE `Photo` ADD COLUMN `feedbackId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_feedbackId_fkey` FOREIGN KEY (`feedbackId`) REFERENCES `Feedback`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
