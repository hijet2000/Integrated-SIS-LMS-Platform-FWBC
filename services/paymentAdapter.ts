
import { mockApi } from './api';

// --- Faith Coin Adapter (In-App Ledger) ---

interface FcWallet {
    id: string;
    ownerId: string;
    balance: number;
    currency: 'FCN';
}

// Mock wallet database
const wallets: { [key: string]: FcWallet } = {
    'wallet_student_1': { id: 'wallet_student_1', ownerId: 'std_1', balance: 2000.00, currency: 'FCN' },
    'wallet_student_2': { id: 'wallet_student_2', ownerId: 'std_2', balance: 50.00, currency: 'FCN' },
    'wallet_school_fees': { id: 'wallet_school_fees', ownerId: 'DEPT:SCHOOL_FEES', balance: 100000.00, currency: 'FCN' },
};

// The adapter interface that could be swapped later
interface BankAdapter {
    transfer(fromOwner: string, toOwner: string, amount: number, memo: string): Promise<{ txHash: string }>;
    getBalance(ownerId: string): Promise<number>;
}

const FaithCoinAdapter: BankAdapter = {
    async getBalance(ownerId: string): Promise<number> {
        const wallet = Object.values(wallets).find(w => w.ownerId === ownerId);
        if (!wallet) {
            // In a real scenario, we might create a wallet here (ensureWallet)
            return mockApi(0);
        }
        return mockApi(wallet.balance);
    },

    async transfer(fromOwner: string, toOwner: string, amount: number, memo: string): Promise<{ txHash: string }> {
        console.log(`FaithCoin Transfer: ${amount} from ${fromOwner} to ${toOwner} for ${memo}`);
        const fromWallet = Object.values(wallets).find(w => w.ownerId === fromOwner);
        const toWallet = Object.values(wallets).find(w => w.ownerId === toOwner);

        if (!fromWallet || !toWallet) {
            return Promise.reject({ status: 404, message: "Wallet not found" });
        }
        if (fromWallet.balance < amount) {
            return Promise.reject({ status: 400, message: "Insufficient funds" });
        }

        fromWallet.balance -= amount;
        toWallet.balance += amount;

        const txHash = `fc_tx_mock_${Date.now()}`;
        console.log(`  -> New Balances: ${fromOwner}: ${fromWallet.balance}, ${toOwner}: ${toWallet.balance}`);
        console.log(`  -> Transaction Hash: ${txHash}`);
        
        return mockApi({ txHash });
    }
};

export default FaithCoinAdapter;
