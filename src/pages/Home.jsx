import Hero from "../components/Hero";
import MembershipForm from "./MembershipForm";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Hero Header */}
      <Hero />
      
      {/* Registration Form */}
      <MembershipForm />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
