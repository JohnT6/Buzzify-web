using Buzzify.Application.DTOs.Artist;
using Buzzify.Application.Interfaces;
using Buzzify.Core.Entities;
using Buzzify.Core.Exceptions;
using Buzzify.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Buzzify.Application.Services
{
    public class ArtistService : IArtistService
    {
        private readonly IArtistRepository _artistRepository;
        private readonly IProfileRepository _profileRepository;
        private readonly ISongRepository _songRepository;
        private readonly IPlaylistRepository _playlistRepository;

        public ArtistService(
            IArtistRepository artistRepository, 
            IProfileRepository profileRepository,
            ISongRepository songRepository,
            IPlaylistRepository playlistRepository)
        {
            _artistRepository = artistRepository;
            _profileRepository = profileRepository;
            _songRepository = songRepository;
            _playlistRepository = playlistRepository;
        }

        public async Task<IEnumerable<ArtistDto>> GetAllArtistsAsync()
        {
            var artists = await _artistRepository.GetAllAsync();
            return artists.Select(a => new ArtistDto
            {
                Id = a.Id,
                Ten = a.Ten,
                AnhDaiDien = a.AnhDaiDien,
                ProfileId = a.ProfileId,
                FollowerCount = a.FollowerCount,
                IsVerified = a.IsVerified,
                Bio = a.Bio,
                CoverImage = a.CoverImage
            });
        }

        public async Task<ArtistDto?> GetArtistByIdAsync(string id)
        {
            var a = await _artistRepository.GetByIdAsync(id);
            if (a == null) return null;

            return new ArtistDto
            {
                Id = a.Id,
                Ten = a.Ten,
                AnhDaiDien = a.AnhDaiDien,
                ProfileId = a.ProfileId,
                FollowerCount = a.FollowerCount,
                IsVerified = a.IsVerified,
                Bio = a.Bio,
                CoverImage = a.CoverImage
            };
        }

        public async Task<ArtistDto> CreateArtistAsync(CreateArtistDto createDto)
        {
            var newArtist = new Artist
            {
                Id = Guid.NewGuid().ToString(),
                Ten = createDto.Ten,
                AnhDaiDien = createDto.AnhDaiDien,
                ProfileId = createDto.ProfileId
            };

            await _artistRepository.AddAsync(newArtist);
            await _artistRepository.SaveChangesAsync();

            return new ArtistDto
            {
                Id = newArtist.Id,
                Ten = newArtist.Ten,
                AnhDaiDien = newArtist.AnhDaiDien,
                ProfileId = newArtist.ProfileId
            };
        }

        public async Task UpdateArtistAsync(string id, CreateArtistDto updateDto)
        {
            var artist = await _artistRepository.GetByIdAsync(id);
            if (artist == null) throw new NotFoundException("Không tìm thấy nghệ sĩ.");

            artist.Ten = updateDto.Ten;
            artist.AnhDaiDien = updateDto.AnhDaiDien;
            artist.ProfileId = updateDto.ProfileId;

            _artistRepository.Update(artist);
            await _artistRepository.SaveChangesAsync();
        }

        public async Task<ArtistDto?> GetArtistByProfileIdAsync(string profileId)
        {
            var artists = await _artistRepository.GetAllAsync();
            var a = artists.FirstOrDefault(x => x.ProfileId == profileId);
            if (a == null) return null;
            return new ArtistDto { 
                Id = a.Id, Ten = a.Ten, AnhDaiDien = a.AnhDaiDien, ProfileId = a.ProfileId, FollowerCount = a.FollowerCount,
                IsVerified = a.IsVerified, Bio = a.Bio, CoverImage = a.CoverImage 
            };
        }

        public async Task DeleteArtistAsync(string id)
        {
            var artist = await _artistRepository.GetByIdAsync(id);
            if (artist == null) throw new NotFoundException("Không tìm thấy nghệ sĩ.");

            _artistRepository.Remove(artist);
            await _artistRepository.SaveChangesAsync();
        }

        public async Task ToggleVerifyArtistAsync(string artistId)
        {
            var artist = await _artistRepository.GetByIdAsync(artistId);
            if (artist == null) throw new NotFoundException("Không tìm thấy nghệ sĩ.");

            artist.IsVerified = !artist.IsVerified;
            _artistRepository.Update(artist);
            await _artistRepository.SaveChangesAsync();
        }

        public async Task UpdateArtistInfoAdminAsync(string artistId, UpdateArtistAdminDto dto)
        {
            var artist = await _artistRepository.GetByIdAsync(artistId);
            if (artist == null) throw new NotFoundException("Không tìm thấy nghệ sĩ.");

            artist.IsVerified = dto.IsVerified;
            artist.Bio = dto.Bio;
            artist.CoverImage = dto.CoverImage;

            _artistRepository.Update(artist);
            await _artistRepository.SaveChangesAsync();
        }

        public async Task FollowArtistAsync(string userId, string artistId)
        {
            var artist = await _artistRepository.GetArtistWithFollowersAsync(artistId);
            var user = await _profileRepository.GetByIdAsync(userId);

            if (artist != null && user != null)
            {
                if (!artist.IdNguoiDungs.Any(u => u.Id == userId))
                {
                    artist.IdNguoiDungs.Add(user);
                    artist.FollowerCount++;
                    _artistRepository.Update(artist);
                    await _artistRepository.SaveChangesAsync();
                }
            }
        }

        public async Task UnfollowArtistAsync(string userId, string artistId)
        {
            var artist = await _artistRepository.GetArtistWithFollowersAsync(artistId);
            var user = await _profileRepository.GetByIdAsync(userId);

            if (artist != null && user != null)
            {
                var follower = artist.IdNguoiDungs.FirstOrDefault(u => u.Id == userId);
                if (follower != null)
                {
                    artist.IdNguoiDungs.Remove(follower);
                    artist.FollowerCount = Math.Max(0, artist.FollowerCount - 1);
                    _artistRepository.Update(artist);
                    await _artistRepository.SaveChangesAsync();
                }
            }
        }

        public async Task<bool> IsFollowingAsync(string userId, string artistId)
        {
            var artist = await _artistRepository.GetArtistWithFollowersAsync(artistId);
            if (artist == null) return false;
            return artist.IdNguoiDungs.Any(u => u.Id == userId);
        }

        public async Task<IEnumerable<ArtistDto>> GetFollowedArtistsAsync(string userId)
        {
            var user = await _profileRepository.GetProfileWithArtistsAsync(userId);
            if (user == null) return Enumerable.Empty<ArtistDto>();

            return user.ArtistsNavigation.Select(a => new ArtistDto
            {
                Id = a.Id,
                Ten = a.Ten,
                AnhDaiDien = a.AnhDaiDien,
                ProfileId = a.ProfileId,
                FollowerCount = a.FollowerCount,
                IsFollowed = true
            });
        }

        public async Task<ArtistStatsDto> GetArtistStatsAsync(string artistId, string range)
        {
            var artistSongs = await _songRepository.GetAll()
                .Include(s => s.LichSuNghes)
                .Include(s => s.BaiHatTrongPlaylists)
                .Where(s => s.ArtistId == artistId)
                .ToListAsync();

            var artist = await _artistRepository.GetArtistWithFollowersAsync(artistId);

            // Xử lý bộ lọc thời gian
            int days = 28;
            if (range == "7d") days = 7;
            else if (range == "1y") days = 365;

            var startDate = DateTime.Now.Date.AddDays(-days);

            // Tổng lượt nghe trong khoảng thời gian đã chọn
            var totalStreamsTimeRange = artistSongs.Sum(s => s.LichSuNghes
                .Count(lh => lh.NgayNghe.HasValue && lh.NgayNghe.Value.Date >= startDate));

            // Tổng lượt thả tim (Toàn thời gian do không có ngày lưu)
            var totalSaves = 0;
            var allPlaylists = (await _playlistRepository.GetAllAsync()).ToList();
            var likedPlaylistIds = allPlaylists.Where(p => p.LoaiPlaylist == "liked_songs").Select(p => p.Id).ToHashSet();

            foreach (var song in artistSongs)
            {
                var adds = song.BaiHatTrongPlaylists.ToList();
                totalSaves += adds.Count(a => likedPlaylistIds.Contains(a.PlaylistId));
            }

            // Người nghe trực tiếp: Số người dùng độc nhất nghe nhạc của artist trong 15 phút qua
            var realTimeListeners = artistSongs
                .SelectMany(s => s.LichSuNghes)
                .Where(lh => lh.NgayNghe.HasValue && lh.NgayNghe.Value >= DateTime.Now.AddMinutes(-15))
                .Select(lh => lh.IdNguoiDung)
                .Distinct()
                .Count();

            // Phân bổ lượt nghe theo bài hát trong khoảng thời gian
            var songStats = artistSongs
                .Select(s => new StatDataPoint
                {
                    Date = s.TieuDe,
                    Value = s.LichSuNghes.Count(lh => lh.NgayNghe.HasValue && lh.NgayNghe.Value.Date >= startDate)
                })
                .Where(x => x.Value > 0)
                .OrderByDescending(x => x.Value)
                .Take(10)
                .ToList();

            // Xu hướng lượt nghe (Mặc định 14 ngày qua để biểu đồ đẹp như UI yêu cầu)
            var trendStats = new List<StatDataPoint>();
            for (int i = 13; i >= 0; i--)
            {
                var targetDate = DateTime.Now.Date.AddDays(-i);
                var dayListens = artistSongs.Sum(s => s.LichSuNghes
                    .Count(lh => lh.NgayNghe.HasValue && lh.NgayNghe.Value.Date == targetDate));
                
                trendStats.Add(new StatDataPoint 
                { 
                    Date = targetDate.ToString("dd/MM"), 
                    Value = dayListens 
                });
            }

            return new ArtistStatsDto
            {
                TotalStreams = totalStreamsTimeRange,
                TotalSaves = totalSaves,
                RealTimeListeners = realTimeListeners,
                FollowerCount = artist?.FollowerCount ?? 0,
                FollowerChangeMonth = 0, // Không có bảng lịch sử follower nên không thể tính được % thay đổi
                SongDistribution = songStats,
                StreamTrend = trendStats
            };
        }
    }
}
