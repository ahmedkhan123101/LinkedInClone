import { useState, useEffect, useCallback } from 'react';
import { Button, message, Spin, Card, Divider } from 'antd';
import {
    UserAddOutlined,
    CheckCircleOutlined,
    UserOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';

const Network = () => {

    const [user, setUser] = useState([]);
    const [users, setUsers] = useState([]);
    const [connections, setConnections] = useState([]);
    const [connectedConnections, setConnectedConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connectingId, setConnectingId] = useState(null);
    const [cancelLoadingId, setCancelLoadingId] = useState(null);
    const [sentRequestIds, setSentRequestIds] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [usersRes, connectionsRes, meRes, connectedRes] = await Promise.all([
                axiosInstance.get('/users'),
                axiosInstance.get('/connections'),
                axiosInstance.get('/auth/me'),
                axiosInstance.get('/connections/my-connections'),
            ]);

            const allUsers = usersRes.data.results || usersRes.data;
            const myConnections = connectionsRes.data || [];
            const myId = String(meRes.data.id || meRes.data._id);
            setUser(meRes.data)
            setUsers(allUsers.filter(u => String(u.id || u._id) !== myId));
            setConnectedConnections(connectedRes.data)
            console.log("connectedRes:", connectedRes)
            const processedConnections = myConnections.map(c => ({
                ...c,
                isRecipient: String(c.recipient?._id || c.recipient) === myId
            }));

            setConnections(processedConnections);
        } catch (error) {
            message.error({ content: "Could not load network data. Check your connection.", key: 'check_connection_key' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const invitations = connections.filter(c =>
        c.status === 'pending' && c.isRecipient === true
    );

    const invitationSenderIds = invitations.map(inv => String(inv.requester._id || inv.requester));

    const handleConnect = async (recipientId) => {
        try {
            setConnectingId(recipientId);
            const response = await axiosInstance.post(`/connections/request/${recipientId}`);

            if (response.status === 201) {
                message.success("Connection request sent!");
                setSentRequestIds((prev) => [...prev, recipientId]);
                setConnections(prev => [...prev, {
                    _id: response.data._id,
                    requester: user.id || user._id,
                    recipient: recipientId,
                    status: 'pending'
                }]);
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Failed to send request.");
        } finally {
            setConnectingId(null);
        }
    };

    const handleRemoveConnection = async (connectionId) => {
        try {
            setActionLoading(connectionId);
            await axiosInstance.delete(`/connections/remove/${connectionId}`);

            setConnectedConnections(prev => prev.filter(conn => conn._id !== connectionId));
            setConnections(prev => prev.filter(conn => conn._id !== connectionId))
            message.success("Connection removed");
        } catch (error) {
            message.error("Failed to remove connection");
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAccept = async (connectionId) => {
        try {
            setActionLoading(connectionId);
            const response = await axiosInstance.patch(`/connections/accept/${connectionId}`);

            if (response.status === 200) {
                message.success("Invitation accepted!");
                await fetchData(); // Refresh UI to update connection status
            }
        } catch (error) {
            message.error("Failed to accept invitation.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleIgnore = async (connectionId, requesterId) => {

        if (actionLoading === connectionId) return;
        const previousConnections = [...connections];
        setActionLoading(connectionId);
        setConnections(prev => prev.filter(conn => conn._id !== connectionId));//Optimistic UI Update
        try {
            await axiosInstance.delete(`/connections/ignore/${requesterId}`);
            message.success("Invitation ignored.");
        } catch (error) {
            setConnections(previousConnections);//Revert to original in case of error
            message.error("Failed to ignore invitation.");
        } finally {
            setActionLoading(null);//flush connectionId.
        }
    };

    const getConnectionStatus = (targetId) => {
        const tid = String(targetId);
        const myId = String(user.id || user._id);
        const conn = connections.find(c =>
            (String(c.requester?._id || c.requester) === tid) ||
            (String(c.recipient?._id || c.recipient) === tid)
        );

        if (conn?.status === 'accepted') return 'connected';

        if (conn?.status === 'pending') {
            const iAmRequester = conn.isRecipient === false || String(conn.requester?._id || conn.requester) === myId;
            if (iAmRequester || sentRequestIds.includes(tid)) {
                return 'pending';
            }
            return 'none';
        }
        return 'none';
    };

    const handleCancelConnection = async (targetId) => {
        try {
            // disable button: Spinner
            setCancelLoadingId(targetId);

            await axiosInstance.delete(`/connections/cancel/${targetId}`);

            // remove user from "sent" tracking array
            setSentRequestIds(prev => prev.filter(id => id !== targetId));

            // remove connection from main list
            setConnections(prev => prev.filter(c =>
                !(String(c.recipient?._id || c.recipient) === String(targetId) && c.status === 'pending')
            ));

            message.success("Connection request withdrawn.");
        } catch (error) {
            message.error(error.response?.data?.message || "Failed to cancel request.");
        } finally {
            // 5. Re-enable the button regardless of outcome
            setCancelLoadingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8 text-center shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-800">My Network</h1>
                    <p className="text-gray-600 mt-2">Grow your circle at Shifa by connecting with others.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
                ) : (
                    <>
                        {/* Invitations Section */}
                        {invitations.length > 0 && (
                            <div className="!mb-8">
                                <h2 className="!text-xl !font-bold !text-gray-800 !mb-6">Invitations</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {invitations.map((inv) => {
                                        const requester = inv.requester;
                                        return (
                                            <Card key={inv._id} className="!hover:shadow-md !transition-shadow">
                                                <div className="flex flex-col items-center text-center">
                                                    <img
                                                        src={requester.profilePicture || `https://placehold.co/80x80?text=${requester.name ? requester.name[0] : 'U'}`}
                                                        alt="profile"
                                                        className="w-20 h-20 rounded-full mb-4 border"
                                                    />
                                                    <h3 className="!font-bold !text-gray-800">
                                                        {requester?.name} {requester?.lastName}
                                                    </h3>
                                                    <p className="!text-gray-500 !text-sm !mb-6">Wants to connect</p>
                                                    <div className="flex gap-2 w-full">
                                                        <Button
                                                            type="primary"
                                                            block
                                                            icon={<CheckOutlined />}
                                                            className="!rounded-full !bg-blue-600 !flex !items-center !justify-center"
                                                            onClick={() => handleAccept(inv._id)}
                                                            loading={actionLoading === inv._id}
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            block
                                                            icon={actionLoading !== inv._id && <CloseOutlined />}
                                                            loading={actionLoading === inv._id} // Spinner shows during request
                                                            disabled={actionLoading === inv._id} // Prevent interaction
                                                            className="!rounded-full !flex !items-center !justify-center"
                                                            onClick={() => handleIgnore(inv._id, inv.requester._id)}
                                                        >
                                                            Ignore
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                                <Divider className="!my-10" />
                            </div>
                        )}

                        {/* Suggestions Section */}
                        <h2 className="!text-xl !font-bold !text-gray-800 !mb-6">People you may know</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {users
                                .filter(u => !invitationSenderIds.includes(String(u.id || u._id)))
                                .map((u) => {
                                    const userId = u.id || u._id;
                                    const status = getConnectionStatus(userId);

                                    return (
                                        <Card key={userId} className="!hover:shadow-md !transition-shadow">
                                            <div className="flex flex-col items-center">
                                                <img
                                                    src={u.profilePicture || `https://placehold.co/80x80?text=${u.name ? u.name[0] : 'U'}`}
                                                    alt="profile"
                                                    className="w-20 h-20 rounded-full mb-4 border"
                                                />
                                                <h3 className="!font-bold !text-gray-800">{u.name} {u.lastName}</h3>
                                                <p className="!text-gray-500 !text-sm !mb-6">Professional at Shifa</p>

                                                {status === 'connected' ? (
                                                    <Button
                                                        block
                                                        icon={<UserOutlined />}
                                                        className="!rounded-full !bg-emerald-50 !border-emerald-200 !text-emerald-600 !font-semibold !cursor-default !hover:bg-emerald-50 !hover:text-emerald-600 !hover:border-emerald-200"
                                                    >
                                                        Connected
                                                    </Button>
                                                ) : status === 'pending' ? (
                                                    <div className="flex flex-row gap-2">
                                                        <Button
                                                            disabled
                                                            icon={<CheckCircleOutlined />}
                                                            className="!rounded-full !bg-gray-100 !text-gray-400"
                                                        >
                                                            Pending
                                                        </Button>

                                                        <Button
                                                            danger
                                                            // Button turns into a spinner and becomes unclickable while request is in flight
                                                            loading={cancelLoadingId === userId}
                                                            disabled={cancelLoadingId === userId}
                                                            icon={cancelLoadingId !== userId && <CloseOutlined />}
                                                            className="!rounded-full !flex !items-center hover:!bg-red-50"
                                                            onClick={() => handleCancelConnection(userId)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        type="default"
                                                        block
                                                        className="!rounded-full !border-blue-600 !text-blue-600 !font-bold !hover:bg-blue-50 !flex !items-center !justify-center"
                                                        onClick={() => handleConnect(userId)}
                                                        loading={connectingId === userId}
                                                        icon={connectingId !== userId && <UserAddOutlined />}
                                                    >
                                                        Connect
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>
                                    );
                                })}
                        </div>
                        {/* Connections */}
                        {connectedConnections.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">
                                    My Network ({connectedConnections.length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {connectedConnections.map((conn) => {
                                        // Determine which side of the connection is NOT you
                                        const connectionData = String(conn.requester._id) === String(user?._id || user?.id)
                                            ? conn.recipient
                                            : conn.requester;

                                        return (
                                            <Card key={conn._id} className="!hover:shadow-md transition-shadow text-center">
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src={connectionData.profilePicture || `https://placehold.co/80x80?text=${connectionData.name[0]}`}
                                                        alt="connection"
                                                        className="w-20 h-20 rounded-full border-2 border-gray-100 object-cover mb-3"
                                                    />
                                                    <div className="font-bold text-lg text-gray-900">
                                                        {connectionData.name} {connectionData.lastName}
                                                    </div>
                                                    <div className="text-gray-500 text-sm mb-4">Connection</div>
                                                    <div className="flex flex-row w-full gap-2 mt-2 justify-center">
                                                        <Button
                                                            danger
                                                            type="primary"
                                                            size="small"
                                                            ghost
                                                            loading={actionLoading === conn._id}
                                                            onClick={() => handleRemoveConnection(conn._id)}
                                                            className='!rounded-full'
                                                        >
                                                            Remove Connection
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                                <Divider />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Network;