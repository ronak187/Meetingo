import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import useFetch from "../utils/useFetch";
import { FaVideo } from "react-icons/fa";
import messageRingtone from "../assets/rings/message-ringtone.mp3";

const callRingtone = new Audio(messageRingtone);

const Chat = () => {
    const [usersList, setUsersList] = useState([]);
    const userDataString = sessionStorage.getItem("user");
    const userInfo = JSON.parse(userDataString);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    const localStreamRef = useRef(null); // <-- new ref for local stream
    const [remoteStream, setRemoteStream] = useState(null);
    const [callActive, setCallActive] = useState(false);
    const [ringPrompt, setRingPrompt] = useState(false);

    const { data } = useFetch("/user/all-users", userInfo.userId);

    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [messages, setMessages] = useState([]);
    const [incomingCall, setIncomingCall] = useState(null);
    const [callAnswered, setCallAnswered] = useState(false);

    // STOMP client and subscriptions
    const stompClientRef = useRef(null);
    const chatSubscriptionRef = useRef(null);

    // Set up users list
    useEffect(() => {
        if (data) {
            const newUserList = data.map((user, index) => ({
                id: user.userId,
                name: user.username,
                avatar: `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 10)}`,
                email: user.email,
            }));
            setUsersList(newUserList);
        }
    }, [data]);

    // Set up STOMP client ONCE
    useEffect(() => {
        const socket = new SockJS("http://localhost:9090/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(str),
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            console.log("STOMP onConnect fired for", userInfo.userId);

            // Subscribe to video call channel ONCE
            client.subscribe(`/video-call/${userInfo.userId}`, (message) => {
                console.log("Received signaling message:", message.body);
                const data = JSON.parse(message.body);
                handleSignalingData(data);
            });

            // Subscribe to chat channel if a user is selected
            if (selectedUser) {
                subscribeChatChannel(client, selectedUser.id);
            }
        };

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (chatSubscriptionRef.current) {
                chatSubscriptionRef.current.unsubscribe();
            }
            client.deactivate();
        };
        // eslint-disable-next-line
    }, []);

    // Subscribe/unsubscribe chat channel when selectedUser changes
    useEffect(() => {
        const client = stompClientRef.current;
        if (!client || !client.connected) return;

        if (chatSubscriptionRef.current) {
            chatSubscriptionRef.current.unsubscribe();
            chatSubscriptionRef.current = null;
        }
        if (selectedUser) {
            subscribeChatChannel(client, selectedUser.id);
        }
        // eslint-disable-next-line
    }, [selectedUser]);

    // Helper to subscribe to chat channel
    function subscribeChatChannel(client, otherUserId) {
        chatSubscriptionRef.current = client.subscribe(
            `/personalChat/${userInfo.userId}/${otherUserId}`,
            (msg) => {
                const receivedMessage = JSON.parse(msg.body);
                
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: "them", text: receivedMessage.message },
                ]);
            }
        );
    }

    // Handle signaling data for video call
    const handleSignalingData = async (data) => {
        console.log("Handling signaling data:", data);

        if (data.type === "offer") {
            // Try to play ringtone, if blocked show prompt
            callRingtone.loop = true;
            callRingtone.currentTime = 0;
            callRingtone.play().catch(() => setRingPrompt(true));
            setIncomingCall({ from: data.from, offer: data.offer });
        } else if (data.type === "answer") {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === "candidate") {
            if (peerConnection.current) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        } else if (data.type === "disconnect") {
            handleStopCall();
        } else if (data.type === "test") {
            console.log("Test signal received from", data.from);
        }
    };

    // Start video call
    const startVideoCall = async () => {
        if (!selectedUser) return;
        await setupPeerConnection(selectedUser.id, true);
    };

    // Set up peer connection for video call
    const setupPeerConnection = async (otherUserId, isCaller, offerObj = null) => {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        localStreamRef.current = stream; // <-- keep this
        stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

        peerConnection.current.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate && stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.publish({
                    destination: `/app/video-call/${otherUserId}`,
                    body: JSON.stringify({ type: "candidate", candidate: event.candidate }),
                });
            }
        };

        if (isCaller) {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.publish({
                    destination: `/app/video-call/${otherUserId}`,
                    body: JSON.stringify({ type: "offer", offer, from: userInfo.userId }),
                });
            }

            setCallActive(true);
            setCallAnswered(true);
        } else if (offerObj) {
            console.log("Answering video call as receiver");
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offerObj));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.publish({
                    destination: `/app/video-call/${otherUserId}`,
                    body: JSON.stringify({ type: "answer", answer }),
                });
                console.log("Answer sent to:", otherUserId);
            }
            setCallActive(true);
            setCallAnswered(true);
        }
    };

    // Answer incoming call
    const handleAnswerCall = async () => {
        console.log("Answering incoming call from:", incomingCall.from);
        callRingtone.pause();
        callRingtone.currentTime = 0;
        if (!incomingCall) return;
        const user = usersList.find(u => u.id === incomingCall.from);
        setSelectedUser(user);
        await setupPeerConnection(incomingCall.from, false, incomingCall.offer);
        setIncomingCall(null);
    };

    // Reject incoming call
    const handleRejectCall = () => {
        callRingtone.pause();
        callRingtone.currentTime = 0;
        if (incomingCall && stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
                destination: `/app/video-call/${incomingCall.from}`,
                body: JSON.stringify({ type: "disconnect" }),
            });
        }
        setIncomingCall(null);
    };

    // Disconnect/Stop call
    const handleStopCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        setLocalStream(null);
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        setCallActive(false);
        setCallAnswered(false);
        if (selectedUser && stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
                destination: `/app/video-call/${selectedUser.id}`,
                body: JSON.stringify({ type: "disconnect" }),
            });
        }
    };

    // Send chat message
    const handleSendMessage = (event) => {
        event.preventDefault();
        const text = event.target.message.value.trim();
        if (!text || !selectedUser) return;

        const now = new Date();
        const createdDateTime = now.toISOString(); // Use ISO string for consistency
        console.log("Sending message at:", Date.now());
        const newMessage = {
            senderId: userInfo.userId,
            receiverId: selectedUser.id,
            message: text,
            createdDateTime
        };

        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
                destination: `/app/personalChat/${selectedUser.id}/${userInfo.userId}`,
                body: JSON.stringify(newMessage),
            });
        }

        setMessages((prevMessages) => [...prevMessages, { sender: "me", text }]);
        event.target.message.value = "";
    };

    // Filter users by search
    const filteredUsers = usersList.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Set local video srcObject only when callActive and localStream are set and video element is rendered
    useEffect(() => {
        if (callActive && localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [callActive, localStream]);

    // Set remote video srcObject only when callActive and remoteStream are set and video element is rendered
    useEffect(() => {
        if (callActive && remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [callActive, remoteStream]);

    return (
        <div className="container-fluid d-flex" style={{ height: "100%" }}>
            <div className="col-md-4 col-lg-3 border-end p-3 bg-light">
                <h4 className="mb-3">Chats</h4>
                <input type="text" className="form-control mb-3" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <ul className="list-group">
                    {filteredUsers.map((user) => (
                        <li key={user.id} className={`list-group-item ${selectedUser?.id === user.id ? "active" : ""}`} onClick={() => setSelectedUser(user)} style={{ cursor: "pointer" }}>
                            <img src={user.avatar} alt={user.name} className="rounded-circle me-2" width="40" height="40" />
                            {user.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="col-md-8 col-lg-9 d-flex flex-column">
                {/* Incoming call modal */}
                {incomingCall && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
                        <div className="bg-white p-4 rounded shadow">
                            <h5>Incoming Video Call</h5>
                            <div className="mb-3">User: {usersList.find(u => u.id === incomingCall.from)?.name || "Unknown"}</div>
                            {ringPrompt && (
                                <button className="btn btn-warning mb-2" onClick={() => {
                                    callRingtone.loop = true;
                                    callRingtone.currentTime = 0;
                                    callRingtone.play();
                                    setRingPrompt(false);
                                }}>Play Ringtone</button>
                            )}
                            <button className="btn btn-success me-2" onClick={handleAnswerCall}>Answer</button>
                            <button className="btn btn-danger" onClick={handleRejectCall}>Reject</button>
                        </div>
                    </div>
                )}
                {selectedUser ? (
                    <>
                        <div className="border-bottom p-3 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <img src={selectedUser.avatar} alt={selectedUser.name} className="rounded-circle me-2" width="40" height="40" />
                                <h5 className="mb-0">{selectedUser.name}</h5>
                            </div>
                            <div>
                                {!callActive && (
                                    <FaVideo size={24} style={{ cursor: "pointer" }} onClick={startVideoCall} />
                                )}
                                {callActive && (
                                    <button className="btn btn-danger ms-2" onClick={handleStopCall}>Disconnect</button>
                                )}
                            </div>
                        </div>
                        <div className="flex-grow-1 overflow-auto p-3">
                            {/* Show video tags only when call is active */}
                            {callActive && (
                                <div className="mb-2 d-flex">
                                    <video ref={localVideoRef} autoPlay playsInline muted style={{ width: 150, height: 100, background: "#000", marginRight: 10 }}></video>
                                    <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 300, height: 200, background: "#000" }}></video>
                                </div>
                            )}
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