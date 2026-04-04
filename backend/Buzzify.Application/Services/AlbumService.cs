using Buzzify.Application.DTOs;
using Buzzify.Application.DTOs.Album;
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
    public class AlbumService : IAlbumService
    {
        private readonly IAlbumRepository _albumRepository;
        private readonly IFileService _fileService;
        private readonly ISongRepository _songRepository;
        private readonly IRepository<TheLoai> _genreRepository;

        public AlbumService(IAlbumRepository albumRepository, IFileService fileService, ISongRepository songRepository, IRepository<TheLoai> genreRepository)
        {
            _albumRepository = albumRepository;
            _fileService = fileService;
            _songRepository = songRepository;
            _genreRepository = genreRepository;
        }

        public async Task<PagedResultDto<AlbumDto>> GetAllAlbumsAsync(string? searchTerm, string? artistId, int page, int pageSize)
        {
            var pagedData = await _albumRepository.GetPagedAsync(searchTerm, artistId, page, pageSize);

            var albumDtos = pagedData.Item.Select(a => new AlbumDto
            {
                Id = a.Id,
                TieuDe = a.TieuDe,
                AnhBia = a.AnhBia,
                ArtistId = a.ArtistId,
                ArtistName = a.Artist?.Ten,
                GenreNames = a.IdTheLoais.Select(g => g.Ten).ToList(),
                IdTheLoais = a.IdTheLoais.Select(g => g.Id).ToList(),
                NgayPhatHanh = a.NgayPhatHanh,
                SongsCount = a.Songs.Count()
            }).ToList();

            return new PagedResultDto<AlbumDto>
            {
                Data = albumDtos,
                TotalItems = pagedData.TotalCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        public async Task<AlbumDto?> GetAlbumByIdAsync(string id, string? requestingUserId = null, string? userRole = null)
        {
            var a = await _albumRepository.GetAlbumWithSongsByIdAsync(id);
            if (a == null) return null;

            bool isOwner = false;
            if (!string.IsNullOrEmpty(requestingUserId))
            {
                isOwner = a.Artist != null && a.Artist.ProfileId == requestingUserId;
            }

            var songsToReturn = (isOwner || userRole == "admin") 
                ? a.Songs 
                : a.Songs.Where(s => s.TrangThai == "published").ToList();

            return new AlbumDto
            {
                Id = a.Id,
                TieuDe = a.TieuDe,
                AnhBia = a.AnhBia,
                ArtistId = a.ArtistId,
                ArtistName = a.Artist?.Ten,
                GenreNames = a.IdTheLoais.Select(g => g.Ten).ToList(),
                IdTheLoais = a.IdTheLoais.Select(g => g.Id).ToList(),
                NgayPhatHanh = a.NgayPhatHanh,
                Songs = songsToReturn.OrderBy(s => s.TrackNumber ?? 99).Select(s => new SongDto
                {
                    Id = s.Id,
                    TieuDe = s.TieuDe,
                    ThoiLuongGiay = s.ThoiLuongGiay,
                    Url = s.Url,
                    AnhBia = s.AnhBia,
                    LuotNghe = s.LuotNghe,
                    ArtistId = s.ArtistId,
                    TenNgheSi = s.Artist?.Ten,
                    NgheSiHopTac = s.NgheSiHopTac,
                    TrackNumber = s.TrackNumber,
                    IdAlbum = s.IdAlbum,
                    TenAlbum = a.TieuDe,
                    TrangThai = s.TrangThai,
                    IsMuted = s.IsMuted
                }).ToList()
            };
        }

        public async Task<AlbumDto> CreateAlbumAsync(CreateAlbumDto createDto)
        {
            var newAlbum = new Album
            {
                Id = Guid.NewGuid().ToString(),
                TieuDe = createDto.TieuDe,
                AnhBia = createDto.AnhBia,
                ArtistId = createDto.ArtistId,
                NgayPhatHanh = createDto.NgayPhatHanh
            };

            if (createDto.IdTheLoais != null && createDto.IdTheLoais.Any())
            {
                var genres = await _genreRepository.GetAllAsync();
                var selectedGenres = genres.Where(g => createDto.IdTheLoais.Contains(g.Id)).ToList();
                foreach (var genre in selectedGenres)
                {
                    newAlbum.IdTheLoais.Add(genre);
                }
            }

            await _albumRepository.AddAsync(newAlbum);
            await _albumRepository.SaveChangesAsync();

            return new AlbumDto
            {
                Id = newAlbum.Id,
                TieuDe = newAlbum.TieuDe,
                AnhBia = newAlbum.AnhBia,
                ArtistId = newAlbum.ArtistId,
                NgayPhatHanh = newAlbum.NgayPhatHanh,
                GenreNames = newAlbum.IdTheLoais.Select(g => g.Ten).ToList(),
                IdTheLoais = newAlbum.IdTheLoais.Select(g => g.Id).ToList()
            };
        }

        public async Task UpdateAlbumAsync(string id, CreateAlbumDto updateDto, string? artistIdToVerify = null)
        {
            // Để update quan hệ n-n, ta cần load album kèm theo IdTheLoais
            var album = await _albumRepository.GetAlbumWithSongsByIdAsync(id); // Hàm này có include IdTheLoais
            if (album == null) throw new NotFoundException("Không tìm thấy album.");

            if (!string.IsNullOrEmpty(artistIdToVerify) && album.ArtistId != artistIdToVerify)
                throw new UnauthorizedException("Bạn không có quyền chỉnh sửa album này.");

            // Nếu thay đổi ảnh bìa, xóa ảnh cũ
            if (!string.IsNullOrEmpty(album.AnhBia) && album.AnhBia != updateDto.AnhBia)
            {
                _fileService.DeleteFile(album.AnhBia);
            }

            album.TieuDe = updateDto.TieuDe;
            album.AnhBia = updateDto.AnhBia;
            album.ArtistId = updateDto.ArtistId;
            album.NgayPhatHanh = updateDto.NgayPhatHanh;

            // Cập nhật thể loại
            album.IdTheLoais.Clear();
            if (updateDto.IdTheLoais != null && updateDto.IdTheLoais.Any())
            {
                var allGenres = await _genreRepository.GetAllAsync();
                var selectedGenres = allGenres.Where(g => updateDto.IdTheLoais.Contains(g.Id)).ToList();
                foreach (var genre in selectedGenres)
                {
                    album.IdTheLoais.Add(genre);
                }
            }

            await _albumRepository.SaveChangesAsync();
        }

        public async Task DeleteAlbumAsync(string id, string? artistIdToVerify = null)
        {
             var album = await _albumRepository.GetByIdAsync(id);
             if (album == null) throw new NotFoundException("Không tìm thấy album.");

             if (!string.IsNullOrEmpty(artistIdToVerify) && album.ArtistId != artistIdToVerify)
                 throw new UnauthorizedException("Bạn không có quyền xóa album này.");

             // Xóa ảnh bìa vật lý
             if (!string.IsNullOrEmpty(album.AnhBia))
             {
                 _fileService.DeleteFile(album.AnhBia);
             }

             _albumRepository.Remove(album);
             await _albumRepository.SaveChangesAsync();
        }

        public async Task ReorderTracksAsync(string albumId, List<string> songIds, string? artistIdToVerify = null)
        {
             var album = await _albumRepository.GetByIdAsync(albumId);
             if (album == null) throw new NotFoundException("Không tìm thấy Album.");

             // Kiểm tra quyền
             if (!string.IsNullOrEmpty(artistIdToVerify) && album.ArtistId != artistIdToVerify)
                 throw new UnauthorizedException("Bạn không có quyền sắp xếp lại bài hát trong album này.");

             // Update track numbers
             for (int i = 0; i < songIds.Count; i++)
             {
                 var song = await _songRepository.GetByIdAsync(songIds[i]);
                 if (song != null && song.IdAlbum == albumId)
                 {
                     song.TrackNumber = i + 1;
                     song.Artist = null;
                     song.IdAlbumNavigation = null;
                     _songRepository.Update(song);
                 }
             }

             await _songRepository.SaveChangesAsync();
        }

        public async Task SaveAlbumAsync(string albumId, string userId)
        {
            await _albumRepository.SaveAlbumAsync(userId, albumId);
        }

        public async Task UnsaveAlbumAsync(string albumId, string userId)
        {
            await _albumRepository.UnsaveAlbumAsync(userId, albumId);
        }

        public async Task<bool> IsAlbumSavedAsync(string albumId, string userId)
        {
            return await _albumRepository.IsAlbumSavedByUserAsync(userId, albumId);
        }

        public async Task<IEnumerable<AlbumDto>> GetSavedAlbumsAsync(string userId)
        {
            var albums = await _albumRepository.GetSavedAlbumsByUserAsync(userId);
            return albums.Select(a => new AlbumDto
            {
                Id = a.Id,
                TieuDe = a.TieuDe,
                AnhBia = a.AnhBia,
                ArtistId = a.ArtistId,
                ArtistName = a.Artist?.Ten,
                GenreNames = a.IdTheLoais.Select(g => g.Ten).Take(1).ToList(),
                NgayPhatHanh = a.NgayPhatHanh,
                Songs = a.Songs.Select(s => new SongDto
                {
                    Id = s.Id,
                    TieuDe = s.TieuDe,
                    ThoiLuongGiay = s.ThoiLuongGiay,
                    ArtistId = s.ArtistId,
                    IdAlbum = s.IdAlbum
                }).ToList()
            });
        }
    }
}
