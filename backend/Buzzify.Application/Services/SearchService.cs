using Buzzify.Application.DTOs.Album;
using Buzzify.Application.DTOs.Artist;
using Buzzify.Application.DTOs.Playlist;
using Buzzify.Application.DTOs.Search;
using Buzzify.Application.DTOs.Song;
using Buzzify.Application.DTOs.User;
using Buzzify.Application.Interfaces;
using Buzzify.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Buzzify.Application.Services
{
    public class SearchService : ISearchService
    {
        private readonly ISongRepository _songRepository;
        private readonly IAlbumRepository _albumRepository;
        private readonly IArtistRepository _artistRepository;
        private readonly IPlaylistRepository _playlistRepository;
        private readonly IProfileRepository _profileRepository;

        public SearchService(
            ISongRepository songRepository,
            IAlbumRepository albumRepository,
            IArtistRepository artistRepository,
            IPlaylistRepository playlistRepository,
            IProfileRepository profileRepository)
        {
            _songRepository = songRepository;
            _albumRepository = albumRepository;
            _artistRepository = artistRepository;
            _playlistRepository = playlistRepository;
            _profileRepository = profileRepository;
        }

        public async Task<SearchResultDto> GlobalSearchAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return new SearchResultDto();

            var queryLower = query.ToLower();

            // Await EACH query sequentially to avoid DbContext threading issues
            var songs = await _songRepository.GetAll()
                .Include(s => s.Artist)
                .Where(s => s.TieuDe != null && s.TieuDe.ToLower().Contains(queryLower))
                .Take(5).ToListAsync();

            var albums = await _albumRepository.GetAll()
                .Include(a => a.Artist)
                .Where(a => a.TieuDe != null && a.TieuDe.ToLower().Contains(queryLower))
                .Take(5).ToListAsync();

            var artists = await _artistRepository.GetAll()
                .Where(ar => ar.Ten != null && ar.Ten.ToLower().Contains(queryLower))
                .Take(5).ToListAsync();

            var playlists = await _playlistRepository.GetAll()
                .Include(p => p.IdNguoiTaoNavigation)
                .Where(p => p.Ten != null && p.Ten.ToLower().Contains(queryLower) && p.CongKhai == true)
                .Take(5).ToListAsync();

            var profiles = await _profileRepository.GetAll()
                .Where(pr => pr.HoTen != null && pr.HoTen.ToLower().Contains(queryLower))
                .Take(10).ToListAsync();

            return new SearchResultDto
            {
                Songs = songs.Select(s => new SongDto 
                { 
                    Id = s.Id, 
                    TieuDe = s.TieuDe, 
                    AnhBia = s.AnhBia, 
                    Url = s.Url,
                    TenNgheSi = s.Artist?.Ten ?? s.NgheSiHopTac ?? "Unknown Artist",
                    LuotNghe = s.LuotNghe 
                }),
                Albums = albums.Select(a => new AlbumDto 
                { 
                    Id = a.Id, 
                    TieuDe = a.TieuDe, 
                    AnhBia = a.AnhBia, 
                    ArtistName = a.Artist?.Ten ?? "Unknown Artist" 
                }),
                Artists = artists.Select(ar => new ArtistDto 
                { 
                    Id = ar.Id, 
                    Ten = ar.Ten, 
                    AnhDaiDien = ar.AnhDaiDien,
                    FollowerCount = ar.FollowerCount
                }),
                Playlists = playlists.Select(p => new PlaylistDto 
                { 
                    Id = p.Id, 
                    Ten = p.Ten, 
                    AnhBia = p.AnhBia,
                    CreatorName = p.IdNguoiTaoNavigation?.HoTen ?? "Buzzify User"
                }),
                Profiles = profiles.Select(pr => new UserProfileDto 
                { 
                    Id = pr.Id, 
                    HoTen = pr.HoTen, 
                    AnhDaiDien = pr.AnhDaiDien 
                })
            };
        }

        public async Task<SearchResultDto> SearchByTypeAsync(string query, string type, int page, int pageSize)
        {
            var result = new SearchResultDto();
            if (string.IsNullOrWhiteSpace(query)) return result;
            var queryLower = query.ToLower();
            var skip = (page - 1) * pageSize;

            switch (type.ToLower())
            {
                case "songs":
                case "tracks":
                    var songs = await _songRepository.GetAll()
                        .Include(s => s.Artist)
                        .Where(s => s.TieuDe != null && s.TieuDe.ToLower().Contains(queryLower))
                        .Skip(skip).Take(pageSize).ToListAsync();
                    result.Songs = songs.Select(s => new SongDto 
                    { 
                        Id = s.Id, 
                        TieuDe = s.TieuDe, 
                        AnhBia = s.AnhBia, 
                        Url = s.Url,
                        TenNgheSi = s.Artist?.Ten ?? s.NgheSiHopTac ?? "Unknown Artist" 
                    });
                    break;
                case "albums":
                    var albums = await _albumRepository.GetAll()
                        .Include(a => a.Artist)
                        .Where(a => a.TieuDe != null && a.TieuDe.ToLower().Contains(queryLower))
                        .Skip(skip).Take(pageSize).ToListAsync();
                    result.Albums = albums.Select(a => new AlbumDto 
                    { 
                        Id = a.Id, 
                        TieuDe = a.TieuDe, 
                        AnhBia = a.AnhBia, 
                        ArtistName = a.Artist?.Ten ?? "Unknown Artist" 
                    });
                    break;
                case "artists":
                    var artists = await _artistRepository.GetAll()
                        .Where(ar => ar.Ten != null && ar.Ten.ToLower().Contains(queryLower))
                        .Skip(skip).Take(pageSize).ToListAsync();
                    result.Artists = artists.Select(ar => new ArtistDto 
                    { 
                        Id = ar.Id, 
                        Ten = ar.Ten, 
                        AnhDaiDien = ar.AnhDaiDien 
                    });
                    break;
                case "profiles":
                    var profiles = await _profileRepository.GetAll()
                        .Where(pr => pr.HoTen != null && pr.HoTen.ToLower().Contains(queryLower))
                        .Skip(skip).Take(pageSize).ToListAsync();
                    result.Profiles = profiles.Select(pr => new UserProfileDto 
                    { 
                        Id = pr.Id, 
                        HoTen = pr.HoTen, 
                        AnhDaiDien = pr.AnhDaiDien 
                    });
                    break;
                case "playlists":
                    var playlists = await _playlistRepository.GetAll()
                        .Include(p => p.IdNguoiTaoNavigation)
                        .Where(p => p.Ten != null && p.Ten.ToLower().Contains(queryLower) && p.CongKhai == true)
                        .Skip(skip).Take(pageSize).ToListAsync();
                    result.Playlists = playlists.Select(p => new PlaylistDto 
                    { 
                        Id = p.Id, 
                        Ten = p.Ten, 
                        AnhBia = p.AnhBia,
                        CreatorName = p.IdNguoiTaoNavigation?.HoTen
                    });
                    break;
            }

            return result;
        }
    }
}
