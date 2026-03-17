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

        public SongService(ISongRepository songRepository)
        {
            _songRepository = songRepository;
        }

        public async Task<PagedResultDto<SongDto>> GetAllSongsAsync(string? searchTerm, int page, int pageSize)
        {
            var pagedData = await _songRepository.GetPagedAsync(searchTerm, page, pageSize);
            
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
                TenNgheSi = s.Artist?.Ten,
                AnhNgheSi = s.Artist?.AnhDaiDien,
                ArtistId = s.ArtistId
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
                TrangThai = s.TrangThai
            };
        }

        public async Task<SongDto> CreateSongAsync(CreateSongDto createDto, string uploaderId)
        {
            var newSong = new Song
            {
                Id = Guid.NewGuid().ToString(),
                TieuDe = createDto.TieuDe,
                ThoiLuongGiay = createDto.ThoiLuongGiay,
                NgheSiHopTac = createDto.NgheSiHopTac,
                Url = createDto.Url,
                AnhBia = createDto.AnhBia,
                ArtistId = createDto.ArtistId,
                IdAlbum = createDto.IdAlbum,
                UploaderId = uploaderId,
                NgayTaiLen = DateTime.UtcNow,
                TrangThai = "published",
                LuotNghe = 0
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
                LuotNghe = newSong.LuotNghe
            };
        }

        public async Task UpdateSongAsync(string id, CreateSongDto updateDto, string userId)
        {
            var song = await _songRepository.GetByIdAsync(id);
            if (song == null) throw new NotFoundException("Không tìm thấy bài hát.");

            // Authorization logic
            if (song.UploaderId != userId)
                throw new UnauthorizedException("Bạn không phải là người tải lên bài hát này nên không thể chỉnh sửa.");

            song.TieuDe = updateDto.TieuDe;
            song.ThoiLuongGiay = updateDto.ThoiLuongGiay;
            song.NgheSiHopTac = updateDto.NgheSiHopTac;
            song.Url = updateDto.Url;
            song.AnhBia = updateDto.AnhBia;
            song.ArtistId = updateDto.ArtistId;
            song.IdAlbum = updateDto.IdAlbum;

            _songRepository.Update(song);
            await _songRepository.SaveChangesAsync();
        }

        public async Task DeleteSongAsync(string id, string userId)
        {
            var song = await _songRepository.GetByIdAsync(id);
            if (song == null) throw new NotFoundException("Không tìm thấy bài hát.");

            // Authorization logic
            if (song.UploaderId != userId)
                throw new UnauthorizedException("Bạn không phải là người tải lên bài hát này nên không thể xóa.");

            _songRepository.Remove(song);
            await _songRepository.SaveChangesAsync();
        }
        public async Task IncrementPlayCountAsync(string id)
        {
            var song = await _songRepository.GetByIdAsync(id);
            if (song != null)
            {
                song.LuotNghe++;
                _songRepository.Update(song);
                await _songRepository.SaveChangesAsync();
            }
        }
    }
}
