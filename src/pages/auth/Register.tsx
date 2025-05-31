import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
	Box,
	Card,
	CardContent,
	TextField,
	Button,
	Typography,
	Link,
	Container,
	InputAdornment,
	IconButton,
} from "@mui/material";
import {
	Person as PersonIcon,
	Email as EmailIcon,
	Lock as LockIcon,
	Visibility,
	VisibilityOff,
} from "@mui/icons-material";
import { useRegisterMutation } from "@/store/api/notesApi";
import { useAppDispatch } from "../../store/hook";
import { setCredentials } from "../../store/slices/authSlice";
import { useNotification } from "../../hooks/useNotification";

const Register: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { showSuccess, showError } = useNotification();

	const [register, { isLoading }] = useRegisterMutation();

	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleChange =
		(field: keyof typeof formData) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setFormData({ ...formData, [field]: event.target.value });
			// 清除字段错误
			if (errors[field]) {
				setErrors({ ...errors, [field]: "" });
			}
		};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.username) {
			newErrors.username = "请输入用户名";
		} else if (formData.username.length < 3) {
			newErrors.username = "用户名至少3位";
		} else if (formData.username.length > 50) {
			newErrors.username = "用户名最多50位";
		}

		if (!formData.email) {
			newErrors.email = "请输入邮箱";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "请输入有效的邮箱地址";
		}

		if (!formData.password) {
			newErrors.password = "请输入密码";
		} else if (formData.password.length < 6) {
			newErrors.password = "密码至少6位";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "请确认密码";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "两次输入的密码不一致";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			const result = await register({
				username: formData.username,
				email: formData.email,
				password: formData.password,
			}).unwrap();

			if (result.data) {
				dispatch(
					setCredentials({
						user: result.data.user,
						token: result.data.token,
					})
				);
				showSuccess("注册成功！");
				navigate("/dashboard");
			}
		} catch (error: any) {
			console.error("Register error:", error);
			const message = error.data?.message || "注册失败，请稍后重试";
			showError(message);
		}
	};

	return (
		<Container component="main" maxWidth="sm">
			<Box
				sx={{
					minHeight: "100vh",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					py: 3,
				}}
			>
				{/* Logo 和标题 */}
				<Box sx={{ textAlign: "center", mb: 4 }}>
					<Typography
						variant="h3"
						component="h1"
						gutterBottom
						sx={{ fontWeight: "bold" }}
					>
						📝 Notes
					</Typography>
					<Typography variant="h6" color="text.secondary">
						创建您的笔记账号
					</Typography>
				</Box>

				{/* 注册卡片 */}
				<Card sx={{ width: "100%", maxWidth: 400 }}>
					<CardContent sx={{ p: 4 }}>
						<Typography
							variant="h5"
							component="h2"
							gutterBottom
							sx={{ textAlign: "center", mb: 3 }}
						>
							注册账号
						</Typography>

						<Box component="form" onSubmit={handleSubmit} noValidate>
							<TextField
								fullWidth
								label="用户名"
								value={formData.username}
								onChange={handleChange("username")}
								error={!!errors.username}
								helperText={errors.username}
								margin="normal"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<PersonIcon color="action" />
										</InputAdornment>
									),
								}}
								autoComplete="username"
								autoFocus
							/>

							<TextField
								fullWidth
								label="邮箱"
								type="email"
								value={formData.email}
								onChange={handleChange("email")}
								error={!!errors.email}
								helperText={errors.email}
								margin="normal"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<EmailIcon color="action" />
										</InputAdornment>
									),
								}}
								autoComplete="email"
							/>

							<TextField
								fullWidth
								label="密码"
								type={showPassword ? "text" : "password"}
								value={formData.password}
								onChange={handleChange("password")}
								error={!!errors.password}
								helperText={errors.password}
								margin="normal"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<LockIcon color="action" />
										</InputAdornment>
									),
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												aria-label="toggle password visibility"
												onClick={() => setShowPassword(!showPassword)}
												edge="end"
											>
												{showPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
								autoComplete="new-password"
							/>

							<TextField
								fullWidth
								label="确认密码"
								type={showConfirmPassword ? "text" : "password"}
								value={formData.confirmPassword}
								onChange={handleChange("confirmPassword")}
								error={!!errors.confirmPassword}
								helperText={errors.confirmPassword}
								margin="normal"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<LockIcon color="action" />
										</InputAdornment>
									),
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												aria-label="toggle confirm password visibility"
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												edge="end"
											>
												{showConfirmPassword ? (
													<VisibilityOff />
												) : (
													<Visibility />
												)}
											</IconButton>
										</InputAdornment>
									),
								}}
								autoComplete="new-password"
							/>

							<Button
								type="submit"
								fullWidth
								variant="contained"
								size="large"
								disabled={isLoading}
								sx={{ mt: 3, mb: 2, py: 1.5 }}
							>
								{isLoading ? "注册中..." : "注册"}
							</Button>

							<Box sx={{ textAlign: "center" }}>
								<Typography variant="body2" color="text.secondary">
									已有账号？{" "}
									<Link component={RouterLink} to="/login" underline="hover">
										立即登录
									</Link>
								</Typography>
							</Box>
						</Box>
					</CardContent>
				</Card>
			</Box>
		</Container>
	);
};

export default Register;
