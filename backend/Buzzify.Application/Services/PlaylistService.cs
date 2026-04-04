using Buzzify.Application.DTOs.Playlist;
using Buzzify.Application.DTOs.Song;
using Buzzify.Application.Interfaces;
using Buzzify.Core.Entities;
using Buzzify.Core.Exceptions;
using Buzzify.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Buzzify.Application.Services
{
    public class PlaylistService : IPlaylistService
    {
        private readonly IPlaylistRepository _playlistRepository;
        private readonly IFileService _fileService;
        private readonly IRepository<TheLoai> _theLoaiRepository;

        public PlaylistService(IPlaylistRepository playlistRepository, IFileService fileService, IRepository<TheLoai> theLoaiRepository)
        {
            _playlistRepository = playlistRepository;
            _fileService = fileService;
            _theLoaiRepository = theLoaiRepository;
        }

        public async Task<IEnumerable<PlaylistDto>> GetAllPlaylistsAsync()
        {
            var playlists = await _playlistRepository.GetAllWithSongsAsync();
            return playlists.Select(p => new PlaylistDto
            {
                Id = p.Id,
                Ten = p.Ten,
                MoTa = p.MoTa,
                AnhBia = p.AnhBia,
                CongKhai = p.CongKhai,
                IdNguoiTao = p.IdNguoiTao,
                LoaiPlaylist = p.LoaiPlaylist,
                CreatorName = p.IdNguoiTaoNavigation?.HoTen,
                IsSystem = p.IsSystem,
                IsFeatured = p.IsFeatured,
                SongCount = p.BaiHatTrongPlaylists.Count(),
                TopSongImages = p.BaiHatTrongPlaylists.Select(bp => bp.Song.AnhBia).Where(a => !string.IsNullOrEmpty(a)).Take(4).ToList()
            });
        }

        public async Task<PlaylistDto?> GetPlaylistByIdAsync(string id)
        {
            var p = await _playlistRepository.GetPlaylistWithSongsAsync(id);
            if (p == null) return null;

            return new PlaylistDto
            {
                Id = p.Id,
                Ten = p.Ten,
                MoTa = p.MoTa,
                AnhBia = p.AnhBia,
                CongKhai = p.CongKhai,
                IdNguoiTao = p.IdNguoiTao,
                LoaiPlaylist = p.LoaiPlaylist,
                CreatorName = p.IdNguoiTaoNavigation?.HoTen,
                IsSystem = p.IsSystem,
                IsFeatured = p.IsFeatured,
                TopSongImages = p.BaiHatTrongPlaylists.Select(bp => bp.Song.AnhBia).Where(a => !string.IsNullOrEmpty(a)).Take(4).ToList(),
                Genres = p.IdTheLoais.Select(t => t.Ten).ToList(),
                GenreIds = p.IdTheLoais.Select(t => t.Id).ToList(),
                SongCount = p.BaiHatTrongPlaylists.Count(bp => bp.Song.TrangThai == "published"),
                Songs = p.BaiHatTrongPlaylists.Where(bp => bp.Song.TrangThai == "published").Select(bp => new SongDto
                {
                    Id = bp.Song.Id,
                    TieuDe = bp.Song.TieuDe,
                    ThoiLuongGiay = bp.Song.ThoiLuongGiay,
                    NgheSiHopTac = bp.Song.NgheSiHopTac,
                    Url = bp.Song.Url,
                    AnhBia = bp.Song.AnhBia,
                    LuotNghe = bp.Song.LuotNghe,
                    NgayTaiLen = bp.Song.NgayTaiLen,
                    TrangThai = bp.Song.TrangThai,
                    TenNgheSi = bp.Song.Artist?.Ten ?? bp.Song.NgheSiHopTac,
                    AnhNgheSi = bp.Song.Artist?.AnhDaiDien,
                    ArtistId = bp.Song.ArtistId,
                    TenAlbum = bp.Song.IdAlbumNavigation?.TieuDe,
                    IdAlbum = bp.Song.IdAlbum,
                    NgayPhatHanh = bp.Song.IdAlbumNavigation?.NgayPhatHanh
                }).ToList()
            };
        }

        public async Task<PlaylistDto> CreatePlaylistAsync(CreatePlaylistDto createDto, string creatorId)
        {
            string? imagePath = null;
            if (!string.IsNullOrEmpty(createDto.AnhBia) && createDto.AnhBia.StartsWith("data:image"))
            {
                imagePath = await _fileService.SaveFileFromBase64Async(createDto.AnhBia, "images/playlists");
            }

            var newPlaylist = new Playlist
            {
                Id = Guid.NewGuid().ToString(),
                Ten = createDto.Ten,
                MoTa = createDto.MoTa,
                AnhBia = imagePath,
                CongKhai = createDto.CongKhai ?? true,
                IdNguoiTao = creatorId,
                LoaiPlaylist = "user_created"
            };

            await _playlistRepository.AddAsync(newPlaylist);
            await _playlistRepository.SaveChangesAsync();

            return new PlaylistDto
            {
                Id = newPlaylist.Id,
                Ten = newPlaylist.Ten,
                MoTa = newPlaylist.MoTa,
                AnhBia = newPlaylist.AnhBia,
                CongKhai = newPlaylist.CongKhai,
                IdNguoiTao = newPlaylist.IdNguoiTao,
                LoaiPlaylist = newPlaylist.LoaiPlaylist
            };
        }

        public async Task UpdatePlaylistAsync(string id, CreatePlaylistDto updateDto, string userId)
        {
            var p = await _playlistRepository.GetByIdAsync(id);
            if (p == null) throw new NotFoundException("Không tìm thấy danh sách phát.");
            
            // Authorization logic
            if (p.IdNguoiTao != userId) 
                throw new UnauthorizedException("Bạn không phải là người tạo danh sách phát này nên không thể chỉnh sửa.");

            p.Ten = updateDto.Ten;
            p.MoTa = updateDto.MoTa;
            
            if (updateDto.CongKhai.HasValue) p.CongKhai = updateDto.CongKhai.Value;

            // Xử lý ảnh bìa
            if (updateDto.AnhBia != null)
            {
                if (string.IsNullOrEmpty(updateDto.AnhBia))
                {
                    // Xoá ảnh current
                    if (!string.IsNullOrEmpty(p.AnhBia)) _fileService.DeleteFile(p.AnhBia);
                    p.AnhBia = null;
                }
                else if (updateDto.AnhBia.StartsWith("data:image"))
                {
                    // Upload ảnh mới
                    if (!string.IsNullOrEmpty(p.AnhBia)) _fileService.DeleteFile(p.AnhBia);
                    p.AnhBia = await _fileService.SaveFileFromBase64Async(updateDto.AnhBia, "images/playlists");
                }
            }

            _playlistRepository.Update(p);
            await _playlistRepository.SaveChangesAsync();
        }

        public async Task DeletePlaylistAsync(string id, string userId)
        {
            var p = await _playlistRepository.GetByIdAsync(id);
            if (p == null) throw new NotFoundException("Không tìm thấy danh sách phát.");
            
            // Authorization logic
            if (p.IdNguoiTao != userId) 
                throw new UnauthorizedException("Bạn không phải là người tạo danh sách phát này nên không thể xóa.");

            // Xoá ảnh bìa vật lý nếu có
            if (!string.IsNullOrEmpty(p.AnhBia)) _fileService.DeleteFile(p.AnhBia);

            _playlistRepository.Remove(p);
            await _playlistRepository.SaveChangesAsync();
        }

        public async Task ToggleFeaturedPlaylistAsync(string id)
        {
            var p = await _playlistRepository.GetByIdAsync(id);
            if (p == null) throw new NotFoundException("Không tìm thấy danh sách phát.");

            p.IsFeatured = !p.IsFeatured;
            _playlistRepository.Update(p);
            await _playlistRepository.SaveChangesAsync();
        }

        public async Task DeletePlaylistAdminAsync(string id)
        {
            var p = await _playlistRepository.GetByIdAsync(id);
            if (p == null) throw new NotFoundException("Không tìm thấy danh sách phát.");

            if (!string.IsNullOrEmpty(p.AnhBia)) _fileService.DeleteFile(p.AnhBia);

            _playlistRepository.Remove(p);
            await _playlistRepository.SaveChangesAsync();
        }

        public async Task<IEnumerable<PlaylistDto>> GetAdminPlaylistsAsync()
        {
            var playlists = await _playlistRepository.GetAllWithSongsAsync();
            
            // Admin chỉ quản lý playlist User tạo hoặc System Mix, không quản lý "Bài hát đã thích" riêng tư
            return playlists
                .Where(p => p.LoaiPlaylist != "liked_songs")
                .Select(p => new PlaylistDto
                {
                    Id = p.Id,
                    Ten = p.Ten,
                    MoTa = p.MoTa,
                    AnhBia = p.AnhBia,
                    CongKhai = p.CongKhai,
                    IdNguoiTao = p.IdNguoiTao,
                    LoaiPlaylist = p.LoaiPlaylist,
                    CreatorName = p.IdNguoiTaoNavigation?.HoTen,
                    IsSystem = p.IsSystem,
                    IsFeatured = p.IsFeatured,
                    SongCount = p.BaiHatTrongPlaylists.Count(),
                    Genres = p.IdTheLoais.Select(t => t.Ten).ToList(),
                    GenreIds = p.IdTheLoais.Select(t => t.Id).ToList(),
                    Songs = p.BaiHatTrongPlaylists.Select(bp => new SongDto {
                        Id = bp.Song.Id,
                        TieuDe = bp.Song.TieuDe,
                        AnhBia = bp.Song.AnhBia,
                        TenNgheSi = bp.Song.Artist?.Ten ?? bp.Song.NgheSiHopTac
                    }).ToList()
                }).OrderByDescending(p => p.IsSystem).ThenByDescending(p => p.IsFeatured);
        }

        public async Task<PlaylistDto> CreateAdminPlaylistAsync(CreatePlaylistDto createDto, string creatorId)
        {
            string? imagePath = null;
            if (!string.IsNullOrEmpty(createDto.AnhBia))
            {
                if (createDto.AnhBia.StartsWith("data:image"))
                {
                    imagePath = await _fileService.SaveFileFromBase64Async(createDto.AnhBia, "images/playlists");
                }
                else
                {
                    imagePath = createDto.AnhBia; // Giữ nguyên URL nếu không phải base64
                }
            }

            var newPlaylist = new Playlist
            {
                Id = Guid.NewGuid().ToString(),
                Ten = createDto.Ten,
                MoTa = createDto.MoTa,
                AnhBia = imagePath,
                CongKhai = createDto.CongKhai ?? true,
                IdNguoiTao = creatorId,
                LoaiPlaylist = createDto.IsSystem ? "system_mix" : "admin_created",
                IsSystem = createDto.IsSystem,
                IsFeatured = false
            };

            if (createDto.IdTheLoais != null && createDto.IdTheLoais.Any())
            {
                foreach (var genreId in createDto.IdTheLoais)
                {
                    var genre = await _theLoaiRepository.GetByIdAsync(genreId);
                    if (genre != null) newPlaylist.IdTheLoais.Add(genre);
                }
            }

            await _playlistRepository.AddAsync(newPlaylist);
            await _playlistRepository.SaveChangesAsync();

            return await GetPlaylistByIdAsync(newPlaylist.Id);
        }

        public async Task UpdateAdminPlaylistAsync(string id, CreatePlaylistDto updateDto)
        {
            var p = await _playlistRepository.GetPlaylistWithSongsAsync(id);
            if (p == null) throw new NotFoundException("Không tìm thấy danh sách phát.");

            p.Ten = updateDto.Ten;
            p.MoTa = updateDto.MoTa;
            if (updateDto.CongKhai.HasValue) p.CongKhai = updateDto.CongKhai.Value;

            // Xử lý ảnh bìa tương tự như UpdatePlaylistAsync hoặc dùng trực tiếp file URL từ Admin
            if (updateDto.AnhBia != null)
            {
                if (string.IsNullOrEmpty(updateDto.AnhBia))
                {
                    if (!string.IsNullOrEmpty(p.AnhBia)) _fileService.DeleteFile(p.AnhBia);
                    p.AnhBia = null;
                }
                else if (updateDto.AnhBia.StartsWith("data:image"))
                {
                    if (!string.IsNullOrEmpty(p.AnhBia)) _fileService.DeleteFile(p.AnhBia);
                    p.AnhBia = await _fileService.SaveFileFromBase64Async(updateDto.AnhBia, "images/playlists");
                }
                else
                {
                    // Giữ nguyên hoặc cập nhật URL
                    p.AnhBia = updateDto.AnhBia;
                }
            }

            // Cập nhật thể loại
            if (updateDto.IdTheLoais != null)
            {
                p.IdTheLoais.Clear();
                foreach (var gid in updateDto.IdTheLoais)
                {
                    var genre = await _theLoaiRepository.GetByIdAsync(gid);
                    if (genre != null) p.IdTheLoais.Add(genre);
                }
            }

            _playlistRepository.Update(p);
            await _playlistRepository.SaveChangesAsync();
        }

        public async Task AddSongToAdminPlaylistAsync(string playlistId, string songId)
        {
            // Không kiểm tra quyền sở hữu, cho phép Admin thêm bài hát vào bất kỳ playlist nào
            await _playlistRepository.AddSongAsync(playlistId, songId);
        }

        public async Task RemoveSongFromAdminPlaylistAsync(string playlistId, string songId)
        {
            await _playlistRepository.RemoveSongAsync(playlistId, songId);
        }

        public async Task AddSongToPlaylistAsync(string playlistId, string songId, string userId)
        {
            var p = await _playlistRepository.GetByIdAsync(playlistId);
            if (p == null) throw new NotFoundException("Không tìm thấy danh sách phát.");
            
            if (p.IdNguoiTao != userId) 
                throw new UnauthorizedException("Bạn không phải là người tạo danh sách phát này nên không thể thêm bài hát.");

            await _playlistRepository.AddSongAsync(playlistId, songId);
        }

        public async Task RemoveSongFromPlaylistAsync(string playlistId, string songId, string userId)
        {
            var p = await _playlistRepository.GetByIdAsync(playlistId);
            if (p == null) throw new NotFoundException("Không tìm thấy danh sách phát.");
            
            if (p.IdNguoiTao != userId) 
                throw new UnauthorizedException("Bạn không phải là người tạo danh sách phát này nên không thể xóa bài hát khỏi danh sách.");

            await _playlistRepository.RemoveSongAsync(playlistId, songId);
        }

        public async Task<PlaylistDto> GetLikedSongsPlaylistAsync(string userId)
        {
            var all = await _playlistRepository.GetAllAsync();
            var liked = all.FirstOrDefault(p => p.IdNguoiTao == userId && p.LoaiPlaylist == "liked_songs");

            if (liked == null)
            {
                liked = new Playlist
                {
                    Id = Guid.NewGuid().ToString(),
                    Ten = "Bài hát đã thích",
                    IdNguoiTao = userId,
                    LoaiPlaylist = "liked_songs",
                    CongKhai = false,
                    MoTa = "Danh sách các bài hát bạn đã yêu thích"
                };
                await _playlistRepository.AddAsync(liked);
                await _playlistRepository.SaveChangesAsync();
            }

            return (await GetPlaylistByIdAsync(liked.Id))!;
        }

        public async Task SavePlaylistAsync(string playlistId, string userId)
        {
            await _playlistRepository.SavePlaylistAsync(userId, playlistId);
        }

        public async Task UnsavePlaylistAsync(string playlistId, string userId)
        {
            await _playlistRepository.UnsavePlaylistAsync(userId, playlistId);
        }

        public async Task<bool> IsPlaylistSavedAsync(string playlistId, string userId)
        {
            return await _playlistRepository.IsPlaylistSavedByUserAsync(userId, playlistId);
        }

        public async Task<IEnumerable<PlaylistDto>> GetSavedPlaylistsAsync(string userId)
        {
            var playlists = await _playlistRepository.GetSavedPlaylistsByUserAsync(userId);
            return playlists.Select(p => new PlaylistDto
            {
                Id = p.Id,
                Ten = p.Ten,
                MoTa = p.MoTa,
                AnhBia = p.AnhBia,
                CongKhai = p.CongKhai,
                IdNguoiTao = p.IdNguoiTao,
                LoaiPlaylist = p.LoaiPlaylist,
                CreatorName = p.IdNguoiTaoNavigation?.HoTen,
                SongCount = p.BaiHatTrongPlaylists.Count(),
                TopSongImages = p.BaiHatTrongPlaylists.Select(bp => bp.Song.AnhBia).Where(a => !string.IsNullOrEmpty(a)).Take(4).ToList()
            });
        }

        public async Task<IEnumerable<PlaylistDto>> GetPlaylistsByUserAsync(string userId)
        {
            var playlists = await _playlistRepository.GetPlaylistsByUserAsync(userId);
            return playlists.Select(p => new PlaylistDto
            {
                Id = p.Id,
                Ten = p.Ten,
                MoTa = p.MoTa,
                AnhBia = p.AnhBia,
                CongKhai = p.CongKhai,
                IdNguoiTao = p.IdNguoiTao,
                LoaiPlaylist = p.LoaiPlaylist,
                CreatorName = p.IdNguoiTaoNavigation?.HoTen,
                SongCount = p.BaiHatTrongPlaylists.Count(),
                TopSongImages = p.BaiHatTrongPlaylists.Select(bp => bp.Song.AnhBia).Where(a => !string.IsNullOrEmpty(a)).Take(4).ToList()
            });
        }
    }
}
