using System;
using System.Linq;
using System.Threading.Tasks;
using Buzzify.Core.Entities;
using Buzzify.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Buzzify.Infrastructure.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BuzzifyDbContext>();

            // 1. Cập nhật SQL Schema (Thêm cột nếu chưa có)
            await UpdateSchemaAsync(context);

            // 2. Tạo tài khoản Artist mẫu
            await SeedArtistUserAsync(context);

            // 3. Cập nhật tất cả bài hát cũ thành công khai (published) nếu bị rỗng
            await UpdateAllSongsToPublishedAsync(context);

            // 4. Tạo album cho các bài hát chưa có album (Single)
            await SeedAlbumsForSongsAsync(context);

            // 5. Tạo lịch sử nghe mẫu (để hiện biểu đồ)
            await SeedListeningHistoryAsync(context);

            // 6. Tạo tài khoản Admin/Artist cụ thể theo yêu cầu
            await SeedSpecificUsersAsync(context);

            // 7. Đánh dấu các playlist hệ thống
            await SeedSystemPlaylistsAsync(context);
        }

        private static async Task UpdateSchemaAsync(BuzzifyDbContext context)
        {
            var strategy = context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await TryAddColumnAsync(context, "songs", "scheduled_publish_date", "DATETIME NULL");
                await TryAddColumnAsync(context, "album", "scheduled_publish_date", "DATETIME NULL");
                await TryAddColumnAsync(context, "artists", "follower_count", "INT DEFAULT 0 NOT NULL");
                
                // Admin Controls Schema Updates
                await TryAddColumnAsync(context, "profiles", "is_locked", "BIT DEFAULT 0 NOT NULL");
                await TryAddColumnAsync(context, "profiles", "loai_tai_khoan", "NVARCHAR(50) DEFAULT 'thuong' NOT NULL");
                await TryAddColumnAsync(context, "artists", "is_verified", "BIT DEFAULT 0 NOT NULL");
                await TryAddColumnAsync(context, "artists", "bio", "NVARCHAR(MAX) NULL");
                await TryAddColumnAsync(context, "artists", "cover_image", "NVARCHAR(MAX) NULL");
                
                await TryAddColumnAsync(context, "playlists", "is_system", "BIT DEFAULT 0 NOT NULL");
                await TryAddColumnAsync(context, "playlists", "is_featured", "BIT DEFAULT 0 NOT NULL");
                
                await TryAddColumnAsync(context, "songs", "is_muted", "BIT DEFAULT 0 NOT NULL");
            });
        }

        private static async Task TryAddColumnAsync(BuzzifyDbContext context, string table, string column, string definition)
        {
            try
            {
                string sql = $@"
                    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[{table}]') AND name = '{column}')
                    BEGIN
                        ALTER TABLE [dbo].[{table}] ADD [{column}] {definition};
                    END";
                await context.Database.ExecuteSqlRawAsync(sql);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Schema Error] Thêm cột {column} vào {table} thất bại: {ex.Message}");
            }
        }

        private static async Task UpdateAllSongsToPublishedAsync(BuzzifyDbContext context)
        {
            try 
            {
                // Update trực tiếp SQL cho nhanh
                int rowsAffected = await context.Database.ExecuteSqlRawAsync("UPDATE [dbo].[songs] SET [trang_thai] = 'published' WHERE [trang_thai] IS NULL OR [trang_thai] = ''");
                if (rowsAffected > 0)
                {
                    Console.WriteLine($"[Seeder] Updated {rowsAffected} songs to default 'published' status.");
                }
            } 
            catch (Exception ex) { Console.WriteLine($"Error updating songs status: {ex.Message}"); }
        }

        private static string GenerateNormalizedEmail(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return $"artist_{Guid.NewGuid().ToString("N").Substring(0, 8)}@buzzify.com";
            
            var normalizedString = name.Normalize(System.Text.NormalizationForm.FormD);
            var stringBuilder = new System.Text.StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            // Xóa dấu Đ
            var cleanName = stringBuilder.ToString().Replace("Đ", "D").Replace("đ", "d").Normalize(System.Text.NormalizationForm.FormC).ToLower();
            cleanName = System.Text.RegularExpressions.Regex.Replace(cleanName, @"[^a-z0-9]", "");
            return $"{cleanName}@buzzify.com";
        }

        private static async Task SeedArtistUserAsync(BuzzifyDbContext context)
        {
            // 1. Lấy tất cả các Artist hiện có trong DB
            var artists = await context.Artists.ToListAsync();

            foreach (var artist in artists)
            {
                // Kiểm tra xem artist này đã có ProfileId hợp lệ chưa
                bool hasValidProfile = false;
                if (!string.IsNullOrEmpty(artist.ProfileId))
                {
                    hasValidProfile = await context.Profiles.AnyAsync(p => p.Id == artist.ProfileId);
                }

                if (!hasValidProfile)
                {
                    // Tạo tài khoản cho Artist này
                    var email = GenerateNormalizedEmail(artist.Ten);
                    
                    // Xử lý trùng email (nếu có)
                    var count = 1;
                    var originalEmail = email;
                    while (await context.Profiles.AnyAsync(p => p.Email == email))
                    {
                        var parts = originalEmail.Split('@');
                        email = $"{parts[0]}{count}@{parts[1]}";
                        count++;
                    }

                    var userId = Guid.NewGuid().ToString();
                    var newUser = new Profile
                    {
                        Id = userId,
                        HoTen = artist.Ten,
                        Email = email,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Artist123!"),
                        Provider = "email",
                        ProviderId = email,
                        IsEmailVerified = true,
                        VaiTro = "artist",
                        AnhDaiDien = artist.AnhDaiDien ?? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(artist.Ten)}&background=0F5E8F&color=fff&bold=true"
                    };

                    context.Profiles.Add(newUser);
                    
                    // Cập nhật lại ProfileId cho Artist
                    artist.ProfileId = userId;
                    context.Artists.Update(artist);

                    Console.WriteLine($"[Seeder] Created account for Artist '{artist.Ten}': Email = {email}, Password = Artist123!");
                }
            }

            await context.SaveChangesAsync();
        }
 
        private static async Task SeedAlbumsForSongsAsync(BuzzifyDbContext context)
        {
            // Lấy các bài hát chưa có album
            var songsWithoutAlbum = await context.Songs
                .Where(s => string.IsNullOrEmpty(s.IdAlbum))
                .ToListAsync();
 
            if (!songsWithoutAlbum.Any()) return;
 
            Console.WriteLine($"[Seeder] Found {songsWithoutAlbum.Count} songs without albums. Creating 'Single' albums...");
 
            foreach (var song in songsWithoutAlbum)
            {
                // Tạo một album Single cho bài hát này
                var albumId = Guid.NewGuid().ToString();
                var newAlbum = new Album
                {
                    Id = albumId,
                    TieuDe = song.TieuDe, // Tên album trùng tên bài hát
                    AnhBia = song.AnhBia,
                    ArtistId = song.ArtistId,
                    NgayPhatHanh = song.NgayTaiLen.HasValue ? DateOnly.FromDateTime(song.NgayTaiLen.Value) : DateOnly.FromDateTime(DateTime.Now),
                    ScheduledPublishDate = song.ScheduledPublishDate
                };
 
                context.Albums.Add(newAlbum);
                
                // Cập nhật lại bài hát thuộc về album này
                song.IdAlbum = albumId;
                context.Songs.Update(song);
            }
 
            await context.SaveChangesAsync();
            Console.WriteLine($"[Seeder] Created {songsWithoutAlbum.Count} 'Single' albums.");
        }

        private static async Task SeedListeningHistoryAsync(BuzzifyDbContext context)
        {
            // Nếu đã có dữ liệu lịch sử nghe trong 14 ngày qua thì thôi
            var recentCheck = DateTime.Now.AddDays(-14);
            if (await context.LichSuNghes.AnyAsync(lh => lh.NgayNghe >= recentCheck)) return;

            var songs = await context.Songs.ToListAsync();
            var profiles = await context.Profiles.Take(5).ToListAsync(); // Lấy 5 user đầu tiên làm người nghe

            if (!songs.Any() || !profiles.Any()) return;

            var random = new Random();
            var histories = new List<LichSuNghe>();

            foreach (var song in songs)
            {
                // Tạo ngẫu nhiên từ 5 đến 50 lượt nghe cho mỗi bài hát trong 14 ngày qua
                int listenCount = random.Next(5, 50);
                for (int i = 0; i < listenCount; i++)
                {
                    var randomUser = profiles[random.Next(profiles.Count)];
                    var randomDay = DateTime.Now.Date.AddDays(-random.Next(0, 14));
                    var randomTime = randomDay.AddHours(random.Next(0, 24)).AddMinutes(random.Next(0, 60));

                    histories.Add(new LichSuNghe
                    {
                        IdNguoiDung = randomUser.Id,
                        SongId = song.Id,
                        NgayNghe = randomTime
                    });
                }
            }

            await context.LichSuNghes.AddRangeAsync(histories);
            await context.SaveChangesAsync();
            Console.WriteLine($"[Seeder] Created {histories.Count} sample listening history records.");
        }

        private static async Task SeedSpecificUsersAsync(BuzzifyDbContext context)
        {
            // 1. Tài khoản ADMIN hệ thống
            var adminEmail = "admin@buzzify.com";
            var existingAdmin = await context.Profiles.FirstOrDefaultAsync(p => p.Email == adminEmail);

            string adminId;
            if (existingAdmin == null)
            {
                adminId = Guid.NewGuid().ToString();
                var adminUser = new Profile
                {
                    Id = adminId,
                    HoTen = "Buzzify Admin",
                    Email = adminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    Provider = "email",
                    ProviderId = adminEmail,
                    IsEmailVerified = true,
                    VaiTro = "admin",
                    AnhDaiDien = "https://ui-avatars.com/api/?name=Admin&background=1ed760&color=fff"
                };
                context.Profiles.Add(adminUser);
                Console.WriteLine($"[Seeder] Created Admin: {adminEmail} / Admin123!");
            }
            else
            {
                adminId = existingAdmin.Id;
                existingAdmin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
                existingAdmin.VaiTro = "admin";
                existingAdmin.HoTen = "Buzzify Admin";
                existingAdmin.Provider = "email"; // QUAN TRỌNG: Sửa từ 'system' thành 'email'
                existingAdmin.ProviderId = adminEmail;
                existingAdmin.IsEmailVerified = true;
                context.Profiles.Update(existingAdmin);
                Console.WriteLine($"[Seeder] Updated Admin password and provider for: {adminEmail}");
            }

            // 2. Tài khoản NGHỆ SĨ Charlie Puth
            var artistEmail = "charlieputh@buzzify.com";
            var existingArtistProfile = await context.Profiles.FirstOrDefaultAsync(p => p.Email == artistEmail);

            string artistProfileId;
            if (existingArtistProfile == null)
            {
                artistProfileId = Guid.NewGuid().ToString();
                var artistUser = new Profile
                {
                    Id = artistProfileId,
                    HoTen = "Charlie Puth",
                    Email = artistEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Artist123!"),
                    Provider = "email",
                    ProviderId = artistEmail,
                    IsEmailVerified = true,
                    VaiTro = "artist",
                    AnhDaiDien = "https://i.scdn.co/image/ab6761610000e5eb57262f3068e16d40ad52f75841c7b80e42d76f8c"
                };
                context.Profiles.Add(artistUser);
                Console.WriteLine($"[Seeder] Created Artist: {artistEmail} / Artist123!");
            }
            else
            {
                artistProfileId = existingArtistProfile.Id;
                existingArtistProfile.VaiTro = "artist";
                existingArtistProfile.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Artist123!");
                existingArtistProfile.Provider = "email";
                existingArtistProfile.ProviderId = artistEmail;
                existingArtistProfile.IsEmailVerified = true;
                context.Profiles.Update(existingArtistProfile);
                Console.WriteLine($"[Seeder] Updated Artist profile for: {artistEmail}");
            }

            // Đảm bảo Charlie Puth có trong bảng Artist
            var artist = await context.Artists.FirstOrDefaultAsync(a => a.Ten == "Charlie Puth");
            if (artist == null)
            {
                var newArtist = new Artist
                {
                    Id = Guid.NewGuid().ToString(),
                    Ten = "Charlie Puth",
                    AnhDaiDien = "https://i.scdn.co/image/ab6761610000e5eb57262f3068e16d40ad52f75841c7b80e42d76f8c",
                    ProfileId = artistProfileId
                };
                context.Artists.Add(newArtist);
                Console.WriteLine("[Seeder] Created Artist record for Charlie Puth");
            }
            else
            {
                artist.ProfileId = artistProfileId;
                context.Artists.Update(artist);
            }

            await context.SaveChangesAsync();
        }

        private static async Task CleanupHiddenSongsDataAsync(BuzzifyDbContext context)
        {
            try
            {
                // Xoá lịch sử nghe của các bài hát bị ẩn
                int historyDeleted = await context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM [dbo].[lich_su_nghe] WHERE [song_id] IN (SELECT [id] FROM [dbo].[songs] WHERE [trang_thai] = 'hidden')");
                
                // Xoá bài hát ẩn khỏi các playlist (bao gồm cả 'bài hát đã thích')
                int playlistSongsDeleted = await context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM [dbo].[chi_tiet_playlist] WHERE [id_bai_hat] IN (SELECT [id] FROM [dbo].[songs] WHERE [trang_thai] = 'hidden')");
                
                if (historyDeleted > 0 || playlistSongsDeleted > 0)
                {
                    Console.WriteLine($"[Seeder] Cleaned up {historyDeleted} history records and {playlistSongsDeleted} playlist songs for hidden tracks.");
                }
            }
            catch (Exception ex) { Console.WriteLine($"Error cleaning up hidden songs data: {ex.Message}"); }
        }

        private static async Task SeedSystemPlaylistsAsync(BuzzifyDbContext context)
        {
            try
            {
                // Đánh dấu các playlist có loai_playlist là 'editorial' hoặc 'system_mix' thành is_system = 1
                int updatedCount = await context.Database.ExecuteSqlRawAsync(
                    "UPDATE [dbo].[playlists] SET [is_system] = 1 WHERE [loai_playlist] IN ('editorial', 'system_mix', 'top_charts') OR [id_nguoi_tao] IN (SELECT [id] FROM [dbo].[profiles] WHERE [vai_tro] = 'admin')");
                
                if (updatedCount > 0)
                {
                    Console.WriteLine($"[Seeder] Marked {updatedCount} playlists as System.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Seeder Error] Lỗi khi cập nhật is_system cho playlists: {ex.Message}");
            }
        }
    }
}
