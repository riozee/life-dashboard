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

type Subscription = {
	id: string;
	amount: number;
	name: string;
	info: string;
};

type TransactionItemProps = {
	transaction: Transaction;
	onDelete: (id: string) => void;
};

type SubscriptionItemProps = {
	subscription: Subscription;
	editingSubscription: {
		id: string;
		field: 'amount' | 'name' | 'info';
		value: string;
	} | null;
	onEdit: (id: string, field: 'amount' | 'name' | 'info', value: string) => void;
	onSave: (id: string, field: 'amount' | 'name' | 'info', value: string) => void;
	onDelete: (id: string) => void;
};

type SubscriptionTrackerProps = {
	subscriptions: Subscription[];
	editingSubscription: {
		id: string;
		field: 'amount' | 'name' | 'info';
		value: string;
	} | null;
	onEdit: (id: string, field: 'amount' | 'name' | 'info', value: string) => void;
	onSave: (id: string, field: 'amount' | 'name' | 'info', value: string) => void;
	onDelete: (id: string) => void;
	onAdd: () => void;
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onDelete }) => {
	const isIncome = transaction.type === 'income';

	return (
		<div className="group relative transition-colors hover:bg-muted/50 p-[0.2em]">
			<div className="flex items-center justify-between">
				<div className="flex flex-col">
					<p
						className={`font-normal ${
							isIncome
								? 'text-green-500 dark:text-green-200'
								: 'text-red-500 dark:text-red-200'
						}`}
					>
						{isIncome ? '+' : '-'}¥{Math.abs(transaction.amount)}
					</p>
					<div className="flex items-center gap-1 text-xs">
						<span className="text-muted-foreground">
							{transaction.date.toDateString() === new Date().toDateString()
								? transaction.date.toLocaleTimeString(undefined, {
										hour: '2-digit',
										minute: '2-digit',
								  })
								: transaction.date.toLocaleString(undefined, {
										year:
											transaction.date.getFullYear() ===
											new Date().getFullYear()
												? undefined
												: 'numeric',
										month: '2-digit',
										day: '2-digit',
										hour: '2-digit',
										minute: '2-digit',
								  })}
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

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({
	subscription,
	editingSubscription,
	onEdit,
	onSave,
	onDelete,
}) => {
	return (
		<div className="group relative transition-colors hover:bg-muted/50 p-[0.01em]">
			<div className="flex flex-col">
				<div className="flex items-center gap-1">
					{editingSubscription?.id === subscription.id &&
					editingSubscription?.field === 'amount' ? (
						<Input
							className="h-6 w-16 p-1"
							value={editingSubscription.value}
							autoFocus
							onChange={e => onEdit(subscription.id, 'amount', e.target.value)}
							onBlur={() =>
								onSave(subscription.id, 'amount', editingSubscription.value)
							}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.currentTarget.blur();
								}
							}}
						/>
					) : (
						<span
							className="font-bold cursor-pointer text-yellow-500"
							onClick={() =>
								onEdit(subscription.id, 'amount', subscription.amount.toString())
							}
						>
							¥{subscription.amount}
						</span>
					)}
					<span className="text-muted-foreground">•</span>
					{editingSubscription?.id === subscription.id &&
					editingSubscription?.field === 'name' ? (
						<Input
							className="h-6 flex-1 p-1"
							value={editingSubscription.value}
							autoFocus
							onChange={e => onEdit(subscription.id, 'name', e.target.value)}
							onBlur={() =>
								onSave(subscription.id, 'name', editingSubscription.value)
							}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.currentTarget.blur();
								}
							}}
						/>
					) : (
						<span
							className="cursor-pointer font-light"
							onClick={() => onEdit(subscription.id, 'name', subscription.name)}
						>
							{subscription.name}
						</span>
					)}
				</div>
				{editingSubscription?.id === subscription.id &&
				editingSubscription?.field === 'info' ? (
					<Input
						className="h-6 text-xs p-1 mt-1"
						value={editingSubscription.value}
						autoFocus
						onChange={e => onEdit(subscription.id, 'info', e.target.value)}
						onBlur={() => onSave(subscription.id, 'info', editingSubscription.value)}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.currentTarget.blur();
							}
						}}
					/>
				) : (
					<span
						className="text-xs text-muted-foreground cursor-pointer"
						onClick={() => onEdit(subscription.id, 'info', subscription.info)}
					>
						{subscription.info}
					</span>
				)}
			</div>
			<div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0"
					onClick={() => onDelete(subscription.id)}
				>
					<span className="sr-only">Delete</span>x
				</Button>
			</div>
		</div>
	);
};

