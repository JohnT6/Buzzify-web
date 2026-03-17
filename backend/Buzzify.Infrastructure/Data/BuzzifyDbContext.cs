using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Buzzify.Core.Entities;

namespace Buzzify.Infrastructure.Data;

public partial class BuzzifyDbContext : DbContext
{
    public BuzzifyDbContext()
    {
    }

    public BuzzifyDbContext(DbContextOptions<BuzzifyDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Album> Albums { get; set; }

    public virtual DbSet<Artist> Artists { get; set; }

    public virtual DbSet<BaiHatTrongDailyMix> BaiHatTrongDailyMixes { get; set; }

    public virtual DbSet<BaiHatTrongPlaylist> BaiHatTrongPlaylists { get; set; }

    public virtual DbSet<LichSuNghe> LichSuNghes { get; set; }

    public virtual DbSet<Playlist> Playlists { get; set; }

    public virtual DbSet<Profile> Profiles { get; set; }

    public virtual DbSet<Song> Songs { get; set; }

    public virtual DbSet<TheLoai> TheLoais { get; set; }

    public virtual DbSet<UserDailyMix> UserDailyMixes { get; set; }

    public virtual DbSet<VwUserFavoriteGenre> VwUserFavoriteGenres { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            // Cấu hình đã được xử lý trong Program.cs thông qua Dependency Injection.
            // Đoạn mã này chỉ để tránh lỗi khi dùng EF Core Tools nếu cần.
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseCollation("SQL_Latin1_General_CP1_CI_AS");

        modelBuilder.Entity<Album>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__album__3213E83F491DAF30");

            entity.ToTable("album");

            entity.HasIndex(e => e.TieuDe, "idx_album_tieu_de");

            entity.Property(e => e.Id)
                .HasMaxLength(36)
                .HasColumnName("id");
            entity.Property(e => e.AnhBia).HasColumnName("anh_bia");
            entity.Property(e => e.ArtistId)
                .HasMaxLength(36)
                .HasColumnName("artist_id");
            entity.Property(e => e.NgayPhatHanh).HasColumnName("ngay_phat_hanh");
            entity.Property(e => e.TieuDe)
                .HasMaxLength(255)
                .HasColumnName("tieu_de");

            entity.HasOne(d => d.Artist).WithMany(p => p.Albums)
                .HasForeignKey(d => d.ArtistId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__album__artist_id__6B24EA82");

            entity.HasMany(d => d.IdTheLoais).WithMany(p => p.IdAlbums)
                .UsingEntity<Dictionary<string, object>>(
                    "TheLoaiAlbum",
                    r => r.HasOne<TheLoai>().WithMany()
                        .HasForeignKey("IdTheLoai")
                        .HasConstraintName("FK__the_loai___id_th__797309D9"),
                    l => l.HasOne<Album>().WithMany()
                        .HasForeignKey("IdAlbum")
                        .HasConstraintName("FK__the_loai___id_al__787EE5A0"),
                    j =>
                    {
                        j.HasKey("IdAlbum", "IdTheLoai").HasName("PK__the_loai__69A2A47E96A9542F");
                        j.ToTable("the_loai_album");
                        j.IndexerProperty<string>("IdAlbum")
                            .HasMaxLength(36)
                            .HasColumnName("id_album");
                        j.IndexerProperty<string>("IdTheLoai")
                            .HasMaxLength(36)
                            .HasColumnName("id_the_loai");
                    });
        });

        modelBuilder.Entity<Artist>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__artists__3213E83F1E17383B");

            entity.ToTable("artists");

            entity.HasIndex(e => e.Ten, "idx_artists_ten");

            entity.Property(e => e.Id)
                .HasMaxLength(36)
                .HasColumnName("id");
            entity.Property(e => e.AnhDaiDien).HasColumnName("anh_dai_dien");
            entity.Property(e => e.ProfileId)
                .HasMaxLength(36)
                .HasColumnName("profile_id");
            entity.Property(e => e.Ten)
                .HasMaxLength(255)
                .HasColumnName("ten");

            entity.HasOne(d => d.Profile).WithMany(p => p.Artists)
                .HasForeignKey(d => d.ProfileId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_artists_profiles");

            entity.HasMany(d => d.IdTheLoais).WithMany(p => p.Artists)
                .UsingEntity<Dictionary<string, object>>(
                    "TheLoaiArtist",
                    r => r.HasOne<TheLoai>().WithMany()
                        .HasForeignKey("IdTheLoai")
                        .HasConstraintName("FK__the_loai___id_th__7B5B524B"),
                    l => l.HasOne<Artist>().WithMany()
                        .HasForeignKey("ArtistId")
                        .HasConstraintName("FK__the_loai___artis__7A672E12"),
                    j =>
                    {
                        j.HasKey("ArtistId", "IdTheLoai").HasName("PK__the_loai__71662BA966A5BAE2");
                        j.ToTable("the_loai_artist");
                        j.IndexerProperty<string>("ArtistId")
                            .HasMaxLength(36)
                            .HasColumnName("artist_id");
                        j.IndexerProperty<string>("IdTheLoai")
                            .HasMaxLength(36)
                            .HasColumnName("id_the_loai");
                    });
        });

