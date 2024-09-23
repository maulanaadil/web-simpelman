-- CreateIndex
CREATE FULLTEXT INDEX `Garden_name_idx` ON `Garden`(`name`);

-- CreateIndex
CREATE FULLTEXT INDEX `Garden_name_address_idx` ON `Garden`(`name`, `address`);
