import React from "react";
import { useNavigate } from "react-router-dom";
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
	AttachFile,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../store/hook";
import { useGetNotesQuery, useDeleteNoteMutation } from "../store/api/notesApi";
import { setCurrentPage } from "../store/slices/notesSlice";
import { useNotification } from "../hooks/useNotification";
import ShareDialog from "./ShareDialog";
import AttachmentManager from "./AttachmentManager";

interface NotesListProps {
	onEditNote?: (noteId: number) => void;
}

const NotesList: React.FC<NotesListProps> = ({ onEditNote }) => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { showSuccess, showError } = useNotification();
	const { selectedCategoryId, selectedTagId, searchQuery, currentPage } =
		useAppSelector((state) => state.notes);

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [selectedNoteId, setSelectedNoteId] = React.useState<number | null>(
		null
	);
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

	const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
	const [sharingNote, setSharingNote] = React.useState<{
		id: number;
		title: string;
	} | null>(null);

	const [attachmentManagerOpen, setAttachmentManagerOpen] =
		React.useState(false);
	const [managingNoteId, setManagingNoteId] = React.useState<number | null>(
		null
	);
	const [managingNoteTitle, setManagingNoteTitle] = React.useState<string>("");

	const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

	const [shareDialogKey, setShareDialogKey] = React.useState(0);

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

	const formatViewCount = (count: number): string => {
		if (count === 0) return "0";
		if (count < 1000) return count.toString();
		if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
		if (count < 1000000) return `${Math.floor(count / 1000)}k`;
		return `${(count / 1000000).toFixed(1)}M`;
	};

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
		if (!selectedNoteId) {
			showError("未选择要删除的笔记");
			return;
		}

		if (isDeleting) {
			return;
		}

		try {
			await deleteNote(selectedNoteId).unwrap();

			showSuccess("笔记删除成功！");

			setDeleteDialogOpen(false);
			setSelectedNoteId(null);
		} catch (error: any) {
			let errorMessage = "删除失败";
			if (error?.data?.message) {
				errorMessage = error.data.message;
			} else if (error?.message) {
				errorMessage = error.message;
			} else if (error?.status) {
				switch (error.status) {
					case 404:
						errorMessage = "笔记不存在或已被删除";
						break;
					case 403:
						errorMessage = "没有权限删除此笔记";
						break;
					case 500:
						errorMessage = "服务器内部错误，请稍后重试";
						break;
					default:
						errorMessage = `删除失败 (错误码: ${error.status})`;
				}
			}

			showError(errorMessage);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setSelectedNoteId(null);
	};

	const handleShare = () => {
		if (selectedNoteId) {
			const note = notes.find((n) => n.id === selectedNoteId);
			if (note) {
				setSharingNote({ id: note.id, title: note.title });
				setShareDialogKey((prev) => prev + 1);
				setShareDialogOpen(true);
			}
		}
		handleMenuClose();
	};

	const handleManageAttachments = () => {
		if (selectedNoteId) {
			const note = notes.find((n) => n.id === selectedNoteId);
			if (note) {
				setManagingNoteId(note.id);
				setManagingNoteTitle(note.title);
				setAttachmentManagerOpen(true);
			}
		}
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
		navigate(`/notes/${noteId}`);
	};

	const noteToDelete = selectedNoteId
		? notes.find((note) => note.id === selectedNoteId)
		: null;

	if (error) {
		return (
			<Box sx={{ textAlign: "center", py: 4 }}>
				<Typography color="error">加载笔记失败</Typography>
			</Box>
		);
	}

	return (
		<Box>
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
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 1,
												flexWrap: "wrap",
											}}
										>
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
													<Typography
														variant="caption"
														color="text.secondary"
														title={`${note.view_count} 次浏览`}
													>
														{formatViewCount(note.view_count)}
													</Typography>
												</Box>
											)}
											{note.attachments && note.attachments.length > 0 && (
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 0.5,
													}}
												>
													<AttachFile
														sx={{ fontSize: 14, color: "text.secondary" }}
													/>
													<Typography
														variant="caption"
														color="text.secondary"
														title={`${note.attachments.length} 个附件`}
													>
														{note.attachments.length}
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
				<MenuItem onClick={handleManageAttachments}>
					<AttachFile sx={{ mr: 1, fontSize: 18 }} />
					附件管理
				</MenuItem>
				<MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
					<Delete sx={{ mr: 1, fontSize: 18 }} />
					删除
				</MenuItem>
			</Menu>

			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>确认删除笔记</DialogTitle>
				<DialogContent>
					{noteToDelete && (
						<Box sx={{ mb: 2 }}>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								即将删除笔记:
							</Typography>
							<Typography variant="h6" gutterBottom>
								{noteToDelete.title}
							</Typography>
						</Box>
					)}

					<Typography>确定要删除这篇笔记吗？删除后将无法恢复。</Typography>

					<Box
						sx={{ mt: 2, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}
					>
						<Typography variant="body2" color="text.secondary">
							<strong>注意：</strong>删除操作会同时删除：
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							component="ul"
							sx={{ mt: 1, pl: 2 }}
						>
							<li>笔记内容和所有元数据</li>
							<li>关联的标签和分类关系</li>
							<li>分享链接和访问记录</li>
							<li>所有附件文件</li>
						</Typography>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleDeleteCancel}
						disabled={isDeleting}
						variant="outlined"
					>
						取消
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						disabled={isDeleting}
						color="error"
						variant="contained"
						sx={{ minWidth: 100 }}
					>
						{isDeleting ? "删除中..." : "确认删除"}
					</Button>
				</DialogActions>
			</Dialog>

			<ShareDialog
				key={shareDialogKey}
				open={shareDialogOpen}
				onClose={() => {
					setShareDialogOpen(false);
					setSharingNote(null);
				}}
				noteId={sharingNote?.id || null}
				noteTitle={sharingNote?.title}
			/>

			{managingNoteId && (
				<AttachmentManager
					open={attachmentManagerOpen}
					onClose={() => {
						setAttachmentManagerOpen(false);
						setManagingNoteId(null);
						setManagingNoteTitle("");
					}}
					noteId={managingNoteId}
					noteTitle={managingNoteTitle}
				/>
			)}
		</Box>
	);
};

export default NotesList;