        modelBuilder.Entity<BaiHatTrongDailyMix>(entity =>
        {
            entity.HasKey(e => new { e.MixId, e.SongId }).HasName("PK__bai_hat___1CC42EDE9BB371CF");

            entity.ToTable("bai_hat_trong_daily_mix");

            entity.Property(e => e.MixId)
                .HasMaxLength(36)
                .HasColumnName("mix_id");
            entity.Property(e => e.SongId)
                .HasMaxLength(36)
                .HasColumnName("song_id");
            entity.Property(e => e.ThuTu).HasColumnName("thu_tu");

            entity.HasOne(d => d.Mix).WithMany(p => p.BaiHatTrongDailyMixes)
                .HasForeignKey(d => d.MixId)
                .HasConstraintName("FK__bai_hat_t__mix_i__208CD6FA");

            entity.HasOne(d => d.Song).WithMany(p => p.BaiHatTrongDailyMixes)
                .HasForeignKey(d => d.SongId)
                .HasConstraintName("FK__bai_hat_t__song___2180FB33");
        });

        modelBuilder.Entity<BaiHatTrongPlaylist>(entity =>
        {
            entity.HasKey(e => new { e.PlaylistId, e.SongId }).HasName("PK__bai_hat___21CF4EF115816D46");

            entity.ToTable("bai_hat_trong_playlist");

            entity.Property(e => e.PlaylistId)
                .HasMaxLength(36)
                .HasColumnName("playlist_id");
            entity.Property(e => e.SongId)
                .HasMaxLength(36)
                .HasColumnName("song_id");
            entity.Property(e => e.NgayThem)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("ngay_them");

            entity.HasOne(d => d.Playlist).WithMany(p => p.BaiHatTrongPlaylists)
                .HasForeignKey(d => d.PlaylistId)
                .HasConstraintName("FK__bai_hat_t__playl__6E01572D");

            entity.HasOne(d => d.Song).WithMany(p => p.BaiHatTrongPlaylists)
                .HasForeignKey(d => d.SongId)
                .HasConstraintName("FK__bai_hat_t__song___6EF57B66");
        });

        modelBuilder.Entity<LichSuNghe>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__lich_su___3213E83FF3A4F20D");

            entity.ToTable("lich_su_nghe");

