import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
	Box,
	Card,
	CardContent,
	Typography,
	TextField,
	InputAdornment,
	Fab,
	Paper,
} from "@mui/material";
import {
	Search,
	Add,
	Description,
	Folder,
	Label,
	Public,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../store/hook";
import { setSearchQuery } from "../../store/slices/notesSlice";
import {
	useGetUserStatsQuery, // 移除了 useGetNotesQuery
} from "../../store/api/notesApi";
import NotesList from "../../components/NotesList";
import NoteEditor from "../../components/NoteEditor";

const Dashboard: React.FC = () => {
	const { searchQuery } = useAppSelector((state) => state.notes);
	const { user } = useAppSelector((state) => state.auth);
	const dispatch = useAppDispatch();
	const [searchParams, setSearchParams] = useSearchParams();

	const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
	const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

	// 获取用户统计数据
	const { data: statsData } = useGetUserStatsQuery();

	// 提取统计数据（不需要单独的 categories 和 tags 变量，直接使用统计接口的数据）
	const userStats = statsData?.data;

	// 处理 URL 参数中的编辑请求
	useEffect(() => {
		const editParam = searchParams.get("edit");
		if (editParam) {
			const noteId = parseInt(editParam, 10);
			if (!isNaN(noteId)) {
				setEditingNoteId(noteId);
				setIsNoteEditorOpen(true);
				// 清除 URL 参数，避免重复打开
				setSearchParams({});
			}
		}
	}, [searchParams, setSearchParams]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(setSearchQuery(event.target.value));
	};

	// 计算统计数据 - 使用真实的统计接口数据
	const stats = [
		{
			label: "全部笔记",
			value: userStats?.total_notes || 0,
			icon: Description,
			color: "#667eea",
		},
		{
			label: "分类数量",
			value: userStats?.total_categories || 0,
			icon: Folder,
			color: "#27ae60",
		},
		{
			label: "标签数量",
			value: userStats?.total_tags || 0,
			icon: Label,
			color: "#f39c12",
		},
		{
			label: "公开笔记",
			value: userStats?.public_notes || 0,
			icon: Public,
			color: "#e74c3c",
		},
	];

	const handleCreateNote = () => {
		setEditingNoteId(null);
		setIsNoteEditorOpen(true);
	};

	const handleEditNote = (noteId: number) => {
		setEditingNoteId(noteId);
		setIsNoteEditorOpen(true);
	};

	const handleCloseNoteEditor = () => {
		setIsNoteEditorOpen(false);
		setEditingNoteId(null);
		// 清除可能存在的 URL 参数
		if (searchParams.has("edit")) {
			setSearchParams({});
		}
	};

	return (
		<Box>
			{/* 欢迎区域 */}
			<Box sx={{ mb: 4 }}>
				<Typography
					variant="h4"
					component="h1"
					gutterBottom
					sx={{ fontWeight: "bold" }}
				>
					欢迎回来，{user?.username}! 👋
				</Typography>
				<Typography variant="body1" color="text.secondary">
					继续管理你的笔记，记录精彩想法
				</Typography>
			</Box>

			{/* 搜索框 */}
			<Paper sx={{ p: 2, mb: 4, backgroundColor: "background.paper" }}>
				<TextField
					fullWidth
					placeholder="搜索笔记..."
					value={searchQuery}
					onChange={handleSearchChange}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search color="action" />
							</InputAdornment>
						),
					}}
					sx={{
						"& .MuiOutlinedInput-root": {
							backgroundColor: "white",
						},
					}}
				/>
			</Paper>

			{/* 统计卡片 */}
			<Box sx={{ mb: 4 }}>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "1fr",
							sm: "repeat(2, 1fr)",
							md: "repeat(4, 1fr)",
						},
						gap: 3,
					}}
				>
					{stats.map((stat, index) => (
						<Box key={index}>
							<Card
								sx={{
									height: "100%",
									transition: "transform 0.2s ease-in-out",
									"&:hover": {
										transform: "translateY(-4px)",
									},
								}}
							>
								<CardContent>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
										}}
									>
										<Box>
											<Typography
												color="text.secondary"
												gutterBottom
												variant="body2"
											>
												{stat.label}
											</Typography>
											<Typography
												variant="h4"
												component="div"
												sx={{ fontWeight: "bold" }}
											>
												{stat.value}
											</Typography>
										</Box>
										<Box
											sx={{
												backgroundColor: stat.color,
												borderRadius: 2,
												p: 1.5,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<stat.icon sx={{ color: "white", fontSize: 24 }} />
										</Box>
									</Box>
								</CardContent>
							</Card>
						</Box>
					))}
				</Box>
			</Box>

			{/* 笔记列表 */}
			<Paper sx={{ p: 3 }}>
				<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
					📝 我的笔记
				</Typography>
				<NotesList onEditNote={handleEditNote} />
			</Paper>

			{/* 添加笔记按钮 */}
			<Fab
				color="primary"
				aria-label="add note"
				onClick={handleCreateNote}
				sx={{
					position: "fixed",
					bottom: 24,
					right: 24,
					background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
				}}
			>
				<Add />
			</Fab>

			{/* 笔记编辑器 */}
			<NoteEditor
				open={isNoteEditorOpen}
				onClose={handleCloseNoteEditor}
				noteId={editingNoteId}
			/>
		</Box>
	);
};

export default Dashboard;
