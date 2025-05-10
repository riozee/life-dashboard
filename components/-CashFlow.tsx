'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Wallet } from 'lucide-react';

type Transaction = {
	id: string;
	amount: number;
	type: 'income' | 'expense';
	description: string;
	date: Date;
};

type TransactionItemProps = {
	transaction: Transaction;
	onDelete: (id: string) => void;
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onDelete }) => {
	const isIncome = transaction.type === 'income';

	return (
		<div className="group relative transition-colors hover:bg-muted/50 p-2">
			<div className="flex items-center justify-between">
				<div className="flex flex-col">
					<p className={`font-normal ${isIncome ? 'text-green-200' : 'text-red-200'}`}>
						{isIncome ? '+' : '-'}¥{Math.abs(transaction.amount)}
					</p>
					<div className="flex items-center gap-1 text-xs mt-0.5">
						<span className="text-muted-foreground">
							{transaction.date.toLocaleDateString()}
						</span>
						{transaction.description && (
							<>
								<span className="text-muted-foreground">•</span>
								<span className="font-light text-muted-foreground">
									{transaction.description}
								</span>
							</>
						)}
					</div>
				</div>
			</div>

			<div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0"
					onClick={() => onDelete(transaction.id)}
				>
					<span className="sr-only">Delete</span>x
				</Button>
			</div>
		</div>
	);
};

export function CashFlow() {
	const [transactions, setTransactions] = useState<Transaction[]>([
		{
			id: '1',
			amount: 1500,
			type: 'income',
			description: 'Salary',
			date: new Date('2023-05-01'),
		},
		{
			id: '2',
			amount: 120,
			type: 'expense',
			description: 'Groceries',
			date: new Date('2023-05-02'),
		},
		{
			id: '3',
			amount: 85,
			type: 'expense',
			description: 'Electricity bill',
			date: new Date('2023-05-03'),
		},
		{
			id: '4',
			amount: 65,
			type: 'expense',
			description: 'Internet bill',
			date: new Date('2023-05-04'),
		},
		{
			id: '5',
			amount: 200,
			type: 'income',
			description: 'Freelance work',
			date: new Date('2023-05-05'),
		},
	]);

	// State for input field
	const [inputValue, setInputValue] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isBalanceHidden, setIsBalanceHidden] = useState(true);

	// Calculate dashboard metrics
	const calculateBalance = () => {
		return transactions.reduce((acc, transaction) => {
			return acc + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
		}, 0);
	};

	const calculateTodayExpense = () => {
		const today = new Date();
		return transactions
			.filter(t => t.type === 'expense' && t.date.toDateString() === today.toDateString())
			.reduce((acc, transaction) => acc + transaction.amount, 0);
	};

	const calculateTodayIncome = () => {
		const today = new Date();
		return transactions
			.filter(t => t.type === 'income' && t.date.toDateString() === today.toDateString())
			.reduce((acc, transaction) => acc + transaction.amount, 0);
	};

	const parseInput = (input: string) => {
		// Reset error message
		setErrorMessage('');

		// Check if input starts with + or -
		const match = input.match(/^([+-])(\d*\.?\d+)\s*(.*)$/);

		if (!match) {
			setErrorMessage('Format: +/-amount description');
			return null;
		}

		const [, sign, amountStr, description] = match;
		const amount = parseFloat(amountStr);

		if (isNaN(amount)) {
			setErrorMessage('Invalid amount');
			return null;
		}

		return {
			type: sign === '+' ? 'income' : ('expense' as 'income' | 'expense'),
			amount,
			description: description.trim() || (sign === '+' ? 'Income' : 'Expense'),
		};
	};

	const handleAddTransaction = () => {
		const parsed = parseInput(inputValue);

		if (!parsed) return;

		const newTransaction: Transaction = {
			id: Date.now().toString(),
			amount: parsed.amount,
			type: parsed.type,
			description: parsed.description,
			date: new Date(),
		};

		setTransactions([newTransaction, ...transactions]);
		setInputValue('');
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleAddTransaction();
		}
	};

	const handleDeleteTransaction = (id: string) => {
		setTransactions(transactions.filter(t => t.id !== id));
	};

	return (
		<div className="flex flex-col h-full">
			{/* Dashboard section */}
			<div className="bg-muted/40 p-3">
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-sm font-medium flex items-center gap-1">
						<Wallet className="h-4 w-4" />
					</h2>
					<span
						className={`text-lg font-bold ${
							isBalanceHidden ? 'blur-sm' : ''
						} cursor-pointer transition-all duration-200`}
						onClick={() => setIsBalanceHidden(!isBalanceHidden)}
						title={isBalanceHidden ? 'Show balance' : 'Hide balance'}
					>
						¥{calculateBalance().toFixed(2)}
					</span>
				</div>

				<div className="rounded-md p-2 shadow-sm">
					<div className="flex items-center justify-between">
						<span className="text-sm">Today</span>
						<span className="text-sm">
							<span className="text-red-600">
								-¥{calculateTodayExpense().toFixed(2)}
							</span>{' '}
							<span className="text-green-600">
								+¥{calculateTodayIncome().toFixed(2)}
							</span>
						</span>
					</div>
				</div>
			</div>

			<Separator />

			{/* Transactions list */}
			<div className="flex-1 overflow-y-auto">
				<ScrollArea className="h-full">
					<div className="p-1">
						{transactions.length === 0 ? (
							<div className="flex items-center justify-center h-20 text-muted-foreground">
								No transactions recorded
							</div>
						) : (
							transactions.map((transaction, index) => (
								<React.Fragment key={transaction.id}>
									<TransactionItem
										transaction={transaction}
										onDelete={handleDeleteTransaction}
									/>
									{index < transactions.length - 1 && <Separator />}
								</React.Fragment>
							))
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Input section */}
			<div className="border-t bg-background p-2">
				<div className="relative flex items-center">
					<Input
						className={`h-8 ${errorMessage ? 'border-red-500' : ''}`}
						placeholder="+/-[amount] (description)"
						value={inputValue}
						onChange={e => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
					/>
				</div>
			</div>
		</div>
	);
}