const SubscriptionTracker: React.FC<SubscriptionTrackerProps> = ({
	subscriptions,
	editingSubscription,
	onEdit,
	onSave,
	onDelete,
	onAdd,
}) => {
	return (
		<ScrollArea className="p-2 max-h-[40%]">
			<div className="flex flex-col border p-2">
				<div className="flex justify-between items-center">
					<span className="text-sm font-medium">
						Subscriptions{' '}
						<span className="text-yellow-500">
							(¥{subscriptions.reduce((p, c) => p + c.amount, 0)})
						</span>
					</span>
					<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onAdd}>
						<span className="sr-only">Add subscription</span>+
					</Button>
				</div>
				<div className="flex-1 overflow-y-auto mt-1 text-sm">
					{subscriptions.length === 0 ? (
						<div className="flex items-center justify-center text-muted-foreground">
							No active subscriptions
						</div>
					) : (
						<div className="space-y-2">
							{subscriptions.map(subscription => (
								<SubscriptionItem
									key={subscription.id}
									subscription={subscription}
									editingSubscription={editingSubscription}
									onEdit={onEdit}
									onSave={onSave}
									onDelete={onDelete}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</ScrollArea>
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

	const [subscriptions, setSubscriptions] = useState<Subscription[]>([
		{
			id: '1',
			amount: 14.99,
			name: 'Netflix',
			info: 'Monthly • Due on 15th',
		},
		{
			id: '2',
			amount: 9.99,
			name: 'Spotify',
			info: 'Monthly • Due on 22nd',
		},
	]);

	const [editingSubscription, setEditingSubscription] = useState<{
		id: string;
		field: 'amount' | 'name' | 'info';
		value: string;
	} | null>(null);

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

	const handleEditSubscription = (
		id: string,
		field: 'amount' | 'name' | 'info',
		value: string
	) => {
		setEditingSubscription({ id, field, value });
	};

	const handleSaveSubscription = (
		id: string,
		field: 'amount' | 'name' | 'info',
		value: string
	) => {
		if (field === 'amount') {
			const amount = parseFloat(value);
			if (!isNaN(amount)) {
				setSubscriptions(subscriptions.map(s => (s.id === id ? { ...s, amount } : s)));
			}
		} else {
			setSubscriptions(subscriptions.map(s => (s.id === id ? { ...s, [field]: value } : s)));
		}
		setEditingSubscription(null);
	};

	const handleDeleteSubscription = (id: string) => {
		setSubscriptions(subscriptions.filter(s => s.id !== id));
	};

	const handleAddSubscription = () => {
		const newSubscription = {
			id: Date.now().toString(),
			amount: 0,
			name: 'New Subscription',
			info: 'Monthly • Due date',
		};
		setSubscriptions([...subscriptions, newSubscription]);
		setEditingSubscription({
			id: newSubscription.id,
			field: 'name',
			value: newSubscription.name,
		});
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

				<div className="flex items-center justify-between">
					<span className="text-sm">Today</span>
					<span className="text-sm">
						<span className="text-red-500 dark:text-red-200">
							-¥{calculateTodayExpense().toFixed(2)}
						</span>{' '}
						<span className="text-green-500 darK:text-green-200">
							+¥{calculateTodayIncome().toFixed(2)}
						</span>
					</span>
				</div>
			</div>

			<Separator />

			{/* subscription tracker */}
			<SubscriptionTracker
				subscriptions={subscriptions}
				editingSubscription={editingSubscription}
				onEdit={handleEditSubscription}
				onSave={handleSaveSubscription}
				onDelete={handleDeleteSubscription}
				onAdd={handleAddSubscription}
			/>

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
