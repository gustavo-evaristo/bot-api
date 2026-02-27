/*
  Warnings:

  - You are about to drop the `kanbams` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "kanbams" DROP CONSTRAINT "kanbams_userId_fkey";

-- DropTable
DROP TABLE "kanbams";

-- CreateTable
CREATE TABLE "kanbans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanbans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "kanbans" ADD CONSTRAINT "kanbans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
