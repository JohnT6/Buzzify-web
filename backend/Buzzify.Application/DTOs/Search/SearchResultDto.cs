using Buzzify.Application.DTOs.Song;
using Buzzify.Application.DTOs.Album;
using Buzzify.Application.DTOs.Artist;
using Buzzify.Application.DTOs.Playlist;
using Buzzify.Application.DTOs.User;
using System.Collections.Generic;

namespace Buzzify.Application.DTOs.Search
{
    public class SearchResultDto
    {
        public IEnumerable<SongDto> Songs { get; set; } = new List<SongDto>();
        public IEnumerable<AlbumDto> Albums { get; set; } = new List<AlbumDto>();
        public IEnumerable<ArtistDto> Artists { get; set; } = new List<ArtistDto>();
        public IEnumerable<PlaylistDto> Playlists { get; set; } = new List<PlaylistDto>();
        public IEnumerable<UserProfileDto> Profiles { get; set; } = new List<UserProfileDto>();
    }
}
