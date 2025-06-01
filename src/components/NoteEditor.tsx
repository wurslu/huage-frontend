// src/components/NoteEditor.tsx - 增强版本，集成附件功能
import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Chip,
	OutlinedInput,
	SelectChangeEvent,
	Switch,
	FormControlLabel,
	Typography,
	Divider,
	IconButton,
	Tabs,
	Tab,
	Badge,
	Paper,
} from "@mui/material";
import { Close, AttachFile, CloudUpload } from "@mui/icons-material";
import {
	useCreateNoteMutation,
	useUpdateNoteMutation,
	useGetCategoriesQuery,
	useGetTagsQuery,
	useGetNoteByIdQuery,
	useGetAttachmentsQuery,
} from "../store/api/notesApi";
import { useNotification } from "../hooks/useNotification";
import FileUpload from "./FileUpload";
import AttachmentList from "./AttatchmentList";

interface NoteEditorProps {
	open: boolean;
	onClose: () => void;
	noteId?: number | null;
}

interface NoteFormData {
	title: string;
	content: string;
	content_type: "markdown" | "html";
	category_id: number | undefined;
	tag_ids: number[];
	is_public: boolean;
}

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`editor-tabpanel-${index}`}
			aria-labelledby={`editor-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ height: "100%" }}>{children}</Box>}
		</div>
	);
}

const NoteEditor: React.FC<NoteEditorProps> = ({ open, onClose, noteId }) => {
	const { showSuccess, showError } = useNotification();
	const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
	const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();

	const { data: categoriesData } = useGetCategoriesQuery();
	const { data: tagsData } = useGetTagsQuery();

	// 获取要编辑的笔记数据
	const { data: noteData } = useGetNoteByIdQuery(noteId || 0, {
		skip: !noteId,
	});

	// 获取附件数据
	const { data: attachmentsData, refetch: refetchAttachments } =
		useGetAttachmentsQuery(noteId || 0, {
			skip: !noteId,
		});

	const categories = categoriesData?.data || [];
	const tags = tagsData?.data || [];
	const attachments = attachmentsData?.data || [];

	const [formData, setFormData] = useState<NoteFormData>({
		title: "",
		content: "",
		content_type: "markdown",
		category_id: undefined,
		tag_ids: [],
		is_public: false,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [tabValue, setTabValue] = useState(0);

	const isEditing = Boolean(noteId);
	const isLoading = isCreating || isUpdating;

	// 当对话框打开或笔记数据变化时，填充表单
	useEffect(() => {
		if (open) {
			if (isEditing && noteData?.data) {
				const note = noteData.data;
				setFormData({
					title: note.title,
					content: note.content,
					content_type: note.content_type as "markdown" | "html",
					category_id: note.category_id || undefined,
					tag_ids: note.tags?.map((tag) => tag.id) || [],
					is_public: note.is_public,
				});
			} else if (!isEditing) {
				setFormData({
					title: "",
					content: "",
					content_type: "markdown",
					category_id: undefined,
					tag_ids: [],
					is_public: false,
				});
			}
			setErrors({});
			setTabValue(0); // 重置到第一个标签页
		}
	}, [open, isEditing, noteData]);

	const handleInputChange = (
		field: keyof NoteFormData,
		value: string | number | boolean | number[] | undefined
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleTagChange = (event: SelectChangeEvent<number[]>) => {
		const value = event.target.value;
		handleInputChange("tag_ids", typeof value === "string" ? [] : value);
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.title.trim()) {
			newErrors.title = "请输入笔记标题";
		} else if (formData.title.length > 255) {
			newErrors.title = "标题不能超过255个字符";
		}

		if (!formData.content.trim()) {
			newErrors.content = "请输入笔记内容";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			const requestData = {
				title: formData.title.trim(),
				content: formData.content.trim(),
				content_type: formData.content_type,
				category_id: formData.category_id || undefined,
				tag_ids: formData.tag_ids,
				is_public: formData.is_public,
			};

			if (isEditing && noteId) {
				await updateNote({
					id: noteId,
					...requestData,
				}).unwrap();
				showSuccess("笔记更新成功！");
			} else {
				await createNote(requestData).unwrap();
				showSuccess("笔记创建成功！");
			}

			onClose();
		} catch (error: any) {
			console.error("Save note error:", error);
			const message =
				error.data?.message || (isEditing ? "更新失败" : "创建失败");
			showError(message);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			onClose();
		}
	};

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleUploadSuccess = () => {
		refetchAttachments();
		showSuccess("文件上传成功！");
	};

	const handleDeleteAttachment = () => {
		refetchAttachments();
	};

	// 扁平化分类列表
	const flattenCategories = (categories: any[], level = 0): any[] => {
		let result: any[] = [];
		categories.forEach((category) => {
			result.push({ ...category, level });
			if (category.children && category.children.length > 0) {
				result = result.concat(flattenCategories(category.children, level + 1));
			}
		});
		return result;
	};

	const flatCategories = flattenCategories(categories);

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="lg"
			fullWidth
			PaperProps={{
				sx: { minHeight: "85vh", maxHeight: "85vh" },
			}}
		>
			<DialogTitle>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography variant="h6">
						{isEditing ? "编辑笔记" : "创建笔记"}
					</Typography>
					<IconButton onClick={handleClose} disabled={isLoading}>
						<Close />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent dividers sx={{ p: 0, display: "flex", height: "100%" }}>
				{/* 左侧：笔记编辑区 */}
				<Box sx={{ flex: 1, p: 3, borderRight: "1px solid #e0e0e0" }}>
					<Box
						component="form"
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 3,
							height: "100%",
						}}
					>
						{/* 标题 */}
						<TextField
							fullWidth
							label="笔记标题"
							value={formData.title}
							onChange={(e) => handleInputChange("title", e.target.value)}
							error={!!errors.title}
							helperText={errors.title}
							placeholder="请输入笔记标题..."
							autoFocus
						/>

						{/* 分类和标签选择 */}
						<Box sx={{ display: "flex", gap: 2 }}>
							<FormControl sx={{ minWidth: 200 }}>
								<InputLabel>分类</InputLabel>
								<Select
									value={formData.category_id || ""}
									label="分类"
									onChange={(e) => {
										const value = e.target.value as string | number;
										handleInputChange(
											"category_id",
											!value || value === "" ? undefined : Number(value)
										);
									}}
								>
									<MenuItem value="">
										<em>无分类</em>
									</MenuItem>
									{flatCategories.map((category) => (
										<MenuItem key={category.id} value={category.id}>
											{"　".repeat(category.level)}
											{category.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<FormControl sx={{ minWidth: 200, flex: 1 }}>
								<InputLabel>标签</InputLabel>
								<Select
									multiple
									value={formData.tag_ids}
									onChange={handleTagChange}
									input={<OutlinedInput label="标签" />}
									renderValue={(selected) => (
										<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
											{selected.map((value) => {
												const tag = tags.find((t) => t.id === value);
												return (
													<Chip
														key={value}
														label={tag?.name}
														size="small"
														sx={{
															backgroundColor: tag?.color + "20",
															color: tag?.color,
														}}
													/>
												);
											})}
										</Box>
									)}
								>
									{tags.map((tag) => (
										<MenuItem key={tag.id} value={tag.id}>
											<Box
												sx={{ display: "flex", alignItems: "center", gap: 1 }}
											>
												<Box
													sx={{
														width: 12,
														height: 12,
														borderRadius: "50%",
														backgroundColor: tag.color,
													}}
												/>
												{tag.name}
											</Box>
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Box>

						{/* 内容类型和公开设置 */}
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<FormControl sx={{ minWidth: 120 }}>
								<InputLabel>内容类型</InputLabel>
								<Select
									value={formData.content_type}
									label="内容类型"
									onChange={(e) =>
										handleInputChange(
											"content_type",
											e.target.value as "markdown" | "html"
										)
									}
								>
									<MenuItem value="markdown">Markdown</MenuItem>
									<MenuItem value="html">HTML</MenuItem>
								</Select>
							</FormControl>

							<FormControlLabel
								control={
									<Switch
										checked={formData.is_public}
										onChange={(e) =>
											handleInputChange("is_public", e.target.checked)
										}
										color="primary"
									/>
								}
								label="公开笔记"
							/>
						</Box>

						{/* 内容编辑器 */}
						<TextField
							fullWidth
							label="笔记内容"
							multiline
							rows={12}
							value={formData.content}
							onChange={(e) => handleInputChange("content", e.target.value)}
							error={!!errors.content}
							helperText={errors.content || "支持 Markdown 语法"}
							placeholder={
								formData.content_type === "markdown"
									? "请输入笔记内容... 支持 Markdown 语法"
									: "请输入笔记内容... HTML 格式"
							}
							sx={{
								flex: 1,
								"& .MuiInputBase-input": {
									fontFamily: "Monaco, Consolas, 'Courier New', monospace",
									fontSize: "14px",
									lineHeight: 1.6,
								},
							}}
						/>

						{/* 快速附件操作栏 */}
						<Paper
							variant="outlined"
							sx={{
								p: 2,
								backgroundColor: "#f8f9fa",
								border: "2px dashed #e0e0e0",
								cursor: "pointer",
								"&:hover": {
									borderColor: "primary.main",
									backgroundColor: "action.hover",
								},
							}}
							onClick={() => setTabValue(1)}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
								<CloudUpload sx={{ color: "text.secondary" }} />
								<Typography variant="body2" color="text.secondary">
									点击管理附件，或拖拽文件到右侧附件区
								</Typography>
								{isEditing && attachments.length > 0 && (
									<Chip
										label={`${attachments.length} 个附件`}
										size="small"
										color="primary"
										variant="outlined"
									/>
								)}
							</Box>
						</Paper>
					</Box>
				</Box>

				{/* 右侧：附件管理区 */}
				<Box sx={{ width: 350, display: "flex", flexDirection: "column" }}>
					<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
						<Tabs value={tabValue} onChange={handleTabChange}>
							<Tab label="预览" />
							<Tab
								label={
									<Badge
										badgeContent={isEditing ? attachments.length : 0}
										color="primary"
									>
										附件
									</Badge>
								}
							/>
						</Tabs>
					</Box>

					<TabPanel value={tabValue} index={0}>
						<Box sx={{ p: 2, height: "calc(85vh - 200px)", overflow: "auto" }}>
							<Typography variant="subtitle2" gutterBottom>
								笔记预览
							</Typography>
							<Paper
								variant="outlined"
								sx={{ p: 2, backgroundColor: "#f8f9fa" }}
							>
								<Typography variant="h6" gutterBottom>
									{formData.title || "未命名笔记"}
								</Typography>
								<Typography
									variant="body2"
									sx={{ whiteSpace: "pre-wrap", mb: 2 }}
								>
									{formData.content || "暂无内容..."}
								</Typography>

								{isEditing && attachments.length > 0 && (
									<>
										<Divider sx={{ my: 2 }} />
										<Typography variant="subtitle2" gutterBottom>
											附件 ({attachments.length})
										</Typography>
										<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
											{attachments.map((attachment) => (
												<Chip
													key={attachment.id}
													label={attachment.original_filename}
													size="small"
													icon={<AttachFile />}
													variant="outlined"
												/>
											))}
										</Box>
									</>
								)}
							</Paper>
						</Box>
					</TabPanel>

					<TabPanel value={tabValue} index={1}>
						<Box sx={{ p: 2, height: "calc(85vh - 200px)", overflow: "auto" }}>
							{isEditing && noteId ? (
								<>
									<Typography variant="subtitle2" gutterBottom>
										附件管理 ({attachments.length})
									</Typography>

									{/* 文件上传组件 */}
									<Box sx={{ mb: 3 }}>
										<FileUpload
											noteId={noteId}
											onUploadSuccess={handleUploadSuccess}
											maxFileSize={50}
											multiple={true}
										/>
									</Box>

									{/* 附件列表 */}
									{attachments.length > 0 && (
										<AttachmentList
											attachments={attachments}
											onDelete={handleDeleteAttachment}
											viewMode="list"
											showActions={true}
										/>
									)}
								</>
							) : (
								<Box sx={{ textAlign: "center", py: 4 }}>
									<CloudUpload
										sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
									/>
									<Typography variant="body2" color="text.secondary">
										请先保存笔记，然后可以添加附件
									</Typography>
								</Box>
							)}
						</Box>
					</TabPanel>
				</Box>
			</DialogContent>

			<DialogActions sx={{ p: 3 }}>
				<Button onClick={handleClose} disabled={isLoading} variant="outlined">
					取消
				</Button>
				<Button
					onClick={handleSubmit}
					disabled={isLoading}
					variant="contained"
					sx={{
						background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
						minWidth: 100,
					}}
				>
					{isLoading ? "保存中..." : isEditing ? "更新" : "创建"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default NoteEditor;
