/*
  Warnings:

  - Added the required column `updated_at` to the `tb_dokumen_penghuni` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tb_kode_keluarga` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tb_persetujuan_keluarga` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."tb_dokumen_penghuni" ADD COLUMN     "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE "public"."tb_kode_keluarga" ADD COLUMN     "updated_at" TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE "public"."tb_persetujuan_keluarga" ADD COLUMN     "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL;
