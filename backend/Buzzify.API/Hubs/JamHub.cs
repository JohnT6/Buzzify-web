using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace Buzzify.API.Hubs
{
    public class JamParticipantInfo
    {
        public string Name { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public bool IsHost { get; set; } = false;
    }

    // Cấu trúc mô phỏng dữ liệu trong bộ nhớ RAM
    public class RoomState
    {
        public string HostConnectionId { get; set; } = string.Empty;
        public bool GuestPermissions { get; set; } = false; // Mặc định Guest không có quyền (Khóa)
        public ConcurrentDictionary<string, JamParticipantInfo> Participants { get; set; } = new(); // ConnectionId -> Info
    }

    public class JamHub : Hub
    {
        // Từ điển toàn cục In-Memory lưu các Phòng (RoomId -> State)
        private static readonly ConcurrentDictionary<string, RoomState> _rooms = new();
        // Bản đồ ngược: ConnectionId -> RoomId để dễ dọn mác lúc Connect đứt
        private static readonly ConcurrentDictionary<string, string> _connectionRooms = new();

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (_connectionRooms.TryRemove(Context.ConnectionId, out var roomId))
            {
                if (_rooms.TryGetValue(roomId, out var room))
                {
                    room.Participants.TryRemove(Context.ConnectionId, out var info);
                    
                    // Nếu là Host disconect, giải tán phòng
                    if (room.HostConnectionId == Context.ConnectionId)
                    {
                        await Clients.Group(roomId).SendAsync("RoomClosed", "Trưởng phòng đã kết thúc Jam.");
                        _rooms.TryRemove(roomId, out _);
                    }
                    else
                    {
                        // Notify others guest rời đi
                        await Clients.Group(roomId).SendAsync("GuestLeft", info?.Name ?? "Một khách");
                        await Clients.Group(roomId).SendAsync("ParticipantsUpdated", room.Participants.Values.ToList());
                    }
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task CreateRoom(string roomId, string hostName, string avatarUrl)
        {
            var room = new RoomState
            {
                HostConnectionId = Context.ConnectionId
            };
            room.Participants.TryAdd(Context.ConnectionId, new JamParticipantInfo {
                Name = hostName,
                Avatar = avatarUrl,
                IsHost = true
            });
            
            _rooms[roomId] = room;
            _connectionRooms[Context.ConnectionId] = roomId;

            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            await Clients.Caller.SendAsync("RoomCreated", roomId);
            await Clients.Group(roomId).SendAsync("ParticipantsUpdated", room.Participants.Values.ToList());
        }

        public async Task JoinRoom(string roomId, string guestName, string avatarUrl)
        {
            if (_rooms.TryGetValue(roomId, out var room))
            {
                room.Participants.TryAdd(Context.ConnectionId, new JamParticipantInfo {
                    Name = guestName,
                    Avatar = avatarUrl,
                    IsHost = false
                });
                _connectionRooms[Context.ConnectionId] = roomId;

                await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
                
                // Gửi thông báo cho mọi người trong phòng có khách mới
                await Clients.Group(roomId).SendAsync("GuestJoined", guestName);
                await Clients.Group(roomId).SendAsync("ParticipantsUpdated", room.Participants.Values.ToList());
                
                // Yêu cầu Host sync dữ liệu Bài Hát + Hàng Chờ hiện tại sang cho Guest mới.
                await Clients.Client(room.HostConnectionId).SendAsync("RequireSync", Context.ConnectionId);
            }
            else
            {
                await Clients.Caller.SendAsync("Error", "Phòng Jam không tồn tại hoặc đã kết thúc.");
            }
        }

        // Host gọi lệnh này để Sync trạng thái tới toàn bộ client
        public async Task SyncStateToAll(string roomId, object stateData)
        {
            if (_rooms.TryGetValue(roomId, out var room) && room.HostConnectionId == Context.ConnectionId)
            {
                await Clients.Group(roomId).SendAsync("ReceiveSyncState", stateData);
            }
        }

        // Host gọi lệnh này để trả lời RequireSync tới đích danh Guest mới
        public async Task SyncStateToTarget(string targetConnectionId, object stateData)
        {
            await Clients.Client(targetConnectionId).SendAsync("ReceiveSyncState", stateData);
        }

        // Chuyển quyền (Host toggle "Quyền của Khách")
        public async Task UpdateGuestPermissions(string roomId, bool canControl)
        {
            if (_rooms.TryGetValue(roomId, out var room) && room.HostConnectionId == Context.ConnectionId)
            {
                room.GuestPermissions = canControl;
                await Clients.Group(roomId).SendAsync("PermissionsUpdated", canControl);
            }
        }

        // Guest gửi RequestAction (Next/Prev/Play) cho Host.
        public async Task RequestAction(string roomId, string actionType, object payload)
        {
            if (_rooms.TryGetValue(roomId, out var room))
            {
                bool isHost = room.HostConnectionId == Context.ConnectionId;
                
                // Khách chỉ được sendRequest nếu GuestPermissions = true.
                // NGOẠI LỆ: SuggestSong (Gửi đề xuất) luôn được phép gửi cho Host xử lý.
                if (isHost || room.GuestPermissions || actionType == "SuggestSong")
                {
                    // Truyền lệnh này ĐẾN HOST
                    await Clients.Client(room.HostConnectionId).SendAsync("ReceiveRequestAction", actionType, payload);
                }
                else
                {
                    await Clients.Caller.SendAsync("Error", "Trưởng phòng chưa mở khóa quyền điều khiển cho khách.");
                }
            }
        }
    }
}
