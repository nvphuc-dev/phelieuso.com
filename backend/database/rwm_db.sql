-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th3 12, 2026 lúc 03:11 AM
-- Phiên bản máy phục vụ: 10.4.24-MariaDB
-- Phiên bản PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `rwm_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('seller','buyer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'seller',
  `note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bonus_rate` decimal(5,2) NOT NULL DEFAULT 0.00 COMMENT '% thưởng cuối năm tính trên tổng doanh thu',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `customers`
--

INSERT INTO `customers` (`id`, `tenant_id`, `name`, `phone`, `address`, `type`, `note`, `bonus_rate`, `created_at`, `updated_at`) VALUES
(3, 3, 'Mợ Tâm', '0932652296', 'Hẽm C3, Phạm Hùng', 'seller', NULL, '10.00', '2026-03-11 03:41:59', '2026-03-11 07:24:38'),
(4, 3, 'Chị Tâm (A.Đức)', '0908777111', 'Hẽm C3, Phạm Hùng', 'seller', NULL, '10.00', '2026-03-11 03:42:45', '2026-03-11 07:24:32'),
(5, 3, 'Cậu Tánh', '0702443345', 'Hẽm C3, Phạm Hùng', 'seller', NULL, '10.00', '2026-03-11 03:43:33', '2026-03-11 07:24:16'),
(6, 3, 'Chị Ba', '0908123456', 'C4 Phạm Hùng', 'seller', NULL, '12.00', '2026-03-11 03:43:58', '2026-03-11 07:24:25'),
(7, 3, 'Nhà Máy Giấy ABC', '0909888777', 'Nguyễn Văn Linh', 'buyer', NULL, '0.00', '2026-03-11 03:56:11', '2026-03-11 07:25:07'),
(8, 3, 'Nhà Máy Sắt XYZ', '0909888999', 'Vĩnh Lộc', 'buyer', NULL, '0.00', '2026-03-11 03:56:44', '2026-03-11 07:25:02');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory`
--

CREATE TABLE `inventory` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `material_id` bigint(20) UNSIGNED NOT NULL,
  `total_weight` decimal(12,3) NOT NULL DEFAULT 0.000,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `inventory`
--

INSERT INTO `inventory` (`id`, `tenant_id`, `material_id`, `total_weight`, `updated_at`) VALUES
(1, 3, 1, '0.500', '2026-03-11 02:28:57'),
(2, 3, 4, '90.000', '2026-03-11 07:35:21'),
(3, 3, 5, '70.000', '2026-03-11 02:39:55'),
(4, 3, 2, '21.000', '2026-03-11 07:34:57'),
(6, 3, 3, '10.000', '2026-03-11 08:59:07'),
(7, 3, 6, '0.000', '2026-03-11 07:34:57');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory_logs`
--

CREATE TABLE `inventory_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `material_id` bigint(20) UNSIGNED NOT NULL,
  `reference_type` enum('purchase','sale') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint(20) UNSIGNED NOT NULL,
  `change_weight` decimal(12,3) NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `inventory_logs`
--

