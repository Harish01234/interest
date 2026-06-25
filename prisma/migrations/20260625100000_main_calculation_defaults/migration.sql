-- MainCalculation: add defaults for single-row upsert pattern
ALTER TABLE "main_calculation" ALTER COLUMN "TotalTobill" SET DEFAULT 0;
ALTER TABLE "main_calculation" ALTER COLUMN "interest" SET DEFAULT 0;
ALTER TABLE "main_calculation" ALTER COLUMN "Bandak" SET DEFAULT 0;
ALTER TABLE "main_calculation" ALTER COLUMN "jinisChara" SET DEFAULT 0;
ALTER TABLE "main_calculation" ALTER COLUMN "cash" SET DEFAULT 0;
