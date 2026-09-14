import { Form, Input, Button, message } from "antd";
import { useNavigate } from 'react-router-dom';
import { registerUser } from "../services/authService.js";
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/slices/authSlice.js";
import { setAccessToken } from '../api/axiosInstance.js';

function SignUp() {

    const [form] = Form.useForm();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onFinish = async (values) => {
        const hideLoading = message.loading('Creating your account...', 0);

        try {
            const response = await registerUser(values)

            const accessToken = response?.access?.token;

            if (accessToken) {
                setAccessToken(accessToken)

                dispatch(
                    setAuth({
                        user: response.user,
                        accessToken
                    })
                );
                hideLoading();
                message.success("Account created successfully!");
                navigate('/feed');
            } else {
                throw new Error("Registration failed: No token received.");
            }
        } catch (error) {
            hideLoading();
            const errorMsg = error.response?.data?.message || error.message || "Failed to register.";
            message.error(errorMsg);
        }
    };


    const onFinishFailed = ({ errorFields }) => {
        if (errorFields.length > 0) {
            form.scrollToField(errorFields[0].name);
        }
    };

    return (
        <div className="flex flex-col items-center bg-[#f3f2f0]">
            {/* div for LinkedIn Icon */}
            {/* Title */}
            <div className="mb-[30px] mt-[30px] mx-6">
                <p className="text-3xl">Make the most of your professional life</p>
            </div>

            {/* Form container: for tabs, laps, pcs w-[400px]*/}
            <div className="bg-white p-5 rounded-[8px] w-[400px]">
                {/* Form */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="on"
                >
                    {/* First Name */}
                    <Form.Item
                        label="First Name"
                        name="name"
                        rules={[{ required: true, message: "Please enter your first name" }]}
                    >
                        <Input placeholder="First Name" />
                    </Form.Item>

                    {/* Last Name */}
                    <Form.Item
                        label="Last Name"
                        name="lastName"
                        rules={[{ required: true, message: "Please enter your last name" }]}
                    >
                        <Input placeholder="Last Name" />
                    </Form.Item>
                    {/* Email */}
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: "Please enter an email address",
                            },
                            {
                                type: "email",
                                message: "Please enter a valid email address",
                            },
                        ]}
                    >
                        <Input
                            type="email"
                            placeholder="example@email.com"
                            autoComplete="email"
                        />
                    </Form.Item>

                    {/* Password */}
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Please enter a password",
                            },
                            {
                                min: 6,
                                message: "Please enter 6 characters or more",
                            },
                        ]}
                    >
                        <Input.Password
                            placeholder="Enter password"
                            autoComplete="current-password"
                            iconRender={(visible) => (
                                <span style={{
                                    color: "#0A66C2", fontWeight: 600, cursor: "pointer"
                                }}>
                                    {visible ? "Hide" : "Show"}
                                </span>
                            )}
                        />
                    </Form.Item>
                    <Form.Item>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            By clicking <strong>Agree &amp; Join</strong> or <strong>Continue</strong>,
                            you agree to the LinkedIn{" "}
                            <a href="#" className="text-[#0A66C2] font-bold hover:underline">
                                User Agreement
                            </a>
                            ,{" "}
                            <a href="#" className="text-[#0A66C2] font-bold hover:underline">
                                Privacy Policy
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-[#0A66C2] font-bold hover:underline">
                                Cookie Policy
                            </a>.
                        </p>
                    </Form.Item>

                    {/* Submit */}
                    <Form.Item>
                        <Button className="!bg-[#004182] !rounded-[50px] !py-[25px]" type="primary" htmlType="submit" block>
                            <span className="text-white font-semibold">Agree and Join</span>
                        </Button>
                    </Form.Item>
                </Form>
                {/* or line */}

                {/* Sign In link */}
                <div className="flex flex-row justify-self-center">
                    <p className="mr-[5px]">Already on LinkedIn?</p>
                    <a onClick={() => navigate('/signin')} className="text-blue-600 hover:underline font-semibold">
                        Sign in
                    </a>
                </div>
            </div>
            <div className="flex flex-row mt-[10px]">
                <p className="mr-[5px]">Looking to create a page for a business?</p>
                <a href="#" className="text-blue-600 hover:underline font-semibold">
                    Get help
                </a>
            </div>
        </div>
    )
}

export default SignUp
