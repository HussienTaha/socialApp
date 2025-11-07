import { Socket, Server } from "socket.io";
import { SocketWithUser } from "../gateway/gateway.interface";
import { ChatService } from "./chat.service";

export class chatEvents {

private _chatservice:ChatService = new ChatService()
    constructor(){}

    sayhi = (socket: SocketWithUser, io: Server) => {
       return  socket.on("sayhiiiii", (data) => {
      this._chatservice.sayhiiiii(data,socket,io)
        });
    };
    sendMessage = (socket: SocketWithUser, io: Server) => {
       return  socket.on("sendMessage", (data) => {
      this._chatservice.sendMessage(data,socket,io)
        
        });
    };
    join_room = (socket: SocketWithUser, io: Server) => {
       return  socket.on("join_room", (data) => {
      this._chatservice.join_room(data,socket,io)
        
        });
    };
    sendGroupMessage = (socket: SocketWithUser, io: Server) => {
       return  socket.on("sendGroupMessage", (data) => {
      this._chatservice.sendGroupMessage(data,socket,io)
        
        });
    };
}