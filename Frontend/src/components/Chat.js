import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import useFetch from "../utils/useFetch";
import { FaVideo } from "react-icons/fa";

const Chat = () => {
    const [usersList, setUsersList] = useState([]);
    const userDataString = sessionStorage.getItem("user");
    const userInfo = JSON.parse(userDataString);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);

    const { data, loading, error } = useFetch("/user/all-users");

    const [stompClient, setStompClient] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (data) {
            const newUserList = data.map((user, index) => ({
                id: user.userId,
                name: user.username,
                avatar: `https://i.pravatar.cc/40?img=${index}`,
                email: user.email,
            }));
            setUsersList(newUserList);
        }
    }, [data]);

    useEffect(() => {
        const socket = new SockJS("http://localhost:9090/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(str),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Connected to WebSocket");
            },
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, []);

    useEffect(() => {
        if (stompClient && selectedUser) {
            stompClient.subscribe(`/video-call/${userInfo.userId}`, (message) => {
                const data = JSON.parse(message.body);
                handleSignalingData(data);
            });

            stompClient.subscribe(`/personalChat/${userInfo.userId}/${selectedUser.id}`, (msg) => {
                const receivedMessage = JSON.parse(msg.body);
                setMessages((prevMessages) => [...prevMessages, { sender: "them", text: receivedMessage.message }]);
            });
        }
    }, [stompClient, selectedUser]);

    const handleSignalingData = async (data) => {
        if (data.type === "offer") {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            stompClient.publish({
                destination: `/video-call/${selectedUser.id}`,
                body: JSON.stringify({ type: "answer", answer }),
            });
        } else if (data.type === "answer") {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === "candidate") {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    };

    const startVideoCall = async () => {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

        peerConnection.current.ontrack = (event) => {
            remoteVideoRef.current.srcObject = event.streams[0];
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                stompClient.publish({
                    destination: `/video-call/${selectedUser.id}`,
                    body: JSON.stringify({ type: "candidate", candidate: event.candidate }),
                });
            }
        };

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        stompClient.publish({
            destination: `/video-call/${selectedUser.id}`,
            body: JSON.stringify({ type: "offer", offer }),
        });
    };

    const handleSendMessage = (event) => {
        event.preventDefault();
        const text = event.target.message.value.trim();
        if (!text) return;

        const newMessage = {
            senderId: userInfo.userId,
            receiverId: selectedUser.id,
            message: text,
        };

        stompClient.publish({
            destination: `/personalChat/${selectedUser.id}/${userInfo.userId}`,
            body: JSON.stringify(newMessage),
        });

        setMessages((prevMessages) => [...prevMessages, { sender: "me", text }]);
        event.target.message.value = "";
    };

    return (
        <div className="container-fluid d-flex" style={{ height: "100%" }}>
            <div className="col-md-4 col-lg-3 border-end p-3 bg-light">
                <h4 className="mb-3">Chats</h4>
                <input type="text" className="form-control mb-3" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <ul className="list-group">
                    {usersList.map((user) => (
                        <li key={user.id} className={`list-group-item ${selectedUser?.id === user.id ? "active" : ""}`} onClick={() => setSelectedUser(user)} style={{ cursor: "pointer" }}>
                            <img src={user.avatar} alt={user.name} className="rounded-circle me-2" width="40" height="40" />
                            {user.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="col-md-8 col-lg-9 d-flex flex-column">
                {selectedUser ? (
                    <>
                        <div className="border-bottom p-3 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <img src={selectedUser.avatar} alt={selectedUser.name} className="rounded-circle me-2" width="40" height="40" />
                                <h5 className="mb-0">{selectedUser.name}</h5>
                            </div>
                            <FaVideo size={24} style={{ cursor: "pointer" }} onClick={startVideoCall} />
                        </div>
                        <div className="flex-grow-1 overflow-auto p-3">
                            <video ref={localVideoRef} autoPlay playsInline></video>
                            <video ref={remoteVideoRef} autoPlay playsInline></video>

                            {messages.map((msg, index) => (
                                <div key={index} className={`mb-1 d-flex ${msg.sender === "me" ? "justify-content-end" : ""}`}>
                                    <div className={`p-2 rounded-3 ${msg.sender === "me" ? "bg-primary text-white" : "bg-light text-dark"}`} style={{ maxWidth: "75%" }}>{msg.text}</div>
                                </div>
                            ))}
                        </div>
                        <form className="border-top p-3 d-flex" onSubmit={handleSendMessage}>
                            <input type="text" name="message" className="form-control me-2" placeholder="Type a message..." />
                            <button className="btn btn-primary">Send</button>
                        </form>
                    </>
                ) : (
                    <div className="d-flex justify-content-center align-items-center flex-grow-1">
                        <h5 className="text-muted">Select a user to start chat</h5>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;