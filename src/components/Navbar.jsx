import { Input, Dropdown } from "antd";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance.js';
import {
    HomeFilled,
    HomeOutlined,
    UserOutlined,
    SolutionOutlined,
    LogoutOutlined,
    CaretDownFilled,
} from '@ant-design/icons';

import { useDispatch } from "react-redux";
import { logout } from '../redux/slices/authSlice.js'
import { clearAccessToken } from '../api/axiosInstance.js'

import logo from '../assets/linkedin-colorful-34.png'
import avatarDefault from '../assets/avatar-colorful-24.png'
import peopleFilled from '../assets/people-filled.png'
import peopleOutlined from '../assets/people-outlined.png'

function Navbar(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        clearAccessToken();
        navigate('/signin', { replace: true });

        axiosInstance.post('/auth/logout')
            .catch(err => console.warn("Logout sync failed", err));
    };

    const items = [
        {
            key: '1',
            label: (
                <div className="flex flex-col p-2">
                    <span className="font-bold text-sm">{props.user?.name}</span>
                    <span className="text-xs text-gray-500">LinkedIn Clone User</span>
                </div>
            ),
        },
        { type: 'divider' },
        {
            key: '2',
            icon: <UserOutlined />,
            label: <Link to="/profile">View Profile</Link>,
        },
        {
            key: 'activity',
            icon: <SolutionOutlined />,
            label: <Link to="/my-activity">My Activity</Link>,
        },
        { type: 'divider' },
        {
            key: '4',
            icon: <LogoutOutlined className="text-red-600" />,
            label: (
                <span className="text-red-600 font-medium">
                    Sign Out
                </span>
            ),
            onClick: handleLogout
        },
    ];

    return (
        <div className="flex h-[55px] bg-white mb-[20px] items-center justify-center sticky top-0 z-50 shadow-sm">
            <div className="flex w-[97%] flex-row items-center justify-between">
                <div className="shrink-0 cursor-pointer" onClick={() => navigate('/feed')}>
                    <img src={logo} alt="Logo" />
                </div>

                <div className="flex flex-row items-center">
                    <NavItem path='/feed' filledIcon={<HomeFilled />} outlinedIcon={<HomeOutlined />} label="Home" onClick={() => navigate('/feed')} />
                    <NavItem path='/network' filledIcon={<img src={peopleFilled} />} outlinedIcon={<img src={peopleOutlined} />} label="My Network" onClick={() => navigate('/network')} />

                    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight" arrow>
                        <div className="flex flex-col items-center cursor-pointer w-[75px] max-[747px]:w-[50px]">
                            <img src={props.user?.profilePicture || avatarDefault} alt="Me" className="rounded-full w-6 h-6 border border-gray-200" />
                            <div className="flex flex-row items-center">
                                <CaretDownFilled />
                            </div>
                        </div>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
}

const NavItem = ({ path, filledIcon, outlinedIcon, label, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === path;
    return (
        <div className="flex flex-col items-center cursor-pointer w-[75px] max-[747px]:w-[43px]" onClick={onClick}>
            <div style={{ fontSize: '20px' }}>
                {isActive ? filledIcon : outlinedIcon}
            </div>
            <p className="text-xs max-[853px]:hidden">{label}</p>
        </div>
    );
}

export default Navbar;
