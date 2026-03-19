using Buzzify.Application.DTOs;
using Buzzify.Application.DTOs.Album;
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

        public AlbumService(IAlbumRepository albumRepository)
        {
            _albumRepository = albumRepository;
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
                GenreNames = a.IdTheLoais.Select(g => g.Ten).Take(1).ToList(),
                NgayPhatHanh = a.NgayPhatHanh
            }).ToList();

            return new PagedResultDto<AlbumDto>
            {
                Data = albumDtos,
                TotalItems = pagedData.TotalCount,
                CurrentPage = page,
                PageSize = pageSize
            };
        }

        public async Task<AlbumDto?> GetAlbumByIdAsync(string id)
        {
            var a = await _albumRepository.GetByIdAsync(id);
            if (a == null) return null;

            return new AlbumDto
            {
                Id = a.Id,
                TieuDe = a.TieuDe,
                AnhBia = a.AnhBia,
                ArtistId = a.ArtistId,
                ArtistName = a.Artist?.Ten,
                GenreNames = a.IdTheLoais.Select(g => g.Ten).Take(1).ToList(),
                NgayPhatHanh = a.NgayPhatHanh
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

            await _albumRepository.AddAsync(newAlbum);
            await _albumRepository.SaveChangesAsync();

            return new AlbumDto
            {
                Id = newAlbum.Id,
                TieuDe = newAlbum.TieuDe,
                AnhBia = newAlbum.AnhBia,
                ArtistId = newAlbum.ArtistId,
                NgayPhatHanh = newAlbum.NgayPhatHanh
            };
        }

        public async Task UpdateAlbumAsync(string id, CreateAlbumDto updateDto)
        {
            var album = await _albumRepository.GetByIdAsync(id);
            if (album == null) throw new NotFoundException("Không tìm thấy album.");

            album.TieuDe = updateDto.TieuDe;
            album.AnhBia = updateDto.AnhBia;
            album.ArtistId = updateDto.ArtistId;
            album.NgayPhatHanh = updateDto.NgayPhatHanh;

            _albumRepository.Update(album);
            await _albumRepository.SaveChangesAsync();
        }

        public async Task DeleteAlbumAsync(string id)
        {
             var album = await _albumRepository.GetByIdAsync(id);
             if (album == null) throw new NotFoundException("Không tìm thấy album.");

             _albumRepository.Remove(album);
             await _albumRepository.SaveChangesAsync();
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
                NgayPhatHanh = a.NgayPhatHanh
            });
        }
    }
}
