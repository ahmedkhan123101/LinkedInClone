import { useState } from "react";
import { Button, Space, Divider, message, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axiosInstance from "../api/axiosInstance";
import EditPostModal from "./EditPostModal";
import avatarDefault from '../assets/avatar-colorful-48.png';

const ActivityPostItem = ({ post: initialPost, onDeleteSuccess, user }) => {
    const [post, setPost] = useState(initialPost);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUpdateSuccess = (updatedPost) => {
        setPost(updatedPost);
        message.success("Post updated successfully");
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await axiosInstance.delete(`/posts/${post._id}`);
            message.success("Post deleted successfully");
            onDeleteSuccess(post._id);
        } catch (error) {
            message.error("Failed to delete post.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLoadComments = async () => {
        try {
            setLoadingComments(true);
            const response = await axiosInstance.get(`/posts/${post._id}/comments`);
            setComments(response.data);
        } catch (error) {
            message.error("Failed to load comments.");
        } finally {
            setLoadingComments(false);
        }
    };

    const renderPostImages = (images) => {
        if (!images || images.length === 0) return null;
        return (
            <div className={`grid gap-1 mt-2 mx-4 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {images.map((imgUrl, index) => (
                    <img
                        key={index}
                        src={imgUrl}
                        className={`rounded-lg object-cover ${images.length === 1
                            ? 'max-w-full max-h-[400px] w-auto h-auto mx-auto'
                            : 'w-full h-48'}`}
                        alt="Post content"
                        loading="lazy"
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 pt-3 pb-4 mb-4 shadow-sm">
            <div className="flex justify-between items-start px-4 mb-2">
                <div className="flex gap-2">
                    <img
                        src={post.author?.profilePicture || avatarDefault}
                        className="w-12 h-12 rounded-full"
                        alt="User"
                    />
                    <div>
                        <p className="font-bold text-sm hover:underline cursor-pointer">
                            {post.author?.name} {post.author?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <Space>
                    {/* EDIT BUTTON */}
                    <Button
                        icon={<EditOutlined />}
                        type="text"
                        className="text-blue-600"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Edit
                    </Button>

                    <Popconfirm
                        title="Delete the post"
                        description="Are you sure to delete this post?"
                        onConfirm={handleDelete}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} type="text" danger loading={isDeleting}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            </div>

            <div className="px-4 text-sm text-gray-800 whitespace-pre-wrap">
                {post.content}
            </div>

            {renderPostImages(post.images)}

            <Divider className="my-3" />

            <div className="px-4 flex justify-between text-xs text-gray-500">
                <span>{post.likes?.length || 0} Likes</span>
                <span className="cursor-pointer hover:underline" onClick={handleLoadComments}>
                    {post.commentCount || 0} Comments
                </span>
            </div>

            {/* Render Comments if loaded */}
            {comments.length > 0 && (
                <div className="px-4 mt-4 space-y-3">
                    {comments.map((comment) => (
                        <div key={comment._id} className="flex gap-2">
                            <img src={comment.author?.profilePicture || avatarDefault} className="w-8 h-8 rounded-full" alt="user" />
                            <div className="flex-1 bg-gray-100 p-2 rounded-lg">
                                <p className="font-bold text-[12px]">{comment.author?.name} {comment.author?.lastName}</p>
                                <p className="text-sm">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <EditPostModal
                isModalOpen={isEditModalOpen}
                setIsModalOpen={setIsEditModalOpen}
                post={post}
                user={user}
                onUpdateSuccess={handleUpdateSuccess}
            />
        </div>
    );
};

export default ActivityPostItem;
