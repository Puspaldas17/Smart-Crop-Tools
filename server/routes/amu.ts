import { RequestHandler } from "express";
import { ledger } from "../lib/ledger";

// Memory store removed in favor of DB
import { DrugLog } from "../db";

export const logTreatment: RequestHandler = async (req, res) => {
  try {
    const { animalId, drugName, dosage, withdrawalDays, applicator } = req.body;

    if (!animalId || !drugName || !withdrawalDays) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const treatmentDate = new Date().toISOString();

    const logEntry = {
      animalId,
      drugName,
      dosage,
      withdrawalDays: Number(withdrawalDays),
      applicator: applicator || "Farmer",
      treatmentDate,
    };

    // 1. Add to Ledger (Blockchain)
    const block = await ledger.addBlock(logEntry);

    // 2. Add to Local DB (Persistent)
    await DrugLog.create(logEntry);

    res.status(201).json({
      message: "Treatment logged successfully",
      blockIndex: block.index,
      blockHash: block.hash,
      withdrawalEnds: getWithdrawalEndDate(treatmentDate, Number(withdrawalDays)),
    });
  } catch (error) {
    console.error("[amu] Log error:", error);
    res.status(500).json({ error: "Failed to log treatment" });
  }
};

export const getAnimalStatus: RequestHandler = async (req, res) => {
  try {
    const { animalId } = req.params;
    
    // Filter history for this animal from DB
    const records = await DrugLog.find({ animalId });
    
    // Check if any withdrawal period is still active
    const now = new Date();
    let isSafe = true;
    let activeWithdrawal = null;

    for (const record of records) {
      // mongoose docs might be objects or docs, handle accordingly if needed
      // safe to assume record structure matches schema
      const tDate = new Date(record.treatmentDate);
      const endDate = new Date(tDate);
      endDate.setDate(endDate.getDate() + record.withdrawalDays);

      if (now < endDate) {
        isSafe = false;
        activeWithdrawal = {
          drug: record.drugName,
          endsAt: endDate.toISOString(),
        };
        break; 
      }
    }

    res.json({
      animalId,
      status: isSafe ? "SAFE" : "WITHDRAWAL_ACTIVE",
      activeWithdrawal,
      historyCount: records.length,
    });
  } catch (e) {
    console.error("[amu] Status error:", e);
    res.status(500).json({ error: "Failed to get status" });
  }
};

export const getLedger: RequestHandler = (_req, res) => {
  const isValid = ledger.isChainValid();
  res.json({
    isValid,
    chainLength: ledger.chain.length,
    blocks: ledger.chain,
  });
};

function getWithdrawalEndDate(startDate: string, days: number): string {
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
