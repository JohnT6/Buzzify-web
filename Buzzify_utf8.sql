USE [master]
GO
/****** Object:  Database [buzzify]    Script Date: 13/03/2026 12:42:00 CH ******/
CREATE DATABASE [buzzify]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'buzzify', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\buzzify.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'buzzify_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\buzzify_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [buzzify] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [buzzify].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [buzzify] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [buzzify] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [buzzify] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [buzzify] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [buzzify] SET ARITHABORT OFF 
GO
ALTER DATABASE [buzzify] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [buzzify] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [buzzify] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [buzzify] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [buzzify] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [buzzify] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [buzzify] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [buzzify] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [buzzify] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [buzzify] SET  DISABLE_BROKER 
GO
ALTER DATABASE [buzzify] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [buzzify] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [buzzify] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [buzzify] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [buzzify] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [buzzify] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [buzzify] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [buzzify] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [buzzify] SET  MULTI_USER 
GO
ALTER DATABASE [buzzify] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [buzzify] SET DB_CHAINING OFF 
GO
ALTER DATABASE [buzzify] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [buzzify] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [buzzify] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [buzzify] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [buzzify] SET QUERY_STORE = ON
GO
ALTER DATABASE [buzzify] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [buzzify]
GO
/****** Object:  User [Genzo]    Script Date: 13/03/2026 12:42:00 CH ******/
CREATE USER [Genzo] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  Table [dbo].[lich_su_nghe]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[lich_su_nghe](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[id_nguoi_dung] [nvarchar](36) NOT NULL,
	[song_id] [nvarchar](36) NOT NULL,
	[ngay_nghe] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[songs]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[songs](
	[id] [nvarchar](36) NOT NULL,
	[tieu_de] [nvarchar](255) NOT NULL,
	[url] [nvarchar](max) NOT NULL,
	[anh_bia] [nvarchar](max) NULL,
	[thoi_luong_giay] [int] NULL,
	[luot_nghe] [int] NULL,
	[artist_id] [nvarchar](36) NULL,
	[id_album] [nvarchar](36) NULL,
	[nghe_si_hop_tac] [nvarchar](max) NULL,
	[track_number] [int] NULL,
	[uploader_id] [nvarchar](36) NULL,
	[ngay_tai_len] [datetime] NULL,
	[trang_thai] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[the_loai]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[the_loai](
	[id] [nvarchar](36) NOT NULL,
	[ten] [nvarchar](255) NOT NULL,
	[search_tags] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[the_loai_album]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[the_loai_album](
	[id_album] [nvarchar](36) NOT NULL,
	[id_the_loai] [nvarchar](36) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_album] ASC,
	[id_the_loai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_user_favorite_genres]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- 1. VIEW: Thống kê các thể loại mà user nghe nhiều nhất (Sở thích của user)
CREATE VIEW [dbo].[vw_user_favorite_genres] AS
SELECT TOP 100 PERCENT
    ls.id_nguoi_dung,
    tla.id_the_loai,
    tl.ten AS ten_the_loai,
    COUNT(ls.id) AS tong_luot_nghe,
    MAX(ls.ngay_nghe) AS lan_nghe_cuoi
FROM [dbo].[lich_su_nghe] ls
JOIN [dbo].[songs] s ON ls.song_id = s.id
JOIN [dbo].[the_loai_album] tla ON s.id_album = tla.id_album
JOIN [dbo].[the_loai] tl ON tla.id_the_loai = tl.id
GROUP BY 
    ls.id_nguoi_dung, 
    tla.id_the_loai, 
    tl.ten
ORDER BY 
    tong_luot_nghe DESC;

GO
/****** Object:  Table [dbo].[album]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[album](
	[id] [nvarchar](36) NOT NULL,
	[tieu_de] [nvarchar](255) NOT NULL,
	[anh_bia] [nvarchar](max) NULL,
	[artist_id] [nvarchar](36) NULL,
	[ngay_phat_hanh] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[album_da_luu]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[album_da_luu](
	[id_nguoi_dung] [nvarchar](36) NOT NULL,
	[id_album] [nvarchar](36) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_nguoi_dung] ASC,
	[id_album] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[artists]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[artists](
	[id] [nvarchar](36) NOT NULL,
	[ten] [nvarchar](255) NOT NULL,
	[anh_dai_dien] [nvarchar](max) NULL,
	[profile_id] [nvarchar](36) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[bai_hat_trong_daily_mix]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[bai_hat_trong_daily_mix](
	[mix_id] [nvarchar](36) NOT NULL,
	[song_id] [nvarchar](36) NOT NULL,
	[thu_tu] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[mix_id] ASC,
	[song_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[bai_hat_trong_playlist]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[bai_hat_trong_playlist](
	[playlist_id] [nvarchar](36) NOT NULL,
	[song_id] [nvarchar](36) NOT NULL,
	[ngay_them] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[playlist_id] ASC,
	[song_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[nghe_si_theo_doi]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[nghe_si_theo_doi](
	[id_nguoi_dung] [nvarchar](36) NOT NULL,
	[artist_id] [nvarchar](36) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_nguoi_dung] ASC,
	[artist_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[playlist_da_luu]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[playlist_da_luu](
	[id_nguoi_dung] [nvarchar](36) NOT NULL,
	[playlist_id] [nvarchar](36) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id_nguoi_dung] ASC,
	[playlist_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[playlists]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[playlists](
	[id] [nvarchar](36) NOT NULL,
	[ten] [nvarchar](255) NOT NULL,
	[id_nguoi_tao] [nvarchar](36) NOT NULL,
	[anh_bia] [nvarchar](max) NULL,
	[mo_ta] [nvarchar](max) NULL,
	[loai_playlist] [nvarchar](20) NOT NULL,
	[cong_khai] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[profiles]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[profiles](
	[id] [nvarchar](36) NOT NULL,
	[ho_ten] [nvarchar](255) NULL,
	[anh_dai_dien] [nvarchar](max) NULL,
	[vai_tro] [nvarchar](50) NULL,
	[email] [nvarchar](255) NULL,
	[provider] [nvarchar](50) NOT NULL,
	[provider_id] [nvarchar](255) NOT NULL,
	[password_hash] [nvarchar](255) NULL,
	[is_email_verified] [bit] NOT NULL,
	[verification_code_hash] [nvarchar](255) NULL,
	[verification_code_expiry] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[the_loai_artist]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[the_loai_artist](
	[artist_id] [nvarchar](36) NOT NULL,
	[id_the_loai] [nvarchar](36) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[artist_id] ASC,
	[id_the_loai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[the_loai_playlist]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[the_loai_playlist](
	[playlist_id] [nvarchar](36) NOT NULL,
	[id_the_loai] [nvarchar](36) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[playlist_id] ASC,
	[id_the_loai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[user_daily_mixes]    Script Date: 13/03/2026 12:42:00 CH ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[user_daily_mixes](
	[id] [nvarchar](36) NOT NULL,
	[id_nguoi_dung] [nvarchar](36) NOT NULL,
	[tieu_de] [nvarchar](255) NOT NULL,
	[id_the_loai_chinh] [nvarchar](36) NULL,
	[ngay_tao] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[album] ([id], [tieu_de], [anh_bia], [artist_id], [ngay_phat_hanh]) VALUES (N'7a6b5c4d-3e2f-1a0b-9c8d-7e6f5a4b3c2d', N'Dữ Liệu Quý', N'/images/albums/du_lieu_quy.jpg', N'c82a3d4-e6f6-a708-c9d0-e1f2a3b4c5d6', CAST(N'2025-01-01' AS Date))
INSERT [dbo].[album] ([id], [tieu_de], [anh_bia], [artist_id], [ngay_phat_hanh]) VALUES (N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', N'My Krazy Life', N'/images/albums/my_krazy_life.jpg', N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', CAST(N'2024-10-15' AS Date))
INSERT [dbo].[album] ([id], [tieu_de], [anh_bia], [artist_id], [ngay_phat_hanh]) VALUES (N'album-chillwithme-001', N'CHILL with me', N'/images/albums/chill_with_me.jpg', N'artist-tientien-001', CAST(N'2018-12-12' AS Date))
INSERT [dbo].[album] ([id], [tieu_de], [anh_bia], [artist_id], [ngay_phat_hanh]) VALUES (N'album-curtaincall-001', N'Curtain Call: The Hits', N'/images/albums/curtain_call_the_hits.jpg', N'artist-eminem-001', CAST(N'2005-12-06' AS Date))
INSERT [dbo].[album] ([id], [tieu_de], [anh_bia], [artist_id], [ngay_phat_hanh]) VALUES (N'album-ninetrackmind-001', N'Nine Track Mind', N'/images/albums/nine_track_mind.jpg', N'artist-charlieputh-001', CAST(N'2016-01-29' AS Date))
GO
INSERT [dbo].[artists] ([id], [ten], [anh_dai_dien], [profile_id]) VALUES (N'8c1b69d6-4b8a-4b0d-9b0d-7d6c1f0e9bc1', N'Hoài Lâm', NULL, NULL)
INSERT [dbo].[artists] ([id], [ten], [anh_dai_dien], [profile_id]) VALUES (N'a0b8d8d7-e8f6-4a53-a2d1-f0e9d8c7b6a5', N'Đạt Long Vinh', NULL, NULL)
INSERT [dbo].[artists] ([id], [ten], [anh_dai_dien], [profile_id]) VALUES (N'artist-charlieputh-001', N'Charlie Puth', N'/images/artists/charlie_puth.jpg', NULL)
INSERT [dbo].[artists] ([id], [ten], [anh_dai_dien], [profile_id]) VALUES (N'artist-eminem-001', N'Eminem', N'/images/artists/eminem.jpg', NULL)
INSERT [dbo].[artists] ([id], [ten], [anh_dai_dien], [profile_id]) VALUES (N'artist-tientien-001', N'Tiên Tiên', N'/images/artists/tien_tien.jpg', NULL)
INSERT [dbo].[artists] ([id], [ten], [anh_dai_dien], [profile_id]) VALUES (N'c82a3d4-e6f6-a708-c9d0-e1f2a3b4c5d6', N'Dương Domic', N'/images/artists/duong_domic.jpg', NULL)
INSERT [dbo].[artists] ([id], [ten], [anh_dai_dien], [profile_id]) VALUES (N'd9f8c7b6-a5b4-c3d2-e1f0-a9b8c7d6e5f4', N'Đinh Dũng', NULL, NULL)
INSERT [dbo].[artists] ([id], [ten], [anh_dai_dien], [profile_id]) VALUES (N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'YG', N'/images/artists/yg.jpg', NULL)
INSERT [dbo].[artists] ([id], [ten], [anh_dai_dien], [profile_id]) VALUES (N'f1e0d9c8-b5a6-9878-c5d6-e2f1a0b9c8d7', N'Đinh Tùng Huy', NULL, NULL)
GO
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'liked-pl-fga-0000-0000-000000000001', N'2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', CAST(N'2025-11-08T03:06:53.053' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-ballad', N'04E212F5-F855-4B7E-90E5-BC58911BC498', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-ballad', N'36461F66-9F3D-4B1D-9BCF-7AC3DB1A6DD7', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-ballad', N'47C9E669-9BDA-4D4F-BB5E-E8EA227E95D9', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-ballad', N'599940ED-DFB2-43AA-B278-3D7844DA092B', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-ballad', N'768E569E-A386-4865-9C95-B280FDD9134D', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-ballad', N'7DF541DE-7D2E-44C9-AFDC-F78DF3205370', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-ballad', N'7F7B285E-E0F1-4DD1-A8DD-CAE0E7CB7C47', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-ballad', N'ACBB3817-EE76-4161-B72D-DDD67A498F2F', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-ballad', N'C03EF6EE-A80D-4BBB-8C42-40BBBA6C2957', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-ballad', N'E74652BB-451F-45C6-BDE4-D99F8B39C2CF', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-ballad', N'EC7BFBDD-C8A9-4756-8E29-71E150E8A258', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'0530CFE9-B65F-49C5-812B-71DA403EF2C4', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'07AFB0F4-4416-42B4-A38D-8F290B8B2235', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'16BC7A45-1374-4444-B2B6-F4025C97EBFE', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'462EE00C-0F18-40CD-AB3C-4DD5A953BF7E', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'519CA523-1D4B-45FA-8189-78F2D8F48C1B', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'57C3659F-A546-4049-B4FC-0C2A999047EE', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'57E45800-F684-4A9A-BB50-A1E7C69F1D8F', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'589DD906-204A-4264-B7D7-ED0BBAA95690', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'5E7D101F-FB4A-42E4-9DF0-459306EBF851', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'64A727B3-A90D-4D4A-8523-BF4F17EEB27B', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'6BC66FB3-D731-4C29-93BE-F47A40B62D85', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'76B1B38F-68E8-4819-B3D6-0D6B046A831D', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'7C06375E-BCE3-4DD3-939D-703BC90E64CE', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'89FFD05F-97E9-419B-85DA-25FD70C2064F', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'8E22A541-2BE2-4388-B215-BAE3874CE088', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'903B0245-173E-4FFD-8266-6CCE16492C00', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'922963E1-2602-475C-9117-00831EC7EBEB', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'981DF9AA-8CD3-4792-B77E-BD0404DA6389', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'98DFF74B-5736-4EB3-A2E2-62ECF4D1B80F', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'A170EF82-CB4C-49B1-B71B-DA35213722FC', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'A6A3AC51-1AC5-4FF3-9BF1-0570DC8B9685', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'AB64B249-BE86-4640-8FFF-C6DB50064257', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'C704D0C7-B7E1-4228-BDEB-0C81F5FE2E79', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'CA516819-062E-4992-999E-E92A6AA1CA8E', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'DC1E8911-6409-4F44-A294-4E3CBE7707DE', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'DEA278CA-E712-4EF7-B7B5-F6E71E0EFA85', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'FE9C6C1C-C79E-458C-8560-633346F023DE', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'FF19F0B0-94A9-4B6A-9D41-2AAAFDA315A5', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-hiphop', N'FF26BB9A-0847-40C5-BEB4-EE45A3891B3B', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'2BFD8235-6A57-40BE-B376-097D3E6A1A7B', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'2EFFCB2A-6582-41D5-A229-034E359DF997', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'358E0D17-2473-459B-A8BA-E5B7655FA797', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'51B7E6F9-C3C2-4A85-95F3-AF1DE4E5ED26', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'5B3AD6D5-57A0-4F97-A1AA-1333AA1804A3', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'5D5C9D98-016A-467A-BB9A-6A4CB4F08649', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'6A961F73-49BA-455A-8458-27D7FD9C04BB', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'AAC6AD41-9DFA-4470-A0E6-450D79E2CB81', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'AE365963-949D-4E91-BCA5-012922756C18', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'B3D48EA1-AAA9-44A2-A854-5E46F767BAB0', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'BC456C49-6CDE-4068-A4D1-24C4CC55992C', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'CA67CA19-509E-4AA7-AF7F-B7B983BBA1EB', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-pop', N'D7E4DC19-2312-4C61-92AF-BF6E063E7B3D', CAST(N'2025-11-10T01:24:38.263' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-vpop', N'2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-vpop', N'33F370C1-4D09-4B60-834F-860B00543E33', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-vpop', N'4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-vpop', N'56722735-E331-4156-9EA2-F985FD784894', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-vpop', N'EECE7D24-A266-40F0-A35C-8134445021DE', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
INSERT [dbo].[bai_hat_trong_playlist] ([playlist_id], [song_id], [ngay_them]) VALUES (N'pl-editorial-vpop', N'FB762410-B39B-4A7D-99CB-BCA90696AF20', CAST(N'2025-11-10T01:24:38.267' AS DateTime))
GO
INSERT [dbo].[playlists] ([id], [ten], [id_nguoi_tao], [anh_bia], [mo_ta], [loai_playlist], [cong_khai]) VALUES (N'liked-pl-fga-0000-0000-000000000001', N'Bài hát đã thích', N'107fed53-2ef8-4afb-9f67-9750f6ae58de', NULL, NULL, N'liked_songs', 0)
INSERT [dbo].[playlists] ([id], [ten], [id_nguoi_tao], [anh_bia], [mo_ta], [loai_playlist], [cong_khai]) VALUES (N'liked-pl-thanh-0000-000-000000000002', N'Bài hát đã thích', N'dcc093d5-a3f6-40e9-8e33-aa5a5c2ea024', NULL, NULL, N'liked_songs', 0)
INSERT [dbo].[playlists] ([id], [ten], [id_nguoi_tao], [anh_bia], [mo_ta], [loai_playlist], [cong_khai]) VALUES (N'pl-editorial-ballad', N'Ballad Tâm Trạng', N'buzzify-editor-001', N'/images/playlists/editorial_ballad.jpg', N'Nhạc buồn và ballad nhẹ nhàng', N'editorial', 1)
INSERT [dbo].[playlists] ([id], [ten], [id_nguoi_tao], [anh_bia], [mo_ta], [loai_playlist], [cong_khai]) VALUES (N'pl-editorial-hiphop', N'Top Hiphop Hits', N'buzzify-editor-001', N'/images/playlists/editorial_hiphop.jpg', N'Những bản Hiphop/Rap hay nhất', N'editorial', 1)
INSERT [dbo].[playlists] ([id], [ten], [id_nguoi_tao], [anh_bia], [mo_ta], [loai_playlist], [cong_khai]) VALUES (N'pl-editorial-love', N'Love Songs', N'buzzify-editor-001', N'/images/playlists/editorial_love.jpg', N'Những bài hát lãng mạn cho tình yêu', N'editorial', 1)
INSERT [dbo].[playlists] ([id], [ten], [id_nguoi_tao], [anh_bia], [mo_ta], [loai_playlist], [cong_khai]) VALUES (N'pl-editorial-pop', N'Pop Rising', N'buzzify-editor-001', N'/images/playlists/editorial_pop.jpg', N'Các hit US-UK mới và thịnh hành', N'editorial', 1)
INSERT [dbo].[playlists] ([id], [ten], [id_nguoi_tao], [anh_bia], [mo_ta], [loai_playlist], [cong_khai]) VALUES (N'pl-editorial-vpop', N'V-Pop Không Thể Bỏ Lỡ', N'buzzify-editor-001', N'/images/playlists/editorial_vpop.jpg', N'Nhạc Trẻ Việt Nam hay nhất', N'editorial', 1)
GO
INSERT [dbo].[profiles] ([id], [ho_ten], [anh_dai_dien], [vai_tro], [email], [provider], [provider_id], [password_hash], [is_email_verified], [verification_code_hash], [verification_code_expiry]) VALUES (N'0d54d8a9-57fb-4ced-b4e7-222ad4e8f6ec', N'Thành', N'https://lh3.googleusercontent.com/a/ACg8ocLIDQ7iQCyulDXs4vmzmM8Sp101ek7sECe2QxsV5HJcjziyuR43=s96-c', N'user', N'phuocthanh03062004@gmail.com', N'google', N'117065698106375404076', NULL, 1, NULL, NULL)
INSERT [dbo].[profiles] ([id], [ho_ten], [anh_dai_dien], [vai_tro], [email], [provider], [provider_id], [password_hash], [is_email_verified], [verification_code_hash], [verification_code_expiry]) VALUES (N'107fed53-2ef8-4afb-9f67-9750f6ae58de', N'Fga', NULL, N'user', N'fga@example.com', N'google', N'google-id-111111', NULL, 1, NULL, NULL)
INSERT [dbo].[profiles] ([id], [ho_ten], [anh_dai_dien], [vai_tro], [email], [provider], [provider_id], [password_hash], [is_email_verified], [verification_code_hash], [verification_code_expiry]) VALUES (N'buzzify-editor-001', N'Buzzify Team', NULL, N'admin', N'admin@buzzify.com', N'system', N'system-001', NULL, 1, NULL, NULL)
INSERT [dbo].[profiles] ([id], [ho_ten], [anh_dai_dien], [vai_tro], [email], [provider], [provider_id], [password_hash], [is_email_verified], [verification_code_hash], [verification_code_expiry]) VALUES (N'dcc093d5-a3f6-40e9-8e33-aa5a5c2ea024', N'Thành', N'https://lh3.googleusercontent.com/a/ACg8oc...', N'admin', N'thanh@example.com', N'google', N'google-id-222222', NULL, 1, NULL, NULL)
INSERT [dbo].[profiles] ([id], [ho_ten], [anh_dai_dien], [vai_tro], [email], [provider], [provider_id], [password_hash], [is_email_verified], [verification_code_hash], [verification_code_expiry]) VALUES (N'e3bec9db-304f-46d1-86e7-de9f26b42aa1', N'John Tran', N'/images/users/1763480617904-798000782-1000007132.jpg', N'user', N'johntran3620@gmail.com', N'email', N'johntran3620@gmail.com', N'$2b$10$SwiR.ixX4hSa.Cxb36DsE.GRnDkZa6ns67Mb63O9gkWwtKu1c3QPO', 1, NULL, NULL)
GO
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'04E212F5-F855-4B7E-90E5-BC58911BC498', N'Qua Ngày Mai', N'/audio/qua_ngay_mai.mp3', N'/images/albums/chill_with_me.jpg', 157, 0, N'artist-tientien-001', N'album-chillwithme-001', NULL, 2, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'0530CFE9-B65F-49C5-812B-71DA403EF2C4', N'Me & My Bitch', N'/audio/me_&_my_bitch.mp3', N'/images/albums/my_krazy_life2.jpg', 211, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', N'Tory Lanez', 9, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'07AFB0F4-4416-42B4-A38D-8F290B8B2235', N'BPT', N'/audio/bpt.mp3', N'/images/albums/my_krazy_life.jpg', 148, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', NULL, 2, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'16BC7A45-1374-4444-B2B6-F4025C97EBFE', N'I Just Wanna Party', N'/audio/i_just_wanna_party.mp3', N'/images/albums/my_krazy_life2.jpg', 212, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', N'Schoolboy Q, Jay Rock', 3, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', N'Đế Vương', N'/audio/song2.mp3', N'/images/songs/song2.jpg', 199, 0, N'd9f8c7b6-a5b4-c3d2-e1f0-a9b8c7d6e5f4', NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'2BFD8235-6A57-40BE-B376-097D3E6A1A7B', N'Some Type of Love', N'/audio/some_type_of_love.mp3', N'/images/albums/nine_track_mind.jpg', 187, 0, N'artist-charlieputh-001', N'album-ninetrackmind-001', NULL, 12, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'2EFFCB2A-6582-41D5-A229-034E359DF997', N'Left Right Left', N'/audio/left_right_left.mp3', N'/images/albums/nine_track_mind.jpg', 188, 0, N'artist-charlieputh-001', N'album-ninetrackmind-001', NULL, 8, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'33F370C1-4D09-4B60-834F-860B00543E33', N'Pin Dự Phòng', N'/audio/pin_du_phong.mp3', N'/images/albums/du_lieu_quy.jpg', 226, 0, N'c82a3d4-e6f6-a708-c9d0-e1f2a3b4c5d6', N'7a6b5c4d-3e2f-1a0b-9c8d-7e6f5a4b3c2d', N'Lưu Hoàng', 3, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'358E0D17-2473-459B-A8BA-E5B7655FA797', N'Dangerously', N'/audio/dangerously.mp3', N'/images/albums/nine_track_mind.jpg', 199, 0, N'artist-charlieputh-001', N'album-ninetrackmind-001', NULL, 2, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'36461F66-9F3D-4B1D-9BCF-7AC3DB1A6DD7', N'Đi Về Đâu - 2018', N'/audio/di_ve_dau.mp3', N'/images/albums/chill_with_me.jpg', 239, 0, N'artist-tientien-001', N'album-chillwithme-001', NULL, 5, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'462EE00C-0F18-40CD-AB3C-4DD5A953BF7E', N'Lose Yourself', N'/audio/lose_yourself.mp3', N'/images/albums/curtain_call_the_hits.jpg', 326, 0, N'artist-eminem-001', N'album-curtaincall-001', NULL, 6, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'47C9E669-9BDA-4D4F-BB5E-E8EA227E95D9', N'Vì Tôi Còn Sống - 2018', N'/audio/vi_toi_con_song.mp3', N'/images/albums/chill_with_me.jpg', 169, 0, N'artist-tientien-001', N'album-chillwithme-001', NULL, 10, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', N'Pháo Hồng', N'/audio/song4.mp3', N'/images/songs/song4.jpg', 235, 0, N'a0b8d8d7-e8f6-4a53-a2d1-f0e9d8c7b6a5', NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'519CA523-1D4B-45FA-8189-78F2D8F48C1B', N'Without Me', N'/audio/without_me.mp3', N'/images/albums/curtain_call_the_hits.jpg', 291, 0, N'artist-eminem-001', N'album-curtaincall-001', NULL, 9, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'51B7E6F9-C3C2-4A85-95F3-AF1DE4E5ED26', N'Up All Night', N'/audio/up_all_night.mp3', N'/images/albums/nine_track_mind.jpg', 190, 0, N'artist-charlieputh-001', N'album-ninetrackmind-001', NULL, 7, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'56722735-E331-4156-9EA2-F985FD784894', N'Chập Chờn', N'/audio/chap_chon.mp3', N'/images/albums/du_lieu_quy.jpg', 192, 0, N'c82a3d4-e6f6-a708-c9d0-e1f2a3b4c5d6', N'7a6b5c4d-3e2f-1a0b-9c8d-7e6f5a4b3c2d', NULL, 1, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'57C3659F-A546-4049-B4FC-0C2A999047EE', N'Just Lose It', N'/audio/just_lose_it.mp3', N'/images/albums/curtain_call_the_hits.jpg', 248, 0, N'artist-eminem-001', N'album-curtaincall-001', NULL, 15, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'57E45800-F684-4A9A-BB50-A1E7C69F1D8F', N'Sorry Momma', N'/audio/sorry_momma.mp3', N'/images/albums/my_krazy_life2.jpg', 305, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', N'Ty Dolla $ign', 14, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'589DD906-204A-4264-B7D7-ED0BBAA95690', N'Shake That', N'/audio/shake_that.mp3', N'/images/albums/curtain_call_the_hits.jpg', 274, 0, N'artist-eminem-001', N'album-curtaincall-001', N'Nate Dogg', 7, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'599940ED-DFB2-43AA-B278-3D7844DA092B', N'Về Với Em Đi - 2018', N'/audio/ve_voi_em_di.mp3', N'/images/albums/chill_with_me.jpg', 199, 0, N'artist-tientien-001', N'album-chillwithme-001', NULL, 4, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'5B3AD6D5-57A0-4F97-A1AA-1333AA1804A3', N'As You Are', N'/audio/as_you_are.mp3', N'/images/songs/as_you_are.jpg', 235, 0, N'artist-charlieputh-001', N'album-ninetrackmind-001', N'Shy Carter', 11, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'5D5C9D98-016A-467A-BB9A-6A4CB4F08649', N'My Gospel', N'/audio/my_gospel.mp3', N'/images/albums/nine_track_mind.jpg', 210, 0, N'artist-charlieputh-001', N'album-ninetrackmind-001', NULL, 6, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'5E7D101F-FB4A-42E4-9DF0-459306EBF851', N'FACK', N'/audio/fack.mp3', N'/images/albums/curtain_call_the_hits.jpg', 205, 0, N'artist-eminem-001', N'album-curtaincall-001', NULL, 2, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'64A727B3-A90D-4D4A-8523-BF4F17EEB27B', N'Cleanin'' Out My Closet', N'/audio/cleanin_out_my_closet.mp3', N'/images/albums/curtain_call_the_hits.jpg', 298, 0, N'artist-eminem-001', N'album-curtaincall-001', NULL, 14, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'6A961F73-49BA-455A-8458-27D7FD9C04BB', N'Suffer', N'/audio/suffer.mp3', N'/images/albums/nine_track_mind.jpg', 210, 0, N'artist-charlieputh-001', N'album-ninetrackmind-001', NULL, 10, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'6BC66FB3-D731-4C29-93BE-F47A40B62D85', N'Stan', N'/audio/stan.mp3', N'/images/albums/curtain_call_the_hits.jpg', 404, 0, N'artist-eminem-001', N'album-curtaincall-001', N'Dido', 5, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'768E569E-A386-4865-9C95-B280FDD9134D', N'Over You - 2018', N'/audio/over_you.mp3', N'/images/albums/chill_with_me.jpg', 171, 0, N'artist-tientien-001', N'album-chillwithme-001', NULL, 7, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'76B1B38F-68E8-4819-B3D6-0D6B046A831D', N'Guilty Conscience', N'/audio/guilty_conscience_(radio_version).mp3', N'/images/albums/curtain_call_the_hits.jpg', 200, 0, N'artist-eminem-001', N'album-curtaincall-001', N'Dr. Dre', 13, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'7C06375E-BCE3-4DD3-939D-703BC90E64CE', N'Who Do You Love?', N'/audio/who_do_you_love.mp3', N'/images/albums/my_krazy_life2.jpg', 233, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', N'Drake', 10, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'7DF541DE-7D2E-44C9-AFDC-F78DF3205370', N'I Lab You - 2018', N'/audio/i_lab_you.mp3', N'/images/albums/chill_with_me.jpg', 212, 0, N'artist-tientien-001', N'album-chillwithme-001', NULL, 8, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'7F7B285E-E0F1-4DD1-A8DD-CAE0E7CB7C47', N'Say You Do - 2018', N'/audio/say_you_do.mp3', N'/images/albums/chill_with_me.jpg', 219, 0, N'artist-tientien-001', N'album-chillwithme-001', NULL, 3, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'89FFD05F-97E9-419B-85DA-25FD70C2064F', N'1AM', N'/audio/1am.mp3', N'/images/albums/my_krazy_life2.jpg', 157, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', NULL, 12, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'8E22A541-2BE2-4388-B215-BAE3874CE088', N'Intro', N'/audio/intro.mp3', N'/images/albums/curtain_call_the_hits.jpg', 33, 0, N'artist-eminem-001', N'album-curtaincall-001', NULL, 1, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'903B0245-173E-4FFD-8266-6CCE16492C00', N'My Name Is', N'/audio/my_name_is.mp3', N'/images/songs/my_name_is.jpg', 268, 0, N'artist-eminem-001', N'album-curtaincall-001', NULL, 4, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'922963E1-2602-475C-9117-00831EC7EBEB', N'Mockingbird', N'/audio/mockingbird.mp3', N'/images/albums/curtain_call_the_hits.jpg', 251, 0, N'artist-eminem-001', N'album-curtaincall-001', NULL, 12, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'981DF9AA-8CD3-4792-B77E-BD0404DA6389', N'Really Be (Smokin N Drinkin)', N'/audio/really_be_(smokin_n_drinkin).mp3', N'/images/albums/my_krazy_life2.jpg', 310, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', N'Kendrick Lamar', 11, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'98DFF74B-5736-4EB3-A2E2-62ECF4D1B80F', N'Left, Right', N'/audio/left_right.mp3', N'/images/albums/my_krazy_life2.jpg', 232, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', N'DJ Mustard', 4, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'A170EF82-CB4C-49B1-B71B-DA35213722FC', N'Bicken Back Being Bool', N'/audio/bicken_back_being_bool.mp3', N'/images/albums/my_krazy_life.jpg', 243, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', NULL, 5, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'A6A3AC51-1AC5-4FF3-9BF1-0570DC8B9685', N'Momma Speech Intro', N'/audio/momma_speech_intro.mp3', N'/images/albums/my_krazy_life.jpg', 15, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', NULL, 1, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'AAC6AD41-9DFA-4470-A0E6-450D79E2CB81', N'We Don''t Talk Anymore', N'/audio/we_dont_talk_anymore.mp3', N'/images/songs/we_dont_talk_anymore.jpg', 217, 10000000, N'artist-charlieputh-001', N'album-ninetrackmind-001', N'Selena Gomez', 5, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'AB64B249-BE86-4640-8FFF-C6DB50064257', N'Meet The Flockers', N'/audio/meet_the_flockers.mp3', N'/images/albums/my_krazy_life2.jpg', 143, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', N'Tee Cee', 6, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'ACBB3817-EE76-4161-B72D-DDD67A498F2F', N'Em Không Thể - 2018', N'/audio/em_khong_the.mp3', N'/images/albums/chill_with_me.jpg', 217, 0, N'artist-tientien-001', N'album-chillwithme-001', NULL, 9, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'AE365963-949D-4E91-BCA5-012922756C18', N'Then There''s You', N'/audio/then_theres_you.mp3', N'/images/albums/nine_track_mind.jpg', 214, 0, N'artist-charlieputh-001', N'album-ninetrackmind-001', NULL, 9, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'B3D48EA1-AAA9-44A2-A854-5E46F767BAB0', N'Losing My Mind', N'/audio/losing_my_mind.mp3', N'/images/albums/nine_track_mind.jpg', 212, 0, N'artist-charlieputh-001', N'album-ninetrackmind-001', NULL, 4, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'BC456C49-6CDE-4068-A4D1-24C4CC55992C', N'Marvin Gaye', N'/audio/marvin_gaye.mp3', N'/images/songs/marvin_gaye.jpg', 190, 0, N'artist-charlieputh-001', N'album-ninetrackmind-001', N'Meghan Trainor', 3, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'C03EF6EE-A80D-4BBB-8C42-40BBBA6C2957', N'My Everything - 2018', N'/audio/my_everything.mp3', N'/images/albums/chill_with_me.jpg', 207, 0, N'artist-tientien-001', N'album-chillwithme-001', NULL, 6, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'C704D0C7-B7E1-4228-BDEB-0C81F5FE2E79', N'My Nigga', N'/audio/my_nigga.mp3', N'/images/albums/my_krazy_life2.jpg', 235, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', N'Jeezy, Rich Homie Quan', 7, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'CA516819-062E-4992-999E-E92A6AA1CA8E', N'The Way I Am', N'/audio/the_way_i_am.mp3', N'/images/albums/curtain_call_the_hits.jpg', 291, 0, N'artist-eminem-001', N'album-curtaincall-001', NULL, 3, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'CA67CA19-509E-4AA7-AF7F-B7B983BBA1EB', N'See You Again', N'/audio/see_you_again.mp3', N'/images/albums/nine_track_mind.jpg', 229, 1000000, N'artist-charlieputh-001', N'album-ninetrackmind-001', N'Wiz Khalifa', 13, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'D7E4DC19-2312-4C61-92AF-BF6E063E7B3D', N'One Call Away', N'/audio/one_call_away.mp3', N'/images/songs/one_call_away.jpg', 194, 0, N'artist-charlieputh-001', N'album-ninetrackmind-001', NULL, 1, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'DC1E8911-6409-4F44-A294-4E3CBE7707DE', N'The Real Slim Shady', N'/audio/the_real_slim_shady.mp3', N'/images/songs/the_real_slim_shady.jpg', 284, 0, N'artist-eminem-001', N'album-curtaincall-001', NULL, 11, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'DEA278CA-E712-4EF7-B7B5-F6E71E0EFA85', N'When I''m Gone', N'/audio/when_im_gone.mp3', N'/images/albums/curtain_call_the_hits.jpg', 281, 0, N'artist-eminem-001', N'album-curtaincall-001', NULL, 16, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'E74652BB-451F-45C6-BDE4-D99F8B39C2CF', N'Intro: Sau 03 Năm', N'/audio/intro_sau_03_nam.mp3', N'/images/albums/chill_with_me.jpg', 147, 0, N'artist-tientien-001', N'album-chillwithme-001', NULL, 1, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'EC7BFBDD-C8A9-4756-8E29-71E150E8A258', N'Ta Cảm Ơn - 2018', N'/audio/ta_cam_on.mp3', N'/images/albums/chill_with_me.jpg', 193, 0, N'artist-tientien-001', N'album-chillwithme-001', NULL, 11, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'EECE7D24-A266-40F0-A35C-8134445021DE', N'Mất Kết Nối', N'/audio/mat_ket_noi.mp3', N'/images/albums/du_lieu_quy.jpg', 207, 0, N'c82a3d4-e6f6-a708-c9d0-e1f2a3b4c5d6', N'7a6b5c4d-3e2f-1a0b-9c8d-7e6f5a4b3c2d', NULL, 4, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'FB762410-B39B-4A7D-99CB-BCA90696AF20', N'Tràn Bộ Nhớ', N'/audio/tran_bo_nho.mp3', N'/images/albums/du_lieu_quy.jpg', 172, 0, N'c82a3d4-e6f6-a708-c9d0-e1f2a3b4c5d6', N'7a6b5c4d-3e2f-1a0b-9c8d-7e6f5a4b3c2d', NULL, 2, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'FE9C6C1C-C79E-458C-8560-633346F023DE', N'Thank God (Interlude)', N'/audio/thank_god_(interlude).mp3', N'/images/albums/my_krazy_life2.jpg', 121, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', N'Big TC, Rodney J, RJ Brown', 13, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'FF19F0B0-94A9-4B6A-9D41-2AAAFDA315A5', N'Do It To Ya', N'/audio/do_it_to_ya.mp3', N'/images/albums/my_krazy_life2.jpg', 265, 0, N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', N'TeeFlii', 8, NULL, NULL, NULL)
INSERT [dbo].[songs] ([id], [tieu_de], [url], [anh_bia], [thoi_luong_giay], [luot_nghe], [artist_id], [id_album], [nghe_si_hop_tac], [track_number], [uploader_id], [ngay_tai_len], [trang_thai]) VALUES (N'FF26BB9A-0847-40C5-BEB4-EE45A3891B3B', N'Sing For The Moment', N'/audio/sing_for_the_moment.mp3', N'/images/albums/curtain_call_the_hits.jpg', 340, 0, N'artist-eminem-001', N'album-curtaincall-001', NULL, 8, NULL, NULL, NULL)
GO
INSERT [dbo].[the_loai] ([id], [ten], [search_tags]) VALUES (N'g-001', N'R&B', N'r&b, rnb, rhythm and blues, soul')
INSERT [dbo].[the_loai] ([id], [ten], [search_tags]) VALUES (N'g-002', N'Hiphop', N'hiphop, rap, urban, hip hop, rap việt')
INSERT [dbo].[the_loai] ([id], [ten], [search_tags]) VALUES (N'g-003', N'Nhạc Tình Yêu', N'nhạc tình yêu, love, romantic, lãng mạn, couple, love songs')
INSERT [dbo].[the_loai] ([id], [ten], [search_tags]) VALUES (N'g-004', N'Ballad', N'nhạc buồn, sad, lofi, ballad, thất tình, tâm trạng, sad songs')
INSERT [dbo].[the_loai] ([id], [ten], [search_tags]) VALUES (N'g-005', N'Podcast', N'podcast, radio, talkshow, kể chuyện, tâm sự, show')
INSERT [dbo].[the_loai] ([id], [ten], [search_tags]) VALUES (N'g-006', N'Pop', N'pop, us-uk, pop music')
INSERT [dbo].[the_loai] ([id], [ten], [search_tags]) VALUES (N'g-007', N'V-Pop', N'v-pop, vpop, việt nam, nhạc trẻ, nhạc việt')
GO
INSERT [dbo].[the_loai_album] ([id_album], [id_the_loai]) VALUES (N'7a6b5c4d-3e2f-1a0b-9c8d-7e6f5a4b3c2d', N'g-001')
INSERT [dbo].[the_loai_album] ([id_album], [id_the_loai]) VALUES (N'7a6b5c4d-3e2f-1a0b-9c8d-7e6f5a4b3c2d', N'g-007')
INSERT [dbo].[the_loai_album] ([id_album], [id_the_loai]) VALUES (N'9f8e7d6c-5b4a-3c2d-1a0f-9e8d7c6b5a4d', N'g-002')
INSERT [dbo].[the_loai_album] ([id_album], [id_the_loai]) VALUES (N'album-chillwithme-001', N'g-004')
INSERT [dbo].[the_loai_album] ([id_album], [id_the_loai]) VALUES (N'album-chillwithme-001', N'g-007')
INSERT [dbo].[the_loai_album] ([id_album], [id_the_loai]) VALUES (N'album-curtaincall-001', N'g-002')
INSERT [dbo].[the_loai_album] ([id_album], [id_the_loai]) VALUES (N'album-ninetrackmind-001', N'g-001')
INSERT [dbo].[the_loai_album] ([id_album], [id_the_loai]) VALUES (N'album-ninetrackmind-001', N'g-006')
GO
INSERT [dbo].[the_loai_artist] ([artist_id], [id_the_loai]) VALUES (N'8c1b69d6-4b8a-4b0d-9b0d-7d6c1f0e9bc1', N'g-004')
INSERT [dbo].[the_loai_artist] ([artist_id], [id_the_loai]) VALUES (N'8c1b69d6-4b8a-4b0d-9b0d-7d6c1f0e9bc1', N'g-007')
INSERT [dbo].[the_loai_artist] ([artist_id], [id_the_loai]) VALUES (N'a0b8d8d7-e8f6-4a53-a2d1-f0e9d8c7b6a5', N'g-007')
INSERT [dbo].[the_loai_artist] ([artist_id], [id_the_loai]) VALUES (N'artist-charlieputh-001', N'g-001')
INSERT [dbo].[the_loai_artist] ([artist_id], [id_the_loai]) VALUES (N'artist-charlieputh-001', N'g-006')
INSERT [dbo].[the_loai_artist] ([artist_id], [id_the_loai]) VALUES (N'c82a3d4-e6f6-a708-c9d0-e1f2a3b4c5d6', N'g-007')
INSERT [dbo].[the_loai_artist] ([artist_id], [id_the_loai]) VALUES (N'd9f8c7b6-a5b4-c3d2-e1f0-a9b8c7d6e5f4', N'g-004')
INSERT [dbo].[the_loai_artist] ([artist_id], [id_the_loai]) VALUES (N'd9f8c7b6-a5b4-c3d2-e1f0-a9b8c7d6e5f4', N'g-007')
INSERT [dbo].[the_loai_artist] ([artist_id], [id_the_loai]) VALUES (N'e7d6c5b4-a3b2-c1d0-e9f8-a7b6c5d4e3f2', N'g-002')
INSERT [dbo].[the_loai_artist] ([artist_id], [id_the_loai]) VALUES (N'f1e0d9c8-b5a6-9878-c5d6-e2f1a0b9c8d7', N'g-004')
INSERT [dbo].[the_loai_artist] ([artist_id], [id_the_loai]) VALUES (N'f1e0d9c8-b5a6-9878-c5d6-e2f1a0b9c8d7', N'g-007')
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [idx_album_tieu_de]    Script Date: 13/03/2026 12:42:01 CH ******/
CREATE NONCLUSTERED INDEX [idx_album_tieu_de] ON [dbo].[album]
(
	[tieu_de] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [idx_artists_ten]    Script Date: 13/03/2026 12:42:01 CH ******/
CREATE NONCLUSTERED INDEX [idx_artists_ten] ON [dbo].[artists]
(
	[ten] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [idx_lich_su_nghe_user_time]    Script Date: 13/03/2026 12:42:01 CH ******/
CREATE NONCLUSTERED INDEX [idx_lich_su_nghe_user_time] ON [dbo].[lich_su_nghe]
(
	[id_nguoi_dung] ASC,
	[ngay_nghe] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_provider_id]    Script Date: 13/03/2026 12:42:01 CH ******/
ALTER TABLE [dbo].[profiles] ADD  CONSTRAINT [UQ_provider_id] UNIQUE NONCLUSTERED 
(
	[provider] ASC,
	[provider_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [idx_songs_tieu_de]    Script Date: 13/03/2026 12:42:01 CH ******/
CREATE NONCLUSTERED INDEX [idx_songs_tieu_de] ON [dbo].[songs]
(
	[tieu_de] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__the_loai__DC107AB1F0019427]    Script Date: 13/03/2026 12:42:01 CH ******/
ALTER TABLE [dbo].[the_loai] ADD UNIQUE NONCLUSTERED 
(
	[ten] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[bai_hat_trong_playlist] ADD  DEFAULT (getdate()) FOR [ngay_them]
GO
ALTER TABLE [dbo].[lich_su_nghe] ADD  DEFAULT (getdate()) FOR [ngay_nghe]
GO
ALTER TABLE [dbo].[playlists] ADD  DEFAULT ('user_created') FOR [loai_playlist]
GO
ALTER TABLE [dbo].[playlists] ADD  DEFAULT ((1)) FOR [cong_khai]
GO
ALTER TABLE [dbo].[profiles] ADD  DEFAULT ('user') FOR [vai_tro]
GO
ALTER TABLE [dbo].[profiles] ADD  DEFAULT ((0)) FOR [is_email_verified]
GO
ALTER TABLE [dbo].[songs] ADD  DEFAULT ((0)) FOR [luot_nghe]
GO
ALTER TABLE [dbo].[songs] ADD  DEFAULT (getdate()) FOR [ngay_tai_len]
GO
ALTER TABLE [dbo].[songs] ADD  DEFAULT ('published') FOR [trang_thai]
GO
ALTER TABLE [dbo].[user_daily_mixes] ADD  DEFAULT (CONVERT([date],getdate())) FOR [ngay_tao]
GO
ALTER TABLE [dbo].[album]  WITH CHECK ADD FOREIGN KEY([artist_id])
REFERENCES [dbo].[artists] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[album_da_luu]  WITH CHECK ADD FOREIGN KEY([id_album])
REFERENCES [dbo].[album] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[album_da_luu]  WITH CHECK ADD FOREIGN KEY([id_nguoi_dung])
REFERENCES [dbo].[profiles] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[artists]  WITH CHECK ADD  CONSTRAINT [FK_artists_profiles] FOREIGN KEY([profile_id])
REFERENCES [dbo].[profiles] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[artists] CHECK CONSTRAINT [FK_artists_profiles]
GO
ALTER TABLE [dbo].[bai_hat_trong_daily_mix]  WITH CHECK ADD FOREIGN KEY([mix_id])
REFERENCES [dbo].[user_daily_mixes] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[bai_hat_trong_daily_mix]  WITH CHECK ADD FOREIGN KEY([song_id])
REFERENCES [dbo].[songs] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[bai_hat_trong_playlist]  WITH CHECK ADD FOREIGN KEY([playlist_id])
REFERENCES [dbo].[playlists] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[bai_hat_trong_playlist]  WITH CHECK ADD FOREIGN KEY([song_id])
REFERENCES [dbo].[songs] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[lich_su_nghe]  WITH CHECK ADD FOREIGN KEY([id_nguoi_dung])
REFERENCES [dbo].[profiles] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[lich_su_nghe]  WITH CHECK ADD FOREIGN KEY([song_id])
REFERENCES [dbo].[songs] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[nghe_si_theo_doi]  WITH CHECK ADD FOREIGN KEY([artist_id])
REFERENCES [dbo].[artists] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[nghe_si_theo_doi]  WITH CHECK ADD FOREIGN KEY([id_nguoi_dung])
REFERENCES [dbo].[profiles] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[playlist_da_luu]  WITH CHECK ADD FOREIGN KEY([id_nguoi_dung])
REFERENCES [dbo].[profiles] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[playlist_da_luu]  WITH CHECK ADD FOREIGN KEY([playlist_id])
REFERENCES [dbo].[playlists] ([id])
GO
ALTER TABLE [dbo].[playlists]  WITH CHECK ADD FOREIGN KEY([id_nguoi_tao])
REFERENCES [dbo].[profiles] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[songs]  WITH CHECK ADD FOREIGN KEY([artist_id])
REFERENCES [dbo].[artists] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[songs]  WITH CHECK ADD FOREIGN KEY([id_album])
REFERENCES [dbo].[album] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[songs]  WITH CHECK ADD  CONSTRAINT [FK_songs_uploader] FOREIGN KEY([uploader_id])
REFERENCES [dbo].[profiles] ([id])
GO
ALTER TABLE [dbo].[songs] CHECK CONSTRAINT [FK_songs_uploader]
GO
ALTER TABLE [dbo].[the_loai_album]  WITH CHECK ADD FOREIGN KEY([id_album])
REFERENCES [dbo].[album] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[the_loai_album]  WITH CHECK ADD FOREIGN KEY([id_the_loai])
REFERENCES [dbo].[the_loai] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[the_loai_artist]  WITH CHECK ADD FOREIGN KEY([artist_id])
REFERENCES [dbo].[artists] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[the_loai_artist]  WITH CHECK ADD FOREIGN KEY([id_the_loai])
REFERENCES [dbo].[the_loai] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[the_loai_playlist]  WITH CHECK ADD FOREIGN KEY([id_the_loai])
REFERENCES [dbo].[the_loai] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[the_loai_playlist]  WITH CHECK ADD FOREIGN KEY([playlist_id])
REFERENCES [dbo].[playlists] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[user_daily_mixes]  WITH CHECK ADD FOREIGN KEY([id_nguoi_dung])
REFERENCES [dbo].[profiles] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[user_daily_mixes]  WITH CHECK ADD FOREIGN KEY([id_the_loai_chinh])
REFERENCES [dbo].[the_loai] ([id])
GO
ALTER TABLE [dbo].[playlists]  WITH CHECK ADD  CONSTRAINT [chk_loai_playlist] CHECK  (([loai_playlist]='mix' OR [loai_playlist]='editorial' OR [loai_playlist]='liked_songs' OR [loai_playlist]='user_created'))
GO
ALTER TABLE [dbo].[playlists] CHECK CONSTRAINT [chk_loai_playlist]
GO
ALTER TABLE [dbo].[songs]  WITH CHECK ADD  CONSTRAINT [chk_song_status] CHECK  (([trang_thai]='rejected' OR [trang_thai]='hidden' OR [trang_thai]='published' OR [trang_thai]='pending'))
GO
ALTER TABLE [dbo].[songs] CHECK CONSTRAINT [chk_song_status]
GO
USE [master]
GO
ALTER DATABASE [buzzify] SET  READ_WRITE 
GO
