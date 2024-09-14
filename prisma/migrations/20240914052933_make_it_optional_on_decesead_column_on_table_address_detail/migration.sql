-- DropForeignKey
ALTER TABLE `AddressDetail` DROP FOREIGN KEY `AddressDetail_deceasedId_fkey`;

-- AlterTable
ALTER TABLE `AddressDetail` MODIFY `deceasedId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `AddressDetail` ADD CONSTRAINT `AddressDetail_deceasedId_fkey` FOREIGN KEY (`deceasedId`) REFERENCES `Deceased`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
