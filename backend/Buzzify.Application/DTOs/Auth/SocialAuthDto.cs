namespace Buzzify.Application.DTOs.Auth
{
    public class GoogleAuthDto
    {
        public string IdToken { get; set; } = string.Empty; 
    }
    
    public class FacebookAuthDto
    {
        public string Token { get; set; } = string.Empty;
    }
}
