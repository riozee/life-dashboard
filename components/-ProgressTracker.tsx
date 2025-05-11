'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { GripVertical, Trash } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

type Task = {
	id: string;
	title: string;
	progress: number;
	description: string;
	startDate: Date;
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

export function ProgressTracker() {
	const [tasks, setTasks] = useState<Task[]>([
		{
			id: '1',
			title: 'Complete project proposal',
			progress: 75,
			description: 'First draft completed, need to review and finalize.',
			startDate: new Date(),
		},
		{
			id: '2',
			title: 'Learn TypeScript',
			progress: 45,
			description: 'Completed basic syntax, working on advanced types.',
			startDate: new Date(),
		},
		{
			id: '3',
			title: 'Gym fitness goal',
			progress: 30,
			description: 'Currently at 65kg, target is 70kg.',
			startDate: new Date(),
		},
		{
			id: '4',
			title: 'Reading "Atomic Habits"',
			progress: 60,
			description: 'Currently on chapter 7 of 12.',
			startDate: new Date(),
		},
	]);

	const [newTaskTitle, setNewTaskTitle] = useState('');

	const handleUpdateProgress = (id: string, progress: number) => {
		setTasks(tasks.map(task => (task.id === id ? { ...task, progress } : task)));
	};

	const handleUpdateDescription = (id: string, description: string) => {
		setTasks(tasks.map(task => (task.id === id ? { ...task, description } : task)));
	};

	const handleDeleteTask = (id: string) => {
		setTasks(tasks.filter(task => task.id !== id));
	};

	const handleDragEnd = (result: DropResult) => {
		const { destination, source } = result;

		if (!destination) return;

		if (destination.droppableId === source.droppableId && destination.index === source.index) {
			return;
		}

		const newTasks = [...tasks];
		const [removed] = newTasks.splice(source.index, 1);
		newTasks.splice(destination.index, 0, removed);

		setTasks(newTasks);
	};

	const handleAddTask = () => {
		if (!newTaskTitle.trim()) return;

		const newTask: Task = {
			id: Date.now().toString(),
			title: newTaskTitle,
			progress: 0,
			description: '',
			startDate: new Date(),
		};

		setTasks([...tasks, newTask]);
		setNewTaskTitle('');
	};

	return (
		<div className="flex flex-col h-full">
			{/* Task list */}
			<div className="flex-1 overflow-y-auto">
				<ScrollArea className="h-full">
					<div className="p-2">
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId="tasks">
								{provided => (
									<div ref={provided.innerRef} {...provided.droppableProps}>
										{tasks.map((task, index) => (
											<TaskItem
												key={task.id}
												task={task}
												index={index}
												onUpdateProgress={handleUpdateProgress}
												onUpdateDescription={handleUpdateDescription}
												onDelete={handleDeleteTask}
											/>
										))}
										{provided.placeholder}
									</div>
								)}
							</Droppable>
						</DragDropContext>
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
					/>
				</div>
			</div>
		</div>
	);
}
