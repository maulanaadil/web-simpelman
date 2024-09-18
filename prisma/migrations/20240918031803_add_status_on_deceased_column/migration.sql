-- AlterTable
ALTER TABLE `Deceased` ADD COLUMN `status` ENUM('terverifikasi', 'belum_terverifikasi') NULL DEFAULT 'belum_terverifikasi';
