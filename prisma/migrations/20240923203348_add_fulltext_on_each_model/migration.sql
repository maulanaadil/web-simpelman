-- CreateIndex
CREATE FULLTEXT INDEX `AdditionalFile_ktpUrl_idx` ON `AdditionalFile`(`ktpUrl`);

-- CreateIndex
CREATE FULLTEXT INDEX `AdditionalFile_certificateUrl_idx` ON `AdditionalFile`(`certificateUrl`);

-- CreateIndex
CREATE FULLTEXT INDEX `AdditionalFile_incapabilityCertificateUrl_idx` ON `AdditionalFile`(`incapabilityCertificateUrl`);

-- CreateIndex
CREATE FULLTEXT INDEX `AddressDetail_homeNumber_idx` ON `AddressDetail`(`homeNumber`);

-- CreateIndex
CREATE FULLTEXT INDEX `AddressDetail_homeNumber_street_idx` ON `AddressDetail`(`homeNumber`, `street`);

-- CreateIndex
CREATE FULLTEXT INDEX `AddressDetail_homeNumber_rt_idx` ON `AddressDetail`(`homeNumber`, `rt`);

-- CreateIndex
CREATE FULLTEXT INDEX `AddressDetail_homeNumber_rw_idx` ON `AddressDetail`(`homeNumber`, `rw`);

-- CreateIndex
CREATE FULLTEXT INDEX `AddressDetail_homeNumber_province_idx` ON `AddressDetail`(`homeNumber`, `province`);

-- CreateIndex
CREATE FULLTEXT INDEX `AddressDetail_homeNumber_city_idx` ON `AddressDetail`(`homeNumber`, `city`);

-- CreateIndex
CREATE FULLTEXT INDEX `AddressDetail_homeNumber_district_idx` ON `AddressDetail`(`homeNumber`, `district`);

-- CreateIndex
CREATE FULLTEXT INDEX `AddressDetail_homeNumber_neighborhood_idx` ON `AddressDetail`(`homeNumber`, `neighborhood`);

-- CreateIndex
CREATE FULLTEXT INDEX `Deceased_name_idx` ON `Deceased`(`name`);

-- CreateIndex
CREATE FULLTEXT INDEX `Deceased_name_fatherInLawName_idx` ON `Deceased`(`name`, `fatherInLawName`);

-- CreateIndex
CREATE FULLTEXT INDEX `Deceased_name_idCard_idx` ON `Deceased`(`name`, `idCard`);

-- CreateIndex
CREATE FULLTEXT INDEX `Graveyard_name_idx` ON `Graveyard`(`name`);

-- CreateIndex
CREATE FULLTEXT INDEX `Graveyard_name_address_idx` ON `Graveyard`(`name`, `address`);

-- CreateIndex
CREATE FULLTEXT INDEX `Heirs_name_idx` ON `Heirs`(`name`);

-- CreateIndex
CREATE FULLTEXT INDEX `Heirs_name_idCard_idx` ON `Heirs`(`name`, `idCard`);

-- CreateIndex
CREATE FULLTEXT INDEX `Heirs_name_phoneNumber_idx` ON `Heirs`(`name`, `phoneNumber`);

-- CreateIndex
CREATE FULLTEXT INDEX `Heirs_name_job_idx` ON `Heirs`(`name`, `job`);
