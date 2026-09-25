import { Button } from "antd";
import Hero from '../assets/LinkedInHeroImage.svg'
import googleIcon from '../assets/google-white-48.png'
import microsoftIcon from '../assets/microsoft-white-48.png'
import { useNavigate } from 'react-router-dom';

function Home() {

    const navigate = useNavigate();

    return (
        <div className="flex border flex-col items-center bg-[#f3f2f0]">
            {/* ((Welcome + Auth) Column + Hero) Row*/}
            {/* Small screens: Column; Medium + large: Row of (Welcome + Auth) Column + Hero */}
            <div className="flex flex-col md:flex-row border border-pink-700">
                <div className="flex flex-col border">
                    {/* Welcome Title */}
                    <div className="mx-3 border">
                        <p className="text-xl md:text-3xl lg:text-4xl">Welcome to your professional community</p>
                    </div>
                    {/* Auth div */}
                    <div className="flex flex-col border w-[400px] mt-[30px] mx-3">
                        <div className="flex flex-col gap-3 mt-4">
                            {/* Google */}
                            <Button
                                type="text"
                                className="!flex !items-center !justify-center !w-full !border !border-gray-300 !rounded-[50px] !py-5 hover:bg-gray-100"
                                onClick={() => console.log("Google login clicked")}
                            >
                                <img
                                    src={googleIcon}
                                    alt="Google"
                                    className="w-5 h-5 mr-2"
                                />
                                Continue with Google
                            </Button>

                            {/* Microsoft */}
                            <Button
                                type="text"
                                className="!flex !items-center !justify-center !w-full !border !border-gray-300 !rounded-[50px] !py-5 hover:bg-gray-100"
                                onClick={() => console.log("Microsoft login clicked")}
                            >
                                <img
                                    src={microsoftIcon}
                                    alt="Microsoft"
                                    className="w-5 h-5 mr-2"
                                />
                                Continue with Microsoft
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mt-[20px] mx-3">
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
                        <div className="flex flex-row mt-[20px] border justify-center">
                            <p className="mr-[5px]">New to LinkedIn?</p>
                            <a onClick={() => { navigate("/signup") }} className="text-blue-600 hover:underline font-semibold">
                                Join Now
                            </a>
                        </div>
                    </div>

                </div>
                {/* Hero Image */}
                <div className="border border-cyan-700 mt-5 md:mt-0">
                    <img src={Hero} alt="Hero Image" className="w-[300px] md:w-full justify-self-center" />
                </div>
            </div>

        </div>
    )
}

export default Home
