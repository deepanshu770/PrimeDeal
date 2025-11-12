/*
  Warnings:

  - You are about to drop the column `outOfStock` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `outOfStock`,
    ADD COLUMN `unit` ENUM('g', 'kg', 'mg', 'lb', 'oz', 'ml', 'l', 'cl', 'gal', 'pcs', 'pack', 'box', 'bottle', 'can', 'jar', 'bag', 'dozen', 'pair', 'tray') NULL,
    MODIFY `netQty` VARCHAR(191) NULL;
