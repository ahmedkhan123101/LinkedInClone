import { Button, Dropdown, message, Spin } from "antd";
import Navbar from "../components/Navbar";
import { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import PostModal from "../components/PostModal";
import PostItem from "../components/PostItem";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../redux/slices/authSlice";
import avatarDefault80 from "../assets/avatar-colorful-80.png";
import avatarDefault48 from "../assets/avatar-colorful-48.png";

function Feed() {

    const dispatch = useDispatch();

    const { user, loading: authLoading } = useSelector((state) => state.auth)

    const [posts, setPosts] = useState([])

    const [uploading, setUploading] = useState(false);

    const [postsLoading, setPostsLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {

        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            return message.error("Image must be less than 5MB");
        }

        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploading(true);

            //Axios will automatically set contenttype to multipart formdata
            const response = await axiosInstance.patch('/auth/me/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedUser = response.data.user || response.data;
            dispatch(updateUser(updatedUser))
            setUploading(false)
            message.success("Profile picture updated!");
        } catch (error) {
            message.error("Failed to upload profile picture.");
        }
    };

    const showModal = () => setIsModalOpen(true);

    const handleLike = async (postId, currentLikes) => {
        //Check if internet is off.
        if (!window.navigator.onLine) {
            return message.error({ content: "You are offline.", key: "you_are_offline_key" })
        }
        //For reverting to old posts if server is down, create a copy.
        const originalPosts = [...posts];
        //Check user id in likes array.
        const isAlreadyLiked = currentLikes.includes(user?._id);
        //Iterate each post and modify the one that user clicked "Like."
        const updatedPosts = posts.map(p => {
            if (p._id === postId) {
                const newLikes = isAlreadyLiked
                    //Toggle like
                    ? p.likes.filter(id => id !== user._id)
                    //Add user's id to likes array to represent "liked."
                    : [...(p.likes || []), user._id]
                return { ...p, likes: newLikes }
            }
            //else return each post to set in "posts" state.
            return p;
        })
        //Update state to render UI: Change this.
        setPosts(updatedPosts)
        //Change in backend.
        try {
            await axiosInstance.post(`posts/${postId}/like`)
        }
        catch (error) {
            //Revert back to originalPosts.
            setPosts(originalPosts)
            message.error("Failed to like. Please try again.")
        }
    }

    const updateCommentCount = (postId) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId ? { ...post, commentCount: (post.commentCount || 0) + 1 } : post
            )
        )
    }

    const items = [
        { label: 'Most relevant', key: '1' },
        { label: 'Most recent', key: '2' },
    ];


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setPostsLoading(true)
                const response = await axiosInstance.get('/posts')
                setPosts(response.data)
                setPostsLoading(false)
            }
            catch (error) {
                console.error("Error:", error)
                message.error({ content: "Failed to load feed data.", key: "feed_load_failed_key" })
            }
        }
        fetchPosts();
    }, [])

    if (uploading) return (
        <div className="flex h-screen justify-center items-center">
            <Spin size="large" tip="Uploading..." />
        </div>
    )

    if (authLoading) return (
        <div className="flex h-screen justify-center items-center">
            <Spin size="large" tip="Authenticating..." />
        </div>
    )

    return (
        <div className="bg-[#f4f2ee] min-h-screen">
            <Navbar user={user} />

            <div className="flex flex-col md:flex-row justify-center gap-6 px-4 mt-6 max-w-6xl mx-auto items-start">

                {/* Profile Sidebar */}
                <div className="w-full max-w-[555px] md:w-[225px]  flex-shrink-0 bg-white h-fit rounded-lg overflow-hidden border border-gray-200">
                    <div className="w-full h-[58px] bg-gray-300"></div>
                    <div
                        className="relative flex justify-center -mt-8 cursor-pointer"
                        onClick={handleAvatarClick}
                    >
                        <div className="relative">
                            <img
                                src={user?.profilePicture || avatarDefault80}
                                alt="Avatar"
                                className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover"
                            />
                            <div className="flex bg-[#0a66c2] h-5 w-5 rounded-full items-center justify-center absolute bottom-0 right-0 border border-white">
                                <span className="text-white text-xs font-bold">+</span>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>
                    </div>
                    <div className="mt-4 text-center px-3 pb-4">
                        <p className="font-semibold text-lg hover:underline cursor-pointer">
                            {user ? `${user.name} ${user.lastName}` : "Loading..."}
                        </p>
                        <p className="text-gray-500 text-xs">Software Engineer</p>
                    </div>
                </div>

                {/* Main Feed Content */}
                <div className="flex flex-col lg:flex-row gap-6 flex-grow">

                    {/* Feed Posts */}
                    <div className="w-full max-w-[555px] flex flex-col gap-4">

                        {/* Start a post box */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 w-full max-w-[555px]">
                            <div className="flex gap-2 items-center">
                                <img src={user?.profilePicture || avatarDefault48} className="w-12 h-12 rounded-full" alt="Avatar" />
                                <Button
                                    onClick={showModal}
                                    className="flex-grow rounded-full text-left px-5 h-12 text-gray-500 font-semibold hover:bg-gray-100"
                                >
                                    Start a post
                                </Button>
                            </div>
                        </div>

                        {postsLoading ? (<Spin />) : (posts.map((post) => (
                            <PostItem key={post._id} post={post} handleLike={handleLike} user={user} updateCommentCount={updateCommentCount} />
                        )))
                        }

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-1">
                            <hr className="flex-grow border-gray-300" />
                            <Dropdown trigger={['click']} menu={{ items }}>
                                <Button type="text" className="text-xs text-gray-500">
                                    Sort by: <span className="font-semibold text-black">Most Relevant</span>
                                </Button>
                            </Dropdown>
                        </div>
                    </div>

                    {/* Right Suggestions Sidebar */}
                    <div className="w-full max-w-[555px] lg:w-[300px] bg-white rounded-lg border border-gray-200 p-4 h-fit">
                        <p className="font-semibold mb-4">Add to your Feed</p>

                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex gap-3 mb-4">
                                <img src={avatarDefault48} className="w-12 h-12 rounded-full" alt="Avatar" />
                                <div>
                                    <p className="font-semibold text-sm">Name</p>
                                    <p className="text-xs text-gray-500 mb-2">Designation</p>
                                    <Button size="small" className="rounded-full border-gray-600 font-semibold px-4">
                                        + Follow
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <Button type="text" className="text-gray-500 font-semibold w-full text-left">
                            View all recommendations →
                        </Button>
                    </div>
                </div>
            </div>

            {/* Post Modal */}
            <PostModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} user={user} />
        </div>
    );
}

export default Feed;
