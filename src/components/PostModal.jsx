import { useState, useRef } from "react";
import axiosInstance from "../api/axiosInstance";

import { Input, Button, message, Modal, Spin } from "antd";

import cameraIcon from '../assets/camera-30.png'
import avatarDefault from '../assets/avatar-colorful-48.png'

const PostModal = ({ setIsModalOpen, isModalOpen, user }) => {

    const [selectedImages, setSelectedImages] = useState([]); //Base64 previews.
    const [rawFiles, setRawFiles] = useState([]); // Actual file objs for backend.

    const [postContent, setPostContent] = useState("");

    const [filesLoading, setFilesLoading] = useState(false);
    const [posting, setPosting] = useState(false);

    const fileInputRef = useRef(null);

    //Show Spin or mapped images when filesLoading==true
    const showSpinOrImages = filesLoading ? (
        <div className="flex justify-center p-4">
            <Spin tip="Processing images..." />
        </div>
    ) : (
        selectedImages.length > 0 && (
            <div className="relative mt-4">
                {selectedImages.map((imgSrc, index) => (
                    <div key={index} className="relative group mb-2 flex justify-center bg-gray-50 rounded-lg overflow-hidden">
                        <img src={imgSrc} alt={`Preview ${index}`} className="max-w-full max-h-80 object-contain" />
                        <Button
                            type="primary"
                            danger
                            shape="circle"
                            size="small"
                            hidden={filesLoading}
                            className="absolute top-1 right-1 opacity-80 hover:opacity-100"
                            onClick={() => removeSelectedImage(index)}
                            disabled={posting || filesLoading}
                        >
                            X
                        </Button>
                    </div>
                ))}
            </div>
        )
    )

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        if (files.length + selectedImages.length > 5) {
            return message.error('Please upload max. 5 images.');
        }

        setFilesLoading(true);

        try {
            const filePromises = files.map((file) => {
                return new Promise((resolve, reject) => {
                    // Check size (5MB limit)
                    if (file.size > 5242880) {
                        message.error(`${file.name} is over 5MB. Please select images again.`);
                        return reject(new Error("File too large"));
                    }

                    const reader = new FileReader();
                    reader.onload = () => resolve({
                        base64: reader.result,
                        file: file
                    });
                    reader.onerror = (err) => reject(err);
                    reader.readAsDataURL(file);
                });
            });


            const results = await Promise.all(filePromises);

            const newBase64s = results.map(r => r.base64);
            const newFiles = results.map(r => r.file);

            setSelectedImages((prev) => [...prev, ...newBase64s]);
            setRawFiles((prev) => [...prev, ...newFiles]);

        } catch (error) {
            console.error("File processing error:", error);
        } finally {
            setFilesLoading(false);
            e.target.value = null;
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setPostContent("");
        setSelectedImages([]);
        setRawFiles([])
    };

    const handlePost = async () => {
        const hideLoading = message.loading('Creating post...', 0);

        try {
            setPosting(true);
            const formData = new FormData();
            formData.append('content', postContent)

            rawFiles.forEach(file => {
                formData.append('files', file)
            })

            const response = await axiosInstance.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (response.status === 201) {
                hideLoading()
                message.success("Post created successfully.")
                setIsModalOpen(false)
                setPostContent("")
                setSelectedImages([])// CLear only if succeeds (Good for UX).
                setRawFiles([])
                setPosting(false)
                //Refresh posts.
            }
        } catch (error) {
            setPosting(false)
            hideLoading();
            console.error("Post creation error:", error);
            const errorMsg = error.response?.data?.message || "Failed to create post.";
            message.error(errorMsg);
        }
    }

    const removeSelectedImage = (indexToRemove) => {
        setSelectedImages((prev) => prev.filter((_, index) => index !== indexToRemove))
        setRawFiles(prev => prev.filter((_, index) => index !== indexToRemove))
    }

    return (
        <Modal
            title="Create a post"
            open={isModalOpen}
            onCancel={handleCancel}
            closable={!posting}
            maskClosable={!posting}
            keyboard={!posting}
            footer={[
                <Button key="image" type="text" className="float-left" onClick={handleImageClick}
                    disabled={posting || filesLoading}
                    icon={
                        <img
                            src={cameraIcon}
                            alt="upload-icon"
                            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                        />
                    } />,
                <Button
                    key="submit"
                    type="primary"
                    loading={posting}
                    disabled={!postContent.trim() || posting || filesLoading}
                    onClick={handlePost}
                    className="rounded-full font-semibold"
                >
                    Post
                </Button>
            ]}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*" //image of any extension.
                multiple
                style={{ display: 'none' }}
            />
            <div className="flex items-center gap-2 mb-4">
                <img src={user?.profilePicture || avatarDefault} className="w-10 h-10 rounded-full" alt="User" />
                <p className="font-semibold">{user?.name} {user?.lastName}</p>
            </div>
            <Input.TextArea
                placeholder="What do you want to talk about?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
                variant="borderless"
            />
            {showSpinOrImages}
        </Modal>
    )
}

export default PostModal;
