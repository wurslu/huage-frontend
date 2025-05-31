import React from "react";
import {
	Grid,
	Card,
	CardContent,
	Typography,
	Box,
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

const Dashboard: React.FC = () => {
	const { searchQuery } = useAppSelector((state) => state.notes);
	const { user, storage } = useAppSelector((state) => state.auth);
	const dispatch = useAppDispatch();

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(setSearchQuery(event.target.value));
	};

	// 临时数据
	const stats = [
		{
			label: "全部笔记",
			value: storage?.file_count || 0,
			icon: Description,
			color: "#667eea",
		},
		{ label: "分类数量", value: 2, icon: Folder, color: "#27ae60" },
		{ label: "标签数量", value: 3, icon: Label, color: "#f39c12" },
		{ label: "公开笔记", value: 1, icon: Public, color: "#e74c3c" },
	];

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
			<Grid container spacing={3} sx={{ mb: 4 }}>
				{stats.map((stat, index) => (
					<Grid item xs={12} sm={6} md={3} key={index}>
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
					</Grid>
				))}
			</Grid>

			{/* 笔记列表占位符 */}
			<Paper sx={{ p: 4, textAlign: "center" }}>
				<Typography variant="h6" gutterBottom>
					📝 笔记列表
				</Typography>
				<Typography color="text.secondary">笔记列表功能即将推出...</Typography>
			</Paper>

			{/* 添加笔记按钮 */}
			<Fab
				color="primary"
				aria-label="add note"
				sx={{
					position: "fixed",
					bottom: 24,
					right: 24,
					background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
				}}
			>
				<Add />
			</Fab>
		</Box>
	);
};

export default Dashboard;
