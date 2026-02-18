export interface SoilInfo {
    ph: string;
    moisture: string;
    temperature: string;
    type: string;
    notes: string;
}

export const soilDatabase: Record<string, SoilInfo> = {
    rice: {
        ph: "5.5 - 7.0",
        moisture: "High (Flooded)",
        temperature: "20°C - 35°C",
        type: "Clay or Clay Loam",
        notes: "Rice require standing water for part of its growth cycle.",
    },
    corn: {
        ph: "5.8 - 7.0",
        moisture: "Moderate",
        temperature: "18°C - 27°C",
        type: "Well-drained Loam",
        notes: "Requires nitrogen-rich soil.",
    },
    maize: {
        ph: "5.8 - 7.0",
        moisture: "Moderate",
        temperature: "18°C - 27°C",
        type: "Well-drained Loam",
        notes: "Same as corn; nitrogen-rich soil preferred.",
    },
    potato: {
        ph: "4.8 - 5.5",
        moisture: "Steady/Consistent",
        temperature: "15°C - 20°C",
        type: "Sandy Loam",
        notes: "Acidic soil helps prevent scab disease.",
    },
    wheat: {
        ph: "6.0 - 7.0",
        moisture: "Low - Moderate",
        temperature: "15°C - 25°C",
        type: "Loam or Clay Loam",
        notes: "Does not tolerate waterlogging well.",
    },
    tomato: {
        ph: "6.0 - 6.8",
        moisture: "Regular/Even",
        temperature: "20°C - 25°C",
        type: "Sandy Loam",
        notes: "Needs calcium to prevent blossom end rot.",
    },
    default: {
        ph: "6.0 - 7.0",
        moisture: "Moderate",
        temperature: "20°C - 25°C",
        type: "Loam",
        notes: "Standard agricultural soil conditions.",
    },
};

export function getSoilInfo(cropName: string): SoilInfo {
    const lower = cropName.toLowerCase();
    for (const key of Object.keys(soilDatabase)) {
        if (lower.includes(key)) {
            return soilDatabase[key];
        }
    }
    return soilDatabase.default;
}