INSERT INTO `inventory_logs` (`id`, `tenant_id`, `material_id`, `reference_type`, `reference_id`, `change_weight`, `note`, `created_at`) VALUES
(1, 3, 1, 'purchase', 1, '0.500', 'Purchase #1', NULL),
(2, 3, 4, 'purchase', 2, '45.000', 'Purchase #2', NULL),
(3, 3, 5, 'purchase', 2, '70.000', 'Purchase #2', NULL),
(4, 3, 2, 'purchase', 2, '21.000', 'Purchase #2', NULL),
(6, 3, 3, 'purchase', 4, '1.000', 'Purchase #4', NULL),
(7, 3, 4, 'purchase', 4, '25.000', 'Purchase #4', NULL),
(8, 3, 2, 'purchase', 4, '15.000', 'Purchase #4', NULL),
(9, 3, 4, 'purchase', 4, '20.000', 'Purchase #4', NULL),
(10, 3, 6, 'purchase', 4, '5.000', 'Purchase #4', NULL),
(11, 3, 4, 'sale', 2, '-90.000', 'Sale #2', NULL),
(12, 3, 3, 'purchase', 5, '10.000', 'Purchase #5', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `materials`
--

CREATE TABLE `materials` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'kg',
  `default_purchase_price` decimal(15,2) DEFAULT NULL,
  `default_sale_price` decimal(15,2) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `materials`
--

INSERT INTO `materials` (`id`, `tenant_id`, `name`, `unit`, `default_purchase_price`, `default_sale_price`, `description`, `created_at`, `updated_at`) VALUES
(1, 3, 'Nhôm lon', 'kg', '27000.00', '30000.00', 'Lon bia, nước ngọt', '2026-03-11 02:27:50', '2026-03-11 03:44:38'),
(2, 3, 'Mũ bình', 'kg', '6000.00', '7000.00', 'Chai nước suối, nước ngọt, dầu ăn...', '2026-03-11 02:34:10', '2026-03-11 02:34:10'),
(3, 3, 'Đồng', 'kg', '150000.00', '170000.00', 'Dây điện, bù lon...', '2026-03-11 02:35:07', '2026-03-11 02:35:07'),
(4, 3, 'Giấy', 'kg', '2700.00', '3000.00', 'Giấy thùng, giấy màu...', '2026-03-11 02:35:55', '2026-03-11 02:35:55'),
(5, 3, 'Sắt đặc', 'kg', '6500.00', '8000.00', NULL, '2026-03-11 02:39:00', '2026-03-11 02:39:00'),
(6, 3, 'Sắt phế', 'kg', '2500.00', '3000.00', NULL, '2026-03-11 03:44:29', '2026-03-11 03:44:29');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_03_11_084825_create_personal_access_tokens_table', 1),
(5, '2026_03_11_100000_create_customers_table', 1),
(6, '2026_03_11_100001_create_materials_table', 1),
(7, '2026_03_11_100002_create_purchase_orders_table', 1),
(8, '2026_03_11_100003_create_sales_orders_table', 1),
(9, '2026_03_11_100004_create_inventory_table', 1),
(10, '2026_03_11_101344_add_time_to_purchase_orders_table', 2),
(11, '2026_03_11_110154_add_time_to_sales_orders_table', 3),
(12, '2026_03_11_141658_add_bonus_rate_to_customers_table', 4),
(13, '2026_03_11_145828_add_avatar_to_users_table', 5),
(14, '2026_03_11_145830_create_user_salaries_table', 5);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'auth_token', 'cfa794285eb5c37bfcaf1a8f5f698d27571447c9731130c455690aa538a6893d', '[\"*\"]', '2026-03-11 03:16:13', NULL, '2026-03-11 01:59:32', '2026-03-11 03:16:13'),
(2, 'App\\Models\\User', 2, 'auth_token', '27726e7ea049f030ec8bf60cd0217114fa02bde586fcf6190871c907b00edbc8', '[\"*\"]', NULL, NULL, '2026-03-11 02:21:43', '2026-03-11 02:21:43'),
(27, 'App\\Models\\User', 8, 'auth_token', '27b79841e4810af8278f471fc0ca4d5cf6bf8917102488fe0b83c832243a1b1a', '[\"*\"]', '2026-03-11 09:14:14', NULL, '2026-03-11 09:04:12', '2026-03-11 09:14:14');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED NOT NULL,
  `material_id` bigint(20) UNSIGNED NOT NULL,
  `weight` decimal(10,3) NOT NULL,
  `price_per_unit` decimal(15,2) NOT NULL,
  `total` decimal(15,2) NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `purchase_items`
--

