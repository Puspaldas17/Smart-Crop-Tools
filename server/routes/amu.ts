import { RequestHandler } from "express";
import { ledger } from "../lib/ledger";

interface DrugLog {
  animalId: string;
  drugName: string;
  dosage: string;
  withdrawalDays: number;
  applicator: string; // 'Farmer' or 'Vet'
  treatmentDate: string;
}

// Memory store for easy lookup (in addition to ledger)
// In prod, this would be a MongoDB collection
const treatmentHistory: DrugLog[] = [];

export const logTreatment: RequestHandler = async (req, res) => {
  try {
    const { animalId, drugName, dosage, withdrawalDays, applicator } = req.body;

    if (!animalId || !drugName || !withdrawalDays) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const treatmentDate = new Date().toISOString();

    const logEntry: DrugLog = {
      animalId,
      drugName,
      dosage,
      withdrawalDays: Number(withdrawalDays),
      applicator: applicator || "Farmer",
      treatmentDate,
    };

    // 1. Add to Ledger (Blockchain)
    const block = ledger.addBlock(logEntry);

    // 2. Add to Local DB (Memory for now)
    treatmentHistory.push(logEntry);

    res.status(201).json({
      message: "Treatment logged successfully",
      blockIndex: block.index,
      blockHash: block.hash,
      withdrawalEnds: getWithdrawalEndDate(treatmentDate, Number(withdrawalDays)),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to log treatment" });
  }
};

export const getAnimalStatus: RequestHandler = async (req, res) => {
  const { animalId } = req.params;
  
  // Filter history for this animal
  const records = treatmentHistory.filter(r => r.animalId === animalId);
  
  // Check if any withdrawal period is still active
  const now = new Date();
  let isSafe = true;
  let activeWithdrawal = null;

  for (const record of records) {
    const endDate = new Date(getWithdrawalEndDate(record.treatmentDate, record.withdrawalDays));
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
