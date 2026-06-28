
import { useState, useEffect } from "react";
import herobg from "../assets/hero.jpeg";

const Hero = () => {
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
        // Auto-dismiss the intro overlay after 2.2 seconds
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 2200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Prevent scrolling while intro overlay is active
        if (showIntro) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [showIntro]);

    return (
        <div className="relative font-sans overflow-hidden">
            {/* Intro Overlay */}
            {showIntro && (
                <div className="fixed inset-0 bg-white flex flex-col justify-center items-center z-50 p-6 text-center transition-opacity duration-500 ease-in-out">
                    <h1 className="fade-text opacity-0 text-3xl md:text-6xl font-normal mb-4 text-zinc-900">
                        Welcome {" "}
                        <span className="bg-[rgb(234,57,8)] text-white py-1.5 px-6 rounded-md font-bold shadow-lg shadow-orange-600/10">
                            Kingdom Influencer
                        </span>
                    </h1>
                    <div className="relative flex flex-col items-center mt-8">
                        <span className="underbar opacity-0 w-72 md:w-96 lg:w-[31.25rem] h-1.5 inline-block bg-[rgb(234,57,8)] absolute bottom-0 left-1/2 transform -translate-x-1/2"></span>
                        <p className="fade-text delay text-lg md:text-3xl opacity-0 font-normal text-zinc-600">
                            You're Wonderful, you're more!
                        </p>
                    </div>
                </div>
            )}

            <main
                className={`transition-opacity duration-1000 ${showIntro ? "opacity-0 h-screen overflow-hidden" : "opacity-100"}`}
            >
                {/* Hero Section */}
                <section
                    className="relative h-[80vh] min-h-[500px] flex flex-col items-center justify-center text-white text-center px-6 bg-cover bg-center"
                    style={{ backgroundImage: `url(${herobg})` }}
                >
                    <div className="absolute inset-0 bg-zinc-950/70" />

                    <div className="relative z-10 max-w-4xl mt-16">
                        <span className="inline-block px-5 py-2 text-[10px] tracking-[0.3em] bg-white/10 backdrop-blur-md text-orange-500 font-black rounded-full mb-8 border border-white/20 uppercase animate-pulse">
                            Membership
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                            WELCOME TO HGBC
                        </h1>
                        <p className="max-w-2xl mx-auto text-base md:text-lg font-medium text-zinc-300 leading-relaxed opacity-95">
                            We're honored to have you join our family today. Please fill out
                            the form below so we can stay connected.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Hero;
