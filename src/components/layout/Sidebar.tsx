// src/components/layout/Sidebar.tsx - 修复版本
import React, { useState } from "react";
import {
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
	Typography,
	Box,
	Chip,
	IconButton,
	Collapse,
} from "@mui/material";
import {
	Description,
	Folder,
	Add,
	ExpandLess,
	ExpandMore,
} from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../store/hook";
import {
	setSelectedCategory,
	setSelectedTag,
	clearFilters,
} from "../../store/slices/notesSlice";
import {
	useGetCategoriesQuery,
	useGetTagsQuery,
} from "../../store/api/notesApi";
import CategoryDialog from "../CategoryDialog";
import TagDialog from "../TagDialog";

const DRAWER_WIDTH = 280;

interface SidebarProps {
	open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
	const dispatch = useAppDispatch();
	const { selectedCategoryId, selectedTagId } = useAppSelector(
		(state) => state.notes
	);

	const { data: categoriesData } = useGetCategoriesQuery();
	const { data: tagsData } = useGetTagsQuery();

	const categories = categoriesData?.data || [];
	const tags = tagsData?.data || [];

	const [categoriesExpanded, setCategoriesExpanded] = React.useState(true);
	const [tagsExpanded, setTagsExpanded] = React.useState(true);

	// 对话框状态
	const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
	const [tagDialogOpen, setTagDialogOpen] = useState(false);

	const handleCategorySelect = (categoryId: number | null) => {
		if (categoryId === selectedCategoryId) {
			dispatch(clearFilters());
		} else {
			dispatch(setSelectedCategory(categoryId));
		}
	};

	const handleTagSelect = (tagId: number | null) => {
		if (tagId === selectedTagId) {
			dispatch(clearFilters());
		} else {
			dispatch(setSelectedTag(tagId));
		}
	};

	const handleAllNotesSelect = () => {
		dispatch(clearFilters());
	};

	const handleCreateCategory = () => {
		setCategoryDialogOpen(true);
	};

	const handleCreateTag = () => {
		setTagDialogOpen(true);
	};

	const renderCategories = (categories: any[], level = 0) => {
		return categories.map((category) => (
			<React.Fragment key={category.id}>
				<ListItem disablePadding sx={{ pl: level * 2 }}>
					<ListItemButton
						selected={selectedCategoryId === category.id}
						onClick={() => handleCategorySelect(category.id)}
						sx={{
							borderRadius: 1,
							mx: 1,
							"&.Mui-selected": {
								backgroundColor: "primary.main",
								color: "white",
								"&:hover": {
									backgroundColor: "primary.dark",
								},
							},
						}}
					>
						<ListItemIcon sx={{ minWidth: 36 }}>
							<Folder
								sx={{
									color:
										selectedCategoryId === category.id ? "white" : "inherit",
								}}
							/>
						</ListItemIcon>
						<ListItemText
							primary={category.name}
							primaryTypographyProps={{ fontSize: "0.9rem" }}
						/>
						{/* 确保显示笔记数量，即使是0 */}
						<Chip
							label={category.note_count || 0}
							size="small"
							sx={{
								height: 20,
								fontSize: "0.7rem",
								backgroundColor:
									selectedCategoryId === category.id
										? "rgba(255,255,255,0.2)"
										: "action.hover",
								color:
									selectedCategoryId === category.id
										? "white"
										: "text.secondary",
							}}
						/>
					</ListItemButton>
				</ListItem>

				{category.children && category.children.length > 0 && (
					<>{renderCategories(category.children, level + 1)}</>
				)}
			</React.Fragment>
		));
	};

