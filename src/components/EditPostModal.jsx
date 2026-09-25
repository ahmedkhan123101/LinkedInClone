import { useState, useEffect, useRef } from "react";
import { Input, Button, message, Modal, Spin } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import axiosInstance from "../api/axiosInstance";
import cameraIcon from '../assets/camera-30.png';
import avatarDefault from '../assets/avatar-colorful-48.png';

const EditPostModal = ({ isModalOpen, setIsModalOpen, post, onUpdateSuccess, user }) => {
    const [postContent, setPostContent] = useState("");
    const [existingImages, setExistingImages] = useState([]); // Cloudinary URLs
    const [newSelectedImages, setNewSelectedImages] = useState([]); // Base64 previews
    const [newRawFiles, setNewRawFiles] = useState([]); // New File objects

    const [loading, setLoading] = useState(false);
    const [filesLoading, setFilesLoading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (post) {
            setPostContent(post.content);
            setExistingImages(post.images || []);
            setNewSelectedImages([]);
            setNewRawFiles([]);
        }
    }, [post, isModalOpen]);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);

        // 1. Check total count (Existing + New)
        if (files.length + existingImages.length + newRawFiles.length > 5) {
            return message.error("Maximum 5 images allowed total");
        }

        setFilesLoading(true);

        const validFiles = [];
        const previews = [];

        for (const file of files) {
            // 2. Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                message.error(`${file.name} is too large. Max size is 5MB.`);
                continue; // Skip this file but continue with others
            }

            try {
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                });

                previews.push(base64);
                validFiles.push(file);
            } catch (err) {
                console.error("Error reading file:", err);
                message.error("Failed to process some images.");
            }
        }

        setNewSelectedImages((prev) => [...prev, ...previews]);
        setNewRawFiles((prev) => [...prev, ...validFiles]);
        setFilesLoading(false);

        // Reset input so the same file can be selected again if removed
        e.target.value = null;
    };

    const removeExistingImage = (url) => {
        setExistingImages(existingImages.filter(img => img !== url));
    };

    const removeNewImage = (index) => {
        setNewSelectedImages(newSelectedImages.filter((_, i) => i !== index));
        setNewRawFiles(newRawFiles.filter((_, i) => i !== index));
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("content", postContent);

            existingImages.forEach(img => formData.append("images", img));

            newRawFiles.forEach(file => formData.append("files", file));

            const response = await axiosInstance.patch(`/posts/${post._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000
            });

            message.success("Post updated!");
            onUpdateSuccess(response.data);
            setIsModalOpen(false);
        } catch (error) {
            message.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Edit post"
            open={isModalOpen}
            closable={!loading}
            maskClosable={!loading}
            onCancel={() => setIsModalOpen(false)}
            footer={[
                <Button key="cam"
                    disabled={filesLoading || loading}
                    loading={loading}
                    icon={<img src={cameraIcon} className="w-6" />} onClick={() => fileInputRef.current.click()} />,
                <Button key="submit" type="primary" loading={loading} onClick={handleUpdate} disabled={filesLoading || loading}>
                    Save Changes
                </Button>
            ]}
        >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple hidden accept="image/*" />

            <div className="flex items-center gap-2 mb-4">
                <img src={user?.profilePicture || avatarDefault} className="w-10 h-10 rounded-full" alt="User" />
                <p className="font-semibold">{user?.name} {user?.lastName}</p>
            </div>

            <Input.TextArea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
                variant="borderless"
            />

            {/* Previews Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4">
                {/* Existing Images */}
                {existingImages.map((url, index) => (
                    <div key={`exist-${index}`} className="relative group">
                        <img src={url} className="w-full h-32 object-cover rounded-lg opacity-80" alt="existing" />
                        <Button
                            danger
                            shape="circle"
                            size="small"
                            disabled={loading}
                            icon={<CloseOutlined />}
                            className="absolute top-1 right-1"
                            onClick={() => removeExistingImage(url)}
                        />
                    </div>
                ))}

                {/* New Images */}
                {newSelectedImages.map((src, index) => (
                    <div key={`new-${index}`} className="relative group">
                        <img src={src} className="w-full h-32 object-cover rounded-lg border-2 border-blue-400" alt="new" />
                        <Button
                            danger
                            shape="circle"
                            size="small"
                            disabled={loading}
                            icon={<CloseOutlined />}
                            className="absolute top-1 right-1"
                            onClick={() => removeNewImage(index)}
                        />
                    </div>
                ))}
            </div>
            {filesLoading && <Spin className="mt-4 w-full" />}
        </Modal>
    );
};

export default EditPostModal;
