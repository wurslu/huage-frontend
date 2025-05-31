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
	Typography,
	IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import {
	useCreateCategoryMutation,
	useUpdateCategoryMutation,
	useGetCategoriesQuery,
} from "../store/api/notesApi";
import { useNotification } from "../hooks/useNotification";

interface CategoryDialogProps {
	open: boolean;
	onClose: () => void;
	categoryId?: number | null;
}

interface CategoryFormData {
	name: string;
	parent_id: number | undefined;
	description: string;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
	open,
	onClose,
	categoryId,
}) => {
	const { showSuccess, showError } = useNotification();
	const [createCategory, { isLoading: isCreating }] =
		useCreateCategoryMutation();
	const [updateCategory, { isLoading: isUpdating }] =
		useUpdateCategoryMutation();

	const { data: categoriesData } = useGetCategoriesQuery();
	const categories = categoriesData?.data || [];

	const [formData, setFormData] = useState<CategoryFormData>({
		name: "",
		parent_id: undefined,
		description: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const isEditing = Boolean(categoryId);
	const isLoading = isCreating || isUpdating;

	// TODO: 如果是编辑模式，需要加载现有分类数据
	useEffect(() => {
		if (isEditing && categoryId) {
			// 这里应该获取分类详情并填充表单
			// const category = categories.find(c => c.id === categoryId);
			// if (category) {
			//   setFormData({
			//     name: category.name,
			//     parent_id: category.parent_id || undefined,
			//     description: category.description || "",
			//   });
			// }
		} else {
			// 新建模式，重置表单
			setFormData({
				name: "",
				parent_id: undefined,
				description: "",
			});
		}
		setErrors({});
	}, [isEditing, categoryId, open, categories]);

	const handleInputChange = (
		field: keyof CategoryFormData,
		value: string | number | undefined
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// 清除字段错误
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "请输入分类名称";
		} else if (formData.name.length > 100) {
			newErrors.name = "分类名称不能超过100个字符";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			const categoryData = {
				name: formData.name.trim(),
				parent_id: formData.parent_id,
				description: formData.description.trim() || undefined,
			};

			if (isEditing && categoryId) {
				await updateCategory({ id: categoryId, ...categoryData }).unwrap();
				showSuccess("分类更新成功！");
			} else {
				await createCategory(categoryData).unwrap();
				showSuccess("分类创建成功！");
			}

			onClose();
		} catch (error: any) {
			console.error("Save category error:", error);
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

	// 扁平化分类列表（排除当前编辑的分类及其子分类）
	const flattenCategories = (categories: any[], level = 0): any[] => {
		let result: any[] = [];
		categories.forEach((category) => {
			// 如果是编辑模式，排除当前分类（避免设置为自己的子分类）
			if (isEditing && category.id === categoryId) {
				return;
			}

			result.push({ ...category, level });
			if (category.children && category.children.length > 0) {
				result = result.concat(flattenCategories(category.children, level + 1));
			}
		});
		return result;
	};

	const flatCategories = flattenCategories(categories);

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
						{isEditing ? "编辑分类" : "创建分类"}
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
					{/* 分类名称 */}
					<TextField
						fullWidth
						label="分类名称"
						value={formData.name}
						onChange={(e) => handleInputChange("name", e.target.value)}
						error={!!errors.name}
						helperText={errors.name}
						placeholder="请输入分类名称..."
						autoFocus
					/>

					{/* 父分类选择 */}
					<FormControl fullWidth>
						<InputLabel>父分类</InputLabel>
						<Select
							value={formData.parent_id ?? ""}
							label="父分类"
							onChange={(e) => {
								const value = e.target.value as string | number;
								handleInputChange(
									"parent_id",
									!value || value === "" ? undefined : Number(value)
								);
							}}
						>
							<MenuItem value="">
								<em>无父分类（顶级分类）</em>
							</MenuItem>
							{flatCategories.map((category) => (
								<MenuItem key={category.id} value={category.id}>
									{"　".repeat(category.level)}
									{category.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* 分类描述 */}
					<TextField
						fullWidth
						label="分类描述"
						multiline
						rows={3}
						value={formData.description}
						onChange={(e) => handleInputChange("description", e.target.value)}
						placeholder="请输入分类描述（可选）..."
						helperText="简单描述这个分类的用途"
					/>
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

export default CategoryDialog;
