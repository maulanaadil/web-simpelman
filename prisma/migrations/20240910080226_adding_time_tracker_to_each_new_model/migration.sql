/*
  Warnings:

  - Added the required column `updatedAt` to the `AdditionalFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AddressDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Deceased` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Graveyard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Heirs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `AdditionalFile` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `AddressDetail` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Deceased` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Graveyard` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Heirs` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
