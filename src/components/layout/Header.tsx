import React from "react";
import {
	AppBar,
	Toolbar,
	Typography,
	Box,
	IconButton,
	Avatar,
	Menu,
	MenuItem,
	Chip,
} from "@mui/material";
import { Menu as MenuIcon, Logout, Settings } from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../../store/hook";
import { logout } from "../../store/slices/authSlice";
import { toggleSidebar } from "../../store/slices/uiSlice";

const Header: React.FC = () => {
	const { user } = useAppSelector((state) => state.auth);
	const dispatch = useAppDispatch();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = () => {
		dispatch(logout());
		handleClose();
	};

	const handleToggleSidebar = () => {
		dispatch(toggleSidebar());
	};

	return (
		<AppBar
			position="fixed"
			sx={{
				zIndex: (theme) => theme.zIndex.drawer + 1,
				background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
				boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
			}}
		>
			<Toolbar sx={{ justifyContent: "space-between" }}>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<IconButton
						color="inherit"
						aria-label="toggle sidebar"
						edge="start"
						onClick={handleToggleSidebar}
						sx={{ mr: 2 }}
					>
						<MenuIcon />
					</IconButton>

					<Typography
						variant="h6"
						component="div"
						sx={{
							fontWeight: "bold",
							fontSize: "1.5rem",
						}}
					>
						📝 Notes
					</Typography>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Chip
						label={user?.role || "user"}
						size="small"
						sx={{
							backgroundColor: "rgba(255,255,255,0.2)",
							color: "white",
							fontWeight: 500,
						}}
					/>

					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Typography
							variant="body2"
							sx={{ color: "white", fontWeight: 500 }}
						>
							{user?.username}
						</Typography>
						<IconButton
							size="large"
							aria-label="account menu"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={handleMenu}
							color="inherit"
						>
							<Avatar
								sx={{
									width: 32,
									height: 32,
									backgroundColor: "rgba(255,255,255,0.2)",
								}}
							>
								{user?.username?.charAt(0).toUpperCase()}
							</Avatar>
						</IconButton>
					</Box>
				</Box>

				<Menu
					id="menu-appbar"
					anchorEl={anchorEl}
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "right",
					}}
					keepMounted
					transformOrigin={{
						vertical: "top",
						horizontal: "right",
					}}
					open={Boolean(anchorEl)}
					onClose={handleClose}
				>
					<MenuItem onClick={handleClose}>
						<Settings sx={{ mr: 2 }} />
						设置
					</MenuItem>
					<MenuItem onClick={handleLogout}>
						<Logout sx={{ mr: 2 }} />
						退出登录
					</MenuItem>
				</Menu>
			</Toolbar>
		</AppBar>
	);
};

export default Header;
