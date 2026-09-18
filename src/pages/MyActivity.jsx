import { useState, useEffect } from "react";
import { Spin, Empty, message } from "antd";
import axiosInstance from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import ActivityPostItem from "../components/ActivityPostItem";

function MyActivity() {
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleDeletePostState = (postId) => {
        // Filter out the deleted post from the current state
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [userResponse, postsResponse] = await Promise.all([
                    axiosInstance.get("/auth/me"),
                    axiosInstance.get("/posts/my-posts")
                ]);

                setUser(userResponse.data);
                setPosts(postsResponse.data);
            } catch (error) {
                message.error({ content: "Failed to load your activity or profile.", key: "activity/profile_load_failed_key" });
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-[#f4f2ee] min-h-screen">
            <Navbar user={user} />

            <div className="max-w-[800px] mx-auto pt-6 px-4">
                <h1 className="text-xl font-semibold mb-4 text-gray-800">My Activity</h1>

                {loading ? (
                    <div className="flex justify-center p-10"><Spin size="large" /></div>
                ) : posts.length > 0 ? (
                    posts.map(post => <ActivityPostItem key={post._id} post={post} onDeleteSuccess={handleDeletePostState} user={user} />)
                ) : (
                    <div className="bg-white p-10 rounded-lg border border-gray-200">
                        <Empty description="You haven't posted anything yet." />
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyActivity;