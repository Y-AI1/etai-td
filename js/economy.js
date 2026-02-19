import { STARTING_LIVES, STARTING_GOLD } from './constants.js';
import { safeStorage } from './utils.js';

const RECORD_KEY = 'td_high_score';
const WAVE_RECORD_KEY = 'td_wave_record';

export class Economy {
    constructor() {
        this.gold = 0;
        this.partnerGold = 0; // other player's gold (display-only on client, tracked by host)
        this.lives = STARTING_LIVES;
        this.score = 0;
        this.record = Economy.getRecord();

        // One-time fresh start for wave-based system (v5)
        if (!safeStorage.getItem('td_v5_clean')) {
            for (const key of safeStorage.keys()) {
                if (key.startsWith('td_')) safeStorage.removeItem(key);
            }
            safeStorage.setItem('td_v5_clean', '1');
        }
    }

    canAfford(cost) {
        return this.gold >= cost;
    }

    spendGold(amount) {
        this.gold -= amount;
    }

    addGold(amount) {
        this.gold += amount;
    }

    addScore(points) {
        this.score += points;
        if (this.score > this.record) {
            this.record = this.score;
            safeStorage.setItem(RECORD_KEY, this.record);
        }
    }

    loseLives(count) {
        this.lives = Math.max(0, this.lives - count);
    }

    startReset() {
        this.gold = STARTING_GOLD;
        this.partnerGold = 0;
        this.lives = STARTING_LIVES;
        this.score = 0;
        this.record = Economy.getRecord();
    }

    reset() {
        this.gold = 0;
        this.partnerGold = 0;
        this.lives = STARTING_LIVES;
        this.score = 0;
        this.record = Economy.getRecord();
    }

    static getRecord() {
        return parseInt(safeStorage.getItem(RECORD_KEY)) || 0;
    }

    static clearRecord() {
        safeStorage.removeItem(RECORD_KEY);
    }

    static getWaveRecord(mapId) {
        const data = JSON.parse(safeStorage.getItem(WAVE_RECORD_KEY) || '{}');
        return mapId ? (data[mapId] || 0) : data;
    }

    static setWaveRecord(mapId, wave) {
        const data = JSON.parse(safeStorage.getItem(WAVE_RECORD_KEY) || '{}');
        if (wave > (data[mapId] || 0)) {
            data[mapId] = wave;
            safeStorage.setItem(WAVE_RECORD_KEY, JSON.stringify(data));
        }
    }

    static getBestRecord() {
        const data = JSON.parse(safeStorage.getItem(WAVE_RECORD_KEY) || '{}');
        let best = 0;
        for (const wave of Object.values(data)) {
            if (wave > best) best = wave;
        }
        return best;
    }
}
