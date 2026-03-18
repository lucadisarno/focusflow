/*
  Warnings:

  - You are about to drop the column `completed` on the `tasks` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "completed",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO';
