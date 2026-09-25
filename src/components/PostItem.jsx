import { useState } from 'react'
import { Button, Input, message } from "antd"

import likeIcon from "../assets/icons8-like-16.png";
import likeBlueIcon from "../assets/icons8-like-blue-16.png";
import avatarDefault from "../assets/avatar-colorful-48.png";
import earthIcon from "../assets/earth-black-24.png";

import axiosInstance from '../api/axiosInstance.js'

const renderPostImages = (post) => {
    console.log(post.images)
    //check for file
    if (!post.images || post.images.length === 0) return null
    return (
        <div className={`grid gap-1 mt-2 mx-4 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`} >
            {post.images.map((imgUrl, index) => (
                <img
                    key={index}
                    src={imgUrl}
                    className={`rounded-lg object-cover ${post.images.length === 1
                        ? 'max-w-full max-h-[400px] w-auto h-auto mx-auto'
                        : 'w-full h-48'
                        }`}
                    alt="Post content"
                    loading="lazy"
                />
            ))}
        </div>
    )
}

const PostItem = ({ post, user, handleLike, updateCommentCount }) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [isCommenting, setIsCommenting] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    const handleLoadComments = async () => {
        try {
            setLoadingComments(true);
            const response = await axiosInstance.get(`/posts/${post._id}/comments`);
            setComments(response.data);
            setCommentsLoaded(true);
        } catch (error) {
            message.error("Failed to load comments.");
        } finally {
            setLoadingComments(false);
        }
    };

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;
        try {
            setIsCommenting(true);
            const response = await axiosInstance.post(`/posts/${post._id}/comments`, {
                content: commentText,
            });

            if (response.status === 201) { // httpStatus.status.CREATED

                const newComment = response.data;

                if (comments.length === 0 && post.commentCount > 0) {

                    await handleLoadComments();
                    // If does not exist, add new
                    setComments(prev => {
                        const exists = prev.find(c => c._id === newComment._id);
                        return exists ? prev : [newComment, ...prev];
                    });
                } else {
                    // If list already open or no comments, add new
                    setComments((prev) => [newComment, ...prev]);
                }

                setCommentText("");
                if (updateCommentCount) {
                    updateCommentCount(post._id)
                }
                message.success("Comment added.");
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to post comment.");
        } finally {
            setIsCommenting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
            {/* Post Header */}
            <div className="flex p-4 gap-2">
                <img src={post.author?.profilePicture || avatarDefault} className="w-12 h-12 rounded-full" alt="Profile" />
                <div>
                    <p className="font-semibold text-sm">{post.author?.name} {post.author?.lastName}</p>
                    <p className="text-xs text-gray-500">Software Intern at Shifa</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <img src={earthIcon} className="w-3 h-3" alt="Public" />
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-2 text-sm">
                <p>{post.content}</p>
            </div>

            {renderPostImages(post)}

            <div className="flex justify-around border-t border-gray-100 py-1 mt-2">
                <Button
                    type="text"
                    className="font-semibold text-gray-500 flex items-center gap-1"
                    onClick={() => handleLike(post._id, post.likes || [])}
                >
                    <img
                        src={post.likes?.includes(user?._id) ? likeBlueIcon : likeIcon}
                        alt="like"
                        className="w-4 h-4"
                    />
                    <span style={{ color: post.likes?.includes(user?._id) ? '#0a66c2' : 'inherit' }}>
                        Like {post.likes?.length > 0 && post.likes.length}
                    </span>
                </Button>

                <Button
                    type="text"
                    className="font-semibold text-gray-500"
                    onClick={commentsLoaded ? undefined : handleLoadComments}//does nothing when comments load.
                    loading={loadingComments}
                >
                    Comment {post.commentCount > 0 && post.commentCount}
                </Button>
                <Button type="text" className="font-semibold text-gray-500">Repost</Button>
                <Button type="text" className="font-semibold text-gray-500">Send</Button>
            </div>

            {/* Comment Section */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                {/* Comment Input Bar */}
                <div className="flex flex-row items-start gap-3 mb-4">
                    <img
                        src={user?.profilePicture || avatarDefault}
                        alt="Avatar"
                        className="object-cover rounded-full h-[32px] w-[32px] mt-1"
                    />
                    <div className="flex-grow">
                        <Input
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={isCommenting}
                            onPressEnter={handleCommentSubmit}
                            className="rounded-full py-1 px-4 bg-white border-gray-300"
                            suffix={
                                <div style={{ width: 'auto', minWidth: '45px', display: 'flex', justifyContent: 'end' }}>
                                    {commentText.trim() ? (
                                        <Button
                                            type="primary"
                                            size="small"
                                            shape="round"
                                            loading={isCommenting}
                                            onClick={handleCommentSubmit}
                                        >
                                            Post
                                        </Button>
                                    ) : null}
                                </div>
                            }
                        />
                    </div>
                </div>

                {/* Display Comments List */}
                {!commentsLoaded ? (
                    post.commentCount > 0 && (
                        <Button type="link" onClick={handleLoadComments} loading={loadingComments} className="text-gray-500 text-xs">
                            Load previous comments...
                        </Button>
                    )
                ) : (
                    <div className="space-y-3 mt-4">
                        {comments.map((comment) => (
                            <div key={comment._id} className="flex gap-2">
                                <img src={comment.author?.profilePicture || avatarDefault} className="w-8 h-8 rounded-full" alt="user" />
                                <div className="flex-1">
                                    <div className="bg-gray-100 p-2 rounded-lg">
                                        <p className="font-bold text-[12px]">{comment.author?.name} {comment.author?.lastName}</p>
                                        <p className="text-sm">{comment.content}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 ml-2">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostItem;
