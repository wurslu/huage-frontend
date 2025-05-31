import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Box,
	Typography,
	IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import {
	useCreateTagMutation,
	useUpdateTagMutation,
	useGetTagsQuery,
} from "../store/api/notesApi";
import { useNotification } from "../hooks/useNotification";

interface TagDialogProps {
	open: boolean;
	onClose: () => void;
	tagId?: number | null;
}

interface TagFormData {
	name: string;
	color: string;
}

// 预设颜色选项
const PRESET_COLORS = [
	"#1976d2", // 蓝色
	"#388e3c", // 绿色
	"#f57c00", // 橙色
	"#d32f2f", // 红色
	"#7b1fa2", // 紫色
	"#303f9f", // 深蓝
	"#689f38", // 浅绿
	"#f9a825", // 黄色
	"#c2185b", // 粉红
	"#5d4037", // 棕色
	"#455a64", // 蓝灰
	"#424242", // 灰色
];

const TagDialog: React.FC<TagDialogProps> = ({ open, onClose, tagId }) => {
	const { showSuccess, showError } = useNotification();
	const [createTag, { isLoading: isCreating }] = useCreateTagMutation();
	const [updateTag, { isLoading: isUpdating }] = useUpdateTagMutation();

	const { data: tagsData } = useGetTagsQuery();
	const tags = tagsData?.data || [];

	const [formData, setFormData] = useState<TagFormData>({
		name: "",
		color: "#1976d2",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const isEditing = Boolean(tagId);
	const isLoading = isCreating || isUpdating;

	// 修复 useEffect 依赖，避免无限更新
	useEffect(() => {
		if (isEditing && tagId) {
			// 这里应该获取标签详情并填充表单
			const tag = tags.find((t) => t.id === tagId);
			if (tag) {
				setFormData({
					name: tag.name,
					color: tag.color,
				});
			}
		} else if (open) {
			// 新建模式，重置表单（只在对话框打开时重置）
			setFormData({
				name: "",
				color: "#1976d2",
			});
		}
		setErrors({});
	}, [isEditing, tagId, open, tags]); // 移除 tags 依赖，避免无限更新

	const handleInputChange = (field: keyof TagFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// 清除字段错误
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "请输入标签名称";
		} else if (formData.name.length > 50) {
			newErrors.name = "标签名称不能超过50个字符";
		}

		if (!formData.color) {
			newErrors.color = "请选择标签颜色";
		} else if (!/^#[0-9A-F]{6}$/i.test(formData.color)) {
			newErrors.color = "请输入有效的颜色代码";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			const tagData = {
				name: formData.name.trim(),
				color: formData.color,
			};

			if (isEditing && tagId) {
				await updateTag({ id: tagId, ...tagData }).unwrap();
				showSuccess("标签更新成功！");
			} else {
				await createTag(tagData).unwrap();
				showSuccess("标签创建成功！");
			}

			onClose();
		} catch (error: any) {
			console.error("Save tag error:", error);
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

	const handleColorSelect = (color: string) => {
		handleInputChange("color", color);
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography variant="h6">
						{isEditing ? "编辑标签" : "创建标签"}
					</Typography>
					<IconButton onClick={handleClose} disabled={isLoading}>
						<Close />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent dividers>
				<Box
					component="form"
					sx={{ display: "flex", flexDirection: "column", gap: 3 }}
				>
					{/* 标签名称 */}
					<TextField
						fullWidth
						label="标签名称"
						value={formData.name}
						onChange={(e) => handleInputChange("name", e.target.value)}
						error={!!errors.name}
						helperText={errors.name}
						placeholder="请输入标签名称..."
						autoFocus
					/>

					{/* 颜色选择 */}
					<Box>
						<Typography variant="subtitle2" gutterBottom>
							选择标签颜色
						</Typography>

						{/* 颜色预览 */}
						<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: 2,
									backgroundColor: formData.color,
									border: "2px solid #e0e0e0",
								}}
							/>
							<Typography variant="body2" color="text.secondary">
								当前颜色: {formData.color}
							</Typography>
						</Box>

						{/* 预设颜色选择 - 使用 flex 布局替代 Grid */}
						<Box
							sx={{
								display: "flex",
								flexWrap: "wrap",
								gap: 1,
								mb: 2,
							}}
						>
							{PRESET_COLORS.map((color) => (
								<Box
									key={color}
									sx={{
										width: 32,
										height: 32,
										borderRadius: 1,
										backgroundColor: color,
										cursor: "pointer",
										border:
											formData.color === color
												? "3px solid #1976d2"
												: "2px solid #e0e0e0",
										transition: "transform 0.2s",
										"&:hover": {
											transform: "scale(1.1)",
										},
									}}
									onClick={() => handleColorSelect(color)}
								/>
							))}
						</Box>

						{/* 自定义颜色输入 */}
						<TextField
							fullWidth
							label="自定义颜色"
							value={formData.color}
							onChange={(e) => handleInputChange("color", e.target.value)}
							error={!!errors.color}
							helperText={errors.color || "格式: #RRGGBB"}
							placeholder="#1976d2"
							inputProps={{ maxLength: 7 }}
						/>
					</Box>
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
					}}
				>
					{isLoading ? "保存中..." : isEditing ? "更新" : "创建"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default TagDialog;
