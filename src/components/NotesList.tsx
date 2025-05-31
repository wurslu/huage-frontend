import React from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	Chip,
	IconButton,
	Menu,
	MenuItem,
	Skeleton,
	Pagination,
	Stack,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from "@mui/material";
import {
	MoreVert,
	Public,
	Lock,
	Edit,
	Delete,
	Share,
	Visibility,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../store/hook";
import { useGetNotesQuery, useDeleteNoteMutation } from "../store/api/notesApi";
import { setCurrentPage } from "../store/slices/notesSlice";
import { useNotification } from "../hooks/useNotification";

interface NotesListProps {
	onEditNote?: (noteId: number) => void;
}

const NotesList: React.FC<NotesListProps> = ({ onEditNote }) => {
	const dispatch = useAppDispatch();
	const { showSuccess, showError } = useNotification();
	const { selectedCategoryId, selectedTagId, searchQuery, currentPage } =
		useAppSelector((state) => state.notes);

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [selectedNoteId, setSelectedNoteId] = React.useState<number | null>(
		null
	);
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

	const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

	// 构建查询参数
	const queryParams = {
		page: currentPage,
		limit: 20,
		...(selectedCategoryId && { category_id: selectedCategoryId }),
		...(selectedTagId && { tag_id: selectedTagId }),
		...(searchQuery && { search: searchQuery }),
		sort: "updated_at",
		order: "desc" as const,
	};

	const { data, isLoading, error } = useGetNotesQuery(queryParams);
	const notes = data?.data?.notes || [];
	const pagination = data?.data?.pagination;

	const handleMenuClick = (
		event: React.MouseEvent<HTMLElement>,
		noteId: number
	) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		setSelectedNoteId(noteId);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		setSelectedNoteId(null);
	};

	const handleEdit = () => {
		if (selectedNoteId && onEditNote) {
			onEditNote(selectedNoteId);
		}
		handleMenuClose();
	};

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
		handleMenuClose();
	};

	const handleDeleteConfirm = async () => {
		if (!selectedNoteId) return;

		try {
			await deleteNote(selectedNoteId).unwrap();
			showSuccess("笔记删除成功！");
			setDeleteDialogOpen(false);
			setSelectedNoteId(null);
		} catch (error: any) {
			console.error("Delete note error:", error);
			const message = error.data?.message || "删除失败";
			showError(message);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setSelectedNoteId(null);
	};

	const handleShare = () => {
		// TODO: 分享笔记
		console.log("Share note:", selectedNoteId);
		handleMenuClose();
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return "今天";
		if (diffDays === 2) return "昨天";
		if (diffDays <= 7) return `${diffDays} 天前`;
		return date.toLocaleDateString();
	};

	const truncateContent = (content: string, maxLength: number = 150) => {
		if (content.length <= maxLength) return content;
		return content.substring(0, maxLength) + "...";
	};

	const handlePageChange = (
		event: React.ChangeEvent<unknown>,
		value: number
	) => {
		dispatch(setCurrentPage(value));
	};

	const handleNoteClick = (noteId: number) => {
		// TODO: 打开笔记详情页面或模态框
		console.log("Open note:", noteId);
	};

	if (error) {
		return (
			<Box sx={{ textAlign: "center", py: 4 }}>
				<Typography color="error">加载笔记失败</Typography>
			</Box>
		);
	}

	return (
		<Box>
			{/* 加载状态 */}
			{isLoading && (
				<Stack spacing={2}>
					{[1, 2, 3].map((index) => (
						<Card key={index}>
							<CardContent>
								<Skeleton variant="text" width="60%" height={32} />
								<Skeleton variant="text" width="100%" />
								<Skeleton variant="text" width="80%" />
								<Box sx={{ display: "flex", gap: 1, mt: 2 }}>
									<Skeleton variant="rectangular" width={60} height={24} />
									<Skeleton variant="rectangular" width={60} height={24} />
								</Box>
							</CardContent>
						</Card>
					))}
				</Stack>
			)}

			{/* 笔记列表 */}
			{!isLoading && notes.length > 0 && (
				<Stack spacing={2}>
					{notes.map((note) => (
						<Card
							key={note.id}
							sx={{
								cursor: "pointer",
								transition: "all 0.2s ease-in-out",
								"&:hover": {
									transform: "translateY(-2px)",
									boxShadow: (theme) => theme.shadows[4],
								},
							}}
							onClick={() => handleNoteClick(note.id)}
						>
							<CardContent>
								{/* 标题行 */}
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-start",
										mb: 2,
									}}
								>
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Typography
											variant="h6"
											component="h3"
											sx={{
												fontWeight: 600,
												mb: 0.5,
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
										>
											{note.title}
										</Typography>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
											<Typography variant="caption" color="text.secondary">
												{formatDate(note.updated_at)}
											</Typography>
											<Tooltip title={note.is_public ? "公开笔记" : "私人笔记"}>
												{note.is_public ? (
													<Public
														sx={{ fontSize: 16, color: "success.main" }}
													/>
												) : (
													<Lock
														sx={{ fontSize: 16, color: "text.secondary" }}
													/>
												)}
											</Tooltip>
											{note.view_count > 0 && (
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 0.5,
													}}
												>
													<Visibility
														sx={{ fontSize: 14, color: "text.secondary" }}
													/>
													<Typography variant="caption" color="text.secondary">
														{note.view_count}
													</Typography>
												</Box>
											)}
										</Box>
									</Box>
									<IconButton
										size="small"
										onClick={(e) => handleMenuClick(e, note.id)}
									>
										<MoreVert />
									</IconButton>
								</Box>

								{/* 内容预览 */}
								{note.content && (
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{
											mb: 2,
											lineHeight: 1.6,
											display: "-webkit-box",
											WebkitLineClamp: 3,
											WebkitBoxOrient: "vertical",
											overflow: "hidden",
										}}
									>
										{truncateContent(note.content)}
									</Typography>
								)}

								{/* 分类和标签 */}
								<Box
									sx={{
										display: "flex",
										flexWrap: "wrap",
										gap: 1,
										alignItems: "center",
									}}
								>
									{note.category && (
										<Chip
											size="small"
											label={note.category.name}
											variant="outlined"
											color="primary"
											sx={{ fontSize: "0.7rem" }}
										/>
									)}
									{note.tags &&
										note.tags.map((tag) => (
											<Chip
												key={tag.id}
												size="small"
												label={tag.name}
												sx={{
													backgroundColor: tag.color + "20",
													color: tag.color,
													fontSize: "0.7rem",
													"& .MuiChip-label": {
														fontWeight: 500,
													},
												}}
											/>
										))}
								</Box>
							</CardContent>
						</Card>
					))}
				</Stack>
			)}

			{/* 空状态 */}
			{!isLoading && notes.length === 0 && (
				<Box sx={{ textAlign: "center", py: 8 }}>
					<Typography variant="h6" color="text.secondary" gutterBottom>
						📝 暂无笔记
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{searchQuery
							? "没有找到匹配的笔记"
							: selectedCategoryId || selectedTagId
							? "该分类/标签下暂无笔记"
							: "开始创建你的第一篇笔记吧！"}
					</Typography>
				</Box>
			)}

			{/* 分页 */}
			{pagination && pagination.pages > 1 && (
				<Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
					<Pagination
						count={pagination.pages}
						page={pagination.page}
						onChange={handlePageChange}
						color="primary"
						size="large"
						showFirstButton
						showLastButton
					/>
				</Box>
			)}

			{/* 操作菜单 */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleMenuClose}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			>
				<MenuItem onClick={handleEdit}>
					<Edit sx={{ mr: 1, fontSize: 18 }} />
					编辑
				</MenuItem>
				<MenuItem onClick={handleShare}>
					<Share sx={{ mr: 1, fontSize: 18 }} />
					分享
				</MenuItem>
				<MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
					<Delete sx={{ mr: 1, fontSize: 18 }} />
					删除
				</MenuItem>
			</Menu>

			{/* 删除确认对话框 */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>确认删除</DialogTitle>
				<DialogContent>
					<Typography>确定要删除这篇笔记吗？删除后将无法恢复。</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel} disabled={isDeleting}>
						取消
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						disabled={isDeleting}
						color="error"
						variant="contained"
					>
						{isDeleting ? "删除中..." : "删除"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default NotesList;
