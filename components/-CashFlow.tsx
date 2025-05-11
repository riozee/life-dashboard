'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataFetching, useMutation } from '@/hooks/use-data-fetching';
import {
	fetchTransactions,
	addTransaction,
	deleteTransaction,
	type Transaction as TransactionType,
} from '@/lib/transaction-actions';
import {
	fetchSubscriptions,
	addSubscription,
	updateSubscription,
	deleteSubscription,
	type Subscription as SubscriptionType,
} from '@/lib/subscription-actions';

// Use the types defined in the server action files
type Transaction = TransactionType;
type Subscription = SubscriptionType;

type TransactionItemProps = {
	transaction: Transaction;
	onDelete: (id: string) => void;
	isLoading: boolean;
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
	isLoading: boolean;
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
	isLoading: boolean;
};

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onDelete, isLoading }) => {
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
							{new Date(transaction.date).toDateString() === new Date().toDateString()
								? new Date(transaction.date).toLocaleTimeString(undefined, {
										hour: '2-digit',
										minute: '2-digit',
								  })
								: new Date(transaction.date).toLocaleString(undefined, {
										year:
											new Date(transaction.date).getFullYear() ===
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
					onClick={() => onDelete(transaction.id || '')}
					disabled={isLoading}
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
	isLoading,
}) => {
	return (
		<div className="group relative transition-colors hover:bg-muted/50 p-[0.01em]">
			<div className="flex flex-col">
				<div className="flex items-center gap-1">
					{editingSubscription?.id === subscription._id &&
					editingSubscription?.field === 'amount' ? (
						<Input
							className="h-6 w-16 p-1"
							value={editingSubscription.value}
							autoFocus
							onChange={e => onEdit(subscription._id || '', 'amount', e.target.value)}
							onBlur={() =>
								onSave(subscription._id || '', 'amount', editingSubscription.value)
							}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.currentTarget.blur();
								}
							}}
							disabled={isLoading}
						/>
					) : (
						<span
							className="font-bold cursor-pointer text-yellow-500"
							onClick={() =>
								!isLoading &&
								onEdit(
									subscription._id || '',
									'amount',
									subscription.amount.toString()
								)
							}
						>
							¥{subscription.amount}
						</span>
					)}
					<span className="text-muted-foreground">•</span>
					{editingSubscription?.id === subscription._id &&
					editingSubscription?.field === 'name' ? (
						<Input
							className="h-6 flex-1 p-1"
							value={editingSubscription.value}
							autoFocus
							onChange={e => onEdit(subscription._id || '', 'name', e.target.value)}
							onBlur={() =>
								onSave(subscription._id || '', 'name', editingSubscription.value)
							}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.currentTarget.blur();
								}
							}}
							disabled={isLoading}
						/>
					) : (
						<span
							className="cursor-pointer font-light"
							onClick={() =>
								!isLoading &&
								onEdit(subscription._id || '', 'name', subscription.name)
							}
						>
							{subscription.name}
						</span>
					)}
				</div>
				{editingSubscription?.id === subscription._id &&
				editingSubscription?.field === 'info' ? (
					<Input
						className="h-6 text-xs p-1 mt-1"
						value={editingSubscription.value}
						autoFocus
						onChange={e => onEdit(subscription._id || '', 'info', e.target.value)}
						onBlur={() =>
							onSave(subscription._id || '', 'info', editingSubscription.value)
						}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.currentTarget.blur();
							}
						}}
						disabled={isLoading}
					/>
				) : (
					<span
						className="text-xs text-muted-foreground cursor-pointer"
						onClick={() =>
							!isLoading && onEdit(subscription._id || '', 'info', subscription.info)
						}
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
					onClick={() => onDelete(subscription._id || '')}
					disabled={isLoading}
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
	isLoading,
}) => {
	return (
		<ScrollArea className="p-2 max-h-[40%]">
			<div className="flex flex-col border p-2">
				<div className="flex justify-between items-center">
					<span className="text-sm font-medium">
						Subscriptions{' '}
						<span className="text-yellow-500">
							(¥{subscriptions?.reduce((p, c) => p + c.amount, 0) || 0})
						</span>
					</span>
					<Button
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0"
						onClick={onAdd}
						disabled={isLoading}
					>
						<span className="sr-only">Add subscription</span>+
					</Button>
				</div>
				<div className="flex-1 overflow-y-auto mt-1 text-sm">
					{isLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
						</div>
					) : subscriptions.length === 0 ? (
						<div className="flex items-center justify-center text-muted-foreground">
							No active subscriptions
						</div>
					) : (
						<div className="space-y-2">
							{subscriptions.map(subscription => (
								<SubscriptionItem
									key={subscription._id}
									subscription={subscription}
									editingSubscription={editingSubscription}
									onEdit={onEdit}
									onSave={onSave}
									onDelete={onDelete}
									isLoading={isLoading}
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
	// State for editing
	const [editingSubscription, setEditingSubscription] = useState<{
		id: string;
		field: 'amount' | 'name' | 'info';
		value: string;
	} | null>(null);

	// State for input field
	const [inputValue, setInputValue] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isBalanceHidden, setIsBalanceHidden] = useState(true);

	// Use standardized data fetching hook for transactions
	const {
		data: transactions,
		loading: l1,
		refetch: refetchTransactions,
	} = useDataFetching<Transaction[]>(fetchTransactions, 'Failed to fetch transactions');

	// Use standardized data fetching hook for subscriptions
	const {
		data: subscriptions,
		loading: l2,
		refetch: refetchSubscriptions,
	} = useDataFetching<Subscription[]>(fetchSubscriptions, 'Failed to fetch subscriptions');

	// Use standardized mutation hooks
	const { mutate: addTransactionMutation, loading: l3 } = useMutation(addTransaction, {
		onSuccess: () => {
			refetchTransactions();
			setInputValue('');
		},
		errorMessage: 'Failed to add transaction',
	});

	const { mutate: deleteTransactionMutation, loading: l4 } = useMutation(
		(id: string) => deleteTransaction(id),
		{
			onSuccess: () => refetchTransactions(),
			errorMessage: 'Failed to delete transaction',
		}
	);

	const { mutate: addSubscriptionMutation, loading: l5 } = useMutation(addSubscription, {
		onSuccess: result => {
			if (result._id) {
				refetchSubscriptions();
				// Set the newly added subscription to edit mode
				setEditingSubscription({
					id: result._id,
					field: 'name',
					value: 'New Subscription',
				});
			}
		},
		errorMessage: 'Failed to add subscription',
	});

	const { mutate: updateSubscriptionMutation, loading: l6 } = useMutation(
		(params: { id: string; update: Partial<Subscription> }) =>
			updateSubscription(params.id, params.update),
		{
			onSuccess: () => {
				refetchSubscriptions();
				setEditingSubscription(null);
			},
			errorMessage: 'Failed to update subscription',
		}
	);

	const { mutate: deleteSubscriptionMutation, loading: l7 } = useMutation(
		(id: string) => deleteSubscription(id),
		{
			onSuccess: () => refetchSubscriptions(),
			errorMessage: 'Failed to delete subscription',
		}
	);

	// Calculate dashboard metrics
	const calculateBalance = () => {
		return (
			transactions?.reduce((acc, transaction) => {
				return (
					acc + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
				);
			}, 0) || 0
		);
	};

	const calculateTodayExpense = () => {
		if (!transactions) return 0;
		const today = new Date();
		return transactions
			.filter(
				t =>
					t.type === 'expense' && new Date(t.date).toDateString() === today.toDateString()
			)
			.reduce((acc, transaction) => acc + transaction.amount, 0);
	};

	const calculateTodayIncome = () => {
		if (!transactions) return 0;
		const today = new Date();
		return transactions
			.filter(
				t => t.type === 'income' && new Date(t.date).toDateString() === today.toDateString()
			)
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

		const newTransaction: Omit<Transaction, '_id' | 'id'> = {
			amount: parsed.amount,
			type: parsed.type,
			description: parsed.description,
			date: new Date(),
		};

		addTransactionMutation(newTransaction);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleAddTransaction();
		}
	};

	const handleDeleteTransaction = (id: string) => {
		if (!id) return;
		deleteTransactionMutation(id);
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
		if (!id) return;

		let update: Partial<Subscription> = {};

		if (field === 'amount') {
			const amount = parseFloat(value);
			if (isNaN(amount)) {
				console.error('Invalid amount');
				return;
			}
			update = { amount };
		} else {
			update = { [field]: value };
		}

		updateSubscriptionMutation({ id, update });
	};

	const handleDeleteSubscription = (id: string) => {
		if (!id) return;
		deleteSubscriptionMutation(id);
	};

	const handleAddSubscription = () => {
		const newSubscription: Omit<Subscription, '_id' | 'id'> = {
			amount: 0,
			name: 'New Subscription',
			info: 'Monthly • Due date',
		};

		addSubscriptionMutation(newSubscription);
	};

	// Overall loading state
	const isLoading = [l1, l2, l3, l4, l5, l6, l7].some(Boolean);

	return (
		<div className="flex flex-col h-full">
			{/* Dashboard section */}
			<div className="bg-muted/40 p-3">
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-sm font-medium flex items-center gap-1">
						<Wallet className="h-4 w-4" />
					</h2>
					{isLoading ? (
						<Skeleton className="h-6 w-28" />
					) : (
						<span
							className={`text-lg font-bold ${
								isBalanceHidden ? 'blur-sm' : ''
							} cursor-pointer transition-all duration-200`}
							onClick={() => setIsBalanceHidden(!isBalanceHidden)}
							title={isBalanceHidden ? 'Show balance' : 'Hide balance'}
						>
							¥{calculateBalance().toFixed(2)}
						</span>
					)}
				</div>

				<div className="flex items-center justify-between">
					<span className="text-sm">Today</span>
					{isLoading ? (
						<Skeleton className="h-5 w-32" />
					) : (
						<span className="text-sm">
							<span className="text-red-500 dark:text-red-200">
								-¥{calculateTodayExpense().toFixed(2)}
							</span>{' '}
							<span className="text-green-500 darK:text-green-200">
								+¥{calculateTodayIncome().toFixed(2)}
							</span>
						</span>
					)}
				</div>
			</div>

			<Separator />

			{/* subscription tracker */}
			<SubscriptionTracker
				subscriptions={subscriptions || []}
				editingSubscription={editingSubscription}
				onEdit={handleEditSubscription}
				onSave={handleSaveSubscription}
				onDelete={handleDeleteSubscription}
				onAdd={handleAddSubscription}
				isLoading={isLoading}
			/>

			<Separator />

			{/* Transactions list */}
			<div className="flex-1 overflow-y-auto">
				<ScrollArea className="h-full">
					<div className="p-1">
						{isLoading ? (
							<div className="space-y-2 p-2">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
							</div>
						) : !transactions || transactions.length === 0 ? (
							<div className="flex items-center justify-center h-20 text-muted-foreground">
								No transactions recorded
							</div>
						) : (
							transactions.map((transaction, index) => (
								<React.Fragment key={transaction.id}>
									<TransactionItem
										transaction={transaction}
										onDelete={handleDeleteTransaction}
										isLoading={isLoading}
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
						disabled={isLoading}
					/>
					{errorMessage && (
						<div className="absolute -top-6 left-0 text-xs text-red-500">
							{errorMessage}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
