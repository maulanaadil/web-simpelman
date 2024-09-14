-- CreateTable
CREATE TABLE `Graveyard` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `mapsUrl` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `type` ENUM('biasa', 'tumpang', 'covid') NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `religion` VARCHAR(191) NOT NULL,
    `additionalInfo` JSON NOT NULL,
    `numberOfGrave` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deceased` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `fatherInLawName` VARCHAR(191) NOT NULL,
    `idCard` VARCHAR(191) NOT NULL,
    `Gender` ENUM('male', 'female') NOT NULL,
    `placeOfBirth` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `dateOfDeath` DATETIME(3) NOT NULL,
    `burialDate` DATETIME(3) NOT NULL,
    `graveyardId` VARCHAR(191) NOT NULL,
    `additionalInfo` JSON NOT NULL,

    UNIQUE INDEX `Deceased_idCard_key`(`idCard`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Heirs` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `idCard` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `job` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Heirs_idCard_key`(`idCard`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AddressDetail` (
    `id` VARCHAR(191) NOT NULL,
    `homeNumber` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `rt` VARCHAR(191) NOT NULL,
    `rw` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `neighborhood` VARCHAR(191) NOT NULL,
    `deceasedId` VARCHAR(191) NOT NULL,
    `heirsId` VARCHAR(191) NULL,

    UNIQUE INDEX `AddressDetail_deceasedId_key`(`deceasedId`),
    UNIQUE INDEX `AddressDetail_heirsId_key`(`heirsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdditionalFile` (
    `id` VARCHAR(191) NOT NULL,
    `ktpUrl` VARCHAR(191) NULL,
    `certificateUrl` VARCHAR(191) NULL,
    `incapabilityCertificateUrl` VARCHAR(191) NULL,
    `deceasedId` VARCHAR(191) NULL,
    `heirsId` VARCHAR(191) NULL,

    UNIQUE INDEX `AdditionalFile_deceasedId_key`(`deceasedId`),
    UNIQUE INDEX `AdditionalFile_heirsId_key`(`heirsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Deceased` ADD CONSTRAINT `Deceased_graveyardId_fkey` FOREIGN KEY (`graveyardId`) REFERENCES `Graveyard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AddressDetail` ADD CONSTRAINT `AddressDetail_deceasedId_fkey` FOREIGN KEY (`deceasedId`) REFERENCES `Deceased`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AddressDetail` ADD CONSTRAINT `AddressDetail_heirsId_fkey` FOREIGN KEY (`heirsId`) REFERENCES `Heirs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdditionalFile` ADD CONSTRAINT `AdditionalFile_deceasedId_fkey` FOREIGN KEY (`deceasedId`) REFERENCES `Deceased`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdditionalFile` ADD CONSTRAINT `AdditionalFile_heirsId_fkey` FOREIGN KEY (`heirsId`) REFERENCES `Heirs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