	return (
		<>
			<Drawer
				variant="persistent"
				anchor="left"
				open={open}
				sx={{
					width: DRAWER_WIDTH,
					flexShrink: 0,
					"& .MuiDrawer-paper": {
						width: DRAWER_WIDTH,
						boxSizing: "border-box",
						mt: "64px",
						backgroundColor: "background.paper",
						borderRight: "1px solid",
						borderColor: "divider",
					},
				}}
			>
				<Box sx={{ p: 2 }}>
					{/* 全部笔记 */}
					<List dense>
						<ListItem disablePadding>
							<ListItemButton
								selected={!selectedCategoryId && !selectedTagId}
								onClick={handleAllNotesSelect}
								sx={{
									borderRadius: 1,
									"&.Mui-selected": {
										backgroundColor: "primary.main",
										color: "white",
										"&:hover": {
											backgroundColor: "primary.dark",
										},
									},
								}}
							>
								<ListItemIcon sx={{ minWidth: 36 }}>
									<Description
										sx={{
											color:
												!selectedCategoryId && !selectedTagId
													? "white"
													: "inherit",
										}}
									/>
								</ListItemIcon>
								<ListItemText
									primary="全部笔记"
									primaryTypographyProps={{ fontWeight: 500 }}
								/>
							</ListItemButton>
						</ListItem>
					</List>

					<Divider sx={{ my: 2 }} />

					{/* 分类部分 */}
					<Box>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								mb: 1,
							}}
						>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								sx={{ fontWeight: 600 }}
							>
								分类 ({categories.length})
							</Typography>
							<Box>
								<IconButton
									size="small"
									color="primary"
									onClick={handleCreateCategory}
									title="创建分类"
								>
									<Add fontSize="small" />
								</IconButton>
								<IconButton
									size="small"
									onClick={() => setCategoriesExpanded(!categoriesExpanded)}
									title={categoriesExpanded ? "收起分类" : "展开分类"}
								>
									{categoriesExpanded ? <ExpandLess /> : <ExpandMore />}
								</IconButton>
							</Box>
						</Box>

						<Collapse in={categoriesExpanded}>
							<List dense>
								{categories.length > 0 ? (
									renderCategories(categories)
								) : (
									<ListItem>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ pl: 1 }}
										>
											暂无分类
										</Typography>
									</ListItem>
								)}
							</List>
						</Collapse>
					</Box>

					<Divider sx={{ my: 2 }} />

					{/* 标签部分 */}
					<Box>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								mb: 1,
							}}
						>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								sx={{ fontWeight: 600 }}
							>
								标签 ({tags.length})
							</Typography>
							<Box>
								<IconButton
									size="small"
									color="primary"
									onClick={handleCreateTag}
									title="创建标签"
								>
									<Add fontSize="small" />
								</IconButton>
								<IconButton
									size="small"
									onClick={() => setTagsExpanded(!tagsExpanded)}
									title={tagsExpanded ? "收起标签" : "展开标签"}
								>
									{tagsExpanded ? <ExpandLess /> : <ExpandMore />}
								</IconButton>
							</Box>
						</Box>

						<Collapse in={tagsExpanded}>
							<List dense>
								{tags.length > 0 ? (
									tags.map((tag) => (
										<ListItem key={tag.id} disablePadding>
											<ListItemButton
												selected={selectedTagId === tag.id}
												onClick={() => handleTagSelect(tag.id)}
												sx={{
													borderRadius: 1,
													mx: 1,
													"&.Mui-selected": {
														backgroundColor: "primary.main",
														color: "white",
														"&:hover": {
															backgroundColor: "primary.dark",
														},
													},
												}}
											>
												<ListItemIcon sx={{ minWidth: 36 }}>
													<Box
														sx={{
															width: 12,
															height: 12,
															borderRadius: "50%",
															backgroundColor: tag.color,
														}}
													/>
												</ListItemIcon>
												<ListItemText
													primary={tag.name}
													primaryTypographyProps={{ fontSize: "0.9rem" }}
												/>
												{/* 确保显示笔记数量，即使是0 */}
												<Chip
													label={tag.note_count || 0}
													size="small"
													sx={{
														height: 20,
														fontSize: "0.7rem",
														backgroundColor:
															selectedTagId === tag.id
																? "rgba(255,255,255,0.2)"
																: "action.hover",
														color:
															selectedTagId === tag.id
																? "white"
																: "text.secondary",
													}}
												/>
											</ListItemButton>
										</ListItem>
									))
								) : (
									<ListItem>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ pl: 1 }}
										>
											暂无标签
										</Typography>
									</ListItem>
								)}
							</List>
						</Collapse>
					</Box>
				</Box>
			</Drawer>

			{/* 分类管理对话框 */}
			<CategoryDialog
				open={categoryDialogOpen}
				onClose={() => setCategoryDialogOpen(false)}
			/>

			{/* 标签管理对话框 */}
			<TagDialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)} />
		</>
	);
};

export default Sidebar;
