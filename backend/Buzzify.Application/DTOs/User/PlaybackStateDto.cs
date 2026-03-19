namespace Buzzify.Application.DTOs.User
{
    public class PlaybackStateDto
    {
        public string? LastSongId { get; set; }
        public string? LastQueueIds { get; set; }
        public string? LastSourceInfo { get; set; }
        public double? LastPosition { get; set; }
    }
}
