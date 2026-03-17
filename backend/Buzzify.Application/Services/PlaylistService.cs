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

        public PlaylistService(IPlaylistRepository playlistRepository)
        {
            _playlistRepository = playlistRepository;
        }

        public async Task<IEnumerable<PlaylistDto>> GetAllPlaylistsAsync()
        {
            var playlists = await _playlistRepository.GetAllAsync();
            return playlists.Select(p => new PlaylistDto
            {
                Id = p.Id,
                Ten = p.Ten,
                MoTa = p.MoTa,
                AnhBia = p.AnhBia,
                CongKhai = p.CongKhai,
                IdNguoiTao = p.IdNguoiTao
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
                Songs = p.BaiHatTrongPlaylists.Select(bp => new SongDto
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
                    ArtistId = bp.Song.ArtistId
                }).ToList()
            };
        }

        public async Task<PlaylistDto> CreatePlaylistAsync(CreatePlaylistDto createDto, string creatorId)
        {
            var newPlaylist = new Playlist
            {
                Id = Guid.NewGuid().ToString(),
                Ten = createDto.Ten,
                MoTa = createDto.MoTa,
                AnhBia = createDto.AnhBia,
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
                IdNguoiTao = newPlaylist.IdNguoiTao
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
            p.AnhBia = updateDto.AnhBia;
            if (updateDto.CongKhai.HasValue) p.CongKhai = updateDto.CongKhai.Value;

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

            _playlistRepository.Remove(p);
            await _playlistRepository.SaveChangesAsync();
        }

        public async Task AddSongToPlaylistAsync(string playlistId, string songId, string userId)
        {
            var p = await _playlistRepository.GetByIdAsync(playlistId);
            if (p == null) throw new NotFoundException("Không tìm thấy danh sách phát.");
            
            if (p.IdNguoiTao != userId) 
                throw new UnauthorizedException("Bạn không phải là người tạo danh sách phát này nên không thể thêm bài hát.");

            // Can validate if songId really exists here using a ISongRepository
            
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
    }
}
