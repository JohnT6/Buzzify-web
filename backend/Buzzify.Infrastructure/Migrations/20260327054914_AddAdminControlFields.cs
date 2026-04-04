using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Buzzify.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminControlFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "profiles",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    ho_ten = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    anh_dai_dien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    vai_tro = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "user"),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    provider = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    provider_id = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    is_email_verified = table.Column<bool>(type: "bit", nullable: false),
                    verification_code_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    verification_code_expiry = table.Column<DateTime>(type: "datetime", nullable: true),
                    last_song_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: true),
                    last_queue_ids = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    last_source_info = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    last_position = table.Column<double>(type: "float", nullable: true),
                    bio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    link = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    anh_dai_dien_provider = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsLocked = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__profiles__3213E83FF47D26C4", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "the_loai",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    ten = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    search_tags = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__the_loai__3213E83FC09AFAB6", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "artists",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    ten = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    anh_dai_dien = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    profile_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: true),
                    follower_count = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CoverImage = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__artists__3213E83F1E17383B", x => x.id);
                    table.ForeignKey(
                        name: "FK_artists_profiles",
                        column: x => x.profile_id,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "playlists",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    ten = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    id_nguoi_tao = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    anh_bia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    mo_ta = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    loai_playlist = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "user_created"),
                    cong_khai = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsSystem = table.Column<bool>(type: "bit", nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__playlist__3213E83F54BD9D14", x => x.id);
                    table.ForeignKey(
                        name: "FK__playlists__id_ng__75A278F5",
                        column: x => x.id_nguoi_tao,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_daily_mixes",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    id_nguoi_dung = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    tieu_de = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    id_the_loai_chinh = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: true),
                    ngay_tao = table.Column<DateOnly>(type: "date", nullable: true, defaultValueSql: "(CONVERT([date],getdate()))")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__user_dai__3213E83F37346270", x => x.id);
                    table.ForeignKey(
                        name: "FK__user_dail__id_ng__1CBC4616",
                        column: x => x.id_nguoi_dung,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__user_dail__id_th__1DB06A4F",
                        column: x => x.id_the_loai_chinh,
                        principalTable: "the_loai",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "album",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    tieu_de = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    anh_bia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    artist_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: true),
                    ngay_phat_hanh = table.Column<DateOnly>(type: "date", nullable: true),
                    scheduled_publish_date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__album__3213E83F491DAF30", x => x.id);
                    table.ForeignKey(
                        name: "FK__album__artist_id__6B24EA82",
                        column: x => x.artist_id,
                        principalTable: "artists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "nghe_si_theo_doi",
                columns: table => new
                {
                    id_nguoi_dung = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    artist_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__nghe_si___731BA51EF3826680", x => new { x.id_nguoi_dung, x.artist_id });
                    table.ForeignKey(
                        name: "FK__nghe_si_t__artis__71D1E811",
                        column: x => x.artist_id,
                        principalTable: "artists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__nghe_si_t__id_ng__72C60C4A",
                        column: x => x.id_nguoi_dung,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "the_loai_artist",
                columns: table => new
                {
                    artist_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    id_the_loai = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__the_loai__71662BA966A5BAE2", x => new { x.artist_id, x.id_the_loai });
                    table.ForeignKey(
                        name: "FK__the_loai___artis__7A672E12",
                        column: x => x.artist_id,
                        principalTable: "artists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__the_loai___id_th__7B5B524B",
                        column: x => x.id_the_loai,
                        principalTable: "the_loai",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "playlist_da_luu",
                columns: table => new
                {
                    id_nguoi_dung = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    playlist_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__playlist__6A6F605FB548F51F", x => new { x.id_nguoi_dung, x.playlist_id });
                    table.ForeignKey(
                        name: "FK__playlist___id_ng__73BA3083",
                        column: x => x.id_nguoi_dung,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__playlist___playl__74AE54BC",
                        column: x => x.playlist_id,
                        principalTable: "playlists",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "the_loai_playlist",
                columns: table => new
                {
                    playlist_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    id_the_loai = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__the_loai__E62A7FB88C9FB010", x => new { x.playlist_id, x.id_the_loai });
                    table.ForeignKey(
                        name: "FK__the_loai___id_th__7C4F7684",
                        column: x => x.id_the_loai,
                        principalTable: "the_loai",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__the_loai___playl__7D439ABD",
                        column: x => x.playlist_id,
                        principalTable: "playlists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "album_da_luu",
                columns: table => new
                {
                    id_nguoi_dung = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    id_album = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__album_da__0297EDE35857E273", x => new { x.id_nguoi_dung, x.id_album });
                    table.ForeignKey(
                        name: "FK__album_da___id_al__6C190EBB",
                        column: x => x.id_album,
                        principalTable: "album",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__album_da___id_ng__6D0D32F4",
                        column: x => x.id_nguoi_dung,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "songs",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    tieu_de = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    anh_bia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    thoi_luong_giay = table.Column<int>(type: "int", nullable: true),
                    luot_nghe = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    artist_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: true),
                    id_album = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: true),
                    nghe_si_hop_tac = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    track_number = table.Column<int>(type: "int", nullable: true),
                    uploader_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: true),
                    ngay_tai_len = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    scheduled_publish_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    trang_thai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "published"),
                    IsMuted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__songs__3213E83F4E37F8AB", x => x.id);
                    table.ForeignKey(
                        name: "FK__songs__artist_id__76969D2E",
                        column: x => x.artist_id,
                        principalTable: "artists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK__songs__id_album__778AC167",
                        column: x => x.id_album,
                        principalTable: "album",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_songs_uploader",
                        column: x => x.uploader_id,
                        principalTable: "profiles",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "the_loai_album",
                columns: table => new
                {
                    id_album = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    id_the_loai = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__the_loai__69A2A47E96A9542F", x => new { x.id_album, x.id_the_loai });
                    table.ForeignKey(
                        name: "FK__the_loai___id_al__787EE5A0",
                        column: x => x.id_album,
                        principalTable: "album",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__the_loai___id_th__797309D9",
                        column: x => x.id_the_loai,
                        principalTable: "the_loai",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bai_hat_trong_daily_mix",
                columns: table => new
                {
                    mix_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    song_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    thu_tu = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__bai_hat___1CC42EDE9BB371CF", x => new { x.mix_id, x.song_id });
                    table.ForeignKey(
                        name: "FK__bai_hat_t__mix_i__208CD6FA",
                        column: x => x.mix_id,
                        principalTable: "user_daily_mixes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__bai_hat_t__song___2180FB33",
                        column: x => x.song_id,
                        principalTable: "songs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bai_hat_trong_playlist",
                columns: table => new
                {
                    playlist_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    song_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    ngay_them = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__bai_hat___21CF4EF115816D46", x => new { x.playlist_id, x.song_id });
                    table.ForeignKey(
                        name: "FK__bai_hat_t__playl__6E01572D",
                        column: x => x.playlist_id,
                        principalTable: "playlists",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__bai_hat_t__song___6EF57B66",
                        column: x => x.song_id,
                        principalTable: "songs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "lich_su_nghe",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_nguoi_dung = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    song_id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    ngay_nghe = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__lich_su___3213E83FF3A4F20D", x => x.id);
                    table.ForeignKey(
                        name: "FK__lich_su_n__id_ng__6FE99F9F",
                        column: x => x.id_nguoi_dung,
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__lich_su_n__song___70DDC3D8",
                        column: x => x.song_id,
                        principalTable: "songs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_album_tieu_de",
                table: "album",
                column: "tieu_de");

            migrationBuilder.CreateIndex(
                name: "IX_album_artist_id",
                table: "album",
                column: "artist_id");

            migrationBuilder.CreateIndex(
                name: "IX_album_da_luu_id_album",
                table: "album_da_luu",
                column: "id_album");

            migrationBuilder.CreateIndex(
                name: "idx_artists_ten",
                table: "artists",
                column: "ten");

            migrationBuilder.CreateIndex(
                name: "IX_artists_profile_id",
                table: "artists",
                column: "profile_id");

            migrationBuilder.CreateIndex(
                name: "IX_bai_hat_trong_daily_mix_song_id",
                table: "bai_hat_trong_daily_mix",
                column: "song_id");

            migrationBuilder.CreateIndex(
                name: "IX_bai_hat_trong_playlist_song_id",
                table: "bai_hat_trong_playlist",
                column: "song_id");

            migrationBuilder.CreateIndex(
                name: "idx_lich_su_nghe_user_time",
                table: "lich_su_nghe",
                columns: new[] { "id_nguoi_dung", "ngay_nghe" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_lich_su_nghe_song_id",
                table: "lich_su_nghe",
                column: "song_id");

            migrationBuilder.CreateIndex(
                name: "IX_nghe_si_theo_doi_artist_id",
                table: "nghe_si_theo_doi",
                column: "artist_id");

            migrationBuilder.CreateIndex(
                name: "IX_playlist_da_luu_playlist_id",
                table: "playlist_da_luu",
                column: "playlist_id");

            migrationBuilder.CreateIndex(
                name: "IX_playlists_id_nguoi_tao",
                table: "playlists",
                column: "id_nguoi_tao");

            migrationBuilder.CreateIndex(
                name: "UQ_provider_id",
                table: "profiles",
                columns: new[] { "provider", "provider_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_songs_tieu_de",
                table: "songs",
                column: "tieu_de");

            migrationBuilder.CreateIndex(
                name: "IX_songs_artist_id",
                table: "songs",
                column: "artist_id");

            migrationBuilder.CreateIndex(
                name: "IX_songs_id_album",
                table: "songs",
                column: "id_album");

            migrationBuilder.CreateIndex(
                name: "IX_songs_uploader_id",
                table: "songs",
                column: "uploader_id");

            migrationBuilder.CreateIndex(
                name: "UQ__the_loai__DC107AB1F0019427",
                table: "the_loai",
                column: "ten",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_the_loai_album_id_the_loai",
                table: "the_loai_album",
                column: "id_the_loai");

            migrationBuilder.CreateIndex(
                name: "IX_the_loai_artist_id_the_loai",
                table: "the_loai_artist",
                column: "id_the_loai");

            migrationBuilder.CreateIndex(
                name: "IX_the_loai_playlist_id_the_loai",
                table: "the_loai_playlist",
                column: "id_the_loai");

            migrationBuilder.CreateIndex(
                name: "IX_user_daily_mixes_id_nguoi_dung",
                table: "user_daily_mixes",
                column: "id_nguoi_dung");

            migrationBuilder.CreateIndex(
                name: "IX_user_daily_mixes_id_the_loai_chinh",
                table: "user_daily_mixes",
                column: "id_the_loai_chinh");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "album_da_luu");

            migrationBuilder.DropTable(
                name: "bai_hat_trong_daily_mix");

            migrationBuilder.DropTable(
                name: "bai_hat_trong_playlist");

            migrationBuilder.DropTable(
                name: "lich_su_nghe");

            migrationBuilder.DropTable(
                name: "nghe_si_theo_doi");

            migrationBuilder.DropTable(
                name: "playlist_da_luu");

            migrationBuilder.DropTable(
                name: "the_loai_album");

            migrationBuilder.DropTable(
                name: "the_loai_artist");

            migrationBuilder.DropTable(
                name: "the_loai_playlist");

            migrationBuilder.DropTable(
                name: "user_daily_mixes");

            migrationBuilder.DropTable(
                name: "songs");

            migrationBuilder.DropTable(
                name: "playlists");

            migrationBuilder.DropTable(
                name: "the_loai");

            migrationBuilder.DropTable(
                name: "album");

            migrationBuilder.DropTable(
                name: "artists");

            migrationBuilder.DropTable(
                name: "profiles");
        }
    }
}
