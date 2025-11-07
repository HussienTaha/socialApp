import { Server, Socket } from "socket.io";
import { SocketWithUser } from "../gateway/gateway.interface";
import { chatEvents } from "./chat.events";

export class ChatGateway {


constructor(){}

private _chatEvents:chatEvents= new chatEvents()
register= ( socket:SocketWithUser,io:Server)=>{
  
this._chatEvents.sayhi(socket,io)
this._chatEvents.sendMessage(socket,io)
this._chatEvents.join_room(socket,io)
this._chatEvents.sendGroupMessage(socket,io)
}


}