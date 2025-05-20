'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { GripVertical, Trash } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
	fetchTasks,
	addTask,
	updateTask,
	deleteTask,
	updateTaskOrders,
} from '@/app/life-dashboard/lib/task-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useDataFetching, useMutation } from '@/app/life-dashboard/use-data-fetching';

export type Task = {
	id: string;
	title: string;
	progress: number;
	description: string;
	startDate: Date;
	order: number;
};

interface TaskItemProps {
	task: Task;
	index: number;
	onUpdateProgress: (id: string, progress: number) => void;
	onUpdateDescription: (id: string, description: string) => void;
	onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
	task,
	index,
	onUpdateProgress,
	onUpdateDescription,
	onDelete,
}) => {
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [descriptionValue, setDescriptionValue] = useState(task.description);

	const handleEditDescription = () => {
		setIsEditingDescription(true);
	};

	const handleSaveDescription = () => {
		onUpdateDescription(task.id, descriptionValue);
		setIsEditingDescription(false);
	};

	const getProgressColor = (progress: number) => {
		if (progress < 25) return 'text-red-500';
		if (progress < 50) return 'text-orange-500';
		if (progress < 75) return 'text-yellow-500';
		return 'text-green-500';
	};

	const getDaysSinceStart = (startDate: Date) => {
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - new Date(startDate).getTime());
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		return diffDays === 0
			? 'Started today'
			: `Started ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
	};

	return (
		<Draggable draggableId={task.id} index={index}>
			{provided => (
				<div
					className="group relative rounded-md border mb-2 p-2"
					ref={provided.innerRef}
					{...provided.draggableProps}
				>
					<div className="flex items-center gap-2">
						<div
							{...provided.dragHandleProps}
							className="cursor-grab hover:text-primary"
						>
							<GripVertical size={16} />
						</div>
						<h3 className="text-sm font-medium flex-1">{task.title}</h3>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
							onClick={() => onDelete(task.id)}
						>
							<Trash className="h-4 w-4" />
						</Button>
					</div>

					<div className="mt-2">
						<div className="flex items-center gap-2">
							<div className="flex-1">
								<Slider
									defaultValue={[task.progress]}
									max={100}
									step={1}
									value={[task.progress]}
									onValueChange={values => onUpdateProgress(task.id, values[0])}
									className="w-full"
								/>
							</div>
							<span
								className={`text-xs font-medium w-9 text-right ${getProgressColor(
									task.progress
								)}`}
							>
								{task.progress}%
							</span>
						</div>

						<div className="mt-2">
							{isEditingDescription ? (
								<div className="space-y-1">
									<Textarea
										value={descriptionValue}
										onChange={e => setDescriptionValue(e.target.value)}
										className="h-16 text-xs resize-none"
										placeholder="Description..."
									/>
									<div className="flex justify-end">
										<Button
											size="sm"
											className="h-6 text-xs px-2"
											onClick={handleSaveDescription}
										>
											Save
										</Button>
									</div>
								</div>
							) : (
								<div
									className="text-xs text-muted-foreground cursor-pointer px-1 py-0.5 hover:bg-muted/50 rounded"
									onClick={handleEditDescription}
								>
									{task.description || 'Add description...'}
								</div>
							)}
						</div>

						<div className="mt-2 text-[0.5em] text-muted-foreground">
							{getDaysSinceStart(task.startDate)}
						</div>
					</div>
				</div>
			)}
		</Draggable>
	);
};

// Loading skeleton component
const TasksSkeleton = () => {
	return (
		<div className="space-y-2">
			{[1, 2, 3].map(i => (
				<div key={i} className="rounded-md border mb-2 p-2 animate-pulse">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-gray-200 rounded"></div>
						<Skeleton className="h-5 w-full" />
					</div>
					<div className="mt-2">
						<Skeleton className="h-4 w-full" />
						<div className="mt-2">
							<Skeleton className="h-16 w-full" />
						</div>
						<div className="mt-2">
							<Skeleton className="h-3 w-24" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export function ProgressTracker() {
	const [newTaskTitle, setNewTaskTitle] = useState('');

	// Use our standardized data fetching hook
	const {
		data: tasksDataRaw,
		loading: l1,
		refetch: refetchTasks,
	} = useDataFetching<Task[]>(fetchTasks, 'Failed to load tasks');

	// Convert string dates to Date objects, similar to Notes.tsx
	const tasksData = tasksDataRaw
		? tasksDataRaw.map(task => ({
				...task,
				startDate: new Date(
					task.startDate instanceof Date ? task.startDate : task.startDate
				),
		  }))
		: [];

	// Use standardized mutation hooks for CRUD operations
	const { mutate: addTaskMutation, loading: l2 } = useMutation(addTask, {
		onSuccess: () => {
			refetchTasks();
			setNewTaskTitle('');
		},
		errorMessage: 'Failed to add task',
	});

	const { mutate: updateTaskMutation, loading: l3 } = useMutation(
		(params: { id: string; progress?: number; description?: string }) =>
			updateTask(params.id, {
				progress: params.progress,
				description: params.description,
			}),
		{
			onSuccess: () => refetchTasks(),
			errorMessage: 'Failed to update task',
		}
	);

	const { mutate: deleteTaskMutation, loading: l4 } = useMutation(
		(id: string) => deleteTask(id),
		{
			onSuccess: () => refetchTasks(),
			errorMessage: 'Failed to delete task',
		}
	);

	const { mutate: updateTaskOrdersMutation, loading: l5 } = useMutation(
		(taskOrders: Array<{ id: string; order: number }>) => updateTaskOrders(taskOrders),
		{
			onSuccess: () => refetchTasks(),
			errorMessage: 'Failed to update task order',
		}
	);

	const handleUpdateProgress = (id: string, progress: number) => {
		updateTaskMutation({ id, progress });
	};

	const handleUpdateDescription = (id: string, description: string) => {
		updateTaskMutation({ id, description });
	};

	const handleDeleteTask = (id: string) => {
		deleteTaskMutation(id);
	};

	const handleDragEnd = (result: DropResult) => {
		const { destination, source } = result;

		if (
			!destination ||
			(destination.droppableId === source.droppableId && destination.index === source.index)
		) {
			return;
		}

		// Create a new array of tasks in the new order
		const reorderedTasks = [...tasksData];
		const [removed] = reorderedTasks.splice(source.index, 1);
		reorderedTasks.splice(destination.index, 0, removed);

		// Update order values for all tasks based on their new positions
		const taskOrders = reorderedTasks.map((task, index) => ({
			id: task.id,
			order: index,
		}));

		// Update task orders in database
		updateTaskOrdersMutation(taskOrders);
	};

	const handleAddTask = () => {
		if (!newTaskTitle.trim()) return;

		const newTaskData = {
			title: newTaskTitle,
			progress: 0,
			description: '',
			startDate: new Date(),
			order: tasksData.length, // Assign the next order number
		};

		addTaskMutation(newTaskData);
	};

	return (
		<div className="flex flex-col h-full">
			{/* Task list */}
			<div className="flex-1 overflow-y-auto">
				<ScrollArea className="h-full">
					<div className="p-2">
						{[l1, l2, l3, l4, l5].some(Boolean) ? (
							<TasksSkeleton />
						) : (
							<DragDropContext onDragEnd={handleDragEnd}>
								<Droppable droppableId="tasks">
									{provided => (
										<div ref={provided.innerRef} {...provided.droppableProps}>
											{[...tasksData]
												.sort((a, b) => a.order - b.order)
												.map((task, index) => (
													<TaskItem
														key={task.id}
														task={task}
														index={index}
														onUpdateProgress={handleUpdateProgress}
														onUpdateDescription={
															handleUpdateDescription
														}
														onDelete={handleDeleteTask}
													/>
												))}
											{provided.placeholder}
										</div>
									)}
								</Droppable>
							</DragDropContext>
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Add task section */}
			<div className="border-t bg-background p-2">
				<div className="flex gap-2">
					<Input
						value={newTaskTitle}
						onChange={e => setNewTaskTitle(e.target.value)}
						placeholder="New task title..."
						className="h-8 text-sm"
						onKeyDown={e => {
							if (e.key === 'Enter') handleAddTask();
						}}
						disabled={[l1, l2, l3, l4, l5].some(Boolean)}
					/>
				</div>
			</div>
		</div>
	);
}
