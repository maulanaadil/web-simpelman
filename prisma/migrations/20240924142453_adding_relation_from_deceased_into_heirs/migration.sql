/*
  Warnings:

  - A unique constraint covering the columns `[deceasedId]` on the table `Heirs` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Heirs` ADD COLUMN `deceasedId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Heirs_deceasedId_key` ON `Heirs`(`deceasedId`);

-- AddForeignKey
ALTER TABLE `Heirs` ADD CONSTRAINT `Heirs_deceasedId_fkey` FOREIGN KEY (`deceasedId`) REFERENCES `Deceased`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
