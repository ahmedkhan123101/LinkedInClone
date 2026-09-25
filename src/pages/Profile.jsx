import { useState, useEffect } from "react";
import { Button, Card, Avatar, message, Tag, Empty, Spin, Popconfirm } from "antd";
import { EditOutlined, PlusOutlined, EnvironmentOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

import EditIntroModal from "../components/EditIntroModal";
import ExperienceModal from "../components/ExperienceModal";
import EducationModal from "../components/EducationModal";
import AllSkillsModal from "../components/AllSkillsModal";

import Navbar from "../components/Navbar";
import avatarDefault from "../assets/avatar-colorful-48.png";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);
    const [isExpModalOpen, setIsExpModalOpen] = useState(false);
    const [isEduModalOpen, setIsEduModalOpen] = useState(false);
    const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await axiosInstance.get("/auth/me");
            setUser(res.data);
        } catch (err) {
            message.error({ content: "Failed to load profile", key: 'profile_load_failed_key' });
        } finally { setLoading(false); }
    };

    const handleAvatarClick = () => {
        document.getElementById("avatar-upload-input").click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return message.error("Image must be < 5MB");

        const formData = new FormData();
        formData.append("image", file);
        try {
            setLoading(true);
            const res = await axiosInstance.patch("/auth/me/avatar", formData);
            setUser({ ...user, profilePicture: res.data.profilePicture });
            message.success("Profile picture updated");
        } catch (err) {
            message.error("Failed to update avatar");
        } finally { setLoading(false); }
    };

    const handleDelete = async (id, type) => {
        try {
            await axiosInstance.delete(`/users/me/${type}/${id}`);
            message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`);
            fetchProfile();
        } catch (err) {
            message.error(`Failed to delete ${type}`);
        }
    };

    if (loading && !user) return <div className="flex justify-center mt-20"><Spin size="large" /></div>;

    return (
        <div className="bg-[#f4f2ee] min-h-screen">
            <Navbar user={user} />
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Intro Card */}
                <Card className="overflow-hidden mb-4 shadow-sm" bodyStyle={{ padding: 0 }}>
                    <div className="h-40 bg-gray-300 relative group">
                        <div className="absolute top-4 right-4">
                            <Button icon={<EditOutlined />} shape="circle" onClick={() => setIsIntroModalOpen(true)} />
                        </div>
                    </div>
                    <div className="px-6 pb-6">
                        <div className="relative -mt-16 mb-4 inline-block">
                            <input id="avatar-upload-input" type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                            <Avatar
                                size={150}
                                src={user?.profilePicture || avatarDefault}
                                className="border-4 border-white shadow-md bg-white cursor-pointer hover:brightness-90 transition-all"
                                onClick={handleAvatarClick}
                            />
                        </div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold">{user?.name} {user?.lastName}</h1>
                                <p className="text-gray-600 text-lg">{user?.headline || "Software Engineer"}</p>
                                <p className="text-gray-500 text-sm mt-1">
                                    <EnvironmentOutlined /> {user?.city || "Islamabad, Pakistan"}
                                </p>
                                <Button type="text" className="text-blue-600 font-semibold p-0 mt-2 h-auto" onClick={() => navigate("/network")}>
                                    Connections
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Experience Section */}
                <Card
                    title="Experience"
                    extra={<Button icon={<PlusOutlined />} type="text" onClick={() => setIsExpModalOpen(true)} />}
                    className="mb-4 shadow-sm"
                >
                    {user?.experience?.length > 0 ? (
                        user?.experience?.map((exp, index) => (
                            <div key={exp._id || index} className="group py-4 first:pt-0 last:pb-0 border-b last:border-0 border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-base text-gray-900">{exp.title}</h4>
                                        <p className="text-gray-700 text-sm">{exp.company}</p>

                                        <p className="text-gray-500 text-sm mt-1">
                                            {exp.startMonth} {exp.startYear} - {exp.currentRole ? "Present" : `${exp.endMonth} ${exp.endYear}`}
                                        </p>

                                        {exp.location && (
                                            <p className="text-gray-400 text-xs mt-1 italic">
                                                <EnvironmentOutlined className="mr-1" />{exp.location}
                                            </p>
                                        )}
                                    </div>

                                    <Popconfirm
                                        title="Delete experience"
                                        description="Are you sure you want to delete this role?"
                                        onConfirm={() => handleDelete(exp._id, 'experience')}
                                        okText="Yes"
                                        cancelText="No"
                                        placement="left"
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </Popconfirm>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No experience added" />
                    )}
                </Card>

                {/* Education Section */}
                <Card
                    title="Education"
                    extra={<Button icon={<PlusOutlined />} type="text" onClick={() => setIsEduModalOpen(true)} />}
                    className="mb-4 shadow-sm"
                >
                    {user?.education?.length > 0 ? (
                        user?.education?.map((edu, index) => (
                            <div key={edu._id || index} className="group py-4 first:pt-0 last:pb-0 border-b last:border-0 border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-base text-gray-900">{edu.school}</h4>
                                        {(edu.degree || edu.fieldOfStudy) && (
                                            <p className="text-gray-600 text-sm">
                                                {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(", ")}
                                            </p>
                                        )}
                                        {edu.startYear && (
                                            <p className="text-gray-500 text-sm mt-1">
                                                {`${edu.startYear}${edu.endYear ? ` - ${edu.endYear}` : " - Present"}`}
                                            </p>
                                        )}
                                    </div>

                                    <Popconfirm
                                        title="Delete education"
                                        description="Are you sure you want to delete this?"
                                        onConfirm={() => handleDelete(edu._id, 'education')}
                                        okText="Yes"
                                        cancelText="No"
                                        placement="left"
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </Popconfirm>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No education added" />
                    )}
                </Card>

                {/* Skills Section */}
                <Card title="Skills" extra={<Button icon={<PlusOutlined />} type="text" onClick={() => setIsSkillsModalOpen(true)} />} className="shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        {user?.skills?.slice(0, 5).map((skill, i) => (
                            <Tag color="blue" key={i} className="px-3 py-1 rounded-full">{skill}</Tag>
                        ))}
                    </div>
                    {user?.skills?.length > 5 && (
                        <Button type="link" className="mt-4 p-0" onClick={() => setIsSkillsModalOpen(true)}>
                            Show all {user.skills.length} skills →
                        </Button>
                    )}
                </Card>

                {/* Modal Components Integration */}
                <EditIntroModal
                    isOpen={isIntroModalOpen}
                    onClose={() => setIsIntroModalOpen(false)}
                    user={user}
                    onSave={fetchProfile}
                />
                <ExperienceModal
                    isOpen={isExpModalOpen}
                    onClose={() => setIsExpModalOpen(false)}
                    onSave={fetchProfile}
                />
                <EducationModal
                    isOpen={isEduModalOpen}
                    onClose={() => setIsEduModalOpen(false)}
                    onSave={fetchProfile}
                />
                <AllSkillsModal
                    isOpen={isSkillsModalOpen}
                    onClose={() => setIsSkillsModalOpen(false)}
                    skills={user?.skills || []}
                    onSave={fetchProfile}
                />
            </div>
        </div>
    );
};

export default Profile;
