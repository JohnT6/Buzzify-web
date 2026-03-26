using Buzzify.Application.DTOs;
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
    public class SongService : ISongService
    {
        private readonly ISongRepository _songRepository;
        private readonly IAlbumRepository _albumRepository;
        private readonly IArtistRepository _artistRepository;
        private readonly IFileService _fileService;

        public SongService(ISongRepository songRepository, IAlbumRepository albumRepository, IArtistRepository artistRepository, IFileService fileService)
        {
            _songRepository = songRepository;
            _albumRepository = albumRepository;
            _artistRepository = artistRepository;
            _fileService = fileService;
        }

        public async Task<PagedResultDto<SongDto>> GetAllSongsAsync(string? searchTerm, string? artistId, int page, int pageSize)
        {
            // Nếu có artistId, chúng ta có thể kiểm tra xem có phải chính chủ đang gọi không (logic này thường xử lý ở Controller)
            // Tạm thời để repository tự quyết định hoặc truyền thêm flag.
            var pagedData = await _songRepository.GetPagedAsync(searchTerm, artistId, page, pageSize, false);
            
            var songDtos = pagedData.Item.Select(s => new SongDto
            {
                Id = s.Id,
                TieuDe = s.TieuDe,
                ThoiLuongGiay = s.ThoiLuongGiay,
                NgheSiHopTac = s.NgheSiHopTac,
                Url = s.Url,
                AnhBia = s.AnhBia,
                LuotNghe = s.LuotNghe,
                NgayTaiLen = s.NgayTaiLen,
                TrangThai = s.TrangThai,
                TenNgheSi = s.Artist?.Ten ?? s.NgheSiHopTac,
                AnhNgheSi = s.Artist?.AnhDaiDien,
                ArtistId = s.ArtistId,
                TenAlbum = s.IdAlbumNavigation?.TieuDe,
                IdAlbum = s.IdAlbum,
                NgayPhatHanh = s.IdAlbumNavigation?.NgayPhatHanh,
                ScheduledPublishDate = s.ScheduledPublishDate,
                TrackNumber = s.TrackNumber
            });

            return new PagedResultDto<SongDto>
            {
                Data = songDtos,
                TotalItems = pagedData.TotalCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        public async Task<PagedResultDto<SongDto>> GetSongsByArtistAsync(string artistId, string? searchTerm, int page, int pageSize, bool includeScheduled = false)
        {
            var pagedData = await _songRepository.GetPagedAsync(searchTerm, artistId, page, pageSize, includeScheduled);
            var songDtos = pagedData.Item.Select(s => new SongDto
            {
                Id = s.Id,
                TieuDe = s.TieuDe,
                ThoiLuongGiay = s.ThoiLuongGiay,
                NgheSiHopTac = s.NgheSiHopTac,
                Url = s.Url,
                AnhBia = s.AnhBia,
                LuotNghe = s.LuotNghe,
                NgayTaiLen = s.NgayTaiLen,
                TrangThai = s.TrangThai,
                TenNgheSi = s.Artist?.Ten ?? s.NgheSiHopTac,
                AnhNgheSi = s.Artist?.AnhDaiDien,
                ArtistId = s.ArtistId,
                TenAlbum = s.IdAlbumNavigation?.TieuDe,
                IdAlbum = s.IdAlbum,
                NgayPhatHanh = s.IdAlbumNavigation?.NgayPhatHanh,
                ScheduledPublishDate = s.ScheduledPublishDate,
                TrackNumber = s.TrackNumber
            });

            return new PagedResultDto<SongDto>
            {
                Data = songDtos,
                TotalItems = pagedData.TotalCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        public async Task<SongDto?> GetSongByIdAsync(string id)
        {
            var s = await _songRepository.GetByIdAsync(id);
            if (s == null) return null;

            return new SongDto
            {
                Id = s.Id,
                TieuDe = s.TieuDe,
                ThoiLuongGiay = s.ThoiLuongGiay,
                NgheSiHopTac = s.NgheSiHopTac,
                Url = s.Url,
                AnhBia = s.AnhBia,
                LuotNghe = s.LuotNghe,
                NgayTaiLen = s.NgayTaiLen,
                TrangThai = s.TrangThai,
                TenNgheSi = s.Artist?.Ten ?? s.NgheSiHopTac,
                AnhNgheSi = s.Artist?.AnhDaiDien,
                ArtistId = s.ArtistId,
                TenAlbum = s.IdAlbumNavigation?.TieuDe,
                IdAlbum = s.IdAlbum,
                NgayPhatHanh = s.IdAlbumNavigation?.NgayPhatHanh,
                ScheduledPublishDate = s.ScheduledPublishDate,
                TrackNumber = s.TrackNumber
            };
        }

        public async Task<SongDto> CreateSongAsync(CreateSongDto createDto, string uploaderId)
        {
            // Tìm ArtistId từ ProfileId (uploaderId)
            var artists = await _artistRepository.GetAllAsync();
            var artist = artists.FirstOrDefault(x => x.ProfileId == uploaderId);
            if (artist == null) throw new NotFoundException("Không tìm thấy hồ sơ nghệ sĩ liên kết với tài khoản này.");

            string artistId = artist.Id;
            string? albumId = createDto.IdAlbum;

            // Nếu không có IdAlbum, tạo Album mới (Single)
            if (string.IsNullOrEmpty(albumId))
            {
                var newAlbum = new Album
                {
                    Id = Guid.NewGuid().ToString(),
                    TieuDe = createDto.TieuDe,
                    AnhBia = createDto.AnhBia,
                    ArtistId = artistId,
                    NgayPhatHanh = DateOnly.FromDateTime(DateTime.Now),
                    ScheduledPublishDate = createDto.ScheduledPublishDate
                };
                await _albumRepository.AddAsync(newAlbum);
                albumId = newAlbum.Id;
            }
            
            // Xác định trạng thái ban đầu
            string status = "published";
            if (createDto.ScheduledPublishDate > DateTime.Now) status = "scheduled";
            if (createDto.TrangThai == "hidden") status = "hidden";

            var newSong = new Song
            {
                Id = Guid.NewGuid().ToString(),
                TieuDe = createDto.TieuDe,
                ThoiLuongGiay = createDto.ThoiLuongGiay,
                NgheSiHopTac = createDto.NgheSiHopTac,
                Url = createDto.Url,
                AnhBia = createDto.AnhBia,
                ArtistId = artistId,
                IdAlbum = albumId,
                UploaderId = uploaderId,
                NgayTaiLen = DateTime.Now,
                ScheduledPublishDate = createDto.ScheduledPublishDate,
                TrangThai = status,
                LuotNghe = 0,
                TrackNumber = createDto.TrackNumber
            };

            await _songRepository.AddAsync(newSong);
            await _songRepository.SaveChangesAsync();

            return new SongDto
            {
                Id = newSong.Id,
                TieuDe = newSong.TieuDe,
                Url = newSong.Url,
                NgheSiHopTac = newSong.NgheSiHopTac,
                ThoiLuongGiay = newSong.ThoiLuongGiay,
                AnhBia = newSong.AnhBia,
                NgayTaiLen = newSong.NgayTaiLen,
                TrangThai = newSong.TrangThai,
                ScheduledPublishDate = newSong.ScheduledPublishDate,
                LuotNghe = newSong.LuotNghe,
                IdAlbum = newSong.IdAlbum,
                TrackNumber = newSong.TrackNumber
            };
        }

        public async Task UpdateSongAsync(string id, CreateSongDto updateDto, string userId)
        {
            var song = await _songRepository.GetByIdAsync(id);
            if (song == null) throw new NotFoundException("Không tìm thấy bài hát.");

            // Authorization logic
            var matchedArtists = await _artistRepository.FindAsync(x => x.ProfileId == userId);
            var artist = matchedArtists.FirstOrDefault();
            
            if (song.UploaderId != userId && (artist == null || song.ArtistId != artist.Id))
                throw new UnauthorizedException("Bạn không có quyền chỉnh sửa bài hát này.");

            // Xóa file cũ nếu thay đổi
            if (!string.IsNullOrEmpty(song.Url) && song.Url != updateDto.Url)
                _fileService.DeleteFile(song.Url);
            
            if (!string.IsNullOrEmpty(song.AnhBia) && song.AnhBia != updateDto.AnhBia)
                _fileService.DeleteFile(song.AnhBia);

            song.TieuDe = updateDto.TieuDe;
            song.ThoiLuongGiay = updateDto.ThoiLuongGiay;
            song.NgheSiHopTac = updateDto.NgheSiHopTac;
            song.Url = updateDto.Url;
            song.AnhBia = updateDto.AnhBia;
            song.IdAlbum = updateDto.IdAlbum;
            song.ScheduledPublishDate = updateDto.ScheduledPublishDate;
            song.TrackNumber = updateDto.TrackNumber;
            
            // Cập nhật trạng thái (nếu là hidden thì giữ hidden, nếu không thì check schedule)
            if (updateDto.TrangThai == "hidden") 
                song.TrangThai = "hidden";
            else if (updateDto.ScheduledPublishDate > DateTime.Now)
                song.TrangThai = "scheduled";
            else 
                song.TrangThai = "published";

            // Detach navigation properties để tránh lỗi config IdentityTracking của EF Core
            song.Artist = null;
            song.IdAlbumNavigation = null;
            
            _songRepository.Update(song);
            await _songRepository.SaveChangesAsync();
        }

        public async Task DeleteSongAsync(string id, string userId)
        {
            var song = await _songRepository.GetByIdAsync(id);
            if (song == null) throw new NotFoundException("Không tìm thấy bài hát.");

            // Authorization logic
            var artists = await _artistRepository.GetAllAsync();
            var artist = artists.FirstOrDefault(x => x.ProfileId == userId);
            
            if (song.UploaderId != userId && (artist == null || song.ArtistId != artist.Id))
                throw new UnauthorizedException("Bạn không có quyền xóa bài hát này.");

            // Xóa file vật lý
            if (!string.IsNullOrEmpty(song.Url)) _fileService.DeleteFile(song.Url);
            if (!string.IsNullOrEmpty(song.AnhBia)) _fileService.DeleteFile(song.AnhBia);

            _songRepository.Remove(song);
            await _songRepository.SaveChangesAsync();
        }
        public async Task IncrementPlayCountAsync(string id)
        {
            var song = await _songRepository.GetByIdAsync(id);
            if (song != null)
            {
                song.LuotNghe++;
                song.Artist = null;
                song.IdAlbumNavigation = null;
                _songRepository.Update(song);
                await _songRepository.SaveChangesAsync();
            }
        }
    }
}