INSERT INTO `purchase_items` (`id`, `purchase_id`, `material_id`, `weight`, `price_per_unit`, `total`, `note`) VALUES
(6, 4, 3, '1.000', '150000.00', '150000.00', NULL),
(7, 4, 4, '25.000', '2700.00', '67500.00', NULL),
(8, 4, 2, '15.000', '6000.00', '90000.00', NULL),
(9, 4, 4, '20.000', '2700.00', '54000.00', NULL),
(10, 4, 6, '5.000', '2500.00', '12500.00', NULL),
(11, 5, 3, '10.000', '150000.00', '1500000.00', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL DEFAULT '00:00:00',
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `purchase_orders`
--

INSERT INTO `purchase_orders` (`id`, `tenant_id`, `customer_id`, `created_by`, `date`, `time`, `total_amount`, `status`, `note`, `created_at`, `updated_at`) VALUES
(4, 3, 6, 3, '2026-03-11', '17:47:00', '374000.00', 'completed', NULL, '2026-03-11 03:47:40', '2026-03-11 07:34:57'),
(5, 3, 5, 3, '2026-03-11', '22:57:00', '1500000.00', 'completed', NULL, '2026-03-11 08:59:07', '2026-03-11 08:59:07');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sales_items`
--

CREATE TABLE `sales_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sales_id` bigint(20) UNSIGNED NOT NULL,
  `material_id` bigint(20) UNSIGNED NOT NULL,
  `weight` decimal(10,3) NOT NULL,
  `price_per_unit` decimal(15,2) NOT NULL,
  `total` decimal(15,2) NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sales_items`
--

INSERT INTO `sales_items` (`id`, `sales_id`, `material_id`, `weight`, `price_per_unit`, `total`, `note`) VALUES
(1, 2, 4, '90.000', '3000.00', '270000.00', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sales_orders`
--

CREATE TABLE `sales_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL DEFAULT '00:00:00',
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` enum('completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sales_orders`
--

INSERT INTO `sales_orders` (`id`, `tenant_id`, `customer_id`, `created_by`, `date`, `time`, `total_amount`, `status`, `note`, `created_at`, `updated_at`) VALUES
(2, 3, 7, 3, '2026-03-11', '00:00:00', '270000.00', 'completed', NULL, '2026-03-11 03:59:56', '2026-03-11 07:35:21');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tenants`
--

CREATE TABLE `tenants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tenants`
--

INSERT INTO `tenants` (`id`, `name`, `email`, `phone`, `slug`, `status`, `created_at`, `updated_at`) VALUES
(3, 'Mỹ Vân', 'myvan@gmail.com', '0908700917', 'my-van-o5oZ5I', 'active', '2026-03-11 02:22:30', '2026-03-11 02:22:30');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('owner','manager','employee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'employee',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `tenant_id`, `name`, `email`, `password`, `role`, `status`, `avatar`, `remember_token`, `created_at`, `updated_at`) VALUES
(3, 3, 'Hồ Mỹ Vân', 'myvan@gmail.com', '$2y$12$eRKXD3UOBRyruW353cVpre4dlbg/cfPuqQokkjK4ax0ycmU11waUu', 'owner', 'active', NULL, NULL, '2026-03-11 02:22:30', '2026-03-11 02:22:30'),
(4, 3, 'Thành Phong', 'thanhphong@gmail.com', '$2y$12$kVqzpN8qWJWEGUWB1FoWMOmgAv/Ky4lnZZfo334.a2NRnLQmnBFw6', 'manager', 'active', NULL, NULL, '2026-03-11 02:51:24', '2026-03-11 02:51:24'),
(5, 3, 'Anh Tú', 'anhtu@gmail.com', '$2y$12$jHZmmWAV8CVi.9TQa65PoO07vjjGzFjoDcXT6ePyzqPDpIudzrWXy', 'employee', 'active', NULL, NULL, '2026-03-11 02:52:02', '2026-03-11 02:52:02'),
(6, 3, 'Anh Phúc', 'anhphuc@gmail.com', '$2y$12$ftk2huRD7yQSo.g/b/YHlOFx.EyZv2jEGq37uKj5jAqYpSGX.omye', 'employee', 'active', NULL, NULL, '2026-03-11 02:52:25', '2026-03-11 08:39:08'),
(7, 3, 'Chị Phượng', 'chiphuong@gmail.com', '$2y$12$cfJ2QRUBo/9B/Oo9BcKE9.rCzC6qF4VyA9AzkwwY.k1mAvNSdyT3G', 'employee', 'active', NULL, NULL, '2026-03-11 02:52:51', '2026-03-11 02:52:51'),
(8, 3, 'Hạng Vũ', 'hangvu@gmail.com', '$2y$12$GO1BX0sKuT73BQdULkXo7O.N6oBfFnuRFzRUZSSLUA4zvKtFCn5tG', 'manager', 'active', NULL, NULL, '2026-03-11 03:04:02', '2026-03-11 03:04:02'),
(9, 3, 'Mã Văn Tần', 'vantan@gmail.com', '$2y$12$occqfMc61qp0qeVHz5bg4.OFqBCj3XWpA4yaG4/Z65mAi82qs09HG', 'manager', 'active', NULL, NULL, '2026-03-11 08:34:27', '2026-03-11 08:34:27'),
(10, 3, 'Ku Mum', 'mum@gmail.com', '$2y$12$fR5Ok5lc7Npyqx9mfqlyTOnu/kR27I.cOGzalkSMg0ewLA4Yf1yNm', 'employee', 'inactive', NULL, NULL, '2026-03-11 08:39:31', '2026-03-11 08:39:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_salaries`
--

CREATE TABLE `user_salaries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tenant_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `month` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'YYYY-MM',
  `base_salary` decimal(15,0) NOT NULL DEFAULT 0,
  `working_days` tinyint(3) UNSIGNED NOT NULL DEFAULT 26,
  `paid_leave_days` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `absent_days` decimal(4,1) NOT NULL DEFAULT 0.0,
  `bonus` decimal(15,0) NOT NULL DEFAULT 0,
  `note` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Chỉ mục cho bảng `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customers_tenant_id_type_index` (`tenant_id`,`type`);

--
-- Chỉ mục cho bảng `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Chỉ mục cho bảng `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventory_tenant_id_material_id_unique` (`tenant_id`,`material_id`),
  ADD KEY `inventory_material_id_foreign` (`material_id`),
  ADD KEY `inventory_tenant_id_index` (`tenant_id`);

--
-- Chỉ mục cho bảng `inventory_logs`
--
ALTER TABLE `inventory_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_logs_material_id_foreign` (`material_id`),
  ADD KEY `inventory_logs_tenant_id_material_id_index` (`tenant_id`,`material_id`),
  ADD KEY `inventory_logs_reference_type_reference_id_index` (`reference_type`,`reference_id`);

--
-- Chỉ mục cho bảng `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Chỉ mục cho bảng `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `materials_tenant_id_index` (`tenant_id`);

--
-- Chỉ mục cho bảng `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Chỉ mục cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Chỉ mục cho bảng `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_items_material_id_foreign` (`material_id`),
  ADD KEY `purchase_items_purchase_id_material_id_index` (`purchase_id`,`material_id`);

--
-- Chỉ mục cho bảng `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_orders_customer_id_foreign` (`customer_id`),
  ADD KEY `purchase_orders_created_by_foreign` (`created_by`),
  ADD KEY `purchase_orders_tenant_id_date_index` (`tenant_id`,`date`),
  ADD KEY `purchase_orders_tenant_id_status_index` (`tenant_id`,`status`);

--
-- Chỉ mục cho bảng `sales_items`
--
ALTER TABLE `sales_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_items_material_id_foreign` (`material_id`),
  ADD KEY `sales_items_sales_id_material_id_index` (`sales_id`,`material_id`);

--
-- Chỉ mục cho bảng `sales_orders`
--
ALTER TABLE `sales_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_orders_customer_id_foreign` (`customer_id`),
  ADD KEY `sales_orders_created_by_foreign` (`created_by`),
  ADD KEY `sales_orders_tenant_id_date_index` (`tenant_id`,`date`),
  ADD KEY `sales_orders_tenant_id_status_index` (`tenant_id`,`status`);

--
-- Chỉ mục cho bảng `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Chỉ mục cho bảng `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tenants_email_unique` (`email`),
  ADD UNIQUE KEY `tenants_slug_unique` (`slug`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_tenant_id_index` (`tenant_id`);

--
-- Chỉ mục cho bảng `user_salaries`
--
ALTER TABLE `user_salaries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_salaries_user_id_month_unique` (`user_id`,`month`),
  ADD KEY `user_salaries_tenant_id_foreign` (`tenant_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `inventory_logs`
--
ALTER TABLE `inventory_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `materials`
--
ALTER TABLE `materials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT cho bảng `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `sales_items`
--
ALTER TABLE `sales_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `sales_orders`
--
ALTER TABLE `sales_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `user_salaries`
--
ALTER TABLE `user_salaries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_material_id_foreign` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `inventory_logs`
--
ALTER TABLE `inventory_logs`
  ADD CONSTRAINT `inventory_logs_material_id_foreign` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_logs_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `materials_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `purchase_items_material_id_foreign` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  ADD CONSTRAINT `purchase_items_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `purchase_orders_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `purchase_orders_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `purchase_orders_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `sales_items`
--
ALTER TABLE `sales_items`
  ADD CONSTRAINT `sales_items_material_id_foreign` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`),
  ADD CONSTRAINT `sales_items_sales_id_foreign` FOREIGN KEY (`sales_id`) REFERENCES `sales_orders` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `sales_orders`
--
ALTER TABLE `sales_orders`
  ADD CONSTRAINT `sales_orders_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `sales_orders_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `sales_orders_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_salaries`
--
ALTER TABLE `user_salaries`
  ADD CONSTRAINT `user_salaries_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_salaries_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