            entity.HasIndex(e => new { e.IdNguoiDung, e.NgayNghe }, "idx_lich_su_nghe_user_time").IsDescending(false, true);

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IdNguoiDung)
                .HasMaxLength(36)
                .HasColumnName("id_nguoi_dung");
            entity.Property(e => e.NgayNghe)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("ngay_nghe");
            entity.Property(e => e.SongId)
                .HasMaxLength(36)
                .HasColumnName("song_id");

            entity.HasOne(d => d.IdNguoiDungNavigation).WithMany(p => p.LichSuNghes)
                .HasForeignKey(d => d.IdNguoiDung)
                .HasConstraintName("FK__lich_su_n__id_ng__6FE99F9F");

            entity.HasOne(d => d.Song).WithMany(p => p.LichSuNghes)
                .HasForeignKey(d => d.SongId)
                .HasConstraintName("FK__lich_su_n__song___70DDC3D8");
        });

        modelBuilder.Entity<Playlist>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__playlist__3213E83F54BD9D14");

            entity.ToTable("playlists");

            entity.Property(e => e.Id)
                .HasMaxLength(36)
                .HasColumnName("id");
            entity.Property(e => e.AnhBia).HasColumnName("anh_bia");
            entity.Property(e => e.CongKhai)
                .HasDefaultValue(true)
                .HasColumnName("cong_khai");
            entity.Property(e => e.IdNguoiTao)
                .HasMaxLength(36)
                .HasColumnName("id_nguoi_tao");
            entity.Property(e => e.LoaiPlaylist)
                .HasMaxLength(20)
                .HasDefaultValue("user_created")
                .HasColumnName("loai_playlist");
            entity.Property(e => e.MoTa).HasColumnName("mo_ta");
            entity.Property(e => e.Ten)
                .HasMaxLength(255)
                .HasColumnName("ten");

            entity.HasOne(d => d.IdNguoiTaoNavigation).WithMany(p => p.Playlists)
                .HasForeignKey(d => d.IdNguoiTao)
                .HasConstraintName("FK__playlists__id_ng__75A278F5");

            entity.HasMany(d => d.IdTheLoais).WithMany(p => p.Playlists)
                .UsingEntity<Dictionary<string, object>>(
                    "TheLoaiPlaylist",
                    r => r.HasOne<TheLoai>().WithMany()
                        .HasForeignKey("IdTheLoai")
                        .HasConstraintName("FK__the_loai___id_th__7C4F7684"),
                    l => l.HasOne<Playlist>().WithMany()
                        .HasForeignKey("PlaylistId")
                        .HasConstraintName("FK__the_loai___playl__7D439ABD"),
                    j =>
                    {
                        j.HasKey("PlaylistId", "IdTheLoai").HasName("PK__the_loai__E62A7FB88C9FB010");
                        j.ToTable("the_loai_playlist");
                        j.IndexerProperty<string>("PlaylistId")
                            .HasMaxLength(36)
                            .HasColumnName("playlist_id");
                        j.IndexerProperty<string>("IdTheLoai")
                            .HasMaxLength(36)
                            .HasColumnName("id_the_loai");
                    });
        });

        modelBuilder.Entity<Profile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__profiles__3213E83FF47D26C4");

            entity.ToTable("profiles");

            entity.HasIndex(e => new { e.Provider, e.ProviderId }, "UQ_provider_id").IsUnique();

            entity.Property(e => e.Id)
                .HasMaxLength(36)
                .HasColumnName("id");
            entity.Property(e => e.AnhDaiDien).HasColumnName("anh_dai_dien");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.HoTen)
                .HasMaxLength(255)
                .HasColumnName("ho_ten");
            entity.Property(e => e.IsEmailVerified).HasColumnName("is_email_verified");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .HasColumnName("password_hash");
            entity.Property(e => e.Provider)
                .HasMaxLength(50)
                .HasColumnName("provider");
            entity.Property(e => e.ProviderId)
                .HasMaxLength(255)
                .HasColumnName("provider_id");
            entity.Property(e => e.VaiTro)
                .HasMaxLength(50)
                .HasDefaultValue("user")
                .HasColumnName("vai_tro");
            entity.Property(e => e.VerificationCodeExpiry)
                .HasColumnType("datetime")
                .HasColumnName("verification_code_expiry");
            entity.Property(e => e.VerificationCodeHash)
                .HasMaxLength(255)
                .HasColumnName("verification_code_hash");

            entity.HasMany(d => d.ArtistsNavigation).WithMany(p => p.IdNguoiDungs)
                .UsingEntity<Dictionary<string, object>>(
                    "NgheSiTheoDoi",
                    r => r.HasOne<Artist>().WithMany()
                        .HasForeignKey("ArtistId")
                        .HasConstraintName("FK__nghe_si_t__artis__71D1E811"),
                    l => l.HasOne<Profile>().WithMany()
                        .HasForeignKey("IdNguoiDung")
                        .HasConstraintName("FK__nghe_si_t__id_ng__72C60C4A"),
                    j =>
                    {
                        j.HasKey("IdNguoiDung", "ArtistId").HasName("PK__nghe_si___731BA51EF3826680");
                        j.ToTable("nghe_si_theo_doi");
                        j.IndexerProperty<string>("IdNguoiDung")
                            .HasMaxLength(36)
                            .HasColumnName("id_nguoi_dung");
                        j.IndexerProperty<string>("ArtistId")
                            .HasMaxLength(36)
                            .HasColumnName("artist_id");
                    });

            entity.HasMany(d => d.IdAlbums).WithMany(p => p.IdNguoiDungs)
                .UsingEntity<Dictionary<string, object>>(
                    "AlbumDaLuu",
                    r => r.HasOne<Album>().WithMany()
                        .HasForeignKey("IdAlbum")
                        .HasConstraintName("FK__album_da___id_al__6C190EBB"),
                    l => l.HasOne<Profile>().WithMany()
                        .HasForeignKey("IdNguoiDung")
                        .HasConstraintName("FK__album_da___id_ng__6D0D32F4"),
                    j =>
                    {
                        j.HasKey("IdNguoiDung", "IdAlbum").HasName("PK__album_da__0297EDE35857E273");
                        j.ToTable("album_da_luu");
                        j.IndexerProperty<string>("IdNguoiDung")
                            .HasMaxLength(36)
                            .HasColumnName("id_nguoi_dung");
                        j.IndexerProperty<string>("IdAlbum")
                            .HasMaxLength(36)
                            .HasColumnName("id_album");
                    });

            entity.HasMany(d => d.PlaylistsNavigation).WithMany(p => p.IdNguoiDungs)
                .UsingEntity<Dictionary<string, object>>(
                    "PlaylistDaLuu",
                    r => r.HasOne<Playlist>().WithMany()
                        .HasForeignKey("PlaylistId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__playlist___playl__74AE54BC"),
                    l => l.HasOne<Profile>().WithMany()
                        .HasForeignKey("IdNguoiDung")
                        .HasConstraintName("FK__playlist___id_ng__73BA3083"),
                    j =>
                    {
                        j.HasKey("IdNguoiDung", "PlaylistId").HasName("PK__playlist__6A6F605FB548F51F");
                        j.ToTable("playlist_da_luu");
                        j.IndexerProperty<string>("IdNguoiDung")
                            .HasMaxLength(36)
                            .HasColumnName("id_nguoi_dung");
                        j.IndexerProperty<string>("PlaylistId")
                            .HasMaxLength(36)
                            .HasColumnName("playlist_id");
                    });
        });

        modelBuilder.Entity<Song>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__songs__3213E83F4E37F8AB");

            entity.ToTable("songs");

            entity.HasIndex(e => e.TieuDe, "idx_songs_tieu_de");

            entity.Property(e => e.Id)
                .HasMaxLength(36)
                .HasColumnName("id");
            entity.Property(e => e.AnhBia).HasColumnName("anh_bia");
            entity.Property(e => e.ArtistId)
                .HasMaxLength(36)
                .HasColumnName("artist_id");
            entity.Property(e => e.IdAlbum)
                .HasMaxLength(36)
                .HasColumnName("id_album");
            entity.Property(e => e.LuotNghe)
                .HasDefaultValue(0)
                .HasColumnName("luot_nghe");
            entity.Property(e => e.NgayTaiLen)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("ngay_tai_len");
            entity.Property(e => e.NgheSiHopTac).HasColumnName("nghe_si_hop_tac");
            entity.Property(e => e.ThoiLuongGiay).HasColumnName("thoi_luong_giay");
            entity.Property(e => e.TieuDe)
                .HasMaxLength(255)
                .HasColumnName("tieu_de");
            entity.Property(e => e.TrackNumber).HasColumnName("track_number");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasDefaultValue("published")
                .HasColumnName("trang_thai");
            entity.Property(e => e.UploaderId)
                .HasMaxLength(36)
                .HasColumnName("uploader_id");
            entity.Property(e => e.Url).HasColumnName("url");

            entity.HasOne(d => d.Artist).WithMany(p => p.Songs)
                .HasForeignKey(d => d.ArtistId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__songs__artist_id__76969D2E");

            entity.HasOne(d => d.IdAlbumNavigation).WithMany(p => p.Songs)
                .HasForeignKey(d => d.IdAlbum)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK__songs__id_album__778AC167");

            entity.HasOne(d => d.Uploader).WithMany(p => p.Songs)
                .HasForeignKey(d => d.UploaderId)
                .HasConstraintName("FK_songs_uploader");
        });

        modelBuilder.Entity<TheLoai>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__the_loai__3213E83FC09AFAB6");

            entity.ToTable("the_loai");

            entity.HasIndex(e => e.Ten, "UQ__the_loai__DC107AB1F0019427").IsUnique();

            entity.Property(e => e.Id)
                .HasMaxLength(36)
                .HasColumnName("id");
            entity.Property(e => e.SearchTags)
                .HasMaxLength(500)
                .HasColumnName("search_tags");
            entity.Property(e => e.Ten)
                .HasMaxLength(255)
                .HasColumnName("ten");
        });

        modelBuilder.Entity<UserDailyMix>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__user_dai__3213E83F37346270");

            entity.ToTable("user_daily_mixes");

            entity.Property(e => e.Id)
                .HasMaxLength(36)
                .HasColumnName("id");
            entity.Property(e => e.IdNguoiDung)
                .HasMaxLength(36)
                .HasColumnName("id_nguoi_dung");
            entity.Property(e => e.IdTheLoaiChinh)
                .HasMaxLength(36)
                .HasColumnName("id_the_loai_chinh");
            entity.Property(e => e.NgayTao)
                .HasDefaultValueSql("(CONVERT([date],getdate()))")
                .HasColumnName("ngay_tao");
            entity.Property(e => e.TieuDe)
                .HasMaxLength(255)
                .HasColumnName("tieu_de");

            entity.HasOne(d => d.IdNguoiDungNavigation).WithMany(p => p.UserDailyMixes)
                .HasForeignKey(d => d.IdNguoiDung)
                .HasConstraintName("FK__user_dail__id_ng__1CBC4616");

            entity.HasOne(d => d.IdTheLoaiChinhNavigation).WithMany(p => p.UserDailyMixes)
                .HasForeignKey(d => d.IdTheLoaiChinh)
                .HasConstraintName("FK__user_dail__id_th__1DB06A4F");
        });

        modelBuilder.Entity<VwUserFavoriteGenre>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_user_favorite_genres");

            entity.Property(e => e.IdNguoiDung)
                .HasMaxLength(36)
                .HasColumnName("id_nguoi_dung");
            entity.Property(e => e.IdTheLoai)
                .HasMaxLength(36)
                .HasColumnName("id_the_loai");
            entity.Property(e => e.LanNgheCuoi)
                .HasColumnType("datetime")
                .HasColumnName("lan_nghe_cuoi");
            entity.Property(e => e.TenTheLoai)
                .HasMaxLength(255)
                .HasColumnName("ten_the_loai");
            entity.Property(e => e.TongLuotNghe).HasColumnName("tong_luot_nghe");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
